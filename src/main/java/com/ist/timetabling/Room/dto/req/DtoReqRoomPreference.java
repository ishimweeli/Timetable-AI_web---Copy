package com.ist.timetabling.Room.dto.req;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
public class DtoReqRoomPreference {
    @NotNull(message = "Day of week is required")
    private Integer day;
    
    @NotNull(message = "Period ID is required")
    private Integer periodId;
    
    @NotNull(message = "Availability is required")
    private Boolean isAvailable;
}