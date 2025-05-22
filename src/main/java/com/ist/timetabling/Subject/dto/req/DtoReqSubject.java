package com.ist.timetabling.Subject.dto.req;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import static com.ist.timetabling.Subject.constant.ConstantSubjectI18n.*;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class DtoReqSubject {

    @NotNull(message = I18N_SUBJECT_ORGANIZATION_REQUIRED)
    private Integer organizationId;

    @NotBlank(message = I18N_SUBJECT_INITIALS_REQUIRED)
    private String initials;

    @NotBlank(message = I18N_SUBJECT_NAME_REQUIRED)
    private String name;

    private String description;

    @NotNull(message = I18N_SUBJECT_MIN_REQUIRED)
    @Min(value = 1, message = I18N_SUBJECT_MESSAGE_DURATION)
    private Integer durationInMinutes;

    @NotNull(message = I18N_SUBJECT_RED_REPETITION_REQUIRED)
    private Boolean redRepetition;

    @NotNull(message = I18N_SUBJECT_BLUE_REPETITION_REQUIRED)
    private Boolean blueRepetition;

    private Integer conflictSubjectId;

    private String group;

    @NotNull(message = I18N_SUBJECT_CONFLICT_HANDLING_REQUIRED)
    private Boolean autoConflictHandling;

    @NotNull(message = I18N_SUBJECT_STATUS_ID_REQUIRED)
    private Integer statusId;

    private Boolean isDeleted;

    private String color;
}
