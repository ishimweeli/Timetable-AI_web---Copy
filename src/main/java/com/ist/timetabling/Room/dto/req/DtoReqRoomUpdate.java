package com.ist.timetabling.Room.dto.req;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DtoReqRoomUpdate {

    @Size(max = 100)
    private String name;

    @Size(max = 500)
    private String description;

    @Size(max = 20)
    private String code;

    @Size(max = 5)
    private String initials;

    @Min(0)
    private Integer capacity;

    private String location;

    private String controlNumber;

    private String priority;

    private Integer organizationId;

    private Integer planSettingsId;

    private Integer statusId;
} 