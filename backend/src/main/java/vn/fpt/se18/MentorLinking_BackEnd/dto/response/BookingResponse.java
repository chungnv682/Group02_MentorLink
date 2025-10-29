package vn.fpt.se18.MentorLinking_BackEnd.dto.response;


import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long bookingId;

    private String description;

    private String comment;

    private String paymentProcess; // COMPLETED, REFUNDED, WAIT_REFUND

    private String statusName; // Approved, Pending, Rejected

    private String emailMentor;

    private ScheduleResponse schedule;
}
