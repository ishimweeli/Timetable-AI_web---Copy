package com.ist.timetabling.Timetable.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ExceptionTimetableNotFound extends RuntimeException {

    public ExceptionTimetableNotFound(String message) {
        super(message);
    }

}
