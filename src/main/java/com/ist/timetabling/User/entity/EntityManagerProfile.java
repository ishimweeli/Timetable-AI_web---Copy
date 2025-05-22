package com.ist.timetabling.User.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;

@Table(name = EntityManagerProfile.TABLE)
@Entity
@Data
@NoArgsConstructor
public class EntityManagerProfile {
    public static final String TABLE = "manager_profiles";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "manager_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "manager_uuid";

    @Column(name = USER_ID, nullable = false)
    private Integer userId = 0;
    public static final String USER_ID = "manager_user_id";

    @Column(name = ORGANIZATION_ID, nullable = false)
    private Integer organizationId = 0;
    public static final String ORGANIZATION_ID = "manager_organization_id";

    @Column(name = CAN_GENERATE_TIMETABLE, nullable = false)
    private Boolean canGenerateTimetable = false;
    public static final String CAN_GENERATE_TIMETABLE = "manager_can_generate_timetable";

    @Column(name = CAN_MANAGE_TEACHERS, nullable = false)
    private Boolean canManageTeachers = false;
    public static final String CAN_MANAGE_TEACHERS = "manager_can_manage_teachers";

    @Column(name = CAN_MANAGE_STUDENTS, nullable = false)
    private Boolean canManageStudents = false;
    public static final String CAN_MANAGE_STUDENTS = "manager_can_manage_students";

    @Column(name = CAN_CREATE_MANAGER, nullable = false)
    private Boolean canCreateManagers = false;
    public static final String CAN_CREATE_MANAGER = "manager_can_create_managers";

    @Column(name = CREATED_BY, nullable = false)
    private Integer createdBy = 0;
    public static final String CREATED_BY = "manager_created_by";

    @Column(name = MODIFIED_BY, nullable = false)
    private Integer modifiedBy = 0;
    public static final String MODIFIED_BY = "manager_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false, updatable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "manager_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "manager_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    private Integer statusId = 0;
    public static final String STATUS_ID = "manager_status_id";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted = false;
    public static final String IS_DELETED = "manager_is_deleted";
} 