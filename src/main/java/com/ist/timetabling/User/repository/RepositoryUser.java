package com.ist.timetabling.User.repository;

import com.ist.timetabling.User.entity.EntityUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepositoryUser extends JpaRepository<EntityUser, Integer> {

    Optional<EntityUser> findByEmail(final String email);

    boolean existsByEmail(final String email);

    boolean existsByPhone(final String phoneNumber);

    Optional<EntityUser> findByPhone(final String phoneNumber);

    EntityUser findUserByEmail(final String email);

    Optional<EntityUser> findByUuidAndIsDeletedFalse(final String uuid);

    Optional<EntityUser> findByEmailAndIsDeletedFalse(final String email);

    Optional<EntityUser> findByEmailAndIsDeletedFalseAndIsActiveTrue(final String email);

    long countByIsDeletedFalse();

    Optional<EntityUser> findByUuidAndIsDeletedFalseAndEntityRole_Name(final String uuid, final String role);

    Page<EntityUser> findAllByIsDeletedFalseAndOrganizationIdAndEntityRole_Name(Integer orgId, String teacherRole, PageRequest of);

    Page<EntityUser> findAllByIsDeletedFalseAndEntityRole_Name(final String role, final Pageable pageable);

    boolean existsByEmailAndIsDeletedFalse(String email);

    @Query("SELECT u FROM EntityUser u WHERE u.isDeleted = false AND u.entityRole.name = :roleName " +
            "AND (LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<EntityUser> searchUsersByRoleAndTerms(
            @Param("roleName") String roleName,
            @Param("searchTerm") String searchTerm,
            Pageable pageable);

    @Query("SELECT u FROM EntityUser u WHERE u.isDeleted = false AND u.entityRole.name = :roleName " +
            "AND u.organization.id = :orgId " +
            "AND (LOWER(u.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) " +
            "OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<EntityUser> searchUsersByRoleOrgAndTerms(
            @Param("roleName") String roleName,
            @Param("orgId") Integer orgId,
            @Param("searchTerm") String searchTerm,
            Pageable pageable);

    @Query("SELECT u FROM EntityUser u WHERE u.isDeleted = false AND u.entityRole.name = :roleName " +
            "AND u.organization.id = :orgId")
    Page<EntityUser> findByRoleAndOrganization(
            @Param("roleName") String roleName,
            @Param("orgId") Integer orgId,
            Pageable pageable);

    @Query("SELECT COUNT(u) FROM EntityUser u JOIN u.entityRole r WHERE r.name = :roleName AND u.isDeleted = false")
    long countByRoleAndIsDeletedFalse(@Param("roleName") String roleName);

    @Query("SELECT COUNT(u) FROM EntityUser u JOIN u.entityRole r WHERE r.name = :roleName AND u.isDeleted = false")
    long countByEntityRoleNameAndIsDeletedFalse(@Param("roleName") String roleName);

    @Query("SELECT COUNT(u) FROM EntityUser u WHERE u.organization.id = :organizationId AND u.isDeleted = false")
    long countByOrganizationIdAndIsDeletedFalse(@Param("organizationId") Integer organizationId);

    @Query("SELECT COUNT(u) FROM EntityUser u JOIN u.entityRole r WHERE u.organization.id = :organizationId AND r.name = :roleName AND u.isDeleted = false")
    long countByOrganizationIdAndRoleAndIsDeletedFalse(@Param("organizationId") Integer organizationId, @Param("roleName") String roleName);

    @Query("SELECT u FROM EntityUser u WHERE u.organization.id = :organizationId AND u.entityRole.name = 'TEACHER' AND u.isDeleted = false")
    List<EntityUser> findTeachersByOrganizationId(@Param("organizationId") Integer organizationId);

    Optional<EntityUser> findByUuid(String teacherUuid);

    EntityUser findByIdAndIsDeletedFalse(Integer userId);
}
