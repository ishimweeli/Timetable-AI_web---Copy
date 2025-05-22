package com.ist.timetabling.Timetable.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Response DTO for binding scheduling summary
 * Contains information about how many periods are scheduled for a binding
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoResBindingSchedulingSummary {
    private Integer bindingId;
    private Integer totalPeriods;
    private Integer scheduledPeriods;
    private Integer remainingPeriods;
    private Boolean isOverscheduled;
}