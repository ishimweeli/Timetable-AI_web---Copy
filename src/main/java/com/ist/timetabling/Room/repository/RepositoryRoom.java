package com.ist.timetabling.Room.repository;

import com.ist.timetabling.Period.entity.EntitySchedulePreference;
import com.ist.timetabling.Room.entity.EntityRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RepositoryRoom extends JpaRepository<EntityRoom, Integer> {

    Optional<EntityRoom> findByUuidAndIsDeletedFalse(final String uuid);

    Page<EntityRoom> findAllByIsDeletedFalse(final Pageable pageable);

    Page<EntityRoom> findByIsDeletedFalse(final Pageable pageable);

    Page<EntityRoom> findByOrganizationIdAndIsDeletedFalse(final Integer organizationId, final Pageable pageable);

    Page<EntityRoom> findByPlanSettingsIdAndIsDeletedFalse(final Integer planSettingsId, final Pageable pageable);

    Page<EntityRoom> findByOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(final Integer organizationId, final Integer planSettingsId, final Pageable pageable);

    boolean existsByCodeAndIsDeletedFalse(final String code);

    boolean existsByCodeAndOrganizationIdAndIsDeletedFalse(final String code, final Integer organizationId);

    long countByIsDeletedFalse();

    long countByOrganizationIdAndIsDeletedFalse(final Integer organizationId);

    @Query(value = "SELECT r.* FROM rooms r WHERE r.is_deleted = false AND LOWER(r.room_name) LIKE %:keyword%", 
           nativeQuery = true)
    List<EntityRoom> searchByNameContainingNative(@Param("keyword") String keyword);

    @Query(value = "SELECT r.* FROM rooms r WHERE r.is_deleted = false AND r.organization_id = :orgId AND LOWER(r.room_name) LIKE %:keyword%", 
           nativeQuery = true)
    List<EntityRoom> searchByNameContainingAndOrganizationId(@Param("keyword") String keyword, @Param("orgId") Integer organizationId);

    @Query(value = "SELECT r.* FROM rooms r WHERE r.is_deleted = false AND LOWER(r.room_name) LIKE %:keyword%", 
           countQuery = "SELECT count(*) FROM rooms r WHERE r.is_deleted = false AND LOWER(r.room_name) LIKE %:keyword%",
           nativeQuery = true)
    Page<EntityRoom> searchByNameContainingNativePage(@Param("keyword") String keyword, Pageable pageable);
    
    @Query(value = "SELECT r.* FROM rooms r WHERE r.is_deleted = false AND r.organization_id = :orgId AND LOWER(r.room_name) LIKE %:keyword%", 
           countQuery = "SELECT count(*) FROM rooms r WHERE r.is_deleted = false AND r.organization_id = :orgId AND LOWER(r.room_name) LIKE %:keyword%",
           nativeQuery = true)
    Page<EntityRoom> searchByNameContainingAndOrganizationIdPage(@Param("keyword") String keyword, @Param("orgId") Integer organizationId, Pageable pageable);

    @Query("SELECT r FROM EntityRoom r WHERE (:keyword IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:orgId IS NULL OR r.organizationId = :orgId) " +
           "AND (:planSettingsId IS NULL OR r.planSettingsId = :planSettingsId) " +
           "AND r.isDeleted = false")
    Page<EntityRoom> searchRoomsWithPlanSettings(
            @Param("keyword") String keyword,
            @Param("orgId") Integer orgId,
            @Param("planSettingsId") Integer planSettingsId,
            Pageable pageable);

    @Query(value = "SELECT sp.* FROM schedule_preferences sp " +
            "JOIN room_schedule_preferences rsp ON sp.schedule_preference_id = rsp.schedule_preference_id " +
            "WHERE rsp.room_id = :roomId AND sp.schedule_preference_is_deleted = false",
            nativeQuery = true)
    List<EntitySchedulePreference> findSchedulePreferencesByRoomId(@Param("roomId") final Integer roomId);

    @Query("SELECT r.id FROM EntityRoom r WHERE r.uuid = :uuid AND r.isDeleted = false")
    Integer findIdByUuidAndIsDeletedFalse(@Param("uuid") String uuid);

    List<EntityRoom> findByOrganizationId(Integer organizationId);
}