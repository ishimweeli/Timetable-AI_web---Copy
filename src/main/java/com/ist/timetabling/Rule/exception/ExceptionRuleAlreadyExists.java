package com.ist.timetabling.Rule.exception;

public class ExceptionRuleAlreadyExists extends RuntimeException {
    public ExceptionRuleAlreadyExists(String message) {
        super(message);
    }
}