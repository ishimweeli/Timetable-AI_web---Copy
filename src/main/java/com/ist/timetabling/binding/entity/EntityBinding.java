package com.ist.timetabling.binding.entity;

import com.ist.timetabling.ClassBand.entity.EntityClassBand;
import com.ist.timetabling.Rule.entity.EntityRule;
import com.ist.timetabling.Subject.entity.EntitySubject;
import com.ist.timetabling.Teacher.entity.EntityTeacherProfile;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Table(name = EntityBinding.TABLE)
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntityBinding {

    public static final String TABLE = "bindings";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "binding_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "binding_uuid";

    @Column(name = ORGANIZATION_ID, nullable = false)
    private Integer organizationId = 0;
    public static final String ORGANIZATION_ID = "binding_organization_id";

    @Column(name = PLAN_SETTINGS_ID, nullable = false)
    private Integer planSettingsId = 0;
    public static final String PLAN_SETTINGS_ID = "binding_plan_settings_id";

    @Column(name = TEACHER_ID, nullable = false)
    private Integer teacherId = 0;
    public static final String TEACHER_ID = "binding_teacher_id";

    @Column(name = SUBJECT_ID, nullable = false)
    private Integer subjectId = 0;
    public static final String SUBJECT_ID = "binding_subject_id";

    @Column(name = CLASS_ID)
    private Integer classId = 0;
    public static final String CLASS_ID = "binding_class_id";

    @Column(name = ROOM_ID, nullable = false)
    private Integer roomId = 0;
    public static final String ROOM_ID = "binding_room_id";

    @Column(name = CLASSBAND_ID)
    private Integer classBandId = 0;
    public static final String CLASSBAND_ID = "binding_classBand_id";


    @Column(name = PERIODS_PER_WEEK, nullable = false)
    private Integer periodsPerWeek = 0;
    public static final String PERIODS_PER_WEEK = "binding_periods_per_week";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = TEACHER_ID, referencedColumnName = "teacher_profile_id", insertable = false, updatable = false)
    private EntityTeacherProfile teacherProfile;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = SUBJECT_ID, referencedColumnName = "subject_id", insertable = false, updatable = false)
    private EntitySubject subject;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "binding_rules",
            joinColumns = @JoinColumn(name = "binding_id"),
            inverseJoinColumns = @JoinColumn(name = "rule_id")
    )
    @Builder.Default
    private List<EntityRule> rules = new ArrayList<>();

    @Column(name = IS_FIXED, nullable = false)
    private Boolean isFixed = false;
    public static final String IS_FIXED = "binding_is_fixed";

    @Column(name = PRIORITY, nullable = false)
    private Integer priority = 0;
    public static final String PRIORITY = "binding_priority";

    @Column(name = NOTES)
    private String notes = "";
    public static final String NOTES = "binding_notes";

    @Column(name = CREATED_BY, nullable = false)
    private Integer createdBy = 0;
    public static final String CREATED_BY = "binding_created_by";

    @Column(name = MODIFIED_BY, nullable = false)
    private Integer modifiedBy = 0;
    public static final String MODIFIED_BY = "binding_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false, updatable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "binding_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "binding_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    private Integer statusId = 0;
    public static final String STATUS_ID = "binding_status_id";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted = false;
    public static final String IS_DELETED = "binding_is_deleted";

}