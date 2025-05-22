package com.ist.timetabling.User.entity;

import com.ist.timetabling.Auth.entity.EntityRole;
import com.ist.timetabling.Organization.entity.EntityOrganization;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;


@Table(name = EntityUser.TABLE)
@Entity
@Data
@NoArgsConstructor
@EqualsAndHashCode
public class EntityUser {

    public static final String TABLE = "users";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "user_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "user_uuid";

    @Column(name = EMAIL, nullable = false, unique = true)
    private String email = "";
    public static final String EMAIL = "user_email";

    @Column(name = PASSWORD_HASH, nullable = false)
    private String passwordHash = "";
    public static final String PASSWORD_HASH = "user_password_hash";

    @Column(name = PHONE, nullable = false)
    private String phone = "";
    public static final String PHONE = "user_phone";

    @Column(name = FIRST_NAME, nullable = false)
    private String firstName = "";
    public static final String FIRST_NAME = "user_first_name";

    @Column(name = LAST_NAME, nullable = false)
    private String lastName = "";
    public static final String LAST_NAME = "user_last_name";

    @Column(name = IS_ACTIVE, nullable = false)
    private Boolean isActive = false;
    public static final String IS_ACTIVE = "user_is_active";

    @Column(name = CREATED_BY, nullable = false)
    private Integer createdBy = 0;
    public static final String CREATED_BY = "user_created_by";

    @Column(name = MODIFIED_BY, nullable = false)
    private Integer modifiedBy = 0;
    public static final String MODIFIED_BY = "user_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false, updatable = false)
    private LocalDateTime createdDate;
    public static final String CREATED_DATE = "user_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String MODIFIED_DATE = "user_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    private Integer statusId = 0;
    public static final String STATUS_ID = "user_status_id";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted = false;
    public static final String IS_DELETED = "user_is_deleted";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", referencedColumnName = "role_id", nullable = false)
    private EntityRole entityRole;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "organization_id", referencedColumnName = "organization_id", nullable = false)
    private EntityOrganization organization;
    public static final String ORGANIZATION_ID = "organization_id";
}
