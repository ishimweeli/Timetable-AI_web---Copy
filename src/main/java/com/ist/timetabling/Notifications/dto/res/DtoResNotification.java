package com.ist.timetabling.Notifications.dto.res;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DtoResNotification {
    private Long notificationId;
    private String uuid;
    private String title;
    private String message;
    private String type;
    private Boolean isRead;
    private LocalDateTime expiresAt;
    private LocalDateTime createdDate;
    private String userUuid;
}
