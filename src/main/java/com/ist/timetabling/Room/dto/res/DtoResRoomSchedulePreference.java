package com.ist.timetabling.Room.dto.res;

import lombok.Data;

@Data
public class DtoResRoomSchedulePreference {
    private Integer id;
    private String uuid;
    private String scheduleUuid;
    private Integer periodId;
    private Integer day;
    private Boolean isAvailable;
    private Integer planSettingsId;
}