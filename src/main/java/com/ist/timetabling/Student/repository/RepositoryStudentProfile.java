package com.ist.timetabling.Student.repository;

import com.ist.timetabling.Student.entity.EntityStudentProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepositoryStudentProfile extends JpaRepository<EntityStudentProfile, Integer> {

    Optional<EntityStudentProfile> findByUuidAndIsDeletedFalse(final String uuid);

    Optional<EntityStudentProfile> findByStudentIdNumberAndIsDeletedFalseAndOrganizationId(
            final String studentIdNumber,
            final Integer organizationId);

    Page<EntityStudentProfile> findAllByIsDeletedFalse(final Pageable pageable);

    Page<EntityStudentProfile> findAllByIsDeletedFalseAndOrganizationId(
            final Integer organizationId,
            final Pageable pageable);

    Page<EntityStudentProfile> findAllByDepartmentAndIsDeletedFalseAndOrganizationId(
            final String department,
            final Integer organizationId,
            final Pageable pageable);

    long countByIsDeletedFalse();

    @Query(value = "SELECT sp.* FROM student_profiles sp " +
            "JOIN users u ON sp.user_id = u.user_id " +
            "WHERE sp.student_is_deleted = false AND " +
            "(LOWER(u.user_first_name) LIKE %:keyword% OR LOWER(u.user_last_name) LIKE %:keyword% OR " +
            "LOWER(u.user_email) LIKE %:keyword% OR LOWER(sp.student_id_number) LIKE %:keyword% OR " +
            "LOWER(sp.department) LIKE %:keyword%)",
            nativeQuery = true)
    List<EntityStudentProfile> searchByKeywordNative(@Param("keyword") String keyword);

    @Query(value = "SELECT sp.* FROM student_profiles sp " +
            "JOIN users u ON sp.user_id = u.user_id " +
            "WHERE sp.student_is_deleted = false AND " +
            "sp.organization_id = :orgId AND " +
            "(LOWER(u.user_first_name) LIKE %:keyword% OR LOWER(u.user_last_name) LIKE %:keyword% OR " +
            "LOWER(u.user_email) LIKE %:keyword% OR LOWER(sp.student_id_number) LIKE %:keyword% OR " +
            "LOWER(sp.department) LIKE %:keyword%)",
            nativeQuery = true)
    List<EntityStudentProfile> searchByKeywordAndOrganizationId(@Param("keyword") String keyword, @Param("orgId") Integer orgId);

    @Query(value = "SELECT sp.* FROM student_profiles sp " +
            "JOIN users u ON sp.user_id = u.user_id " +
            "WHERE sp.student_is_deleted = false AND " +
            "sp.department = :department AND " +
            "sp.organization_id = :orgId AND " +
            "(LOWER(u.user_first_name) LIKE %:keyword% OR LOWER(u.user_last_name) LIKE %:keyword% OR " +
            "LOWER(u.user_email) LIKE %:keyword% OR LOWER(sp.student_id_number) LIKE %:keyword%)",
            nativeQuery = true)
    List<EntityStudentProfile> searchByDepartmentAndKeywordAndOrganizationId(
            @Param("department") String department,
            @Param("keyword") String keyword,
            @Param("orgId") Integer orgId);

    Page<EntityStudentProfile> findAllByStudentClassIdAndIsDeletedFalse(Integer studentClassId, Pageable pageable);

    List<EntityStudentProfile> findAllByStudentClassIdAndIsDeletedFalse(Integer studentClassId);

    @Query("SELECT sp FROM EntityStudentProfile sp WHERE (sp.studentClassId IS NULL OR sp.studentClassId = 0) AND sp.isDeleted = false")
    List<EntityStudentProfile> findUnassignedStudents();

    @Query("SELECT sp FROM EntityStudentProfile sp WHERE (sp.studentClassId IS NULL OR sp.studentClassId = 0) AND sp.isDeleted = false")
    Page<EntityStudentProfile> findUnassignedStudents(Pageable pageable);
}