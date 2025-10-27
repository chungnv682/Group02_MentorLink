package vn.fpt.se18.MentorLinking_BackEnd.dto.request.user;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Size;
import lombok.Getter;

import java.time.LocalDate;

@Getter
public class UpdateProfileRequest {

    private String fullname;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dob;

    private String phone;

    private String gender;

    private String address;

    private String currentLocation;

    private String title;

    private String linkedinUrl;

    private String avatarUrl;

    private String intro;

    private String bankAccountNumber;

    private String bankName;

}

