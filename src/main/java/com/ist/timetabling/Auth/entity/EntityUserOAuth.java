package com.ist.timetabling.Auth.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;


@Table(name = EntityUserOAuth.TABLE)
@Entity
@Data
@NoArgsConstructor
public class EntityUserOAuth {
    public static final String TABLE = "user_oauth";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "oauth_id";

    @Column(name = USER_ID, nullable = false)
    private Integer userId = 0;
    public static final String USER_ID = "oauth_user_id";

    @Column(name = PROVIDER, nullable = false, length = 100)
    private String provider = "";
    public static final String PROVIDER = "oauth_provider";

    @Column(name = PROVIDER_USER_ID, nullable = false, length = 200)
    private String providerUserId = "";
    public static final String PROVIDER_USER_ID = "oauth_provider_user_id";

    @Column(name = ACCESS_TOKEN, nullable = false, length = 256)
    private String accessToken = "";
    public static final String ACCESS_TOKEN = "oauth_access_token";

    @Column(name = REFRESH_TOKEN, nullable = false, length = 256)
    private String refreshToken = "";
    public static final String REFRESH_TOKEN = "oauth_refresh_token";

    @Column(name = ISSUED_AT, nullable = false)
    private LocalDateTime issuedAt;
    public static final String ISSUED_AT = "oauth_issued_at";

    @Column(name = EXPIRES_AT, nullable = false)
    private LocalDateTime expiresAt;
    public static final String EXPIRES_AT = "oauth_expires_at";

} 
