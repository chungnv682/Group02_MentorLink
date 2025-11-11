package vn.fpt.se18.MentorLinking_BackEnd;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MentorLinkingBackEndApplication {

	public static void main(String[] args) {
		SpringApplication.run(MentorLinkingBackEndApplication.class, args);
	}

}
