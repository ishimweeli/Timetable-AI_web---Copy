package com.ist.timetabling.Timetable.repository;

import com.ist.timetabling.Timetable.entity.EntityTimetableEntry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;


@Repository
public interface RepositoryTimetableEntry extends JpaRepository<EntityTimetableEntry, Integer> {

    @Query("SELECT COUNT(e) FROM EntityTimetableEntry e WHERE e.timetableId = :timetableId")
    long countByTimetableId(@Param("timetableId") Integer timetableId);

    List<EntityTimetableEntry> findByTimetableId(Integer timetableId);

    Optional<EntityTimetableEntry> findByUuidAndIsDeletedFalse(String uuid);

    List<EntityTimetableEntry> findByTimetableIdAndIsDeletedFalse(Integer timetableId);

    List<EntityTimetableEntry> findByTimetableIdAndDayOfWeek(Integer timetableId, Integer dayOfWeek);

    List<EntityTimetableEntry> findByTimetableIdAndClassId(Integer timetableId, Integer classId);

    List<EntityTimetableEntry> findByTimetableIdAndSubjectId(Integer timetableId, Integer subjectId);

    List<EntityTimetableEntry> findByTimetableIdAndRoomId(Integer timetableId, Integer roomId);

    @Query("SELECT e FROM EntityTimetableEntry e WHERE e.timetableId = :timetableId " +
            "AND (:subjectIds IS NULL OR e.subjectId IN :subjectIds) " +
            "AND (:roomIds IS NULL OR e.roomId IN :roomIds) " +
            "AND (:teacherIds IS NULL OR e.teacherId IN :teacherIds)")
    List<EntityTimetableEntry> filterEntries(@Param("timetableId") Integer timetableId,
                                             @Param("subjectIds") List<Integer> subjectIds,
                                             @Param("roomIds") List<Integer> roomIds,
                                             @Param("teacherIds") List<Integer> teacherIds);

    List<EntityTimetableEntry> findByTimetableIdAndTeacherIdAndDayOfWeekAndPeriod(Integer timetableId, Integer teacherId, Integer dayOfWeek, Integer period);

    List<EntityTimetableEntry> findByTimetableIdAndClassIdAndDayOfWeekAndPeriod(
            Integer timetableId, Integer classId, Integer dayOfWeek, Integer period);

    List<EntityTimetableEntry> findByTimetableIdAndRoomIdAndDayOfWeekAndPeriod(
            Integer timetableId, Integer roomId, Integer dayOfWeek, Integer period);

    @Query("SELECT e FROM EntityTimetableEntry e WHERE e.timetableId = :timetableId " +
            "AND (:subjectIds IS NULL OR e.subjectId IN :subjectIds) " +
            "AND (:roomIds IS NULL OR e.roomId IN :roomIds) " +
            "AND (:teacherIds IS NULL OR e.teacherId IN :teacherIds)" +
            "AND (:classIds IS NULL OR e.classId IN :classIds)")
    List<EntityTimetableEntry> filterEntries(@Param("timetableId") Integer timetableId,
                                             @Param("subjectIds") List<Integer> subjectIds,
                                             @Param("roomIds") List<Integer> roomIds,
                                             @Param("teacherIds") List<Integer> teacherIds,
                                             @Param("classIds") List<Integer> classIds);

    @Query("SELECT e FROM EntityTimetableEntry e WHERE (e.classId = :classId AND e.isDeleted = false) OR (e.isClassBandEntry = true AND e.classBandId IN :bandIds AND e.isDeleted = false)")
    List<EntityTimetableEntry> findEntriesForClassOrBands(@Param("classId") Integer classId, @Param("bandIds") List<Integer> bandIds);

    List<EntityTimetableEntry> findByClassBandIdAndIsClassBandEntryTrueAndIsDeletedFalse(Integer classBandId);

    Page<EntityTimetableEntry> findByTimetableIdAndIsDeletedFalse(Integer timetableId, Pageable pageable);

    List<EntityTimetableEntry> findByUuidInAndIsDeletedFalse(List<String> uuids);

    List<EntityTimetableEntry> findByTimetableIdAndDayOfWeekAndPeriodAndIsDeletedTrue(
            Integer timetableId, Integer dayOfWeek, Integer period);
}