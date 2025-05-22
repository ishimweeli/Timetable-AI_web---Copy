package com.ist.timetabling.Class.exception;

public class ExceptionClassAlreadyExists extends RuntimeException {
    public ExceptionClassAlreadyExists(final String message) {
        super(message);
    }
}