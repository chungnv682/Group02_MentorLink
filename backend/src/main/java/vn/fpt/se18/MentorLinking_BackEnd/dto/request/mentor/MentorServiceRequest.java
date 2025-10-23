package vn.fpt.se18.MentorLinking_BackEnd.dto.request.mentor;

import jakarta.persistence.Column;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorServiceRequest {
    private String serviceName;

    private String description;
}
