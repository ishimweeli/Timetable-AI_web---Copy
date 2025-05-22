//package com.ist.timetabling.Class.entity;
//
//import jakarta.persistence.*;
//import lombok.Data;
//import lombok.EqualsAndHashCode;
//import lombok.NoArgsConstructor;
//import org.hibernate.annotations.CreationTimestamp;
//import org.hibernate.annotations.UpdateTimestamp;
//import org.hibernate.annotations.UuidGenerator;
//import java.time.LocalDateTime;
//
//
//@Table(name = EntityClassBinding.TABLE)
//@Entity
//@Data
//@NoArgsConstructor
//@EqualsAndHashCode
//public class EntityClassBinding {
//
//    public static final String TABLE = "class_bindings";
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    @Column(name = ID, columnDefinition = "BIGINT UNSIGNED AUTO_INCREMENT")
//    private Long id;
//    public static final String ID = "binding_id";
//
//    @UuidGenerator
//    @Column(name = UUID, columnDefinition = "CHAR(36) NOT NULL")
//    private String uuid;
//    public static final String UUID = "binding_uuid";
//
//    @Column(name = ORGANIZATION_ID, nullable = false, columnDefinition = "INT UNSIGNED NOT NULL DEFAULT 0")
//    private int organizationId = 0;
//    public static final String ORGANIZATION_ID = "binding_organization_id";
//
//    @Column(name = MAIN_TEACHER_ID, nullable = false, columnDefinition = "INT UNSIGNED NOT NULL DEFAULT 0")
//    private int mainTeacherId = 0;
//    public static final String MAIN_TEACHER_ID = "binding_main_teacher_id";
//
//    @Column(name = CREATED_BY, nullable = false, columnDefinition = "INT UNSIGNED NOT NULL DEFAULT 0")
//    private Integer createdBy = 0;
//    public static final String CREATED_BY = "binding_created_by";
//
//    @Column(name = MODIFIED_BY, nullable = false, columnDefinition = "INT UNSIGNED NOT NULL DEFAULT 0")
//    private Integer modifiedBy = 0;
//    public static final String MODIFIED_BY = "binding_modified_by";
//
//    @CreationTimestamp
//    @Column(name = CREATED_DATE, nullable = false, updatable = false, columnDefinition = "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP")
//    private LocalDateTime createdDate;
//    public static final String CREATED_DATE = "binding_created_date";
//
//    @UpdateTimestamp
//    @Column(name = MODIFIED_DATE, nullable = false, columnDefinition = "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
//    private LocalDateTime modifiedDate;
//    public static final String MODIFIED_DATE = "binding_modified_date";
//
//    @Column(name = STATUS_ID, nullable = false, columnDefinition = "INT UNSIGNED NOT NULL DEFAULT 0")
//    private Integer statusId = 0;
//    public static final String STATUS_ID = "binding_status_id";
//
//    @Column(name = IS_DELETED, nullable = false, columnDefinition = "TINYINT(1) NOT NULL DEFAULT 0")
//    private Boolean isDeleted = false;
//    public static final String IS_DELETED = "binding_is_deleted";
//
//}
