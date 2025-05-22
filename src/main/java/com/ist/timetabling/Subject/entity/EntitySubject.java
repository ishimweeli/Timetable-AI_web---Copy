package com.ist.timetabling.Subject.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;


@Entity
@Table(name = EntitySubject.TABLE)
@Data
@NoArgsConstructor
public class EntitySubject {

    public static final String TABLE = "subjects";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "subject_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "subject_uuid";

    @Column(name = ORGANIZATION_ID, nullable = false)
    private Integer organizationId = 0;
    public static final String ORGANIZATION_ID = "subject_organization_id";

    @Column(name = INITIALS, nullable = false)
    private String initials = "";
    public static final String INITIALS = "subject_initials";

    @Column(name = NAME, nullable = false)
    private String name = "";
    public static final String NAME = "subject_name";

    @Column(name = DESCRIPTION, columnDefinition = "TEXT")
    private String description = "";
    public static final String DESCRIPTION = "subject_description";

    @Column(name = DURATION_IN_MINUTES, nullable = false)
    private Integer durationInMinutes = 0;
    public static final String DURATION_IN_MINUTES = "subject_duration_in_minutes";

    @Column(name = RED_REPETITION, nullable = false)
    private Boolean redRepetition = false;
    public static final String RED_REPETITION = "subject_red_repetition";

    @Column(name = BLUE_REPETITION, nullable = false)
    private Boolean blueRepetition = false;
    public static final String BLUE_REPETITION = "subject_blue_repetition";

    @Column(name = COLOR)
    private String color;
    public static final String COLOR = "subject_color";

    @Column(name = CONFLICT_SUBJECT_ID)
    private Integer conflictSubjectId = 0;
    public static final String CONFLICT_SUBJECT_ID = "subject_conflict_subject_id";

    @Column(name = GROUP)
    private String group = "";
    public static final String GROUP = "subject_group";

    @Column(name = AUTO_CONFLICT_HANDLING, nullable = false)
    private Boolean autoConflictHandling = false;
    public static final String AUTO_CONFLICT_HANDLING = "subject_auto_conflict_handling";

    @Column(name = CREATED_BY, nullable = false)
    private Integer createdBy = 0;
    public static final String CREATED_BY = "subject_created_by";

    @Column(name = MODIFIED_BY, nullable = false)
    private Integer modifiedBy = 0;
    public static final String MODIFIED_BY = "subject_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "subject_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "subject_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    private Integer statusId = 0;
    public static final String STATUS_ID = "subject_status_id";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted = false;
    public static final String IS_DELETED = "subject_is_deleted";

} 