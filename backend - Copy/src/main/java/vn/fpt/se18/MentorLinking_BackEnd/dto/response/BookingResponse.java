package vn.fpt.se18.MentorLinking_BackEnd.dto.response;

import jakarta.persistence.*;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Schedule;
import vn.fpt.se18.MentorLinking_BackEnd.entity.Status;
import vn.fpt.se18.MentorLinking_BackEnd.entity.User;

public class BookingResponse {
    private String description;

    private String comment;

    private String statusName; // Approved, Pending, Rejected

    private String emailMentor;

    private ScheduleResponse schedule;
}
