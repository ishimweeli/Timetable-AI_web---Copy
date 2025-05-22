package com.ist.timetabling.Auth.util;

import com.ist.timetabling.Auth.repository.RepositoryBlacklistedToken;
import com.ist.timetabling.User.entity.EntityUser;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;


@Service
@Slf4j
@RequiredArgsConstructor
public class UtilAuthJwt {

    private final RepositoryBlacklistedToken repositoryBlacklistedToken;

    @Value("${jwt.secret}")
    private String SECRET_KEY;

    @Value("${jwt.expiration}")
    private long EXPIRATION_TIME;

    private SecretKey getSigningKey() {
        byte[] keyBytes = SECRET_KEY.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(EntityUser entityUser) {
        return generateToken(entityUser, EXPIRATION_TIME);
    }

    private String generateToken(EntityUser entityUser, long expirationTime) {
        Map<String, Object> claims = new HashMap<>();
        String jti = UUID.randomUUID().toString();

        if(entityUser != null) {
            claims.put("firstName", entityUser.getFirstName());
            claims.put("lastName", entityUser.getLastName());
            claims.put("email", entityUser.getEmail());
            claims.put("uuid", entityUser.getUuid());
            claims.put("phone", entityUser.getPhone());

            if(entityUser.getEntityRole() != null) {
                claims.put("roleId", entityUser.getEntityRole().getId());
                claims.put("roleName", entityUser.getEntityRole().getName());
            }
        }else {
            claims.put("email", "anonymous");
        }

        String jwt = Jwts.builder()
                .claims(claims)
                .subject(Optional.ofNullable(entityUser).map(EntityUser::getEmail).orElse("anonymous"))
                .issuedAt(new Date())
                .id(jti)
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey())
                .compact();

        claims.put("token", jwt);

        return jwt;
    }

    private Claims getClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        }catch(JwtException e) {
            log.error("Error parsing JWT token: {}", e.getMessage());
            return null;
        }
    }

    public String extractUsername(String token) {
        Claims claims = getClaims(token);
        return claims != null ? (String) claims.get("email") : null;
    }

    public String extractJti(String token) {
        Claims claims = getClaims(token);
        return claims != null ? claims.getId() : null;
    }

    public boolean isTokenValid(String token, EntityUser entityUser) {
        final String email = extractUsername(token);
        String jti = extractJti(token);
        return email != null && email.equals(entityUser.getEmail()) && !isTokenExpired(token) && !isTokenBlacklisted(jti);
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = getClaims(token);
            String jti = claims != null ? claims.getId() : null;
            return claims != null && !isTokenExpired(token) && !isTokenBlacklisted(jti);
        }catch(Exception e) {
            return false;
        }
    }

    public boolean isTokenExpired(String token) {
        Claims claims = getClaims(token);
        return claims != null && claims.getExpiration().before(new Date());
    }

    public boolean isTokenBlacklisted(String jti) {
        return jti != null && repositoryBlacklistedToken.existsByJti(jti);
    }

    public Date getExpirationDateFromToken(String token) {
        Claims claims = getClaims(token);
        return claims != null ? claims.getExpiration() : null;
    }

    public String extractFirstName(String token) {
        Claims claims = getClaims(token);
        return claims != null ? (String) claims.get("firstName") : null;
    }

    public String extractLastName(String token) {
        Claims claims = getClaims(token);
        return claims != null ? (String) claims.get("lastName") : null;
    }

    public String extractUuid(String token) {
        Claims claims = getClaims(token);
        return claims != null ? (String) claims.get("uuid") : null;
    }

    public String extractPhone(String token) {
        Claims claims = getClaims(token);
        return claims != null ? (String) claims.get("phone") : null;
    }

    public Long extractRoleId(String token) {
        Claims claims = getClaims(token);
        return claims != null ? Long.valueOf(claims.get("roleId").toString()) : null;
    }

    public String extractRoleName(String token) {
        Claims claims = getClaims(token);
        return claims != null ? (String) claims.get("roleName") : null;
    }
}
