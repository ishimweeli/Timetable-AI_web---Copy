package com.ist.timetabling.Auth.entity;

import com.ist.timetabling.User.entity.EntityUser;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = EntityAuthCode.TABLE)
@Data
@NoArgsConstructor
public class EntityAuthCode {
    public static final String TABLE = "authcodes";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "authcode_id";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = USER_ID, nullable = false)
    private EntityUser user;
    public static final String USER_ID = "authcode_user_id";

    @Column(name = VALUE, nullable = false)
    private String value;
    public static final String VALUE = "authcode_value";

    @Enumerated(EnumType.STRING)
    @Column(name = TYPE, nullable = false)
    private AuthCodeType type;
    public static final String TYPE = "authcode_type";

    @Column(name = IP_ADDRESS)
    private String ipAddress;
    public static final String IP_ADDRESS = "authcode_ip_address";

    @Column(name = ATTEMPTS, nullable = false)
    private Integer attempts = 0;
    public static final String ATTEMPTS = "authcode_attempts";

    @Column(name = EXPIRES_AT, nullable = false)
    private LocalDateTime expiresAt;
    public static final String EXPIRES_AT = "authcode_expires_at";

    @Column(name = USED_AT)
    private LocalDateTime usedAt;
    public static final String USED_AT = "authcode_used_at";

    @Column(name = IS_USED, nullable = false)
    private Boolean isUsed = false;
    public static final String IS_USED = "authcode_is_used";

    @Column(name = CREATED_BY, nullable = false)
    private Integer createdBy = 0;
    public static final String CREATED_BY = "authcode_created_by";

    @Column(name = MODIFIED_BY, nullable = false)
    private Integer modifiedBy = 0;
    public static final String MODIFIED_BY = "authcode_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false, updatable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "authcode_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "authcode_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    private Integer statusId = 0;
    public static final String STATUS_ID = "authcode_status_id";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted = false;
    public static final String IS_DELETED = "authcode_is_deleted";

    public enum AuthCodeType {
        REGISTRATION,
        PASSWORD_RESET,
        TWO_FACTOR_AUTH
    }
} 