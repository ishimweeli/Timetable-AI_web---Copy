//package com.ist.timetabling.Class.entity;
//
//import jakarta.persistence.*;
//import lombok.Data;
//import lombok.EqualsAndHashCode;
//import lombok.NoArgsConstructor;
//import org.hibernate.annotations.CreationTimestamp;
//import org.hibernate.annotations.UpdateTimestamp;
//import org.hibernate.annotations.UuidGenerator;
//
//import java.time.LocalDateTime;
//
//@Table(name = EntityClassBindingSchedule.TABLE)
//@Entity
//@Data
//@NoArgsConstructor
//@EqualsAndHashCode
//public class EntityClassBindingSchedule {
//
//    public static final String TABLE = "class_binding_schedules";
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    @Column(name = ID, columnDefinition = "BIGINT UNSIGNED AUTO_INCREMENT")
//    private Long id;
//    public static final String ID = "schedule_id";
//
//    @UuidGenerator
//    @Column(name = UUID, columnDefinition = "CHAR(36) NOT NULL")
//    private String uuid;
//    public static final String UUID = "schedule_uuid";
//
//    @Column(name = BINDING_ID, nullable = false, columnDefinition = "INT UNSIGNED NOT NULL DEFAULT 0")
//    private int bindingId = 0;
//    public static final String BINDING_ID = "schedule_binding_id";
//
//    @Column(name = DAY_OF_WEEK, nullable = false, columnDefinition = "INT UNSIGNED NOT NULL DEFAULT 0")
//    private int dayOfWeek = 0;
//    public static final String DAY_OF_WEEK = "schedule_day_of_week";
//
//    @Column(name = START_TIME, nullable = false, columnDefinition = "TIME NOT NULL DEFAULT '00:00:00'")
//    private String startTime = "00:00:00";
//    public static final String START_TIME = "schedule_start_time";
//
//    @Column(name = END_TIME, nullable = false, columnDefinition = "TIME NOT NULL DEFAULT '00:00:00'")
//    private String endTime = "00:00:00";
//    public static final String END_TIME = "schedule_end_time";
//
//    @Column(name = CREATED_BY, nullable = false, columnDefinition = "INT UNSIGNED NOT NULL DEFAULT 0")
//    private Integer createdBy = 0;
//    public static final String CREATED_BY = "schedule_created_by";
//
//    @Column(name = MODIFIED_BY, nullable = false, columnDefinition = "INT UNSIGNED NOT NULL DEFAULT 0")
//    private Integer modifiedBy = 0;
//    public static final String MODIFIED_BY = "schedule_modified_by";
//
//    @CreationTimestamp
//    @Column(name = CREATED_DATE, nullable = false, updatable = false, columnDefinition = "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP")
//    private LocalDateTime createdDate;
//    public static final String CREATED_DATE = "schedule_created_date";
//
//    @UpdateTimestamp
//    @Column(name = MODIFIED_DATE, nullable = false, columnDefinition = "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
//    private LocalDateTime modifiedDate;
//    public static final String MODIFIED_DATE = "schedule_modified_date";
//
//    @Column(name = STATUS_ID, nullable = false, columnDefinition = "INT UNSIGNED NOT NULL DEFAULT 0")
//    private Integer statusId = 0;
//    public static final String STATUS_ID = "schedule_status_id";
//
//    @Column(name = IS_DELETED, nullable = false, columnDefinition = "TINYINT(1) NOT NULL DEFAULT 0")
//    private Boolean isDeleted = false;
//    public static final String IS_DELETED = "schedule_is_deleted";
//}
