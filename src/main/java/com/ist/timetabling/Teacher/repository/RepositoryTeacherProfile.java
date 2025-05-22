package com.ist.timetabling.Teacher.repository;

import com.ist.timetabling.Period.entity.EntitySchedulePreference;
import com.ist.timetabling.Teacher.entity.EntityTeacherProfile;
import com.ist.timetabling.User.entity.EntityUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepositoryTeacherProfile extends JpaRepository<EntityTeacherProfile, Integer> {

    Optional<EntityTeacherProfile> findByUserId(final Integer userId);


    Optional<EntityTeacherProfile> findByUserIdAndOrganizationId(final Integer integer, final Integer organizationId);

    Optional<EntityTeacherProfile> findByUserIdAndOrganizationIdAndPlanSettingsId(final Integer userId, final Integer organizationId, final Integer planSettingsId);

    List<EntityTeacherProfile> findBySchedulePreferencesContaining(final EntitySchedulePreference schedulePreference);

    @Query(value = "SELECT tp.* FROM teacher_profiles tp " +
            "JOIN users u ON tp.user_id = u.user_id " +
            "JOIN roles r ON u.role_id = r.role_id " +
            "WHERE u.user_is_deleted = false AND r.role_name = 'TEACHER' AND " +
            "(LOWER(u.user_first_name) LIKE CONCAT('%', :keyword, '%') OR " +
            "LOWER(u.user_last_name) LIKE CONCAT('%', :keyword, '%') OR " +
            "LOWER(u.user_email) LIKE CONCAT('%', :keyword, '%'))",
            nativeQuery = true)
    List<EntityTeacherProfile> searchByNameContainingNative(@Param("keyword") final String keyword);

    @Query(value = "SELECT tp.* FROM teacher_profiles tp " +
            "JOIN users u ON tp.user_id = u.user_id " +
            "JOIN roles r ON u.role_id = r.role_id " +
            "WHERE u.user_is_deleted = false AND r.role_name = 'TEACHER' AND " +
            "tp.organization_id = :orgId AND " +
            "(LOWER(u.user_first_name) LIKE CONCAT('%', :keyword, '%') OR " +
            "LOWER(u.user_last_name) LIKE CONCAT('%', :keyword, '%') OR " +
            "LOWER(u.user_email) LIKE CONCAT('%', :keyword, '%'))",
            nativeQuery = true)
    List<EntityTeacherProfile> searchByNameContainingAndOrganizationId(@Param("keyword") final String keyword, @Param("orgId") final Integer orgId);

    @Query(value = "SELECT tp.* FROM teacher_profiles tp " +
            "JOIN users u ON tp.user_id = u.user_id " +
            "JOIN roles r ON u.role_id = r.role_id " +
            "WHERE u.user_is_deleted = false AND r.role_name = 'TEACHER' AND " +
            "tp.organization_id = :orgId AND tp.plan_settings_id = :planSettingsId AND " +
            "(LOWER(u.user_first_name) LIKE CONCAT('%', :keyword, '%') OR " +
            "LOWER(u.user_last_name) LIKE CONCAT('%', :keyword, '%') OR " +
            "LOWER(u.user_email) LIKE CONCAT('%', :keyword, '%'))",
            nativeQuery = true)
    List<EntityTeacherProfile> searchByNameContainingAndOrganizationIdAndPlanSettingsId(
            @Param("keyword") final String keyword, 
            @Param("orgId") final Integer orgId,
            @Param("planSettingsId") final Integer planSettingsId);

    EntityTeacherProfile findByUuidAndIsDeletedFalse(final String teacherUuid);

    List<EntityTeacherProfile> findByOrganizationIdAndIsDeletedFalse(final Integer orgId);
    
    // Methods for plan settings filtering
    List<EntityTeacherProfile> findByPlanSettingsIdAndIsDeletedFalse(final Integer planSettingsId);
    
    List<EntityTeacherProfile> findByOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(final Integer organizationId, final Integer planSettingsId);
    
    @Query(value = "SELECT tp.* FROM teacher_profiles tp " +
            "JOIN users u ON tp.user_id = u.user_id " +
            "JOIN roles r ON u.role_id = r.role_id " +
            "WHERE u.user_is_deleted = false AND r.role_name = 'TEACHER' AND " +
            "tp.plan_settings_id = :planSettingsId AND tp.is_deleted = false AND " +
            "(LOWER(u.user_first_name) LIKE CONCAT('%', :keyword, '%') OR " +
            "LOWER(u.user_last_name) LIKE CONCAT('%', :keyword, '%') OR " +
            "LOWER(u.user_email) LIKE CONCAT('%', :keyword, '%'))",
            nativeQuery = true)
    List<EntityTeacherProfile> searchByNameContainingAndPlanSettingsId(
            @Param("keyword") final String keyword, 
            @Param("planSettingsId") final Integer planSettingsId);


    @Query(value = "SELECT tp.* FROM teacher_profiles tp " +
            "JOIN users u ON tp.user_id = u.user_id " +
            "WHERE u.user_uuid = :userUuid",
            nativeQuery = true)
    EntityTeacherProfile findByUserUuid(@Param("userUuid") String userUuid);

    @Query(value = "SELECT tp.teacher_profile_id FROM teacher_profiles tp " +
            "WHERE tp.teacher_profile_uuid = :uuid AND tp.is_deleted = false",
            nativeQuery = true)
    Integer findIdByUuidAndIsDeletedFalse(@Param("uuid") String uuid);

    Page<EntityTeacherProfile> findAllByIsDeletedFalse(Pageable pageable);

    List<EntityTeacherProfile> findAllByIsDeletedFalse();

    Page<EntityTeacherProfile> findAllByOrganizationIdAndIsDeletedFalse(Integer organizationId, Pageable pageable);

    Optional<EntityTeacherProfile> findByUuid(String teacherUuid);
}
