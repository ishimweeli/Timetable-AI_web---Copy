package com.ist.timetabling.Core.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;


@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
public class ExceptionEmailSendFailure extends RuntimeException {

    private final String errorCode;

    public ExceptionEmailSendFailure(final String message) {
        super(message);
        this.errorCode = "EMAIL_SEND_FAILURE";
    }

}

