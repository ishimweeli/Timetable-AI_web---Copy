package com.ist.timetabling.Notifications.service;

import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Notifications.dto.req.DtoReqNotification;
import com.ist.timetabling.Notifications.dto.res.DtoResNotification;

import java.util.List;

public interface ServiceNotification {

    ApiResponse<List<DtoResNotification>> getUserNotifications(final DtoReqNotification dtoReqNotification);

    // get user notifications with unread only
    ApiResponse<List<DtoResNotification>> getUnreadUserNotifications(final String userUuid, final Boolean unreadOnly);

    ApiResponse<DtoResNotification> markAsRead(final Long notificationId);

    ApiResponse<Integer> getUnreadCount(final String userUuid);

    void createActionNotification(final String userUuid, final String title, final String message, final String type, final String entityType);

}
