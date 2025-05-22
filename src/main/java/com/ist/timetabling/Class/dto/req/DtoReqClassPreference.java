package com.ist.timetabling.Class.dto.req;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DtoReqClassPreference {
    private String preferenceType;
    private Boolean preferenceValue;
    private Integer periodId;
    private Integer dayOfWeek;
}
