package com.ist.timetabling.Notifications.dto.req;

import lombok.Data;

@Data
public class DtoReqNotification {
    private String userUuid;
    private Boolean unreadOnly;
}
