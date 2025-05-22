package com.ist.timetabling.Notifications.controller;

import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Notifications.dto.req.DtoReqNotification;
import com.ist.timetabling.Notifications.dto.res.DtoResNotification;
import com.ist.timetabling.Notifications.service.ServiceNotification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class ControllerNotification {

    private final ServiceNotification serviceNotification;

    @Autowired
    public ControllerNotification(final ServiceNotification serviceNotification) {
        this.serviceNotification = serviceNotification;
    }

    @GetMapping("/user/{userUuid}")
    public ResponseEntity<ApiResponse<List<DtoResNotification>>> getUserNotifications(
            @PathVariable final String userUuid,
            @RequestParam(required = false) final Boolean unreadOnly) {
        
        final DtoReqNotification dtoReqNotification = new DtoReqNotification();
        dtoReqNotification.setUserUuid(userUuid);
        dtoReqNotification.setUnreadOnly(unreadOnly);
        
        final ApiResponse<List<DtoResNotification>> apiResponse = serviceNotification.getUserNotifications(dtoReqNotification);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping("/unread-user/{userUuid}")
    public ResponseEntity<ApiResponse<List<DtoResNotification>>> getUnreadUserNotifications(
            @PathVariable final String userUuid,
            @RequestParam(required = false) final Boolean unreadOnly) {

        final ApiResponse<List<DtoResNotification>> apiResponse = serviceNotification.getUnreadUserNotifications(userUuid, unreadOnly);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping("/unread-count/{userUuid}")
    public ResponseEntity<ApiResponse<Integer>> getUnreadCount(@PathVariable final String userUuid) {
        final ApiResponse<Integer> apiResponse = serviceNotification.getUnreadCount(userUuid);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @PutMapping("/{notificationId}/mark-read")
    public ResponseEntity<ApiResponse<DtoResNotification>> markAsRead(@PathVariable final Long notificationId) {
        final ApiResponse<DtoResNotification> apiResponse = serviceNotification.markAsRead(notificationId);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }
}
