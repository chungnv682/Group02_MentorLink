package vn.fpt.se18.MentorLinking_BackEnd.service.serviceImpl;


import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import vn.fpt.se18.MentorLinking_BackEnd.exception.AppException;
import vn.fpt.se18.MentorLinking_BackEnd.exception.ErrorCode;
import vn.fpt.se18.MentorLinking_BackEnd.service.EmailService;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {


    @Value("${spring.sendgrid.from-email}")
    private String from ;

    private final SendGrid sendGrid;

    private final SpringTemplateEngine templateEngine;


    @Override
    public void sendConfirmBooking(String to, String subject, String studentName, LocalDate date, Long timeStart, Long timeEnd, String linkMeeting) {

        Context context = new Context();

        String formattedTime = timeStart + " - " + timeEnd;

        Map<String, Object> model = new HashMap<>();
        model.put("to", to);
        model.put("subject", subject);
        model.put("studentName", studentName);
        model.put("date", date);
        model.put("time", formattedTime);
        model.put("googleMeetLink", linkMeeting);
        context.setVariables(model);

        String htmlContent = templateEngine.process("lesson-email.html", context);

        Email fromEmail = new Email(from);
        Email toEmail = new Email(to);

        Content content = new Content("text/plain", htmlContent);
        Mail mail = new Mail(fromEmail, subject, toEmail, content);
        try {
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sendGrid.api(request);

            if (response.getStatusCode() == 202) { // Accepted
                log.info("Email sent successfully");
            } else {
                log.error("Email sent failed: StatusCode = {}, Body = {}", response.getStatusCode(), response.getBody());
                throw new AppException(ErrorCode.EMAIL_INVALID);
            }
        } catch (IOException e) {
            log.error("Email sent failed");
            throw new AppException(ErrorCode.EMAIL_INVALID);
        }
    }

    @Override
    public void sendRejectBooking(String to, String subject, String text) {

        Email fromEmail = new Email(from);
        Email toEmail = new Email(to);


        Content content = new Content("text/plain", text);
        Mail mail = new Mail(fromEmail, subject, toEmail, content);
        try {
            Request request = new Request();
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());

            Response response = sendGrid.api(request);

            if (response.getStatusCode() == 202) { // Accepted
                log.info("Email sent successfully");
            } else {
                log.error("Email sent failed: StatusCode = {}, Body = {}", response.getStatusCode(), response.getBody());
                throw new AppException(ErrorCode.EMAIL_INVALID);
            }
        } catch (IOException e) {
            log.error("Email sent failed");
            throw new AppException(ErrorCode.EMAIL_INVALID);
        }
    }

    @Override
    public void sendRequestFeedback(String to, String subject, String body) {

    }
}

