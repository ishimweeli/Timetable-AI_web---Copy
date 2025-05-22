package com.ist.timetabling.PlanSetting.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ExceptionPlanningSettingsTimeConstraintViolation extends RuntimeException {
    public ExceptionPlanningSettingsTimeConstraintViolation(String message) {
        super(message);
    }
}