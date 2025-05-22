package com.ist.timetabling.Notifications.repository;

import com.ist.timetabling.Notifications.entity.EntityNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RepositoryNotification extends JpaRepository<EntityNotification, Long> {
    
    Optional<EntityNotification> findByUuidAndIsDeletedFalse(String uuid);
    
    @Query("SELECT n FROM EntityNotification n WHERE n.userUuid = :userUuid AND n.isDeleted = false AND n.expiresAt > :now ORDER BY n.createdDate DESC")
    List<EntityNotification> findActiveNotificationsByUserUuid(@Param("userUuid") String userUuid, @Param("now") LocalDateTime now);
    
    @Query("SELECT n FROM EntityNotification n WHERE n.userUuid = :userUuid AND n.isDeleted = false AND n.isRead = false AND n.expiresAt > :now ORDER BY n.createdDate DESC")
    List<EntityNotification> findUnreadNotificationsByUserUuid(@Param("userUuid") String userUuid, @Param("now") LocalDateTime now);
}
