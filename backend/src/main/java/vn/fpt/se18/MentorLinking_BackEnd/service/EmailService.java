package vn.fpt.se18.MentorLinking_BackEnd.service;

import java.time.LocalDate;
import java.util.Date;

public interface EmailService {
    public void sendConfirmBooking(String to, String subject, String studentName, LocalDate date, Long timeStart, Long timeEnd, String linkMeeting);

    public void sendRequestFeedback(String to, String subject, String body);

    public void sendRejectBooking(String to, String subject, String text);

    public void sendMentorRejection(String to, String mentorName, String reason);
}
