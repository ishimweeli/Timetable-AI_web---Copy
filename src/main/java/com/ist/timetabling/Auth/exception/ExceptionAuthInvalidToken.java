package com.ist.timetabling.Auth.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;


@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class ExceptionAuthInvalidToken extends RuntimeException {

    public ExceptionAuthInvalidToken(String message) {
        super(message);
    }

}
