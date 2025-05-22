package com.ist.timetabling.Period.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public  class DtoResSchedule {
    private Integer day;
    private String scheduleId;
}