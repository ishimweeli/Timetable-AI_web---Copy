package com.ist.timetabling.User.repository;


import com.ist.timetabling.User.entity.EntityAdminProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;


@Repository
public interface RepositoryAdminProfile extends JpaRepository<EntityAdminProfile, Integer> {

    Optional<EntityAdminProfile> findByUuidAndIsDeletedFalse(final String uuid);

    Page<EntityAdminProfile> findAllByIsDeletedFalse(final Pageable pageable);

    @Modifying
    @Transactional
    @Query("UPDATE EntityAdminProfile a SET a.isDeleted = true WHERE a.uuid = :uuid AND a.isDeleted = false")
    int softDeleteByUuid(@Param("uuid") final String Uuid);

    long countByIsDeletedFalse();

}
