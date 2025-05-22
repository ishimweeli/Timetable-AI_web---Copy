package com.ist.timetabling.Core.exception;

import lombok.Getter;


@Getter
public class ExceptionCoreValidation extends RuntimeException {

    private final String title;

    public ExceptionCoreValidation(final String title, final String message) {
        super(message);
        this.title = title;
    }

}
