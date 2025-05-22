package com.ist.timetabling.Auth.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DtoResAuthRefreshToken {

    private String token;
    private String refreshToken;

}
