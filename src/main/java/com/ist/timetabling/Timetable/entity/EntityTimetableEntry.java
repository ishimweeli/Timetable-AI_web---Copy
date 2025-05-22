package com.ist.timetabling.Timetable.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = EntityTimetableEntry.TABLE)
@Data
@NoArgsConstructor
public class EntityTimetableEntry {

    public static final String TABLE = "timetable_entries";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "entry_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "timetable_entry_uuid";

    @Column(name = TIMETABLE_ID, nullable = false)
    private Integer timetableId;
    public static final String TIMETABLE_ID = "entry_timetable_id";

    @Column(name = CLASS_ID)
    private Integer classId;
    public static final String CLASS_ID = "entry_class_id";

    @Column(name = DAY_OF_WEEK, nullable = false)
    private Integer dayOfWeek = 1;
    public static final String DAY_OF_WEEK = "entry_day_of_week";

    @Column(name = PERIOD, nullable = false)
    private Integer period = 1;
    public static final String PERIOD = "entry_period";

    @Column(name = ROOM_ID)
    private Integer roomId;
    public static final String ROOM_ID = "entry_room_id";

    @Column(name = STATUS, nullable = false)
    private String status = "Active";
    public static final String STATUS = "entry_status";

    @Column(name = SUBJECT_ID)
    private Integer subjectId;
    public static final String SUBJECT_ID = "entry_subject_id";

    @Column(name = TEACHER_ID)
    private Integer teacherId;
    public static final String TEACHER_ID = "entry_teacher_id";

    @Column(name = DURATION_MINUTES, nullable = false)
    private Integer durationMinutes = 45;
    public static final String DURATION_MINUTES = "entry_duration_minutes";

    @Column(name = PERIOD_TYPE, nullable = false)
    private String periodType = "Regular";
    public static final String PERIOD_TYPE = "entry_period_type";

    @Column(name = PERIOD_NUMBER, nullable = false)
    private Integer periodNumber = 1;
    public static final String PERIOD_NUMBER = "entry_period_number";

    @Column(name = IS_LOCKED, nullable = false)
    private Boolean isLocked = false;
    public static final String IS_LOCKED = "entry_is_locked";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted = false;
    public static final String IS_DELETED = "timetable_is_deleted";

    @Column(name = IS_CLASS_BAND_ENTRY, nullable = false)
    private Boolean isClassBandEntry = false;
    public static final String IS_CLASS_BAND_ENTRY = "entry_is_class_band_entry";

    @Column(name = CLASS_BAND_ID)
    private Integer classBandId;
    public static final String CLASS_BAND_ID = "entry_class_band_id";

}