package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl.adminImpl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.user.GetMentorRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.MentorStatisticsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.user.MentorManagementResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Role;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Status;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;
import vn.fpt.se18.MentorLinking_BackEnd.repository.RoleRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.StatusRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.UserRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.admin.MentorService;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MentorAdminServiceImpl implements MentorService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StatusRepository statusRepository;

    @Override
    public List<MentorManagementResponse> getAllMentors() {
        // Get all users with MENTOR role
        Optional<Role> mentorRole = roleRepository.findByName("MENTOR");
        if (mentorRole.isEmpty()) {
            return List.of();
        }

        List<User> mentors = userRepository.findAll().stream()
                .filter(user -> user.getRole() != null && user.getRole().getId().equals(mentorRole.get().getId()))
                .collect(Collectors.toList());

        return mentors.stream()
                .map(MentorManagementResponse::new)
                .collect(Collectors.toList());
    }

    public BaseResponse<PageResponse<MentorManagementResponse>> getAllMentorsWithCondition(BaseRequest<GetMentorRequest> request) {
        GetMentorRequest data = request.getData();

        // Get MENTOR role ID
        Optional<Role> mentorRole = roleRepository.findByName("MENTOR");
        if (mentorRole.isEmpty()) {
            return BaseResponse.<PageResponse<MentorManagementResponse>>builder()
                    .respCode("1")
                    .description("MENTOR role not found")
                    .build();
        }

        Pageable pageable = PageRequest.of(
                data.getPage() - 1,
                data.getSize(),
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        // Use existing method but filter for MENTOR role
        Page<User> mentorPage = userRepository.findAllWithCondition(
                data.getKeySearch(),
                mentorRole.get().getId(),
                data.getStatus() != null ? data.getStatus().longValue() : null,
                pageable
        );

        List<MentorManagementResponse> mentorResponses = mentorPage.getContent().stream()
                .map(MentorManagementResponse::new)
                .collect(Collectors.toList());

        PageResponse<MentorManagementResponse> pageResponse = PageResponse.<MentorManagementResponse>builder()
                .content(mentorResponses)
                .totalElements(mentorPage.getTotalElements())
                .totalPages(mentorPage.getTotalPages())
                .currentPage(data.getPage())
                .pageSize(data.getSize())
                .build();

        return BaseResponse.<PageResponse<MentorManagementResponse>>builder()
                .respCode("0")
                .description("Success")
                .data(pageResponse)
                .build();
    }

    public BaseResponse<MentorManagementResponse> getMentorById(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return BaseResponse.<MentorManagementResponse>builder()
                    .respCode("1")
                    .description("Mentor not found")
                    .build();
        }

        User user = userOpt.get();
        // Verify this is a mentor
        Optional<Role> mentorRole = roleRepository.findByName("MENTOR");
        if (mentorRole.isEmpty() || !user.getRole().getId().equals(mentorRole.get().getId())) {
            return BaseResponse.<MentorManagementResponse>builder()
                    .respCode("1")
                    .description("User is not a mentor")
                    .build();
        }

        return BaseResponse.<MentorManagementResponse>builder()
                .respCode("0")
                .description("Success")
                .data(new MentorManagementResponse(user))
                .build();
    }

    public BaseResponse<Void> approveMentor(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Mentor not found")
                    .build();
        }

        User user = userOpt.get();
        Optional<Status> approvedStatus = statusRepository.findByCode("APPROVED");
        if (approvedStatus.isEmpty()) {
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("APPROVED status not found")
                    .build();
        }

        user.setStatus(approvedStatus.get());
        userRepository.save(user);

        return BaseResponse.<Void>builder()
                .respCode("0")
                .description("Mentor approved successfully")
                .build();
    }

    public BaseResponse<Void> rejectMentor(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("Mentor not found")
                    .build();
        }

        User user = userOpt.get();
        Optional<Status> rejectedStatus = statusRepository.findByCode("REJECTED");
        if (rejectedStatus.isEmpty()) {
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("REJECTED status not found")
                    .build();
        }

        user.setStatus(rejectedStatus.get());
        userRepository.save(user);

        return BaseResponse.<Void>builder()
                .respCode("0")
                .description("Mentor rejected successfully")
                .build();
    }

    public BaseResponse<Void> bulkApproveMentors(List<Long> mentorIds) {
        Optional<Status> approvedStatus = statusRepository.findByCode("APPROVED");
        if (approvedStatus.isEmpty()) {
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("APPROVED status not found")
                    .build();
        }

        List<User> mentors = userRepository.findAllById(mentorIds);
        mentors.forEach(mentor -> mentor.setStatus(approvedStatus.get()));
        userRepository.saveAll(mentors);

        return BaseResponse.<Void>builder()
                .respCode("0")
                .description("Mentors approved successfully")
                .build();
    }

    public BaseResponse<Void> bulkRejectMentors(List<Long> mentorIds) {
        Optional<Status> rejectedStatus = statusRepository.findByCode("REJECTED");
        if (rejectedStatus.isEmpty()) {
            return BaseResponse.<Void>builder()
                    .respCode("1")
                    .description("REJECTED status not found")
                    .build();
        }

        List<User> mentors = userRepository.findAllById(mentorIds);
        mentors.forEach(mentor -> mentor.setStatus(rejectedStatus.get()));
        userRepository.saveAll(mentors);

        return BaseResponse.<Void>builder()
                .respCode("0")
                .description("Mentors rejected successfully")
                .build();
    }

    @Override
    public BaseResponse<MentorStatisticsResponse> getMentorStatistics() {
        // Get MENTOR role
        Optional<Role> mentorRole = roleRepository.findByName("MENTOR");
        if (mentorRole.isEmpty()) {
            return BaseResponse.<MentorStatisticsResponse>builder()
                    .respCode("1")
                    .description("MENTOR role not found")
                    .build();
        }

        // Get all mentors
        List<User> allMentors = userRepository.findAll().stream()
                .filter(user -> user.getRole() != null && user.getRole().getId().equals(mentorRole.get().getId()))
                .toList();

        // Count by status
        long pendingCount = allMentors.stream()
                .filter(mentor -> mentor.getStatus() != null && "PENDING".equals(mentor.getStatus().getCode()))
                .count();

        long approvedCount = allMentors.stream()
                .filter(mentor -> mentor.getStatus() != null && "ACTIVE".equals(mentor.getStatus().getCode()))
                .count();

        long rejectedCount = allMentors.stream()
                .filter(mentor -> mentor.getStatus() != null && "INACTIVE".equals(mentor.getStatus().getCode()))
                .count();

        long totalCount = allMentors.size();

        MentorStatisticsResponse statistics = MentorStatisticsResponse.builder()
                .pending(pendingCount)
                .approved(approvedCount)
                .rejected(rejectedCount)
                .total(totalCount)
                .build();

        return BaseResponse.<MentorStatisticsResponse>builder()
                .respCode("0")
                .description("Success")
                .data(statistics)
                .build();
    }
}
