package com.ist.timetabling.Auth.entity;

import com.ist.timetabling.User.entity.EntityUser;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;
import java.util.List;


@Table(name = EntityRole.TABLE)
@Entity
@Data
@NoArgsConstructor
public class EntityRole {

    public static final String TABLE = "roles";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "role_id";

    @UuidGenerator
    @Column(name = UUID)
    private String uuid;
    public static final String UUID = "role_uuid";

    @Column(name = NAME, nullable = false, unique = true)
    private String name = "";
    public static final String NAME = "role_name";

    @Lob
    @Column(name = DESCRIPTION, nullable = false)
    private String description = "";
    public static final String DESCRIPTION = "role_description";

    @Column(name = CREATED_BY, nullable = false)
    private Integer createdBy = 0;
    public static final String CREATED_BY = "role_created_by";

    @Column(name = MODIFIED_BY, nullable = false)
    private Integer modifiedBy = 0;
    public static final String MODIFIED_BY = "role_modified_by";

    @CreationTimestamp
    @Column(name = CREATED_DATE, nullable = false, updatable = false)
    private LocalDateTime createdDate;
    public static final String  CREATED_DATE= "role_created_date";

    @UpdateTimestamp
    @Column(name = MODIFIED_DATE, nullable = false)
    private LocalDateTime modifiedDate;
    public static final String  MODIFIED_DATE= "role_modified_date";

    @Column(name = STATUS_ID, nullable = false)
    private Integer statusId = 0;
    public static final String  STATUS_ID= "role_status_id";

    @Column(name = IS_DELETED, nullable = false)
    private Boolean isDeleted = false;
    public static final String  IS_DELETED= "role_is_deleted";

    @OneToMany(mappedBy = "entityRole", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EntityUser> entityUsers;

}
