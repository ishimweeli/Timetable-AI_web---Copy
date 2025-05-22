package com.ist.timetabling.User.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoResUserProfile {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Integer statusId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String role;
    private boolean isActive;

}