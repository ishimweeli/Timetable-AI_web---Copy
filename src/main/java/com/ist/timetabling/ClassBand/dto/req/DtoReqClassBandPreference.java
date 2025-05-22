package com.ist.timetabling.ClassBand.dto.req;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DtoReqClassBandPreference {
    private String preferenceType;
    private Boolean preferenceValue;
    private Integer periodId;
    private Integer dayOfWeek;
}