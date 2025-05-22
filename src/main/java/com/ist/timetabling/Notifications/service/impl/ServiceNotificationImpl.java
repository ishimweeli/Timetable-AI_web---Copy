package com.ist.timetabling.Notifications.service.impl;

import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.Notifications.dto.req.DtoReqNotification;
import com.ist.timetabling.Notifications.dto.res.DtoResNotification;
import com.ist.timetabling.Notifications.entity.EntityNotification;
import com.ist.timetabling.Notifications.repository.RepositoryNotification;
import com.ist.timetabling.Notifications.service.ServiceNotification;
import com.ist.timetabling.User.entity.EntityUser;
import com.ist.timetabling.User.repository.RepositoryUser;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import static com.ist.timetabling.Notifications.constant.ConstantNotificationI18n.*;

@Service
public class ServiceNotificationImpl implements ServiceNotification {

    private final RepositoryNotification repositoryNotification;
    private final RepositoryUser repositoryUser;
    private final HttpServletRequest httpServletRequest;

    @Autowired
    public ServiceNotificationImpl(final RepositoryNotification repositoryNotification, final RepositoryUser repositoryUser, final HttpServletRequest httpServletRequest) {
        this.repositoryNotification = repositoryNotification;
        this.repositoryUser = repositoryUser;
        this.httpServletRequest = httpServletRequest;
    }

    @Override
    public ApiResponse<List<DtoResNotification>> getUserNotifications(final DtoReqNotification dtoReqNotification) {
        final I18n i18n = new I18n(httpServletRequest);
        final String userUuid = dtoReqNotification.getUserUuid();
        final Boolean unreadOnly = dtoReqNotification.getUnreadOnly();
        final LocalDateTime now = LocalDateTime.now();
        
        List<EntityNotification> notifications;
        
        if (unreadOnly != null && unreadOnly) {
            notifications = repositoryNotification.findUnreadNotificationsByUserUuid(userUuid, now);
        } else {
            notifications = repositoryNotification.findActiveNotificationsByUserUuid(userUuid, now);
        }
        
        final List<DtoResNotification> dtoResNotifications = notifications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
                
        final String message = dtoResNotifications.isEmpty() 
                ? i18n.getNotification(I18N_NOTIFICATION_NOT_FOUND)
                : i18n.getNotification(I18N_NOTIFICATION_LIST_SUCCESS);
                
        return ApiResponse.success(HttpStatus.OK, message, dtoResNotifications);
    }

    @Override
    public ApiResponse<List<DtoResNotification>> getUnreadUserNotifications(final String userUuid, final Boolean unreadOnly) {
        final I18n i18n = new I18n(httpServletRequest);
        final LocalDateTime now = LocalDateTime.now();

        List<EntityNotification> notifications;

        if (unreadOnly != null && unreadOnly) {
            notifications = repositoryNotification.findUnreadNotificationsByUserUuid(userUuid, now);
        } else {
            notifications = repositoryNotification.findActiveNotificationsByUserUuid(userUuid, now);
        }

        final List<DtoResNotification> dtoResNotifications = notifications.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        final String message = dtoResNotifications.isEmpty()
                ? i18n.getNotification(I18N_NOTIFICATION_NOT_FOUND)
                : i18n.getNotification(I18N_NOTIFICATION_LIST_SUCCESS);

        return ApiResponse.success(HttpStatus.OK, message, dtoResNotifications);
    }

    @Override
    public ApiResponse<DtoResNotification> markAsRead(final Long notificationId) {
        final I18n i18n = new I18n(httpServletRequest);
        final EntityNotification entityNotification = repositoryNotification.findById(notificationId)
                .orElseThrow(() -> new RuntimeException(i18n.getNotification(I18N_NOTIFICATION_NOT_FOUND)));
        
        entityNotification.setIsRead(true);
        entityNotification.setModifiedDate(LocalDateTime.now());
        
        final EntityNotification updatedNotification = repositoryNotification.save(entityNotification);
        final DtoResNotification dtoResNotification = convertToDto(updatedNotification);
        
        return ApiResponse.success(HttpStatus.OK, i18n.getNotification(I18N_NOTIFICATION_MARKED_READ), dtoResNotification);
    }

    @Override
    public ApiResponse<Integer> getUnreadCount(final String userUuid) {
        final I18n i18n = new I18n(httpServletRequest);
        final LocalDateTime now = LocalDateTime.now();
        final List<EntityNotification> unreadNotifications = 
                repositoryNotification.findUnreadNotificationsByUserUuid(userUuid, now);
        final Integer count = unreadNotifications.size();
        
        return ApiResponse.success(HttpStatus.OK, i18n.getNotification(I18N_NOTIFICATION_COUNT_SUCCESS), count);
    }


    @Override
    public void createActionNotification(final String userUuid, final String title, final String message, final String type, final String entityType) {
        final Optional<EntityUser> optionalUser = repositoryUser.findByUuidAndIsDeletedFalse(userUuid);
        if (!optionalUser.isPresent()) {
            return;
        }

        final EntityUser entityUser = optionalUser.get();
        final Integer userId = entityUser.getId();
        final Integer organizationId = entityUser.getOrganization().getId();

        final EntityNotification entityNotification = new EntityNotification();
        entityNotification.setUserUuid(userUuid);
        entityNotification.setTitle(title);
        entityNotification.setMessage(message);
        entityNotification.setType(type);
        entityNotification.setEntityType(entityType);
        entityNotification.setIsRead(false);
        entityNotification.setIsDeleted(false);
        entityNotification.setCreatedDate(LocalDateTime.now());
        entityNotification.setExpiresAt(LocalDateTime.now().plusMonths(1));
        entityNotification.setCreatedBy(userId);
        entityNotification.setModifiedBy(userId);
        entityNotification.setStatusId(1);
        entityNotification.setOrganizationId(organizationId);
        repositoryNotification.save(entityNotification);
    }

    private DtoResNotification convertToDto(final EntityNotification entityNotification) {
        final DtoResNotification dtoResNotification = new DtoResNotification();
        dtoResNotification.setNotificationId(entityNotification.getId());
        dtoResNotification.setUuid(entityNotification.getUuid());
        dtoResNotification.setTitle(entityNotification.getTitle());
        dtoResNotification.setMessage(entityNotification.getMessage());
        dtoResNotification.setType(entityNotification.getType());
        dtoResNotification.setIsRead(entityNotification.getIsRead());
        dtoResNotification.setExpiresAt(entityNotification.getExpiresAt());
        dtoResNotification.setCreatedDate(entityNotification.getCreatedDate());
        dtoResNotification.setUserUuid(entityNotification.getUserUuid());
        return dtoResNotification;
    }

}
