package com.ist.timetabling.Notifications.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;


@Table(name = EntityNotification.TABLE)
@Entity
@Data
@NoArgsConstructor
public class EntityNotification {

    public static final String TABLE = "notifications";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Long id;
    public static final String ID = "notification_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "notification_uuid";

    @Column(name = USER_UUID, nullable = false)
    private String userUuid;
    public static final String USER_UUID = "notification_user_uuid";

    @Column(name = TITLE, nullable = false)
    private String title;
    public static final String TITLE = "notification_title";

    @Lob
    @Column(name = MESSAGE, nullable = false)
    private String message;
    public static final String MESSAGE = "notification_message";

    @Column(name = TYPE, nullable = false)
    private String type;
    public static final String TYPE = "notification_type";

    @Column(name = IS_READ, nullable = false)
    private Boolean isRead;
    public static final String IS_READ = "notification_is_read";

    @Column(name = EXPIRES_AT, nullable = false)
    private LocalDateTime expiresAt;
    public static final String EXPIRES_AT = "notification_expires_at";

    @Column(name = CREATED_BY, nullable = false)
    private Integer createdBy;
    public static final String CREATED_BY = "notification_created_by";

    @Column(name = MODIFIED_BY, nullable = false)
    private Integer modifiedBy;
    public static final String MODIFIED_BY = "notification_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false, updatable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "notification_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "notification_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    private Integer statusId;
    public static final String STATUS_ID = "notification_status_id";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted;
    public static final String IS_DELETED = "notification_is_deleted";


    @Column(name = ENTITY_TYPE, nullable = true)
    private String entityType;
    public static final String ENTITY_TYPE = "notification_entity_type";

    @Column(name = ORGANIZATION_ID, nullable = false)
    private Integer organizationId;
    public static final String ORGANIZATION_ID = "notification_organization_id";

}