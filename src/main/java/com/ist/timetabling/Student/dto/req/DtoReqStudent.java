package com.ist.timetabling.Student.dto.req;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import static com.ist.timetabling.Student.constant.ConstantStudentI18n.*;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoReqStudent {

    @NotNull(message = I18N_STUDENT_ORGANIZATION_REQUIRED)
    private Integer organizationId;

    @NotNull(message = I18N_STUDENT_CLASS_REQUIRED)
    private Integer classId;

    @NotBlank(message = I18N_STUDENT_FULL_NAME_INVALID)
    private String fullName;

    @NotBlank(message = I18N_STUDENT_STUDENT_ID_INVALID)
    private String studentIdNumber;

    private String department;

    @Email(message = I18N_STUDENT_EMAIL_INVALID)
    private String email;

    private String phone;

    private String lastName;

    private String firstName;

    private String notes;

    private String address;

    private Integer statusId;

}
