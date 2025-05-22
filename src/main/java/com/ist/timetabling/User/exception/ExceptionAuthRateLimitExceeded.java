package com.ist.timetabling.User.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.TOO_MANY_REQUESTS)
public class ExceptionAuthRateLimitExceeded extends RuntimeException {

    public ExceptionAuthRateLimitExceeded(String message) {
        super(message);
    }

    public ExceptionAuthRateLimitExceeded(String message, Throwable cause) {
        super(message, cause);
    }
}