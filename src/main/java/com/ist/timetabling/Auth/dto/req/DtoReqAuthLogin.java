package com.ist.timetabling.Auth.dto.req;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import static com.ist.timetabling.Auth.constant.ConstantI18nAuth.*;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoReqAuthLogin {

    @NotBlank(message = I18N_AUTH_EMAIL_REQUIRED)
    @Email(message = I18N_AUTH_INVALID_EMAIL_FORMAT)
    private String email;

    @NotBlank(message = I18N_AUTH_PASSWORD_REQUIRED)
    private String password;

}
