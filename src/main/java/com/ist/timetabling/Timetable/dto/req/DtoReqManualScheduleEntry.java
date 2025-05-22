package com.ist.timetabling.Timetable.dto.req;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Request DTO for manual schedule entry creation
 * Used to manually place a binding in a timetable at a specific day and period
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoReqManualScheduleEntry {
    private Integer timetableId;
    private Integer bindingId;
    private Integer dayOfWeek;
    private Integer periodId;
    private Boolean isDraft;
} 