package vn.fpt.se18.MentorLinking_BackEnd.service;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@Service
public interface EmailService {
    public void sendConfirmBooking(String to, String subject, String studentName, String mentorName, String service, LocalDate date, List<Long[]> bookingTimes, String linkMeeting);

    public void sendRequestFeedback(String to, String subject, String body);

    public void sendRejectBooking(String to, String subject, String studentName, String reason);

    public void sendRejectBooking1(String to, String subject, String studentName, String mentorName, String service, LocalDate date, List<Long[]> bookingTimes, String reason);

    public void send(String to, String subject, String text);

    public void sendOtp(String to, String subject, String otpCode);

    public void sendMentorRejection(String to, String mentorName, String reason);


    /**
     * Send a password reset link containing a one-time token so user can set a new password.
     * @param to recipient email
     * @param subject email subject
     * @param resetLink fully qualified frontend URL with token param
     */
    public void sendResetPasswordLink(String to, String subject, String resetLink);
}
