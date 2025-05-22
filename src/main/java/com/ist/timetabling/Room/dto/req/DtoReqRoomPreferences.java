package com.ist.timetabling.Room.dto.req;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;


@Data
@NoArgsConstructor
public class DtoReqRoomPreferences {
    @NotEmpty(message = "At least one preference is required")
    @Valid
    private List<DtoReqRoomPreference> preferences;
}