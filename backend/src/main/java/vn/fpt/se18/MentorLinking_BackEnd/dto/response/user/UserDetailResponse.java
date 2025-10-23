package vn.fpt.se18.MentorLinking_BackEnd.dto.response.user;

import lombok.Builder;
import lombok.Getter;
import vn.fpt.se18.MentorLinking_BackEnd.util.UserStatus;

import java.io.Serializable;
import java.util.Date;

@Builder
@Getter
public class UserDetailResponse implements Serializable {
    private Long id;

    private String email;

    private String username;

    private UserStatus status;
}
