package com.ist.timetabling.PlanSetting.dto.req;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class DtoReqTimeBlockType {

    private String uuid;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Duration in minutes is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    @NotNull(message = "Number of occurrences is required")
    @Min(value = 0, message = "Occurrences must be a non-negative number")
    private Integer occurrences;

}