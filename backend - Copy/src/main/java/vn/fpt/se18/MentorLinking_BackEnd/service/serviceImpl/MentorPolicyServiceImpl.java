package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.MentorPolicyRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.MentorPolicyResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.MentorPolicy;
import vn.fpt.se18.MentorLinking_BackEnd.repository.MentorPolicyRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.MentorPolicyService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MentorPolicyServiceImpl implements MentorPolicyService {

    private final MentorPolicyRepository mentorPolicyRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MentorPolicyResponse> getAllMentorPolicies() {
        return mentorPolicyRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorPolicyResponse> getActiveMentorPolicies() {
        return mentorPolicyRepository.findByIsActiveTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MentorPolicyResponse getMentorPolicyById(Long id) {
        MentorPolicy policy = mentorPolicyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mentor policy not found with id: " + id));
        return mapToResponse(policy);
    }

    @Override
    public MentorPolicyResponse createMentorPolicy(MentorPolicyRequest request) {
        MentorPolicy policy = MentorPolicy.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .isActive(request.getIsActive())
                .build();

        MentorPolicy savedPolicy = mentorPolicyRepository.save(policy);
        return mapToResponse(savedPolicy);
    }

    @Override
    public MentorPolicyResponse updateMentorPolicy(Long id, MentorPolicyRequest request) {
        MentorPolicy existingPolicy = mentorPolicyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mentor policy not found with id: " + id));

        existingPolicy.setTitle(request.getTitle());
        existingPolicy.setContent(request.getContent());
        existingPolicy.setIsActive(request.getIsActive());

        MentorPolicy updatedPolicy = mentorPolicyRepository.save(existingPolicy);
        return mapToResponse(updatedPolicy);
    }

    @Override
    public void deleteMentorPolicy(Long id) {
        if (!mentorPolicyRepository.existsById(id)) {
            throw new RuntimeException("Mentor policy not found with id: " + id);
        }
        mentorPolicyRepository.deleteById(id);
    }

    @Override
    public MentorPolicyResponse toggleActiveStatus(Long id) {
        MentorPolicy policy = mentorPolicyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mentor policy not found with id: " + id));

        policy.setIsActive(!policy.getIsActive());
        MentorPolicy updatedPolicy = mentorPolicyRepository.save(policy);
        return mapToResponse(updatedPolicy);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MentorPolicyResponse> searchMentorPoliciesByTitle(String keyword) {
        return mentorPolicyRepository.findByTitleContainingIgnoreCase(keyword)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private MentorPolicyResponse mapToResponse(MentorPolicy policy) {
        return MentorPolicyResponse.builder()
                .id(policy.getId())
                .title(policy.getTitle())
                .content(policy.getContent())
                .isActive(policy.getIsActive())
                .createdAt(policy.getCreatedAt())
                .updatedAt(policy.getUpdatedAt())
                .build();
    }
}
