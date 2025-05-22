package com.ist.timetabling.Auth.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;


@Table(name = EntityAuthToken.TABLE)
@Entity
@Data
@NoArgsConstructor
public class EntityAuthToken {

    public static final String TABLE = "auth_tokens";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = ID)
    private Integer id;
    public static final String ID = "token_id";

    @Column(name = USER_ID, nullable = false)
    private Integer userId = 0;
    public static final String USER_ID = "token_user_id";

    @Column(name = TOKEN, nullable = false, unique = true, length = 256)
    private String token = "";
    public static final String TOKEN = "token_token";

    @CreationTimestamp
    @Column(name = ISSUED_AT, nullable = false, updatable = false)
    private java.time.LocalDateTime issuedAt;
    public static final String ISSUED_AT = "token_issued_at";

    @Column(name = EXPIRY, nullable = false)
    private java.time.LocalDateTime expiry;
    public static final String EXPIRY = "token_expiry";

} 
