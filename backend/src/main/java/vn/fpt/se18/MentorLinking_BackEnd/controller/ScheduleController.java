package vn.fpt.se18.MentorLinking_BackEnd.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.BaseResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.ScheduleResponse;
import vn.fpt.se18.MentorLinking_BackEnd.service.ScheduleService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
    @RequestMapping("/schedules")
@RequiredArgsConstructor
@Tag(name = "Schedule Controller")
@Slf4j
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping("/mentor/{mentorId}/upcoming")
    public BaseResponse<List<ScheduleResponse>> getUpcomingSchedulesForMentor(@PathVariable("mentorId") Long mentorId) {
        List<ScheduleResponse> data = scheduleService.getUpcomingSchedulesForMentor(mentorId);
        return BaseResponse.<List<ScheduleResponse>>builder()
                .requestDateTime(LocalDateTime.now().toString())
                .respCode("0")
                .description("Get upcoming schedules for mentor successfully")
                .data(data)
                .build();
    }
}

