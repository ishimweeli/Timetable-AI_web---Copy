package com.ist.timetabling.Teacher.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;
import java.time.LocalTime;


@Table(name = EntityTeacherAvailability.TABLE)
@Entity
@Data
@NoArgsConstructor
public class EntityTeacherAvailability {

    public static final String TABLE = "teacher_availabilities";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "teacher_availability_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "teacher_availability_uuid";

    @Column(name = ORGANIZATION_ID, nullable = false)
    private Integer organizationId;
    public static final String ORGANIZATION_ID = "organization_id";

    @Column(name = TEACHER_ID, nullable = false)
    private Integer teacherId;
    public static final String TEACHER_ID = "teacher_id";

    @Column(name = DAY_OF_WEEK, nullable = false)
    private Integer dayOfWeek;
    public static final String DAY_OF_WEEK = "teacher_availability_day_of_week";

    @Column(name = START_TIME, nullable = false)
    private LocalTime startTime;
    public static final String START_TIME = "teacher_availability_start_time";

    @Column(name = END_TIME, nullable = false)
    private LocalTime endTime;
    public static final String END_TIME = "teacher_availability_end_time";

    @Column(name = CREATED_BY, nullable = false)
    private Integer createdBy;
    public static final String CREATED_BY = "teacher_availability_created_by";

    @Column(name = MODIFIED_BY, nullable = false)
    private Integer modifiedBy;
    public static final String MODIFIED_BY = "teacher_availability_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false, updatable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "teacher_availability_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "teacher_availability_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    private Integer statusId;
    public static final String STATUS_ID = "teacher_availability_status_id";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted;
    public static final String IS_DELETED = "teacher_availability_is_deleted";

}