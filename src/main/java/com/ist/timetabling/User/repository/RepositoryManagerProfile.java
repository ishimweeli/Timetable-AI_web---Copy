package com.ist.timetabling.User.repository;
import com.ist.timetabling.User.entity.EntityManagerProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RepositoryManagerProfile extends JpaRepository<EntityManagerProfile, Integer> {
    Optional<EntityManagerProfile> findByUserId(Integer userId);
    Optional<EntityManagerProfile> findByUuid(String uuid);
    Page<EntityManagerProfile> findAllByIsDeletedFalse(Pageable pageable);
    Optional<EntityManagerProfile> findByUserIdAndIsDeletedFalse(Integer userId);
}