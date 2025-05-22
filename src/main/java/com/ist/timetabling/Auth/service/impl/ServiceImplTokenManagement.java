package com.ist.timetabling.Auth.service.impl;

import com.ist.timetabling.Auth.entity.EntityAuthBlacklistedToken;
import com.ist.timetabling.Auth.entity.EntityAuthRefreshToken;
import com.ist.timetabling.Auth.repository.RepositoryBlacklistedToken;
import com.ist.timetabling.Auth.repository.RepositoryRefreshToken;
import com.ist.timetabling.Auth.service.ServiceTokenManagement;
import com.ist.timetabling.Auth.util.UtilAuthJwt;
import com.ist.timetabling.User.entity.EntityUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;


@Service
@Slf4j
@RequiredArgsConstructor
public class ServiceImplTokenManagement implements ServiceTokenManagement {

    private final RepositoryBlacklistedToken repositoryBlacklistedToken;
    private final RepositoryRefreshToken repositoryRefreshToken;
    private final UtilAuthJwt utilAuthJwt;

    @Override
    @Transactional
    public void blacklistToken(final String token) {
        if(token != null && !token.isEmpty()) {
            final String jti = utilAuthJwt.extractJti(token);

            if(jti != null && !repositoryBlacklistedToken.existsByJti(jti)) {
                final Date expirationDate = utilAuthJwt.getExpirationDateFromToken(token);
                final LocalDateTime expiresAt = expirationDate != null ? expirationDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime() : LocalDateTime.now().plusHours(24);

                final EntityAuthBlacklistedToken entityAuthBlacklistedToken = EntityAuthBlacklistedToken.builder().jti(jti).expiresAt(expiresAt).build();
                repositoryBlacklistedToken.save(entityAuthBlacklistedToken);
            }
        }
    }

    @Override
    @Transactional
    public EntityAuthRefreshToken createRefreshToken(final EntityUser entityUser) {
        final String token = UUID.randomUUID().toString();
        repositoryRefreshToken.findByUser(entityUser).forEach(rt -> { rt.setRevoked(true); repositoryRefreshToken.save(rt); });

        final EntityAuthRefreshToken entityAuthRefreshToken = EntityAuthRefreshToken.builder()
                .token(token)
                .user(entityUser)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .build();

        return repositoryRefreshToken.save(entityAuthRefreshToken);
    }

    @Override
    @Transactional
    public Optional<EntityAuthRefreshToken> findByToken(final String token) {
        return repositoryRefreshToken.findByToken(token);
    }

    @Override
    @Transactional
    public void revokeRefreshToken(final String token) {
        repositoryRefreshToken.findByToken(token).ifPresent(rt -> { rt.setRevoked(true); repositoryRefreshToken.save(rt); });
    }

    @Override
    @Transactional
    public void revokeAllUserRefreshTokens(final EntityUser entityUser) {
        repositoryRefreshToken.findByUser(entityUser).forEach(rt -> { rt.setRevoked(true); repositoryRefreshToken.save(rt); });
    }

    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanupExpiredTokens() {
        final LocalDateTime now = LocalDateTime.now();
        repositoryBlacklistedToken.deleteExpiredTokens(now);
        repositoryRefreshToken.deleteExpiredTokens(now);
    }

}
