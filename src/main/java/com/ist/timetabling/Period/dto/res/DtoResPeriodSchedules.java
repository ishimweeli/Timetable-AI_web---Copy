package com.ist.timetabling.Period.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DtoResPeriodSchedules {
    private String uuid;
    private String time;
    private List<ScheduleDto> schedules;
    private List days;
    private Integer planSettingsId;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ScheduleDto {
        private Integer day;
        private Integer periodId;
    }
}
