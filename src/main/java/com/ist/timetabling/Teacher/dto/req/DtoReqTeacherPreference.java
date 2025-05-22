package com.ist.timetabling.Teacher.dto.req;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DtoReqTeacherPreference {
    private String preferenceType;
    private Boolean preferenceValue;
}