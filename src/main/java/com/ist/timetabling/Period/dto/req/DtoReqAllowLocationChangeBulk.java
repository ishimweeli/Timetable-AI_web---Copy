package com.ist.timetabling.Period.dto.req;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class DtoReqAllowLocationChangeBulk {
    @NotEmpty
    private List<String> periodUuids;
    @NotNull
    private Boolean allowLocationChange;
}