package com.ist.timetabling.Subject.repository;

import com.ist.timetabling.Subject.entity.EntitySubject;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepositorySubject extends JpaRepository<EntitySubject,Integer> {

    Optional<EntitySubject> findByUuidAndIsDeletedFalse(final String uuid);

    Page<EntitySubject> findAllByIsDeletedFalse(final Pageable pageable);

    Page<EntitySubject> findAllByIsDeletedFalseAndOrganizationId(final Integer orgId, final Pageable pageable);

    Optional<EntitySubject> findByNameAndIsDeletedFalse(final String name);

    @Modifying
    @Transactional
    @Query("UPDATE EntitySubject a SET a.isDeleted = true WHERE a.uuid = :uuid AND a.isDeleted = false")
    int softDeleteByUuid(@Param("uuid") final String Uuid);

    long countByIsDeletedFalse();

    long countByOrganizationIdAndIsDeletedFalse(final Integer organizationId);

    Optional<EntitySubject> findByNameAndOrganizationIdAndIsDeletedFalse(final String name, final Integer orgId);

    @Query(value = "SELECT s.* FROM subjects s " +
            "WHERE s.subject_is_deleted = false AND " +
            "(LOWER(s.subject_name) LIKE %:keyword% OR LOWER(s.subject_initials) LIKE %:keyword% OR LOWER(s.subject_description) LIKE %:keyword%)",
            nativeQuery = true)
    List<EntitySubject> searchByNameContainingNative(@Param("keyword") final String keyword);

    @Query(value = "SELECT s.* FROM subjects s " +
            "WHERE s.subject_is_deleted = false AND " +
            "s.subject_organization_id = :orgId AND " +
            "(LOWER(s.subject_name) LIKE %:keyword% OR LOWER(s.subject_initials) LIKE %:keyword% OR LOWER(s.subject_description) LIKE %:keyword%)",
            nativeQuery = true)

    List<EntitySubject> searchByNameContainingAndOrganizationId(@Param("keyword") final String keyword, @Param("orgId") final Integer orgId);

    List<EntitySubject> findByOrganizationIdAndIsDeletedFalse(final Integer organizationId);

    @Query("SELECT s.id FROM EntitySubject s WHERE s.uuid = :uuid AND s.isDeleted = false")
    Integer findIdByUuidAndIsDeletedFalse(@Param("uuid") String uuid);
}