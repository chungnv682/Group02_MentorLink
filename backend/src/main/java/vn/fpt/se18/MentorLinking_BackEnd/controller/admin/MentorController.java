package vn.fpt.se18.MentorLinking_BackEnd.controller.admin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorPageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.MentorService;

@RestController
@RequestMapping("/mentors")
@RequiredArgsConstructor
@Slf4j
public class MentorController {


    private final MentorService mentorService;

    @GetMapping()
    public BaseResponse<MentorPageResponse> getAllMentors(@RequestParam(required = false) String keyword,
                                                          @RequestParam(defaultValue = "numberOfBooking:desc") String sort,
                                                          @RequestParam(defaultValue = "0") int page,
                                                          @RequestParam(defaultValue = "20") int size) {
        log.info("Getting all mentors with keyword: {}, sort: {}, page: {}, size: {}", keyword, sort, page, size);
        return BaseResponse.<MentorPageResponse>builder()
                .data(mentorService.getAllMentors(keyword, sort, page, size))
                .build();
    }

    @GetMapping("/{id}")
    public BaseResponse<MentorDetailResponse> getMentorById(@PathVariable Long id) {
        log.info("Getting mentor by id: {}", id);
        return BaseResponse.<MentorDetailResponse>builder()
                .data(mentorService.getMentorById(id))
                .build();
    }
}
