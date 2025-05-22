package com.ist.timetabling.Room.dto.req;
import static com.ist.timetabling.Room.constant.ConstantRoomI18n.I18N_ROOM_CAPACITY_NEGATIVE;
import static com.ist.timetabling.Room.constant.ConstantRoomI18n.I18N_ROOM_CAPACITY_REQUIRED;
import static com.ist.timetabling.Room.constant.ConstantRoomI18n.I18N_ROOM_CODE_REQUIRED;
import static com.ist.timetabling.Room.constant.ConstantRoomI18n.I18N_ROOM_NAME_REQUIRED;
import static com.ist.timetabling.Room.constant.ConstantRoomI18n.I18N_ROOM_STATUS_ID_REQUIRED;
import static com.ist.timetabling.Room.constant.ConstantRoomI18n.I18N_ROOM_ORGANIZATION_ID_REQUIRED;
import static com.ist.timetabling.Room.constant.ConstantRoomI18n.I18N_ROOM_CONTROLNUMBER_REQUIRED;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
public class DtoReqRoom {

    @NotBlank(message = I18N_ROOM_NAME_REQUIRED)
    private String name;

    @NotBlank(message = I18N_ROOM_CODE_REQUIRED)
    private String code;

    @NotNull(message = I18N_ROOM_CAPACITY_REQUIRED)
    @Min(value = 0, message = I18N_ROOM_CAPACITY_NEGATIVE)
    private Integer capacity;

    private String description = "";

    @NotNull(message = I18N_ROOM_STATUS_ID_REQUIRED)
    private Integer statusId;
    
    private String initials;
    
    private Integer controlNumber;
    
    private String priority;

    @NotNull(message = I18N_ROOM_ORGANIZATION_ID_REQUIRED)
    private Integer organizationId;

    private Integer planSettingsId;

    @NotNull(message = "Location number is required")
    @Min(value = 1, message = "Location number must be between 1 and 8")
    @Max(value = 8, message = "Location number must be between 1 and 8")
    private Integer locationNumber = 1;

}

