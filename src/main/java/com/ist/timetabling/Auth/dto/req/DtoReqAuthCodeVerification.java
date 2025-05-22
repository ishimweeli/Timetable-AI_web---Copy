package com.ist.timetabling.Auth.dto.req;

import com.ist.timetabling.Auth.entity.EntityAuthCode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import static com.ist.timetabling.Auth.constant.ConstantI18nAuth.*;


@Data
public class DtoReqAuthCodeVerification {

    @NotBlank(message = I18N_AUTH_VERIFICATION_CODE_IS_REQUIRED)
    private String code;

    @NotNull(message = I18N_AUTH_CODE_IS_REQUIRED)
    private EntityAuthCode.AuthCodeType type;

    private String email;

} 