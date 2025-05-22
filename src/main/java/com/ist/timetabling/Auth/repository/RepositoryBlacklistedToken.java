package com.ist.timetabling.Auth.repository;

import com.ist.timetabling.Auth.entity.EntityAuthBlacklistedToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;


@Repository
public interface RepositoryBlacklistedToken extends JpaRepository<EntityAuthBlacklistedToken, Long> {

    boolean existsByJti(final String jti);

    @Modifying
    @Query("DELETE FROM EntityAuthBlacklistedToken t WHERE t.expiresAt < ?1")
    void deleteExpiredTokens(final LocalDateTime now);

}
