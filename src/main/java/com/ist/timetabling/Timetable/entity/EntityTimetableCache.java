package com.ist.timetabling.Timetable.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;

@Entity
@Table(name = EntityTimetableCache.TABLE)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntityTimetableCache {

    public static final String TABLE = "timetable_cache";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "id";

    @Column(name = CACHE_KEY, nullable = false)
    @Builder.Default
    private String cacheKey = "";
    public static final String CACHE_KEY = "cache_key";

    @Column(name = CACHE_DATA)
    @Builder.Default
    private String cacheData = "";
    public static final String CACHE_DATA = "cache_data";

    @Column(name = CREATED_AT, nullable = false)
    private LocalDateTime createdAt;
    public static final String CREATED_AT = "created_at";

    @Column(name = EXPIRES_AT)
    private LocalDateTime expiresAt;
    public static final String EXPIRES_AT = "expires_at";

    @Column(name = IS_VALID)
    @Builder.Default
    private Boolean isValid = true;
    public static final String IS_VALID = "is_valid";

    @Column(name = TIMETABLE_ID, nullable = false)
    private Integer timetableId;
    public static final String TIMETABLE_ID = "timetable_id";

    @UuidGenerator
    @Column(name = UUID, nullable = false, length = 36)
    private String uuid;
    public static final String UUID = "uuid";
}