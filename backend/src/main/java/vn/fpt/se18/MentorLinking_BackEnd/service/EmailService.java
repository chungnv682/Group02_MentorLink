package vn.fpt.se18.MentorLinking_BackEnd.service;

import java.time.LocalDate;
import java.util.Date;

public interface EmailService {
    public void sendConfirmBooking(String to, String subject, String studentName, String mentorName, String service, LocalDate date, Long timeStart, Long timeEnd, String linkMeeting);

    public void sendRequestFeedback(String to, String subject, String body);

    public void sendRejectBooking(String to, String subject, String studentName, String reason);

    public void sendRejectBooking1(String to, String subject, String studentName, String mentorName, String service, LocalDate date, Long timeStart, Long timeEnd, String reason);

    public void send(String to, String subject, String text);
}
