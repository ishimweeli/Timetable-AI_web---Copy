package com.ist.timetabling.Auth.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoResAuthLogin {

    private String firstName;
    private String lastName;
    private String email;
    private String uuid;
    private String phone;
    private Integer roleId;
    private String roleName;
    private Integer organizationId;
    private String token;
    private String  refreshToken;

}
