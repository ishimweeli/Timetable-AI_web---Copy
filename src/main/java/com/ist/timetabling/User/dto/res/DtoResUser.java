package com.ist.timetabling.User.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoResUser {
    private Integer id;
    private String uuid;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private Boolean isActive;
    private Integer roleId;
    private String roleName;
    private Boolean needsVerification;
}