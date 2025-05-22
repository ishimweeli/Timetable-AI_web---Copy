package com.ist.timetabling.Room.dto.res;

import java.time.LocalDateTime;

import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
public class DtoResRoom {

    private Integer id;
    private String uuid;
    private String name;
    private String code;
    private Integer capacity;
    private String description;
    private Integer statusId;
    private String initials;
    private Integer controlNumber;
    private String priority;
    private Integer createdBy;
    private Integer modifiedBy;
    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;
    private Integer organizationId;
    private Integer planSettingsId;
    private Integer locationNumber;

}