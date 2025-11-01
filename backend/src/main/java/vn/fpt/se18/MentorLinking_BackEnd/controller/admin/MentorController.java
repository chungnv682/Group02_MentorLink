package vn.fpt.se18.MentorLinking_BackEnd.controller.admin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.CountryResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorDetailResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor.MentorPageResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.MentorService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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
        // dele mentor
        // get id mentor
        return BaseResponse.<MentorDetailResponse>builder()
                .data(mentorService.getMentorById(id))
                .build();
    }

    @GetMapping("/{mentorId}/countries")
    public BaseResponse<List<CountryResponse>> getMentorCountries(@PathVariable Long mentorId) {
        log.info("REST request to get countries for mentor: {}", mentorId);
        List<CountryResponse> data = mentorService.getMentorCountries(mentorId);
        return BaseResponse.<List<CountryResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get mentor countries successfully")
                .data(data)
                .build();
    }

    @PutMapping("/{mentorId}/countries")
    public BaseResponse<Void> updateMentorCountries(
            @PathVariable Long mentorId,
            @RequestBody Map<String, List<Long>> requestBody) {
        log.info("REST request to update countries for mentor: {}", mentorId);
        List<Long> countryIds = requestBody.get("countryIds");
        mentorService.updateMentorCountries(mentorId, countryIds);
        return BaseResponse.<Void>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Update mentor countries successfully")
                .build();
    }
}
