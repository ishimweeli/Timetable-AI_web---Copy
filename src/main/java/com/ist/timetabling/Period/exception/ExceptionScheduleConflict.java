package com.ist.timetabling.Period.exception;

public class ExceptionScheduleConflict extends RuntimeException {
    public ExceptionScheduleConflict(String message) {
        super(message);
    }
}