package vn.fpt.se18.MentorLinking_BackEnd.dto.request.mentor;

import jakarta.persistence.Column;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorEducationRequest {

    private String schoolName;

    private String major;

    private java.time.LocalDate startDate;

    private java.time.LocalDate endDate;

    private String certificateImage;

}
