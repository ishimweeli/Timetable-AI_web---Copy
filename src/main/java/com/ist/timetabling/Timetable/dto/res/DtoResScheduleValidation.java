package com.ist.timetabling.Timetable.dto.res;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoResScheduleValidation {
    private Boolean valid;
    private Integer bindingId;
    private Integer dayOfWeek;
    private Integer periodId;
    private Integer timetableId;
    private List<DtoResScheduleConflict> conflicts;
    private List<String> validationErrors;
    
    // Additional method to maintain compatibility with controller
    public Boolean getIsValid() {
        return valid;
    }
} 