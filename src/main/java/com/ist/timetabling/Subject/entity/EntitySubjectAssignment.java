package com.ist.timetabling.Subject.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Table(name = EntitySubjectAssignment.TABLE)
@Entity
@Data
@NoArgsConstructor
public class EntitySubjectAssignment {
    public static final String TABLE = "subject_assignments";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "assignment_id";

    @Column(name = TEACHER_ID, nullable = false)
    private Integer teacherId = 0;
    public static final String TEACHER_ID = "assignment_teacher_id";

    @Column(name = SUBJECT_ID, nullable = false)
    private Integer subjectId = 0;
    public static final String SUBJECT_ID = "assignment_subject_id";

    @Column(name = CLASS_ID, nullable = false)
    private Integer classId = 0;
    public static final String CLASS_ID = "assignment_class_id";

    @Column(name = WEEKLY_HOURS, nullable = false)
    private Integer weeklyHours = 0;
    public static final String WEEKLY_HOURS = "assignment_weekly_hours";
} 