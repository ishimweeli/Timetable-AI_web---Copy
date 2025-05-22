package com.ist.timetabling.Timetable.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import static com.ist.timetabling.Timetable.constant.ConstantTimeTableI18n.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DtoReqTimetableAdmin {

    @NotNull(message = I18N_TIMETABLE_ORGANIZATION_REQUIRED)
    private Integer organizationId;

    @NotBlank(message = I18N_TIMETABLE_ACADEMIC_REQUIRED)
    private String academicYear;

    @NotBlank(message = I18N_TIMETABLE_SEMESTER_REQUIRED)
    private String semester;

}
