package com.ist.timetabling.PlanSetting.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class ExceptionPlanningSettingsAlreadyExists extends RuntimeException {
    public ExceptionPlanningSettingsAlreadyExists(String message) {
        super(message);
    }
}