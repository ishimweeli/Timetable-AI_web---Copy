package com.ist.timetabling.binding.repository;

import com.ist.timetabling.binding.entity.EntityBinding;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@Transactional(readOnly = true)
public interface RepositoryBinding extends JpaRepository<EntityBinding, Integer> {

    // Basic find operations
    Optional<EntityBinding> findByUuidAndIsDeletedFalse(String uuid);
    
    // Added for UUID object compatibility
    Optional<EntityBinding> findByUuid(String BindingUuid);

    Page<EntityBinding> findByIsDeletedFalse(Pageable pageable);
    
    List<EntityBinding> findByOrganizationId(Integer organizationId);

    List<EntityBinding> findByPlanSettingsIdAndIsDeletedFalse(Integer planSettingsId);

    List<EntityBinding> findByOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(Integer organizationId, Integer planSettingsId);

    Page<EntityBinding> findByPlanSettingsIdAndIsDeletedFalse(Integer planSettingsId, Pageable pageable);

    Page<EntityBinding> findByOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(Integer organizationId, Integer planSettingsId, Pageable pageable);

    @Query("SELECT b FROM EntityBinding b WHERE " +
            "b.teacherId IN (SELECT tp.id FROM EntityTeacherProfile tp WHERE tp.userId IN " +
            "(SELECT u.id FROM EntityUser u WHERE u.uuid = :teacherUuid)) AND " +
            "b.subjectId IN (SELECT s.id FROM EntitySubject s WHERE s.uuid = :subjectUuid) AND " +
            "b.classId IN (SELECT c.id FROM EntityClass c WHERE c.uuid = :classUuid) AND " +
            "b.isDeleted = false")
    List<EntityBinding> findByTeacherUuidAndSubjectUuidAndClassUuidAndIsDeletedFalse(
            @Param("teacherUuid") String teacherUuid,
            @Param("subjectUuid") String subjectUuid,
            @Param("classUuid") String classUuid);

    @Query("SELECT b FROM EntityBinding b WHERE " +
            "b.teacherId IN (SELECT tp.id FROM EntityTeacherProfile tp WHERE tp.userId IN " +
            "(SELECT u.id FROM EntityUser u WHERE u.uuid = :teacherUuid)) AND " +
            "b.subjectId IN (SELECT s.id FROM EntitySubject s WHERE s.uuid = :subjectUuid) AND " +
            "b.classBandId IN (SELECT cb.id FROM EntityClassBand cb WHERE cb.uuid = :classBandUuid) AND " +
            "b.isDeleted = false")
    List<EntityBinding> findByTeacherUuidAndSubjectUuidAndClassBandUuidAndIsDeletedFalse(
            @Param("teacherUuid") String teacherUuid,
            @Param("subjectUuid") String subjectUuid,
            @Param("classBandUuid") String classBandUuid);

    // Period counts
    @Query("SELECT SUM(b.periodsPerWeek) FROM EntityBinding b WHERE b.teacherId = :teacherId AND b.isDeleted = false")
    Integer getTeacherTotalPeriods(@Param("teacherId") Integer teacherId);

    @Query("SELECT SUM(b.periodsPerWeek) FROM EntityBinding b WHERE b.classId = :classId AND b.isDeleted = false")
    Integer getClassTotalPeriods(@Param("classId") Integer classId);

    @Query("SELECT SUM(b.periodsPerWeek) FROM EntityBinding b WHERE b.classBandId = :classBandId AND b.isDeleted = false")
    Integer getClassBandTotalPeriods(@Param("classBandId") Integer classBandId);

    @Query("SELECT COUNT(b) FROM EntityBinding b WHERE b.teacherId = :teacherId AND b.isFixed = true AND b.isDeleted = false")
    int countFixedBindingsByTeacherId(@Param("teacherId") Integer teacherId);

    Page<EntityBinding> findByOrganizationIdAndIsDeletedFalse(Integer organizationId, Pageable pageable);

    Page<EntityBinding> findByTeacherIdAndOrganizationIdAndIsDeletedFalse(Integer teacherId, Integer organizationId, Pageable pageable);

    @Query("SELECT b FROM EntityBinding b WHERE " +
            "EXISTS (SELECT tp FROM EntityTeacherProfile tp JOIN EntityUser u ON tp.userId = u.id " +
            "WHERE tp.id = b.teacherId AND " +
            "(LOWER(u.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')))) OR " +
            "EXISTS (SELECT s FROM EntitySubject s WHERE s.id = b.subjectId AND " +
            "LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
            "EXISTS (SELECT r FROM EntityRoom r WHERE r.id = b.roomId AND " +
            "LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:organizationId IS NULL OR b.organizationId = :organizationId) AND b.isDeleted = false")
    Page<EntityBinding> searchByKeywordAndOrganizationId(@Param("keyword") String keyword, @Param("organizationId") Integer organizationId, Pageable pageable);


    Page<EntityBinding> findByStatusIdAndIsDeletedFalse(Integer statusId, Pageable pageable);

    Page<EntityBinding> findByStatusIdAndOrganizationIdAndIsDeletedFalse(Integer statusId, Integer organizationId, Pageable pageable);


    List<EntityBinding> findByTeacherIdAndIsDeletedFalse(Integer teacherId);

    List<EntityBinding> findByClassIdAndIsDeletedFalse(Integer classId);

    List<EntityBinding> findByClassBandIdAndIsDeletedFalse(Integer classBandId);

    List<EntityBinding> findByRoomIdAndIsDeletedFalse(Integer roomId);

    List<EntityBinding> findBySubjectIdAndIsDeletedFalse(Integer subjectId);


    @Query("SELECT COALESCE(SUM(b.periodsPerWeek), 0) FROM EntityBinding b " +
            "WHERE b.teacherId = :teacherId AND b.isDeleted = false")
    Integer getTeacherWorkloadTotalPeriods(@Param("teacherId") Integer teacherId);

    @Query("SELECT COALESCE(SUM(b.periodsPerWeek), 0) FROM EntityBinding b " +
            "WHERE b.roomId = :roomId AND b.isDeleted = false")
    Integer getRoomWorkloadTotalPeriods(@Param("roomId") Integer roomId);

    @Query("SELECT COALESCE(SUM(b.periodsPerWeek), 0) FROM EntityBinding b " +
            "WHERE b.subjectId = :subjectId AND b.isDeleted = false")
    Integer getSubjectWorkloadTotalPeriods(@Param("subjectId") Integer subjectId);

    // Fixed binding counts
    @Query("SELECT COUNT(b) FROM EntityBinding b " +
            "WHERE b.teacherId = :teacherId AND b.isFixed = true AND b.isDeleted = false")
    Integer countByTeacherIdAndIsFixedTrueAndIsDeletedFalse(@Param("teacherId") Integer teacherId);


    @Query("SELECT COUNT(b) FROM EntityBinding b " +
            "WHERE b.teacherId = :teacherId AND b.subjectId = :subjectId AND b.classId = :classId " +
            "AND b.isDeleted = false")
    Integer countByTeacherIdAndSubjectIdAndClassIdAndIsDeletedFalse(
            @Param("teacherId") Integer teacherId,
            @Param("subjectId") Integer subjectId,
            @Param("classId") Integer classId);

    @Query("SELECT COUNT(b) FROM EntityBinding b " +
            "WHERE b.teacherId = :teacherId AND b.subjectId = :subjectId AND b.classBandId = :classBandId " +
            "AND b.uuid != :uuid AND b.isDeleted = false")
    Integer countByTeacherIdAndSubjectIdAndClassBandIdAndUuidNotAndIsDeletedFalse(
            @Param("teacherId") Integer teacherId,
            @Param("subjectId") Integer subjectId,
            @Param("classBandId") Integer classBandId,
            @Param("uuid") String uuid);
            

    @Query("SELECT COUNT(b) FROM EntityBinding b " +
            "WHERE b.teacherId = :teacherId AND b.subjectId = :subjectId AND b.classId = :classId " +
            "AND b.uuid != :uuid AND b.isDeleted = false")
    Integer countByTeacherIdAndSubjectIdAndClassIdAndUuidNotAndIsDeletedFalse(
            @Param("teacherId") Integer teacherId,
            @Param("subjectId") Integer subjectId,
            @Param("classId") Integer classId,
            @Param("uuid") String uuid);


    @Query("SELECT COUNT(b) FROM EntityBinding b " +
            "WHERE b.classId = :classId AND b.subjectId = :subjectId " +
            "AND b.isDeleted = false")
    Integer countByClassIdAndSubjectIdAndIsDeletedFalse(
            @Param("classId") Integer classId,
            @Param("subjectId") Integer subjectId);
            
    @Query("SELECT COUNT(b) FROM EntityBinding b " +
            "WHERE b.classId = :classId AND b.subjectId = :subjectId " +
            "AND b.uuid != :uuid AND b.isDeleted = false")
    Integer countByClassIdAndSubjectIdAndUuidNotAndIsDeletedFalse(
            @Param("classId") Integer classId,
            @Param("subjectId") Integer subjectId,
            @Param("uuid") String uuid);
            

    @Query("SELECT COUNT(b) FROM EntityBinding b " +
            "WHERE b.classBandId = :classBandId AND b.subjectId = :subjectId " +
            "AND b.isDeleted = false")
    Integer countByClassBandIdAndSubjectIdAndIsDeletedFalse(
            @Param("classBandId") Integer classBandId,
            @Param("subjectId") Integer subjectId);

    @Query("SELECT b FROM EntityBinding b WHERE " +
            "b.teacherId IN (SELECT tp.id FROM EntityTeacherProfile tp WHERE tp.userId IN " +
            "(SELECT u.id FROM EntityUser u WHERE u.uuid = :teacherUuid)) AND " +
            "b.isDeleted = false")
    List<EntityBinding> findByTeacherUuidAndIsDeletedFalse(@Param("teacherUuid") String teacherUuid);
    

    @Query("SELECT b FROM EntityBinding b WHERE " +
            "b.subjectId IN (SELECT s.id FROM EntitySubject s WHERE s.uuid = :subjectUuid) AND " +
            "b.isDeleted = false")
    List<EntityBinding> findBySubjectUuidAndIsDeletedFalse(@Param("subjectUuid") String subjectUuid);
    

    @Query("SELECT b FROM EntityBinding b WHERE " +
            "b.roomId IN (SELECT r.id FROM EntityRoom r WHERE r.uuid = :roomUuid) AND " +
            "b.isDeleted = false")
    List<EntityBinding> findByRoomUuidAndIsDeletedFalse(@Param("roomUuid") String roomUuid);


    Integer countByClassBandIdAndSubjectIdAndUuidNotAndIsDeletedFalse(Integer classBandId, Integer subjectId, String bindingUuid);

    @Query("SELECT b FROM EntityBinding b WHERE b.classBandId IN (SELECT cb.id FROM EntityClassBand cb WHERE cb.uuid = :classBandUuid) AND b.isDeleted = false")
    List<EntityBinding> findByClassBandUuidAndIsDeletedFalse(@Param("classBandUuid") String classBandUuid);

    @Query("SELECT DISTINCT b.classId FROM EntityBinding b WHERE b.teacherId = :teacherId AND b.isDeleted = false")
    List<Integer> findClassIdsByTeacherIdAndIsDeletedFalse(@Param("teacherId") Integer teacherId);

    @Query("SELECT DISTINCT b.classId FROM EntityBinding b WHERE b.roomId = :roomId AND b.isDeleted = false")
    List<Integer> findClassIdsByRoomIdAndIsDeletedFalse(@Param("roomId") Integer roomId);

    @Query("SELECT DISTINCT b.classId FROM EntityBinding b WHERE b.subjectId = :subjectId AND b.isDeleted = false")
    List<Integer> findClassIdsBySubjectIdAndIsDeletedFalse(@Param("subjectId") Integer subjectId);

    @Query(value = "SELECT b.* FROM bindings b " +
            "LEFT JOIN teacher_profiles tp ON b.binding_teacher_id = tp.teacher_profile_id " +
            "LEFT JOIN users u ON tp.user_id = u.user_id " +
            "LEFT JOIN subjects s ON b.binding_subject_id = s.subject_id " +
            "LEFT JOIN classes c ON b.binding_class_id = c.class_id " +
            "LEFT JOIN rooms r ON b.binding_room_id = r.room_id " +
            "WHERE b.binding_is_deleted = false " +
            "AND (:keyword IS NULL OR " +
            "LOWER(CONCAT(u.user_first_name, ' ', u.user_last_name)) LIKE CONCAT('%', LOWER(:keyword), '%') OR " +
            "LOWER(s.subject_name) LIKE CONCAT('%', LOWER(:keyword), '%') OR " +
            "LOWER(c.class_name) LIKE CONCAT('%', LOWER(:keyword), '%') OR " +
            "LOWER(r.room_name) LIKE CONCAT('%', LOWER(:keyword), '%')) " +
            "AND (:planSettingsId IS NULL OR b.binding_plan_settings_id = :planSettingsId) " +
            "AND (:orgId IS NULL OR b.binding_organization_id = :orgId) " +
            "ORDER BY u.user_last_name ASC",
            nativeQuery = true)
    List<EntityBinding> searchByKeywordAndPlanSettingsIdAndOrganizationId(
            @Param("keyword") String keyword,
            @Param("planSettingsId") Integer planSettingsId,
            @Param("orgId") Integer orgId);

    Page<EntityBinding> findByTeacherIdAndOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(Integer teacherId, Integer organizationId, Integer planSettingsId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(b.periodsPerWeek), 0) FROM EntityBinding b WHERE b.teacherId = :teacherId AND b.planSettingsId = :planSettingsId AND b.isDeleted = false")
    Integer getTeacherWorkloadTotalPeriodsByPlanSettings(Integer teacherId, Integer planSettingsId);

    @Query("SELECT COALESCE(SUM(b.periodsPerWeek), 0) FROM EntityBinding b WHERE b.classId = :classId AND b.planSettingsId = :planSettingsId AND b.isDeleted = false")
    Integer getClassTotalPeriodsByPlanSettings(@Param("classId") Integer classId, @Param("planSettingsId") Integer planSettingsId);
    
    @Query("SELECT COALESCE(SUM(b.periodsPerWeek), 0) FROM EntityBinding b WHERE b.classBandId = :classBandId AND b.planSettingsId = :planSettingsId AND b.isDeleted = false")
    Integer getClassBandTotalPeriodsByPlanSettings(@Param("classBandId") Integer classBandId, @Param("planSettingsId") Integer planSettingsId);
    
    @Query("SELECT COALESCE(SUM(b.periodsPerWeek), 0) FROM EntityBinding b WHERE b.roomId = :roomId AND b.planSettingsId = :planSettingsId AND b.isDeleted = false")
    Integer getRoomWorkloadTotalPeriodsByPlanSettings(@Param("roomId") Integer roomId, @Param("planSettingsId") Integer planSettingsId);
}