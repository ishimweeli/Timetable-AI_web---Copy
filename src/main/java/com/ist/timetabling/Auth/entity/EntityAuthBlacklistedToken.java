package com.ist.timetabling.Auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Table(name = EntityAuthBlacklistedToken.TABLE)
@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EntityAuthBlacklistedToken {

    public static final String TABLE = "auth_blacklisted_tokens";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "blacklisted_token_id";

    @Column(name = JTI, nullable = false, unique = true, length = 256)
    private String jti = "";
    public static final String JTI = "blacklisted_token_jti";

    @CreationTimestamp
    @Column(name = CREATED_AT, nullable = false, updatable = false)
    private java.time.LocalDateTime createdAt;
    public static final String CREATED_AT = "blacklisted_token_created_at";

    @Column(name = EXPIRES_AT, nullable = false)
    private java.time.LocalDateTime expiresAt;
    public static final String EXPIRES_AT = "blacklisted_token_expires_at";
}