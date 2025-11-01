package vn.fpt.se18.MentorLinking_BackEnd.controller.admin;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.BaseRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.request.user.GetMentorRequest;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.PageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.admin.MentorStatisticsResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.user.MentorManagementResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.admin.MentorService;

import java.util.List;

@Slf4j
@Validated
@RestController
@RequestMapping("/admin/mentor-management")
@Tag(name = "Mentor Management Controller")
@RequiredArgsConstructor
public class MentorManagementController {

    private final MentorService mentorService;

    @PostMapping("/get-all-mentors")
    public BaseResponse<PageResponse<MentorManagementResponse>> getAllMentorsWithCondition(
            @Valid @RequestBody BaseRequest<GetMentorRequest> request) {
        return mentorService.getAllMentorsWithCondition(request);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get mentor details by ID")
    public BaseResponse<MentorManagementResponse> getMentorById(@PathVariable Long id) {
        return mentorService.getMentorById(id);
    }

    @PutMapping("/{id}/approve")
    @Operation(summary = "Approve a mentor application")
    public BaseResponse<Void> approveMentor(@PathVariable Long id) {
        return mentorService.approveMentor(id);
    }

    @PutMapping("/{id}/reject")
    @Operation(summary = "Reject a mentor application")
    public BaseResponse<Void> rejectMentor(@PathVariable Long id) {
        return mentorService.rejectMentor(id);
    }

    @PutMapping("/bulk-approve")
    @Operation(summary = "Bulk approve mentor applications")
    public BaseResponse<Void> bulkApproveMentors(@RequestBody List<Long> mentorIds) {
        return mentorService.bulkApproveMentors(mentorIds);
    }

    @PutMapping("/bulk-reject")
    @Operation(summary = "Bulk reject mentor applications")
    public BaseResponse<Void> bulkRejectMentors(@RequestBody List<Long> mentorIds) {
        return mentorService.bulkRejectMentors(mentorIds);
    }

    @GetMapping("/statistics")
    public BaseResponse<MentorStatisticsResponse> getMentorStatistics() {
        return mentorService.getMentorStatistics();
    }
}
