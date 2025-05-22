package com.ist.timetabling.Teacher.dto.req;

import com.ist.timetabling.Teacher.util.TimeRange;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalTime;
import static com.ist.timetabling.Teacher.constant.ConstantTeacherAvailabilityI18n.*;


@Data
@AllArgsConstructor
public class DtoReqTeacherAvailability {

    private static final int MIN_DURATION_MINUTES = 30;

    private static final int MAX_DURATION_MINUTES = 480;

    @NotNull(message = I18N_TEACHER_AVAILABILITY_DAYOFWEEK_REQUIRED)
    @Min(value = 1, message = I18N_TEACHER_AVAILABILITY_DAYOFWEEK_RANGE)
    @Max(value = 5, message = I18N_TEACHER_AVAILABILITY_DAYOFWEEK_RANGE)
    private Integer dayOfWeek;

    @NotNull(message = I18N_TEACHER_AVAILABILITY_STARTTIME_REQUIRED)
    @TimeRange(message = I18N_TEACHER_AVAILABILITY_STARTTIME_RANGE)
    private LocalTime startTime;

    @NotNull(message = I18N_TEACHER_AVAILABILITY_ENDTIME_REQUIRED)
    @TimeRange(message = I18N_TEACHER_AVAILABILITY_ENDTIME_RANGE)
    private LocalTime endTime;

}
