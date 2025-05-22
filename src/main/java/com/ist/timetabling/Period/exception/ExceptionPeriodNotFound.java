package com.ist.timetabling.Period.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ExceptionPeriodNotFound extends RuntimeException {

    public ExceptionPeriodNotFound(String message) {
        super(message);
    }
}