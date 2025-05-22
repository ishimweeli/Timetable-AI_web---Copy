package com.ist.timetabling.Student.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import org.hibernate.validator.constraints.NotEmpty;

import java.time.LocalDateTime;

@Table(name = EntityStudentProfile.TABLE)
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode
public class EntityStudentProfile {

    public static final String TABLE = "student_profiles";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "student_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "student_uuid";

    @Column(name = USER_ID, nullable = false)
    private Integer userId;
    public static final String USER_ID = "user_id";

    @Column(name = ORGANIZATION_ID)
    private Integer organizationId;
    public static final String ORGANIZATION_ID = "organization_id";

    @Column(name = CLASS_ID, nullable = false)
    private Integer studentClassId = 0;
    public static final String CLASS_ID = "student_class_id";

    @Column(name = "student_id_number")
    private String studentIdNumber;

    @Column(name = "department")
    private String department;

    @Column(name = "address")
    private String address;

    @Column(name = "notes")
    private String notes;

    @Column(name = CREATED_BY, nullable = false)
    private Integer createdBy = 0;
    public static final String CREATED_BY = "student_created_by";

    @Column(name = MODIFIED_BY, nullable = false)
    private Integer modifiedBy = 0;
    public static final String MODIFIED_BY = "student_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false, updatable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "student_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "student_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    private Integer statusId = 0;
    public static final String STATUS_ID = "student_status_id";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted = false;
    public static final String IS_DELETED = "student_is_deleted";
}