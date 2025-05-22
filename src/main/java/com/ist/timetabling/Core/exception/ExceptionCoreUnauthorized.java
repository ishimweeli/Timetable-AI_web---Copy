package com.ist.timetabling.Core.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;


@ResponseStatus(HttpStatus.NOT_FOUND)
public class ExceptionCoreUnauthorized extends RuntimeException {

    public ExceptionCoreUnauthorized(String message) {
        super(message);
    }

}

