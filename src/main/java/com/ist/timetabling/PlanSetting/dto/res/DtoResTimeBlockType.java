package com.ist.timetabling.PlanSetting.dto.res;

import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class DtoResTimeBlockType {

    private Integer id;
    private String uuid;
    private String name;
    private Integer durationMinutes;
    private Integer occurrences;
    private Integer createdBy;
    private Integer modifiedBy;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;
}