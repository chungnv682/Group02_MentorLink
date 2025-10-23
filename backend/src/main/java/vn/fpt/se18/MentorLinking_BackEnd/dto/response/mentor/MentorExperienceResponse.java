package vn.fpt.se18.MentorLinking_BackEnd.dto.response.mentor;

import jakarta.persistence.Column;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorExperienceResponse {
    private String companyName;

    private String position;

    private java.time.LocalDate startDate;

    private java.time.LocalDate endDate;

    private String experienceImage;
}
