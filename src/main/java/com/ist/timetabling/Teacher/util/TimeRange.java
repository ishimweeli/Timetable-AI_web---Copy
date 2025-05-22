package com.ist.timetabling.Teacher.util;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;


@Documented
@Constraint(validatedBy = TimeRangeValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface TimeRange {

    String message() default "Time must be between 08:00 and 16:00";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    String min() default "08:00";

    String max() default "16:00";

}
