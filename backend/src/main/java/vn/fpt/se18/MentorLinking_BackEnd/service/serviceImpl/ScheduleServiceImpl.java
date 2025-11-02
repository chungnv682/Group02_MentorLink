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
import vn.fpt.se18.MentorLinking_BackEnd.util.PaymentProcess;

import java.time.LocalDate;
import java.time.LocalTime;
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

        // Filter out schedules for "today" that have any timeSlot with timeStart
        // earlier than current hour
        final LocalDate today = from;
        final int currentHour = LocalTime.now().getHour();
        List<Schedule> filteredSchedules = schedules.stream()
                .filter(s -> {
                    if (s.getDate() != null && s.getDate().isEqual(today)) {
                        Set<TimeSlot> slots = s.getTimeSlots();
                        if (slots != null && !slots.isEmpty()) {
                            boolean anySlotInPast = slots.stream()
                                    .anyMatch(ts -> ts != null && ts.getTimeStart() != null
                                            && ts.getTimeStart() < currentHour);
                            return !anySlotInPast; // exclude schedule if any slot is in the past
                        }
                    }
                    return true;
                })
                .collect(Collectors.toList());

        if (filteredSchedules == null || filteredSchedules.isEmpty()) {
            return List.of();
        }

        // Collect schedule ids and query booked ones in batch to avoid N+1
        List<Long> scheduleIds = filteredSchedules.stream().map(Schedule::getId).collect(Collectors.toList());

        // New: get schedule ids that have a COMPLETED paymentProcess booking
        List<Long> completedBookedIdsList = bookingRepository.findScheduleIdsByIdsAndPaymentProcess(scheduleIds,
                PaymentProcess.COMPLETED);
        Set<Long> completedBookedIds = completedBookedIdsList == null ? Set.of()
                : completedBookedIdsList.stream().collect(Collectors.toSet());

        return filteredSchedules.stream().map(s -> {
            Set<TimeSlotResponse> timeSlotResponses = s.getTimeSlots() == null ? Set.of()
                    : s.getTimeSlots().stream().map((TimeSlot ts) -> TimeSlotResponse.builder()
                            .timeSlotId(ts.getId())
                            .timeStart(ts.getTimeStart())
                            .timeEnd(ts.getTimeEnd())
                            .build()).collect(Collectors.toSet());

            // Determine isBooked: true if schedule entity has flag true OR has any COMPLETED booking
            boolean isBookedFlag = s.getIsBooked() != null && s.getIsBooked();
            boolean hasCompletedBooking = completedBookedIds.contains(s.getId());

            return ScheduleResponse.builder()
                    .scheduleId(s.getId())
                    .date(s.getDate())
                    .timeSlots(timeSlotResponses)
                    .price(s.getPrice())
                    .emailMentor(s.getUser() != null ? s.getUser().getEmail() : null)
                    .isBooked(isBookedFlag || hasCompletedBooking)
                    .build();
        }).collect(Collectors.toList());
    }
}
