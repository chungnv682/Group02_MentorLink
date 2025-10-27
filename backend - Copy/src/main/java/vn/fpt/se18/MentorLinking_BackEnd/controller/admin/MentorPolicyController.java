package vn.fpt.se18.MentorLinking_BackEnd.controller.admin;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.admin.MentorPolicyRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.MentorPolicyResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.MentorPolicyService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/mentor-policies")
@RequiredArgsConstructor
@Slf4j
public class MentorPolicyController {

    private final MentorPolicyService mentorPolicyService;

    @GetMapping
    public BaseResponse<List<MentorPolicyResponse>> getAllMentorPolicies() {
        log.info("Getting all mentor policies");
        return BaseResponse.<List<MentorPolicyResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Get all mentor policies successfully")
                .data(mentorPolicyService.getAllMentorPolicies())
                .build();
    }

    @GetMapping("/active")
    public BaseResponse<List<MentorPolicyResponse>> getActiveMentorPolicies() {
        log.info("Getting all active mentor policies");
        return BaseResponse.<List<MentorPolicyResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Get active mentor policies successfully")
                .data(mentorPolicyService.getActiveMentorPolicies())
                .build();
    }

    @GetMapping("/{id}")
    public BaseResponse<MentorPolicyResponse> getMentorPolicyById(@PathVariable Long id) {
        log.info("Getting mentor policy by id: {}", id);
        return BaseResponse.<MentorPolicyResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Get mentor policy successfully")
                .data(mentorPolicyService.getMentorPolicyById(id))
                .build();
    }

    @PostMapping
    public BaseResponse<MentorPolicyResponse> createMentorPolicy(@Valid @RequestBody MentorPolicyRequest request) {
        log.info("Creating new mentor policy with title: {}", request.getTitle());
        return BaseResponse.<MentorPolicyResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Mentor policy created successfully")
                .data(mentorPolicyService.createMentorPolicy(request))
                .build();
    }

    @PutMapping("/{id}")
    public BaseResponse<MentorPolicyResponse> updateMentorPolicy(@PathVariable Long id,
                                                                 @Valid @RequestBody MentorPolicyRequest request) {
        log.info("Updating mentor policy with id: {}", id);
        return BaseResponse.<MentorPolicyResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Mentor policy updated successfully")
                .data(mentorPolicyService.updateMentorPolicy(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public BaseResponse<Void> deleteMentorPolicy(@PathVariable Long id) {
        log.info("Deleting mentor policy with id: {}", id);
        mentorPolicyService.deleteMentorPolicy(id);
        return BaseResponse.<Void>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Mentor policy deleted successfully")
                .build();
    }

    @PatchMapping("/{id}/toggle-status")
    public BaseResponse<MentorPolicyResponse> toggleActiveStatus(@PathVariable Long id) {
        log.info("Toggling active status for mentor policy with id: {}", id);
        return BaseResponse.<MentorPolicyResponse>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Mentor policy status toggled successfully")
                .data(mentorPolicyService.toggleActiveStatus(id))
                .build();
    }

    @GetMapping("/search")
    public BaseResponse<List<MentorPolicyResponse>> searchMentorPolicies(@RequestParam String keyword) {
        log.info("Searching mentor policies with keyword: {}", keyword);
        return BaseResponse.<List<MentorPolicyResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .description("Search mentor policies successfully")
                .data(mentorPolicyService.searchMentorPoliciesByTitle(keyword))
                .build();
    }
}
