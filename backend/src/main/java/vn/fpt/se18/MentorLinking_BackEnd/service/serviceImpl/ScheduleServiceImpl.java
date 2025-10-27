package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.ScheduleResponse;
import vn.fpt.se18.MentorLinking_BackEnd.dto.response.TimeSlotResponse;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Schedule;
import vn.fpt.se18.MentorLinking_BackEnd.entity.TimeSlot;
import vn.fpt.se18.MentorLinking_BackEnd.repository.ScheduleRepository;
import vn.fpt.se18.MentorLinking_BackEnd.repository.BookingRepository;
import vn.fpt.se18.MentorLinking_BackEnd.service.ScheduleService;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final BookingRepository bookingRepository;

    @Override
    public List<ScheduleResponse> getUpcomingSchedulesForMentor(Long mentorId) {
        LocalDate from = LocalDate.now();
        LocalDate to = from.plusDays(2);

        List<Schedule> schedules = scheduleRepository.findByMentorIdAndDateBetween(mentorId, from, to);

        if (schedules == null || schedules.isEmpty()) {
            return List.of();
        }

        // Collect schedule ids and query booked ones in batch to avoid N+1
        List<Long> scheduleIds = schedules.stream().map(Schedule::getId).collect(Collectors.toList());
        List<Long> bookedIdsList = bookingRepository.findBookedScheduleIds(scheduleIds);
        Set<Long> bookedIds = bookedIdsList == null ? Set.of() : bookedIdsList.stream().collect(Collectors.toSet());

        return schedules.stream().map(s -> {
            Set<TimeSlotResponse> timeSlotResponses = s.getTimeSlots() == null ? Set.of() : s.getTimeSlots().stream().map((TimeSlot ts) ->
                    TimeSlotResponse.builder()
                            .timeSlotId(ts.getId())
                            .timeStart(ts.getTimeStart())
                            .timeEnd(ts.getTimeEnd())
                            .build()
            ).collect(Collectors.toSet());

            return ScheduleResponse.builder()
                    .scheduleId(s.getId())
                    .date(s.getDate())
                    .timeSlots(timeSlotResponses)
                    .price(s.getPrice())
                    .emailMentor(s.getUser() != null ? s.getUser().getEmail() : null)
                    // Respect the schedule's own isBooked flag OR presence of bookings
                    .isBooked(Boolean.TRUE.equals(s.getIsBooked()) || bookedIds.contains(s.getId()))
                    .build();
        }).collect(Collectors.toList());
    }
}
