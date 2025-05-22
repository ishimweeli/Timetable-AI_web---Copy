package com.ist.timetabling.Timetable.dto.res;

import lombok.Data;

@Data
public class DtoResTimetableStats {
    private Double successRate;
    private Double failureRate;
    private Double avgGenerationTime;
    private Integer schedulesGeneratedToday;
    private String timetableUuid;
    private String timetableName;
}