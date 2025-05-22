package com.ist.timetabling.Organization.repository;

import com.ist.timetabling.Organization.entity.EntityOrganization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;


@Repository
public interface RepositoryOrganization extends JpaRepository<EntityOrganization, Integer> {

    Page<EntityOrganization> findByIsDeletedFalseOrderByNameAsc(final Pageable pageable);

    boolean existsByNameAndIsDeletedFalse(final String name);

    Optional<EntityOrganization> findByUuidAndIsDeletedFalse(final String uuid);

    Page<EntityOrganization> findByStatusIdAndIsDeletedFalseOrderByIdDesc(final Integer statusId, final Pageable pageable);

    List<EntityOrganization> findByNameContainingAndIsDeletedFalseOrderByIdDesc(final String keyword);

    long countByIsDeletedFalse();
    Optional<EntityOrganization> findByName(String defaultOrgEmail);

    Page<EntityOrganization> findAllByIsDeletedFalseOrderByNameAsc(Pageable pageable);
    @Query("SELECT o FROM EntityOrganization o JOIN o.users u WHERE u.id = :userId AND o.isDeleted = false ORDER BY o.name ASC")
    Page<EntityOrganization> findOrganizationsByUserAndNotDeleted(Integer userId, Pageable pageable);
    boolean existsByIdAndIsDeletedFalse(Integer id);
    
    boolean existsByContactEmailAndIsDeletedFalse(String email);
    
    boolean existsByContactEmailAndUuidNotAndIsDeletedFalse(String email, String excludeUuid);

    EntityOrganization findEntityOrganizationByUuid(final String organizationUuid);

    @Query(
      value = "SELECT o.* FROM organizations o WHERE o.organization_is_deleted = false AND LOWER(o.organization_name) LIKE :keyword",
      countQuery = "SELECT COUNT(*) FROM organizations o WHERE o.organization_is_deleted = false AND LOWER(o.organization_name) LIKE :keyword",
      nativeQuery = true
    )
    Page<EntityOrganization> searchByNameContainingNative(@Param("keyword") String keyword, Pageable pageable);
}
