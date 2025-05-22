package com.ist.timetabling.Auth.entity;

import com.ist.timetabling.User.entity.EntityUser;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Table(name = EntityAuthRefreshToken.TABLE)
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EntityAuthRefreshToken {

    public static final String TABLE = "auth_refresh_tokens";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "refresh_token_id";

    @Column(name = USER_ID, nullable = false, insertable = false, updatable = false)
    private Integer userId = 0;
    public static final String USER_ID = "refresh_token_user_id";

    @ManyToOne
    @JoinColumn(name = USER_ID, nullable = false)
    private EntityUser user;

    @Column(name = TOKEN, nullable = false, unique = true, length = 256)
    private String token = "";
    public static final String TOKEN = "refresh_token_token";

    @CreationTimestamp
    @Column(name = CREATED_AT, nullable = false, updatable = false)
    private java.time.LocalDateTime createdAt;
    public static final String CREATED_AT = "refresh_token_created_at";

    @Column(name = EXPIRES_AT, nullable = false)
    private java.time.LocalDateTime expiresAt;
    public static final String EXPIRES_AT = "refresh_token_expires_at";

    @Column(name = REVOKED, nullable = false)
    private boolean revoked = false;
    public static final String REVOKED = "refresh_token_revoked";
}