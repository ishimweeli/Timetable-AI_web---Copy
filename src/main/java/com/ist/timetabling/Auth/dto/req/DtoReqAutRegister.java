package com.ist.timetabling.Auth.dto.req;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;
import static com.ist.timetabling.Auth.constant.ConstantI18nAuth.*;


@Data
public class DtoReqAutRegister {

    @NotBlank(message = I18N_AUTH_FIRST_NAME_REQUIRED)
    private String firstName;

    @NotBlank(message = I18N_AUTH_LAST_NAME_REQUIRED)
    private String lastName;

    @Email(message = I18N_AUTH_INVALID_EMAIL_FORMAT)
    @NotBlank(message = I18N_AUTH_EMAIL_REQUIRED)
    private String email;

    @NotBlank(message = I18N_AUTH_PASSWORD_REQUIRED)
    @Size(min = 8, message = I18N_AUTH_PASSWORD_MIN_LENGTH)
    @Pattern(regexp = ".*\\d.*", message = I18N_AUTH_PASSWORD_DIGIT_REQUIRED)
    @Pattern(regexp = ".*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?].*", message = I18N_AUTH_PASSWORD_SPECIAL_CHAR_REQUIRED)
    private String password;

    @NotBlank(message = I18N_AUTH_PHONE_REQUIRED)
    @Pattern(regexp = "^(\\+\\d{1,3})?[- ]?(\\(\\d{1,4}\\))?[- ]?\\d{1,4}[- ]?\\d{1,4}[- ]?\\d{1,9}$", message = I18N_AUTH_PHONE_NUMBER_INVALID)
    private String phone;

    @NotBlank(message = I18N_AUTH_ORGANIZATION_NAME_REQUIRED)
    private String organizationName;

    private String avatarUrl;

}
