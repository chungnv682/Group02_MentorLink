package vn.fpt.se18.MentorLinking_BackEnd.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
@AllArgsConstructor
public enum ErrorCode {
    UNCATEGORIZED("01", "UNCATEGORIZED", HttpStatus.INTERNAL_SERVER_ERROR),
    METHOD_NOT_ALLOWED("02", "METHOD_NOT_ALLOWED", HttpStatus.METHOD_NOT_ALLOWED),
    UNAUTHORIZED("03", "UNAUTHORIZED", HttpStatus.FORBIDDEN),
    UNAUTHENTICATED("04", "UNAUTHENTICATED", HttpStatus.UNAUTHORIZED),
    INVALID_INPUT("05", "INVALID_INPUT", HttpStatus.BAD_REQUEST),
    ERROR_PATH("06", "ERROR_PATH", HttpStatus.BAD_REQUEST),
    INVALID_ENDPOINT("07", "INVALID_ENDPOINT", HttpStatus.BAD_REQUEST),
    JWT_EXPIRED("08", "JWT token has expired", HttpStatus.UNAUTHORIZED),
    JWT_INVALID_SIGNATURE("09", "JWT signature is invalid", HttpStatus.UNAUTHORIZED),
    JWT_MALFORMED("10", "JWT token is malformed", HttpStatus.UNAUTHORIZED),
    JWT_UNSUPPORTED("11", "JWT token is unsupported", HttpStatus.UNAUTHORIZED),
    JWT_ILLEGAL_ARGUMENT("12", "JWT token is invalid", HttpStatus.UNAUTHORIZED),
    EMAIL_INVALID("13", "EMAIL_INVALID", HttpStatus.BAD_REQUEST),
    ;
    private final String code;
    private final String message;
    private final HttpStatus httpStatus;
}
