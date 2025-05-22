package com.ist.timetabling.Ai.dto.req;

import lombok.Data;


@Data
public class DtoReqAi {

    private String provider;
    private String model;
    private String system;
    private String context;
    private String history;
    private String message;
    private Integer organizationId;
    private Integer planSettingId;

}
