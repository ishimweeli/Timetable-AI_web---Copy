package com.ist.timetabling.Core.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;


@Table(name = EntityAttendance.TABLE)
@Entity
@Data
@NoArgsConstructor
public class EntityAttendance {

    public static final String TABLE = "attendances";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Long id;
    public static final String ID = "attendance_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "attendance_uuid";

    @Column(name = TIMETABLE_ENTRY_ID, nullable = false)
    private Integer timetableEntryId;
    public static final String TIMETABLE_ENTRY_ID = "attendance_timetable_entry_id";

    @Column(name = STUDENT_ID, nullable = false)
    private Integer studentId;
    public static final String STUDENT_ID = "attendance_student_id";

    @Column(name = STATUS, nullable = false)
    private String status;
    public static final String STATUS = "attendance_status";

    @Column(name = RECORDED_AT, nullable = false)
    private LocalDateTime recordedAt;
    public static final String RECORDED_AT = "attendance_recorded_at";

    @Column(name = CREATED_BY, nullable = false)
    private Integer createdBy;
    public static final String CREATED_BY = "attendance_created_by";

    @Column(name = MODIFIED_BY, nullable = false)
    private Integer modifiedBy;
    public static final String MODIFIED_BY = "attendance_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false, updatable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "attendance_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "attendance_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    private Integer statusId;
    public static final String STATUS_ID = "attendance_status_id";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted;
    public static final String IS_DELETED = "attendance_is_deleted";

}