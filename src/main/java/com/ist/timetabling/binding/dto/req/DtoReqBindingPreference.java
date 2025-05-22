package com.ist.timetabling.binding.dto.req;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoReqBindingPreference {
    private String preferenceType;
    private Boolean preferenceValue;
}