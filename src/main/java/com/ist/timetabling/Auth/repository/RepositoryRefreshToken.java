package com.ist.timetabling.Auth.repository;

import com.ist.timetabling.Auth.entity.EntityAuthRefreshToken;
import com.ist.timetabling.User.entity.EntityUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;


@Repository
public interface RepositoryRefreshToken extends JpaRepository<EntityAuthRefreshToken, Long> {

    Optional<EntityAuthRefreshToken> findByToken(final String token);

    List<EntityAuthRefreshToken> findByUser(final EntityUser entityUser);

    @Modifying
    @Query("DELETE FROM EntityAuthRefreshToken t WHERE t.expiresAt < ?1 OR t.revoked = true")
    void deleteExpiredTokens(final LocalDateTime now);

}
