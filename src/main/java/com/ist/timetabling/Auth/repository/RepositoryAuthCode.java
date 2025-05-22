package com.ist.timetabling.Auth.repository;

import com.ist.timetabling.Auth.entity.EntityAuthCode;
import com.ist.timetabling.User.entity.EntityUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;


@Repository
public interface RepositoryAuthCode extends JpaRepository<EntityAuthCode, Integer> {

    Optional<EntityAuthCode> findByValueAndTypeAndIsUsedFalseAndExpiresAtAfter(String value, EntityAuthCode.AuthCodeType type, LocalDateTime currentTime);

    Optional<EntityAuthCode> findByUserAndTypeAndIsUsedFalse(EntityUser user, EntityAuthCode.AuthCodeType type);

    void deleteByUserAndType(EntityUser user, EntityAuthCode.AuthCodeType type);

} 