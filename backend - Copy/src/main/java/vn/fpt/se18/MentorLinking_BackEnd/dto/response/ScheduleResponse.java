package vn.fpt.se18.MentorLinking_BackEnd.dto.response;


import java.util.Set;

public class ScheduleResponse {
    private java.time.LocalDate date;

    private Set<TimeSlotResponse> timeSlots;

    private Double price;

    private String emailMentor;
}
