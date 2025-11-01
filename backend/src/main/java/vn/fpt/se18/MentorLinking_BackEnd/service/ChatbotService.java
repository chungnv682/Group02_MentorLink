package vn.fpt.se18.MentorLinking_BackEnd.service;

import vn.fpt.se18.MentorLinking_BackEnd.repository.FaqRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.MentorCountryRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.MentorRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.MentorPolicyRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.CustomerPolicyRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.BlogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import vn.fpt.se18.MentorLinking_BackEnd.dto.ChatMessageDTO;
import vn.fpt.se18.MentorLinking_BackEnd.dto.ChatResponseDTO;
import vn.fpt.se18.MentorLinking_BackEnd.dto.MentorRecommendationDTO;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

/**
 * Chatbot service that handles AI-powered responses
 * Combines Qdrant vector search with Gemini API for intelligent responses
 */
@Service
@Slf4j
public class ChatbotService {

    private static final String MENTOR_COLLECTION = "mentors";
    private static final String FAQ_COLLECTION = "faqs";
    private static final String BLOG_COLLECTION = "blogs";
    private static final String POLICY_COLLECTION = "policies";
    private static final int SEARCH_LIMIT = 5;

    @Autowired(required = false)
    private UserRepository userRepository;

    @Autowired(required = false)
    private FaqRepository faqRepository;

    @Autowired(required = false)
    private MentorRepository mentorRepository;

    @Autowired(required = false)
    private MentorCountryRepository mentorCountryRepository;

    @Autowired(required = false)
    private MentorPolicyRepository mentorPolicyRepository;

    @Autowired(required = false)
    private CustomerPolicyRepository customerPolicyRepository;

    @Autowired(required = false)
    private BlogRepository blogRepository;

    @Autowired
    private DataSyncService dataSyncService;

    /**
     * Process user message and generate AI response
     */
    public ChatResponseDTO processMessage(ChatMessageDTO messageDTO) {
        try {
            String userMessage = messageDTO.getMessage();
            log.info("Processing chat message: {}", userMessage);

            // Try to use full AI pipeline
            try {
        // Prefer DB-based answers (fallback) so we can run without external services
        String answer = generateDbBasedResponse(userMessage);
        List<MentorRecommendationDTO> recommendations = extractAndRecommendMentorsFromDb(userMessage);
        double confidence = recommendations.isEmpty() ? 0.6 : 0.9;

        return ChatResponseDTO.builder()
            .message(answer)
            .recommendedMentors(recommendations)
            .confidence(confidence)
            .build();
            } catch (Exception aiException) {
                log.warn("AI pipeline failed, using fallback response", aiException);
                // Fallback: return simple response without AI
                return generateFallbackResponse(userMessage);
            }

        } catch (Exception e) {
            log.error("Error processing chat message", e);
            return ChatResponseDTO.builder()
                    .message("Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.")
                    .recommendedMentors(new ArrayList<>())
                    .confidence(0.0)
                    .build();
        }
    }

    /**
     * Generate a response based on DB contents (FAQ, policies, blogs, mentors)
     */
    private String generateDbBasedResponse(String userMessage) {
        if (userMessage == null || userMessage.isBlank()) {
            return "Xin chào! Bạn có thể hỏi về mentor, cách đặt lịch, hoặc chính sách. Hãy mô tả câu hỏi rõ hơn.";
        }

        // Tokenize user message
        Set<String> userTokens = tokenize(userMessage);

        // Detect intent words
        String userLower = userMessage.toLowerCase();
        boolean mentionsMentor = userLower.contains("mentor") || userLower.contains("cố vấn") || userLower.contains("hỗ trợ") || userLower.contains("tìm mentor") || userLower.contains("tìm cố vấn");

        // If the user is explicitly asking for mentors, handle that first to avoid blog/policy false positives
        if (mentionsMentor) {
            List<MentorRecommendationDTO> mentorResults = extractAndRecommendMentorsFromDbWithScoring(userMessage, userTokens);
            if (!mentorResults.isEmpty()) {
                StringBuilder sb = new StringBuilder();
                sb.append("Tôi tìm thấy các mentor phù hợp:\n");
                mentorResults.stream().limit(5).forEach(m -> sb.append("- ").append(m.getName()).append("\n"));
                return sb.toString();
            }
            // if no mentors found, continue to other matching strategies
        }

        // 1) FAQ — compute token overlap / Jaccard and pick best match
        if (faqRepository != null) {
            List<vn.fpt.se18.MentorLinking_BackEnd.entity.FAQ> faqs = faqRepository.findAll();
            double bestScore = 0.0;
            vn.fpt.se18.MentorLinking_BackEnd.entity.FAQ bestFaq = null;

            for (var faq : faqs) {
                String combined = (faq.getQuestion() == null ? "" : faq.getQuestion()) + " " + (faq.getAnswer() == null ? "" : faq.getAnswer());
                double score = jaccardSimilarity(userTokens, tokenize(combined));
                if (score > bestScore) {
                    bestScore = score;
                    bestFaq = faq;
                }
            }

            if (bestFaq != null && bestScore >= 0.25) { // threshold for confident FAQ match
                return "FAQ: " + bestFaq.getQuestion() + "\n" + bestFaq.getAnswer();
            }
        }

    // 2) Policy / Blog search: look for top-matching titles/content
        Map<String, Double> policyMatches = new LinkedHashMap<>();
        if (mentorPolicyRepository != null) {
            for (var p : mentorPolicyRepository.findAll()) {
                double s = jaccardSimilarity(userTokens, tokenize(p.getTitle() + " " + (p.getDescription() == null ? "" : p.getDescription())));
                if (s > 0.15) policyMatches.put("MENTOR_POLICY:" + p.getId() + ":" + p.getTitle(), s);
            }
        }
        if (customerPolicyRepository != null) {
            for (var p : customerPolicyRepository.findAll()) {
                double s = jaccardSimilarity(userTokens, tokenize(p.getTitle() + " " + (p.getDescription() == null ? "" : p.getDescription())));
                if (s > 0.15) policyMatches.put("CUSTOMER_POLICY:" + p.getId() + ":" + p.getTitle(), s);
            }
        }

        // Also check blogs: compute similarity and combine with view count
        List<vn.fpt.se18.MentorLinking_BackEnd.entity.Blog> allBlogs = blogRepository != null ? blogRepository.findAll() : List.of();
        int maxViews = allBlogs.stream().map(b -> b.getViewCount() == null ? 0 : b.getViewCount()).max(Integer::compareTo).orElse(1);

        Map<vn.fpt.se18.MentorLinking_BackEnd.entity.Blog, Double> blogScores = new LinkedHashMap<>();
        for (var b : allBlogs) {
            double j = jaccardSimilarity(userTokens, tokenize(b.getTitle() + " " + (b.getContent() == null ? "" : b.getContent())));
            double viewNorm = (b.getViewCount() == null ? 0 : b.getViewCount()) / (double) Math.max(1, maxViews);
            double combined = 0.7 * j + 0.3 * viewNorm;
            if (combined > 0.08) blogScores.put(b, combined);
        }

        // Special-case: explicit blog popularity queries ("nhiều lượt xem", "ít lượt xem")
        boolean mentionsBlog = userMessage.toLowerCase().contains("blog") || userMessage.toLowerCase().contains("bài blog");
        boolean asksMost = userMessage.toLowerCase().contains("nhiều nhất") || userMessage.toLowerCase().contains("nhiều lượt xem") || userMessage.toLowerCase().contains("nhiều");
        boolean asksLeast = userMessage.toLowerCase().contains("ít nhất") || userMessage.toLowerCase().contains("ít lượt xem") || userMessage.toLowerCase().contains("ít ");

        if (mentionsBlog && (asksMost || asksLeast)) {
            // return top or bottom blogs by view count
            List<vn.fpt.se18.MentorLinking_BackEnd.entity.Blog> blogs = allBlogs.stream().filter(b -> b.getIsPublished() != null && b.getIsPublished()).collect(Collectors.toList());
            if (blogs.isEmpty()) return "Hiện tại không có bài blog nào được xuất bản.";
            if (asksMost) {
                blogs.sort(Comparator.comparingInt(b -> -(b.getViewCount() == null ? 0 : b.getViewCount())));
                StringBuilder sb = new StringBuilder();
                sb.append("Các bài blog nhiều lượt xem nhất:\n");
                blogs.stream().limit(5).forEach(b -> sb.append("- ").append(b.getTitle()).append(" (").append(b.getViewCount() == null ? 0 : b.getViewCount()).append(" lượt xem)\n"));
                return sb.toString();
            } else {
                blogs.sort(Comparator.comparingInt(b -> (b.getViewCount() == null ? 0 : b.getViewCount())));
                StringBuilder sb = new StringBuilder();
                sb.append("Các bài blog ít lượt xem nhất:\n");
                blogs.stream().limit(5).forEach(b -> sb.append("- ").append(b.getTitle()).append(" (").append(b.getViewCount() == null ? 0 : b.getViewCount()).append(" lượt xem)\n"));
                return sb.toString();
            }
        }

        if (!policyMatches.isEmpty() || !blogScores.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            if (!policyMatches.isEmpty()) {
                var topPolicies = policyMatches.entrySet().stream().sorted(Map.Entry.<String, Double>comparingByValue().reversed()).limit(3).collect(Collectors.toList());
                sb.append("Các chính sách liên quan:\n");
                for (var e : topPolicies) {
                    sb.append("- ").append(e.getKey().split(":" ,3)[2]).append("\n");
                }
            }
            if (!blogScores.isEmpty()) {
                var topBlogs = blogScores.entrySet().stream().sorted(Map.Entry.<vn.fpt.se18.MentorLinking_BackEnd.entity.Blog, Double>comparingByValue().reversed()).limit(5).collect(Collectors.toList());
                sb.append("\nCác bài blog liên quan hoặc phổ biến:\n");
                for (var e : topBlogs) {
                    sb.append("- ").append(e.getKey().getTitle()).append("\n");
                }
            }
            return sb.toString();
        }

        // 3) Mentor matching: match by services, title, bio, country
        List<MentorRecommendationDTO> mentors = extractAndRecommendMentorsFromDbWithScoring(userMessage, userTokens);
        if (!mentors.isEmpty()) {
            StringBuilder sb = new StringBuilder();
            sb.append("Tôi tìm thấy các mentor phù hợp:\n");
            mentors.stream().limit(5).forEach(m -> sb.append("- ").append(m.getName()).append("\n"));
            return sb.toString();
        }

        // 4) Fallback: helpful guidance
        return "Xin cảm ơn câu hỏi! Hiện tại tôi chưa tìm thấy thông tin chính xác trong hệ thống. Vui lòng mô tả rõ hơn hoặc thử hỏi về 'cách đặt lịch', 'chính sách', hoặc 'tìm mentor theo quốc gia'.";
    }

    // --- Improved mentor recommendation with scoring ---
    private List<MentorRecommendationDTO> extractAndRecommendMentorsFromDbWithScoring(String userMessage, Set<String> userTokens) {
        List<MentorRecommendationDTO> recommendations = new ArrayList<>();
        if (mentorRepository == null) return recommendations;

        List<vn.fpt.se18.MentorLinking_BackEnd.entity.User> mentors = mentorRepository.findAll();

        for (var m : mentors) {
            double score = 0.0;

            // service names overlap
            if (m.getMentorServices() != null && !m.getMentorServices().isEmpty()) {
                String services = m.getMentorServices().stream().map(s -> s.getServiceName() == null ? "" : s.getServiceName()).collect(Collectors.joining(" "));
                score += 0.5 * jaccardSimilarity(userTokens, tokenize(services));
            }

            // bio and title overlap
            String bioTitle = (m.getBio() == null ? "" : m.getBio()) + " " + (m.getTitle() == null ? "" : m.getTitle());
            score += 0.3 * jaccardSimilarity(userTokens, tokenize(bioTitle));

            // country match heuristic
            if (m.getMentorCountries() != null) {
                for (vn.fpt.se18.MentorLinking_BackEnd.entity.MentorCountry mc : m.getMentorCountries()) {
                    if (mc.getCountry() != null && mc.getCountry().getName() != null) {
                        if (userTokens.contains(mc.getCountry().getName().toLowerCase())) {
                            score += 0.4; // strong boost for explicit country match
                        }
                    }
                }
            }

            // rating weight
            double rating = m.getRating() == null ? 0.0 : m.getRating();
            score += 0.1 * (rating / 5.0);

            if (score > 0.05) {
                MentorRecommendationDTO dto = MentorRecommendationDTO.builder()
                        .mentorId(m.getId())
                        .name(m.getFullname())
                        .expertise(String.join(", ", m.getMentorServices()==null?List.of("Chưa cập nhật"):m.getMentorServices().stream().map(s->s.getServiceName()).limit(3).collect(Collectors.toList())))
                        .rating(m.getRating()==null?0.0:m.getRating())
                        .profileImage(m.getProfileImage())
                        .reason("Gợi ý dựa trên nội dung hồ sơ và từ khoá trong câu hỏi")
                        .relevanceScore(score)
                        .build();
                recommendations.add(dto);
            }
        }

        recommendations.sort(Comparator.comparingDouble(MentorRecommendationDTO::getRelevanceScore).reversed());
        return recommendations;
    }

    // --- Tokenization & similarity helpers ---
    private static final Set<String> STOP_WORDS = Set.of("và","là","của","cho","có","tôi","muốn","những","theo","trong","với","cần","được","để","cái","một","các");

    private Set<String> tokenize(String text) {
        if (text == null) return Collections.emptySet();
        String normalized = text.toLowerCase().replaceAll("[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\\s]"," ");
        String[] parts = normalized.split("\\s+");
        Set<String> tokens = new HashSet<>();
        for (String p : parts) {
            if (p == null || p.length() < 2) continue;
            if (STOP_WORDS.contains(p)) continue;
            tokens.add(p);
        }
        return tokens;
    }

    private double jaccardSimilarity(Set<String> a, Set<String> b) {
        if ((a == null || a.isEmpty()) && (b == null || b.isEmpty())) return 1.0;
        if (a == null || a.isEmpty() || b == null || b.isEmpty()) return 0.0;
        Set<String> intersection = new HashSet<>(a);
        intersection.retainAll(b);
        Set<String> union = new HashSet<>(a);
        union.addAll(b);
        return (double) intersection.size() / (double) union.size();
    }

    /**
     * Extract mentor recommendations using DB (simple heuristic)
     */
    private List<MentorRecommendationDTO> extractAndRecommendMentorsFromDb(String userMessage) {
        List<MentorRecommendationDTO> recommendations = new ArrayList<>();
        if (mentorRepository == null) return recommendations;

        String lower = userMessage == null ? "" : userMessage.toLowerCase();
        // Simple: if user asks for mentor, return top-rated mentors
        if (lower.contains("mentor") || lower.contains("cố vấn")) {
            List<vn.fpt.se18.MentorLinking_BackEnd.entity.User> mentors = mentorRepository.findAll();
            mentors.sort(Comparator.comparing(u -> u.getRating() == null ? 0.0f : -u.getRating()));
            mentors.stream().limit(3).forEach(m -> {
                MentorRecommendationDTO dto = MentorRecommendationDTO.builder()
                        .mentorId(m.getId())
                        .name(m.getFullname())
                        .expertise(String.join(", ", m.getMentorServices()==null?List.of("Chưa cập nhật"):m.getMentorServices().stream().map(s->s.getServiceName()).limit(3).collect(Collectors.toList())))
                        .rating(m.getRating()==null?0.0:m.getRating())
                        .profileImage(m.getProfileImage())
                        .reason("Gợi ý dựa trên hồ sơ và đánh giá")
                        .relevanceScore(0.75)
                        .build();
                recommendations.add(dto);
            });
        }

        return recommendations;
    }

    /**
     * Generate fallback response when AI services are unavailable
     */
    private ChatResponseDTO generateFallbackResponse(String userMessage) {
        String userMessageLower = userMessage.toLowerCase();
        String response = "Xin cảm ơn câu hỏi của bạn! ";

        if (userMessageLower.contains("mentor") || userMessageLower.contains("hướng dẫn")) {
            response += "Bạn có thể tìm mentor phù hợp bằng cách click vào nút 'Tìm Cố vấn' trên trang chủ. ";
        } else if (userMessageLower.contains("booking") || userMessageLower.contains("đặt lịch")) {
            response += "Để đặt lịch với mentor, vui lòng chọn mentor và chọn khoảng thời gian phù hợp. ";
        } else if (userMessageLower.contains("chính sách") || userMessageLower.contains("policy")) {
            response += "Vui lòng xem phần 'Trở thành Cố vấn' hoặc 'Hỏi Đáp' để biết thêm về chính sách. ";
        } else {
            response += "Tôi sẵn sàng giúp bạn! Vui lòng hỏi về mentor, booking, hoặc chính sách. ";
        }

        return ChatResponseDTO.builder()
                .message(response)
                .recommendedMentors(new ArrayList<>())
                .confidence(0.5)
                .build();
    }

    /**
     * Search for relevant context from Qdrant collections
     */
    private String searchRelevantContext(String query) {
        StringBuilder context = new StringBuilder();
        // Qdrant is not configured in this environment — return empty context.
        context.append("(Context search disabled - Qdrant not configured)");
        return context.toString();
    }

    /**
     * Search a specific Qdrant collection
     */
    private String searchCollection(String collectionName, float[] queryEmbedding) {
        StringBuilder results = new StringBuilder();
        // Qdrant disabled — no results
        return "";
    }

    /**
     * Generate AI response using Gemini with Vietnamese context
     */
    private String generateAIResponse(String userMessage, String context) {
        // Generative model is not available in this environment. Use DB-based or fallback response.
        String dbAnswer = generateDbBasedResponse(userMessage);
        if (dbAnswer != null && !dbAnswer.isBlank()) return dbAnswer;
        return "Xin lỗi, tính năng tạo phản hồi nâng cao chưa được cấu hình. Vui lòng thử hỏi điều khác hoặc liên hệ hỗ trợ.";
    }

    /**
     * Extract mentor recommendations from context
     */
    private List<MentorRecommendationDTO> extractAndRecommendMentors(String userMessage, String context) {
        // Qdrant disabled - use DB-based recommendation
        return extractAndRecommendMentorsFromDb(userMessage);
    }

    /**
     * Extract expertise areas from mentor profile
     */
    private List<String> extractExpertise(User mentor) {
        if (mentor.getMentorServices() == null || mentor.getMentorServices().isEmpty()) {
            return List.of("Chưa cập nhật");
        }
        return mentor.getMentorServices().stream()
                .map(s -> s.getServiceName())
                .limit(3)
                .collect(Collectors.toList());
    }

    /**
     * Generate embedding for query (same method as in DataSyncService)
     */
    private float[] generateQueryEmbedding(String text) {
        float[] embedding = new float[768];
        String[] words = text.toLowerCase().split("\\s+");
        
        for (int i = 0; i < 768; i++) {
            float value = 0;
            for (String word : words) {
                value += (float) Math.sin(word.hashCode() * (i + 1)) / words.length;
            }
            embedding[i] = value / 2;
        }
        
        return embedding;
    }

    /**
     * Calculate confidence score for the response
     */
    private double calculateConfidence(String userMessage, String context) {
        // Simple confidence calculation based on context relevance
        int keywordMatches = 0;
        String[] keywords = userMessage.toLowerCase().split("\\s+");
        String contextLower = context.toLowerCase();

        for (String keyword : keywords) {
            if (keyword.length() > 3 && contextLower.contains(keyword)) {
                keywordMatches++;
            }
        }

        return Math.min(1.0, (double) keywordMatches / keywords.length);
    }

    /**
     * Ensure data is synced to Qdrant (check if collections have data)
     */
    private void ensureDataSynced() {
        try {
            // Qdrant is not available; ensureDataSynced will attempt a noop sync
            dataSyncService.syncAllDataToQdrant();
        } catch (Exception e) {
            log.warn("Failed to check collections (Qdrant disabled), attempting to sync", e);
        }
    }
}
