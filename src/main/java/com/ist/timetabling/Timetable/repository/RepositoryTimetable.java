package com.ist.timetabling.Timetable.repository;

import com.ist.timetabling.Timetable.entity.EntityTimetable;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.time.LocalDateTime;


@Repository
public interface RepositoryTimetable extends JpaRepository<EntityTimetable, Integer> {

    @Query("SELECT COUNT(t) FROM EntityTimetable t WHERE t.organizationId = :organizationId AND t.isDeleted = false")
    long countByOrganizationId(@Param("organizationId") Integer organizationId);

    @Query("SELECT COUNT(t) FROM EntityTimetable t WHERE t.isDeleted = false")
    long countByIsDeletedFalse();

    long countByOrganizationIdAndIsDeletedFalse(final Integer organizationId);

    List<EntityTimetable> findByOrganizationIdAndIsDeletedFalse(final Integer organizationId);

    Optional<EntityTimetable> findByUuidAndIsDeletedFalse(final String uuid);

    @Query("SELECT t FROM EntityTimetable t WHERE t.organizationId = :organizationId AND t.isDeleted = false ORDER BY t.createdDate DESC")
    List<EntityTimetable> findLatestByOrganizationId(@Param("organizationId") Integer organizationId, Pageable pageable);

    Optional<EntityTimetable> findByOrganizationIdAndPlansettingIdAndAcademicYearAndSemesterAndIsDeletedFalse(Integer organizationId, Integer plansettingId, String academicYear, String semester);

    long countByGeneratedDateAfterAndOrganizationId(LocalDateTime date, Integer organizationId);

}