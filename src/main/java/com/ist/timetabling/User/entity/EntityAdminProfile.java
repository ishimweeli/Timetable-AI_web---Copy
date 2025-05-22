package com.ist.timetabling.User.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;


@Table(name = EntityAdminProfile.TABLE)
@Entity
@Data
@NoArgsConstructor
@EqualsAndHashCode
public class EntityAdminProfile {

    public static final String TABLE = "admin_profiles";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "admin_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "admin_uuid";

    @Column(name = USER_ID, nullable = false)
    private Integer userId = 0;
    public static final String USER_ID = "admin_user_id";

    @Column(name = ORGANIZATION_ID, nullable = false)
    private Integer organizationId = 0;
    public static final String ORGANIZATION_ID = "admin_organization_id";

    @Column(name = CAN_MANAGE_ORGANIZATIONS, nullable = false)
    private Boolean canManageOrganizations = false;
    public static final String CAN_MANAGE_ORGANIZATIONS = "admin_can_manage_organizations";

    @Column(name = CREATED_BY, nullable = false)
    private Integer createdBy = 0;
    public static final String CREATED_BY = "admin_created_by";

    @Column(name = MODIFIED_BY, nullable = false)
    private Integer modifiedBy = 0;
    public static final String MODIFIED_BY = "admin_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false, updatable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "admin_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "admin_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    private Integer statusId = 0;
    public static final String STATUS_ID = "admin_status_id";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted = false;
    public static final String IS_DELETED = "admin_is_deleted";

}
