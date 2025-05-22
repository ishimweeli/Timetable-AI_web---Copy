package com.ist.timetabling.Auth.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import static com.ist.timetabling.Auth.constant.ConstantI18nAuth.*;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DtoReqAuthRefreshToken {

    @NotBlank(message = I18N_AUTH_REFRESH_TOKEN_IS_REQUIRED)
    private String refreshToken;

}
