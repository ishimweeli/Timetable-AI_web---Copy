package com.ist.timetabling.Teacher.util;

import com.ist.timetabling.Teacher.util.TimeRange;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.time.LocalTime;


public class TimeRangeValidator implements ConstraintValidator<TimeRange, LocalTime> {

    private LocalTime minTime;
    private LocalTime maxTime;

    @Override
    public void initialize(TimeRange constraintAnnotation) {
        this.minTime = LocalTime.parse(constraintAnnotation.min());
        this.maxTime = LocalTime.parse(constraintAnnotation.max());
    }

    @Override
    public boolean isValid(LocalTime value, ConstraintValidatorContext context) {
        if(value == null) {
            return true;
        }
        return !value.isBefore(minTime) && !value.isAfter(maxTime);
    }

}
