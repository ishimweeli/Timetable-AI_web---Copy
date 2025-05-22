package com.ist.timetabling.Timetable.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.ist.timetabling.Class.entity.EntityClass;
import com.ist.timetabling.Class.repository.RepositoryClass;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Period.dto.res.DtoResPeriod;
import com.ist.timetabling.Period.repository.RepositoryPeriod;
import com.ist.timetabling.PlanSetting.entity.EntityPlanSetting;
import com.ist.timetabling.PlanSetting.repository.RepositoryPlanSetting;
import com.ist.timetabling.Room.entity.EntityRoom;
import com.ist.timetabling.Room.repository.RepositoryRoom;
import com.ist.timetabling.Subject.entity.EntitySubject;
import com.ist.timetabling.Subject.repository.RepositorySubject;
import com.ist.timetabling.Teacher.entity.EntityTeacherProfile;
import com.ist.timetabling.Teacher.repository.RepositoryTeacherProfile;
import com.ist.timetabling.Timetable.dto.req.DtoReqTimetable;
import com.ist.timetabling.Timetable.dto.req.DtoReqTimetableEntry;
import com.ist.timetabling.Timetable.dto.res.*;
import com.ist.timetabling.Timetable.entity.EntityTimetable;
import com.ist.timetabling.Timetable.entity.EntityTimetableEntry;
import com.ist.timetabling.Timetable.exception.ExceptionTimetableNotFound;
import com.ist.timetabling.Timetable.repository.RepositoryTimetable;
import com.ist.timetabling.Timetable.repository.RepositoryTimetableEntry;
import com.ist.timetabling.Timetable.service.ServiceTimetable;
import com.ist.timetabling.User.entity.EntityUser;
import com.ist.timetabling.User.repository.RepositoryUser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ServiceTimetableImpl implements ServiceTimetable {

    private static final Logger log = LoggerFactory.getLogger(ServiceTimetableImpl.class);
    private final RepositoryTimetable repositoryTimetable;
    private final RepositoryTimetableEntry repositoryTimetableEntry;
    private final ObjectMapper objectMapper;
    private final RepositorySubject repositorySubject;
    private final RepositoryUser repositoryUser;
    private final RepositoryRoom repositoryRoom;
    private final RepositoryTeacherProfile repositoryTeacherProfile;
    private final RepositoryClass repositoryClass;
    private final RepositoryPeriod repositoryPeriod;
    private final RepositoryPlanSetting repositoryPlanSetting;

    @Autowired
    public ServiceTimetableImpl(
            RepositoryTimetable repositoryTimetable,
            RepositoryTimetableEntry repositoryTimetableEntry,
            RepositorySubject repositorySubject,
            RepositoryUser repositoryUser,
            RepositoryRoom repositoryRoom,
            RepositoryTeacherProfile repositoryTeacherProfile,
            RepositoryClass repositoryClass,
            RepositoryPeriod repositoryPeriod,
            RepositoryPlanSetting repositoryPlanSetting
    ) {
        this.repositoryTimetable = repositoryTimetable;
        this.repositoryTimetableEntry = repositoryTimetableEntry;
        this.repositorySubject = repositorySubject;
        this.repositoryUser = repositoryUser;
        this.repositoryRoom = repositoryRoom;
        this.repositoryTeacherProfile = repositoryTeacherProfile;
        this.repositoryClass = repositoryClass;
        this.repositoryPeriod = repositoryPeriod;
        this.repositoryPlanSetting = repositoryPlanSetting;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public List<DtoResTimetable> getAllTimetables(Integer organizationId) {
        final List<EntityTimetable> timetables = repositoryTimetable.findByOrganizationIdAndIsDeletedFalse(organizationId);
        final List<DtoResTimetable> responses = new ArrayList<>();

        for (EntityTimetable timetable : timetables) {
            DtoResTimetable dto = convertToDto(timetable);
            List<EntityTimetableEntry> entryEntities = repositoryTimetableEntry.findByTimetableIdAndIsDeletedFalse(timetable.getId());
            List<DtoResTimetableEntry> entryDtos = convertToEntryDtos(entryEntities, timetable.getId());
            dto.setEntries(entryDtos);
            responses.add(dto);
        }

        return responses;
    }

    @Override
    public DtoResTimetable getTimetableByUuid(final String uuid) {
        final EntityTimetable timetable = repositoryTimetable.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionTimetableNotFound("Timetable not found with UUID: " + uuid));

        syncTimetableRelatedEntities(timetable.getId());

        final List<EntityTimetableEntry> entries = repositoryTimetableEntry.findByTimetableIdAndIsDeletedFalse(timetable.getId());
        final DtoResTimetable timetableDto = convertToDto(timetable);
        timetableDto.setEntries(convertToEntryDtos(entries, timetable.getId()));

        return timetableDto;
    }

    @Override
    public List<DtoResTimetableEntry> getTimetableEntriesByUuid(final String uuid) {
        final EntityTimetable timetable = repositoryTimetable.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionTimetableNotFound("Timetable not found with UUID: " + uuid));

        final List<EntityTimetableEntry> entries = repositoryTimetableEntry.findByTimetableIdAndIsDeletedFalse(timetable.getId());
        
        final List<DtoResTimetableEntry> dtoEntries = convertToEntryDtos(entries, timetable.getId());
        
        
        for (DtoResTimetableEntry dto : dtoEntries) {
            if (dto.getIsLocked() == null) {
                dto.setIsLocked(false);
            }
        }
        
        return dtoEntries;
    }

    @Override
    public List<DtoResTimetableEntry> getTimetableEntriesByUuidAndDay(final String uuid, final Integer dayOfWeek) {
        final EntityTimetable timetable = repositoryTimetable.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionTimetableNotFound("Timetable not found with UUID: " + uuid));

        final List<EntityTimetableEntry> entries = repositoryTimetableEntry.findByTimetableIdAndDayOfWeek(timetable.getId(), dayOfWeek);
        final List<DtoResTimetableEntry> dtoEntries = entries.stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());

        enrichTimetableEntriesWithSubjectData(dtoEntries);

        return dtoEntries;
    }

    @Override
    public List<DtoResTimetableEntry> getTimetableEntriesByUuidAndSubject(final String uuid, final Integer subjectId) {
        final EntityTimetable timetable = repositoryTimetable.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionTimetableNotFound("Timetable not found with UUID: " + uuid));

        final List<EntityTimetableEntry> entries = repositoryTimetableEntry.findByTimetableIdAndSubjectId(timetable.getId(), subjectId);
        return convertToEntryDtos(entries, timetable.getId());
    }

    private DtoResTimetableEntry mapEntityToDto(EntityTimetableEntry entry) {
        final DtoResTimetableEntry dto = new DtoResTimetableEntry();
        dto.setId(entry.getId());
        dto.setUuid(entry.getUuid());
        dto.setTimetableId(entry.getTimetableId());
        dto.setDayOfWeek(entry.getDayOfWeek());
        dto.setPeriod(entry.getPeriod());

        // Ensure subject data is properly populated
        if (entry.getSubjectId() != null) {
            EntitySubject subject = repositorySubject.findById(entry.getSubjectId())
                    .orElseThrow(() -> new RuntimeException("Subject not found with ID: " + entry.getSubjectId()));
            dto.setSubjectId(subject.getId());
            dto.setSubjectUuid(subject.getUuid());
            dto.setSubjectName(subject.getName());
            dto.setSubjectColor(subject.getColor());
            dto.setSubjectInitials(subject.getInitials());
        }

        dto.setDurationMinutes(entry.getDurationMinutes());
        dto.setPeriodType(entry.getPeriodType());
        dto.setStatus(entry.getStatus());

        return dto;
    }

    private void enrichTimetableEntriesWithSubjectData(List<DtoResTimetableEntry> entries) {
        // Create a map of subject IDs to fetch missing data in one query
        Set<Integer> subjectIds = entries.stream()
                .filter(e -> e.getSubjectId() != null && (e.getSubjectName() == null || e.getSubjectColor() == null))
                .map(DtoResTimetableEntry::getSubjectId)
                .collect(Collectors.toSet());

        if (!subjectIds.isEmpty()) {
            Map<Integer, EntitySubject> subjectMap = repositorySubject.findAllById(subjectIds).stream()
                    .collect(Collectors.toMap(EntitySubject::getId, subject -> subject));

            // Update entries with missing subject data
            entries.forEach(entry -> {
                if (entry.getSubjectId() != null && (entry.getSubjectName() == null || entry.getSubjectColor() == null)) {
                    EntitySubject subject = subjectMap.get(entry.getSubjectId());
                    if (subject != null) {
                        entry.setSubjectUuid(subject.getUuid());
                        entry.setSubjectName(subject.getName());
                        entry.setSubjectColor(subject.getColor());
                        entry.setSubjectInitials(subject.getInitials());
                    }
                }
            });
        }
    }
    @Override
    public List<DtoResTimetableEntry> getTimetableEntriesByUuidAndRoom(final String uuid, final Integer roomId) {
        final EntityTimetable timetable = repositoryTimetable.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionTimetableNotFound("Timetable not found with UUID: " + uuid));

        final List<EntityTimetableEntry> entries = repositoryTimetableEntry.findByTimetableIdAndRoomId(timetable.getId(), roomId);
        return convertToEntryDtos(entries, timetable.getId());
    }

    @Override
    public List<DtoResTimetableEntry> getTimetableEntriesByUuidAndSubjectUuid(final String uuid, final String subjectUuid) {
        final EntityTimetable timetable = repositoryTimetable.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionTimetableNotFound("Timetable not found with UUID: " + uuid));

        final EntitySubject subject = repositorySubject.findByUuidAndIsDeletedFalse(subjectUuid)
                .orElseThrow(() -> new RuntimeException("Subject not found with UUID: " + subjectUuid));

        final List<EntityTimetableEntry> entries = repositoryTimetableEntry.findByTimetableIdAndSubjectId(timetable.getId(), subject.getId());
        return convertToEntryDtos(entries, timetable.getId());
    }

    @Override
    public List<DtoResTimetableEntry> getTimetableEntriesByUuidAndRoomUuid(final String uuid, final String roomUuid) {
        final EntityTimetable timetable = repositoryTimetable.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionTimetableNotFound("Timetable not found with UUID: " + uuid));

        final EntityRoom room = repositoryRoom.findByUuidAndIsDeletedFalse(roomUuid)
                .orElseThrow(() -> new RuntimeException("Room not found with UUID: " + roomUuid));

        final List<EntityTimetableEntry> entries = repositoryTimetableEntry.findByTimetableIdAndRoomId(timetable.getId(), room.getId());
        return convertToEntryDtos(entries, timetable.getId());
    }

    @Override
    public DtoResTimetable getLatestTimetable(final Integer organizationId) {
        final Pageable pageable = PageRequest.of(0, 1);
        final List<EntityTimetable> timetables = repositoryTimetable.findLatestByOrganizationId(organizationId, pageable);

        if (timetables.isEmpty()) {
            throw new ExceptionTimetableNotFound("No timetables found for organization ID: " + organizationId);
        }

        final EntityTimetable latestTimetable = timetables.get(0);

        syncTimetableRelatedEntities(latestTimetable.getId());

        final List<EntityTimetableEntry> entries = repositoryTimetableEntry.findByTimetableIdAndIsDeletedFalse(latestTimetable.getId());
        final DtoResTimetable timetableDto = convertToDto(latestTimetable);      
        timetableDto.setEntries(convertToEntryDtos(entries, latestTimetable.getId()));

        return timetableDto;
    }

    @Override
    public List<DtoResTimetableEntry> filterTimetableEntries(final String uuid, final List<Integer> teacherIds, final List<Integer> roomIds, final List<Integer> subjectIds, final List<Integer> classIds) {
        final EntityTimetable timetable = repositoryTimetable.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionTimetableNotFound("Timetable not found with uuid: " + uuid));

        // Get all entries for this timetable
        List<EntityTimetableEntry> allEntries = repositoryTimetableEntry.findByTimetableIdAndIsDeletedFalse(timetable.getId());

        // Apply filters with null-safe checks
        List<EntityTimetableEntry> filteredEntries = allEntries.stream()
                .filter(entry -> {
                    // Teacher filter
                    boolean matchesTeacher = teacherIds == null || teacherIds.isEmpty();
                    if (!matchesTeacher && entry.getTeacherId() != null) {
                        matchesTeacher = teacherIds.contains(entry.getTeacherId());
                    }

                    // Room filter
                    boolean matchesRoom = roomIds == null || roomIds.isEmpty();
                    if (!matchesRoom && entry.getRoomId() != null) {
                        matchesRoom = roomIds.contains(entry.getRoomId());
                    }

                    // Subject filter
                    boolean matchesSubject = subjectIds == null || subjectIds.isEmpty();
                    if (!matchesSubject && entry.getSubjectId() != null) {
                        matchesSubject = subjectIds.contains(entry.getSubjectId());
                    }

                    // Class filter
                    boolean matchesClass = classIds == null || classIds.isEmpty();
                    if (!matchesClass && entry.getClassId() != null) {
                        matchesClass = classIds.contains(entry.getClassId());
                    }

                    return matchesTeacher && matchesRoom && matchesSubject && matchesClass;
                })
                .collect(Collectors.toList());

        // Convert to DTOs with all data preserved
        return convertToEntryDtos(filteredEntries, timetable.getId());
    }

    @Override
    public ApiResponse<DtoResTimetable> create(DtoReqTimetable dtoReqTimetable) {
        final ApiResponse<DtoResTimetable> apiResponse = new ApiResponse<>();

        final EntityTimetable entityTimetable = new EntityTimetable();
        entityTimetable.setAcademicYear(dtoReqTimetable.getAcademicYear());
        entityTimetable.setSemester(dtoReqTimetable.getSemester());
        entityTimetable.setOrganizationId(dtoReqTimetable.getOrganizationId());
        repositoryTimetable.save(entityTimetable);

        final DtoResTimetable dtoResTimetable = convertToDtoAi(entityTimetable);
        final List<EntityTimetableEntry> entries = repositoryTimetableEntry.findByTimetableId(entityTimetable.getId());
        dtoResTimetable.setEntries(convertToEntryDtos(entries, entityTimetable.getId()));

        apiResponse.setSuccess(true);
        apiResponse.setData(dtoResTimetable);

        return apiResponse;
    }

    @Override
    public DtoResTimetable createTimetable(DtoReqTimetable dtoReqTimetable) {
        final EntityTimetable entityTimetable = new EntityTimetable();
        entityTimetable.setAcademicYear(dtoReqTimetable.getAcademicYear());
        entityTimetable.setSemester(dtoReqTimetable.getSemester());
        entityTimetable.setOrganizationId(dtoReqTimetable.getOrganizationId());
        if (dtoReqTimetable.getPlanSettingId() != null) {
            entityTimetable.setPlansettingId(dtoReqTimetable.getPlanSettingId());
            try {
                Optional<EntityPlanSetting> planSettingOpt = repositoryPlanSetting.findById(dtoReqTimetable.getPlanSettingId());
                if (planSettingOpt.isPresent()) {
                    EntityPlanSetting planSetting = planSettingOpt.get();
                    entityTimetable.setPlanSettingUuid(planSetting.getUuid());
                    entityTimetable.setPlanStartDate(planSetting.getPlanStartDate());
                    entityTimetable.setPlanEndDate(planSetting.getPlanEndDate());
                    entityTimetable.setIncludeWeekends(planSetting.getIncludeWeekends());
                }
            } catch (Exception e) {
                log.error("Error fetching plan settings data: {}", e.getMessage(), e);
            }
        }
        
        repositoryTimetable.save(entityTimetable);

        final DtoResTimetable dtoResTimetable = convertToDtoAi(entityTimetable);
        final List<EntityTimetableEntry> entries = repositoryTimetableEntry.findByTimetableId(entityTimetable.getId());
        dtoResTimetable.setEntries(convertToEntryDtos(entries, entityTimetable.getId()));
        return dtoResTimetable;
    }

    @Override
    public DtoResTimetable findOrCreateTimetable(DtoReqTimetable dtoReqTimetable, boolean createIfNotFound) {
        Optional<EntityTimetable> existing = repositoryTimetable.findByOrganizationIdAndPlansettingIdAndAcademicYearAndSemesterAndIsDeletedFalse(
                dtoReqTimetable.getOrganizationId(),
                dtoReqTimetable.getPlanSettingId(),
                dtoReqTimetable.getAcademicYear(),
                dtoReqTimetable.getSemester()
        );

        if (existing.isPresent()) {
            return convertToDto(existing.get());
        }

        if (!createIfNotFound) {
            return null;
        }

        final EntityTimetable entityTimetable = new EntityTimetable();
        entityTimetable.setOrganizationId(dtoReqTimetable.getOrganizationId());
        entityTimetable.setPlansettingId(dtoReqTimetable.getPlanSettingId());
        entityTimetable.setAcademicYear(dtoReqTimetable.getAcademicYear());
        entityTimetable.setSemester(dtoReqTimetable.getSemester());
        if (dtoReqTimetable.getPlanSettingId() != null) {
            try {
                Optional<EntityPlanSetting> planSettingOpt = repositoryPlanSetting.findById(dtoReqTimetable.getPlanSettingId());
                if (planSettingOpt.isPresent()) {
                    EntityPlanSetting planSetting = planSettingOpt.get();
                    entityTimetable.setPlanSettingUuid(planSetting.getUuid());
                    entityTimetable.setPlanStartDate(planSetting.getPlanStartDate());
                    entityTimetable.setPlanEndDate(planSetting.getPlanEndDate());
                    entityTimetable.setIncludeWeekends(planSetting.getIncludeWeekends());
                }
            } catch (Exception e) {
                log.error("Error fetching plan settings data: {}", e.getMessage(), e);
            }
        }
        
        repositoryTimetable.save(entityTimetable);

        return convertToDtoAi(entityTimetable);
    }

    @Override
    public List<DtoResTimetableEntry> updateTimetableEntryPositions(final String timetableUuid, final List<DtoReqTimetableEntry> entryPositions, final String operation) {
        
        if (entryPositions == null || entryPositions.size() != 2) {
            throw new IllegalArgumentException("Exactly two entries must be provided for swapping.");
        }

        DtoReqTimetableEntry first = entryPositions.get(0);
        DtoReqTimetableEntry second = entryPositions.get(1);

        EntityTimetableEntry entry1 = repositoryTimetableEntry.findByUuidAndIsDeletedFalse(first.getUuid())
                .orElseThrow(() -> new RuntimeException("Timetable entry not found with UUID: " + first.getUuid()));
        EntityTimetableEntry entry2 = repositoryTimetableEntry.findByUuidAndIsDeletedFalse(second.getUuid())
                .orElseThrow(() -> new RuntimeException("Timetable entry not found with UUID: " + second.getUuid()));

        if ("create".equalsIgnoreCase(operation)) {
            // Move operation - Move entry1 to entry2's position and mark entry2 as deleted

            Integer tempDay = entry1.getDayOfWeek();
            Integer tempPeriod = entry1.getPeriod();

            // Update entry1's position to the destination position
            entry1.setDayOfWeek(entry2.getDayOfWeek());
            entry1.setPeriod(entry2.getPeriod());

            entry2.setDayOfWeek(tempDay);
            entry2.setPeriod(tempPeriod);
            // Mark entry2 as deleted
            entry2.setIsDeleted(true);

            repositoryTimetableEntry.save(entry1);
            repositoryTimetableEntry.save(entry2);

            List<EntityTimetableEntry> updatedEntries = new ArrayList<>();
            updatedEntries.add(entry1);
            updatedEntries.add(entry2);

            return convertToEntryDtos(updatedEntries, entry1.getTimetableId());
        } else {
            // Standard swap operation - remains unchanged
            Integer tempDay = entry1.getDayOfWeek();
            Integer tempPeriod = entry1.getPeriod();

            entry1.setDayOfWeek(entry2.getDayOfWeek());
            entry1.setPeriod(entry2.getPeriod());

            entry2.setDayOfWeek(tempDay);
            entry2.setPeriod(tempPeriod);

            repositoryTimetableEntry.save(entry1);
            repositoryTimetableEntry.save(entry2);

            List<EntityTimetableEntry> swappedEntries = new ArrayList<>();
            swappedEntries.add(entry1);
            swappedEntries.add(entry2);

            return convertToEntryDtos(swappedEntries, entry1.getTimetableId());
        }
    }

    @Override
    public DtoResTimetableStats getTimetableStats(final String uuid) {
        final EntityTimetable timetable = repositoryTimetable.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionTimetableNotFound("Timetable not found with UUID: " + uuid));

        final DtoResTimetableStats stats = new DtoResTimetableStats();
        stats.setTimetableUuid(timetable.getUuid());
        stats.setTimetableName(timetable.getName());

        // Calculate success rate
        final int totalGenerations = timetable.getGenerationSuccessCount() + timetable.getGenerationFailureCount();
        if (totalGenerations > 0) {
            stats.setSuccessRate((double) timetable.getGenerationSuccessCount() / totalGenerations * 100);
            stats.setFailureRate((double) timetable.getGenerationFailureCount() / totalGenerations * 100);
        } else {
            stats.setSuccessRate(0.0);
            stats.setFailureRate(0.0);
        }

        // Set average generation time
        stats.setAvgGenerationTime(timetable.getGenerationDuration() != null ?
                (double) timetable.getGenerationDuration() : 0.0);

        // Count schedules generated today
        final LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        final long schedulesGeneratedToday = repositoryTimetable.countByGeneratedDateAfterAndOrganizationId(
                today, timetable.getOrganizationId());
        stats.setSchedulesGeneratedToday((int) schedulesGeneratedToday);

        return stats;
    }

    private DtoResTimetable convertToDto(final EntityTimetable timetable) {
        final DtoResTimetable dto = new DtoResTimetable();
        dto.setId(timetable.getId());
        dto.setUuid(timetable.getUuid());
        dto.setName(timetable.getName());
        dto.setAcademicYear(timetable.getAcademicYear());
        dto.setSemester(timetable.getSemester());
        dto.setGeneratedBy(timetable.getGeneratedBy());
        dto.setOrganizationId(timetable.getOrganizationId());
        dto.setSchoolStartTime(timetable.getSchoolStartTime());
        dto.setSchoolEndTime(timetable.getSchoolEndTime());
        dto.setStatusId(timetable.getStatusId());
        dto.setDescription(timetable.getDescription());
        dto.setIsPublished(timetable.getIsPublished());
        dto.setStartDay(timetable.getStartDay());
        dto.setEndDay(timetable.getEndDay());
        dto.setCreatedDate(timetable.getCreatedDate());
        dto.setModifiedDate(timetable.getModifiedDate());
        dto.setGeneratedDate(timetable.getGeneratedDate());
        dto.setPlanSettingUuid(timetable.getPlanSettingUuid());
        dto.setPlanStartDate(timetable.getPlanStartDate());
        dto.setPlanEndDate(timetable.getPlanEndDate());
        dto.setIncludeWeekends(timetable.getIncludeWeekends());
        dto.setGenerationDuration(timetable.getGenerationDuration());
        dto.setGenerationSuccessCount(timetable.getGenerationSuccessCount());
        dto.setGenerationFailureCount(timetable.getGenerationFailureCount());
        dto.setTimetablePlan(timetable.getTimetablePlan());
        return dto;
    }

    private DtoResTimetable convertToDtoAi(final EntityTimetable timetable) {
        final DtoResTimetable dto = new DtoResTimetable();
        dto.setId(timetable.getId());
        dto.setUuid(timetable.getUuid());
        dto.setName(timetable.getName());
        dto.setAcademicYear(timetable.getAcademicYear());
        dto.setSemester(timetable.getSemester());
        dto.setGeneratedBy(timetable.getGeneratedBy());
        dto.setOrganizationId(timetable.getOrganizationId());
        dto.setSchoolStartTime(timetable.getSchoolStartTime());
        dto.setSchoolEndTime(timetable.getSchoolEndTime());
        dto.setStatusId(timetable.getStatusId());
        dto.setDescription(timetable.getDescription());
        dto.setIsPublished(timetable.getIsPublished());
        dto.setStartDay(timetable.getStartDay());
        dto.setEndDay(timetable.getEndDay());
        dto.setCreatedDate(timetable.getCreatedDate());
        dto.setModifiedDate(timetable.getModifiedDate());
        dto.setGeneratedDate(timetable.getGeneratedDate());
        dto.setPlanSettingUuid(timetable.getPlanSettingUuid());
        dto.setPlanStartDate(timetable.getPlanStartDate());
        dto.setPlanEndDate(timetable.getPlanEndDate());
        dto.setIncludeWeekends(timetable.getIncludeWeekends());
        dto.setTimetablePlan(timetable.getTimetablePlan());
        return dto;
    }

    @Transactional
    public void syncTimetableRelatedEntities(final Integer timetableId) {
        final EntityTimetable timetable = repositoryTimetable.findById(timetableId)
                .orElseThrow(() -> new ExceptionTimetableNotFound("Timetable not found with ID: " + timetableId));

        try {
            final List<EntitySubject> subjects = repositorySubject.findByOrganizationIdAndIsDeletedFalse(timetable.getOrganizationId());
            final List<EntityRoom> rooms = repositoryRoom.findByOrganizationId(timetable.getOrganizationId());
            final List<EntityTeacherProfile> teacherProfiles = repositoryTeacherProfile.findByOrganizationIdAndIsDeletedFalse(timetable.getOrganizationId());
            final List<EntityClass> classes = repositoryClass.findByOrganizationIdAndIsDeletedFalse(timetable.getOrganizationId());

            final ObjectMapper mapper = new ObjectMapper();
            final ObjectNode rootNode = mapper.createObjectNode();

            final ArrayNode subjectsArray = mapper.createArrayNode();
            for (EntitySubject subject : subjects) {
                final ObjectNode subjectNode = mapper.createObjectNode();
                subjectNode.put("id", subject.getId());
                subjectNode.put("uuid", subject.getUuid());
                subjectNode.put("name", subject.getName());
                subjectNode.put("color", subject.getColor() != null ? subject.getColor() : "#808080");
                subjectNode.put("initials", subject.getInitials());
                subjectsArray.add(subjectNode);
            }
            rootNode.set("subjects", subjectsArray);

            final ArrayNode teachersArray = mapper.createArrayNode();
            for (EntityTeacherProfile profile : teacherProfiles) {
                final ObjectNode teacherNode = mapper.createObjectNode();
                teacherNode.put("id", profile.getId());
                teacherNode.put("uuid", profile.getUuid());
                teacherNode.put("name", "");
                teacherNode.put("initials", profile.getInitials());
                teachersArray.add(teacherNode);
            }
            rootNode.set("teachers", teachersArray);

            final ArrayNode roomsArray = mapper.createArrayNode();
            for (EntityRoom room : rooms) {
                final ObjectNode roomNode = mapper.createObjectNode();
                roomNode.put("id", room.getId());
                roomNode.put("uuid", room.getUuid());
                roomNode.put("name", room.getName());
                roomNode.put("code", room.getCode());
                roomsArray.add(roomNode);
            }
            rootNode.set("rooms", roomsArray);

            final ArrayNode classesArray = mapper.createArrayNode();
            for (EntityClass classEntity : classes) {
                final ObjectNode classNode = mapper.createObjectNode();
                classNode.put("id", classEntity.getId());
                classNode.put("uuid", classEntity.getUuid());
                classNode.put("name", classEntity.getName());
                classNode.put("initials", classEntity.getInitial());
                classesArray.add(classNode);
            }
            rootNode.set("classes", classesArray);

            final String cachedDataJson = mapper.writeValueAsString(rootNode);
            timetable.setCachedData(cachedDataJson);
            repositoryTimetable.save(timetable);

        } catch (Exception e) {
            log.error("Error updating cached data: {}", e.getMessage());
        }
    }

    private List<DtoResTimetableEntry> convertToEntryDtos(final List<EntityTimetableEntry> entries, final Integer timetableId) {
        final List<DtoResTimetableEntry> dtos = new ArrayList<>();

        final EntityTimetable timetable = repositoryTimetable.findById(timetableId)
                .orElseThrow(() -> new ExceptionTimetableNotFound("Timetable not found with ID: " + timetableId));

        final ObjectMapper mapper = new ObjectMapper();
        JsonNode cachedData;
        try {
            cachedData = mapper.readTree(timetable.getCachedData());
        } catch (Exception e) {
            log.error("Error parsing cached data: {}", e.getMessage());
            cachedData = mapper.createObjectNode();
        }

        final Map<Integer, JsonNode> subjectMap = new HashMap<>();
        final Map<Integer, JsonNode> teacherMap = new HashMap<>();
        final Map<Integer, JsonNode> roomMap = new HashMap<>();
        final Map<Integer, JsonNode> classMap = new HashMap<>();

        if (cachedData.has("subjects") && cachedData.get("subjects").isArray()) {
            for (JsonNode subject : cachedData.get("subjects")) {
                if (subject.has("id")) {
                    subjectMap.put(subject.get("id").asInt(), subject);
                }
            }
        }

        if (cachedData.has("teachers") && cachedData.get("teachers").isArray()) {
            for (JsonNode teacher : cachedData.get("teachers")) {
                if (teacher.has("id")) {
                    teacherMap.put(teacher.get("id").asInt(), teacher);
                }
            }
        }

        if (cachedData.has("rooms") && cachedData.get("rooms").isArray()) {
            for (JsonNode room : cachedData.get("rooms")) {
                if (room.has("id")) {
                    roomMap.put(room.get("id").asInt(), room);
                }
            }
        }

        if (cachedData.has("classes") && cachedData.get("classes").isArray()) {
            for (JsonNode classNode : cachedData.get("classes")) {
                if (classNode.has("id")) {
                    classMap.put(classNode.get("id").asInt(), classNode);
                }
            }
        }

        Set<Integer> teacherProfileIds = new HashSet<>();
        for (EntityTimetableEntry entry : entries) {
            if (entry.getTeacherId() != null) {
                teacherProfileIds.add(entry.getTeacherId());
            }
        }

        Map<Integer, EntityTeacherProfile> teacherProfileMap = new HashMap<>();
        Map<Integer, EntityUser> userMap = new HashMap<>();

        if (!teacherProfileIds.isEmpty()) {
            try {
                List<EntityTeacherProfile> teacherProfiles = repositoryTeacherProfile.findAllById(new ArrayList<>(teacherProfileIds));

                Set<Integer> userIds = new HashSet<>();
                for (EntityTeacherProfile profile : teacherProfiles) {
                    teacherProfileMap.put(profile.getId(), profile);
                    userIds.add(profile.getUserId());
                }

                if (!userIds.isEmpty()) {
                    List<EntityUser> users = repositoryUser.findAllById(new ArrayList<>(userIds));
                    for (EntityUser user : users) {
                        userMap.put(user.getId(), user);
                    }
                }
            } catch (Exception e) {
                log.error("Error fetching teacher data: {}", e.getMessage());
            }
        }

        for (EntityTimetableEntry entry : entries) {
            if(!entry.getIsDeleted()){
                final DtoResTimetableEntry dto = new DtoResTimetableEntry();
                dto.setId(entry.getId());
                dto.setUuid(entry.getUuid());
                dto.setTimetableId(entry.getTimetableId());
                dto.setDayOfWeek(entry.getDayOfWeek());
                dto.setPeriod(entry.getPeriod());
                dto.setDurationMinutes(entry.getDurationMinutes());
                dto.setPeriodType(entry.getPeriodType());
                dto.setStatus(entry.getStatus());

                dto.setSubjectId(entry.getSubjectId());
                if (entry.getSubjectId() != null && subjectMap.containsKey(entry.getSubjectId())) {
                    final JsonNode subject = subjectMap.get(entry.getSubjectId());
                    dto.setSubjectUuid(subject.has("uuid") ? subject.get("uuid").asText() : null);
                    dto.setSubjectName(subject.has("name") ? subject.get("name").asText() : null);
                    dto.setSubjectColor(subject.has("color") ? subject.get("color").asText() : null);
                    dto.setSubjectInitials(subject.has("initials") ? subject.get("initials").asText() : null);
                }

                dto.setTeacherId(entry.getTeacherId());
                if (entry.getTeacherId() != null) {
                    if (teacherProfileMap.containsKey(entry.getTeacherId())) {
                        EntityTeacherProfile teacherProfile = teacherProfileMap.get(entry.getTeacherId());
                        dto.setTeacherUuid(teacherProfile.getUuid());
                        dto.setTeacherInitials(teacherProfile.getInitials());

                        if (userMap.containsKey(teacherProfile.getUserId())) {
                            EntityUser user = userMap.get(teacherProfile.getUserId());
                            dto.setTeacherName(user.getFirstName() + " " + user.getLastName());
                        } else {
                            dto.setTeacherName("");
                        }
                    } else {
                        dto.setTeacherUuid(null);
                        dto.setTeacherName("");
                        dto.setTeacherInitials(null);
                    }
                }

                dto.setRoomId(entry.getRoomId());
                if (entry.getRoomId() != null && roomMap.containsKey(entry.getRoomId())) {
                    final JsonNode room = roomMap.get(entry.getRoomId());
                    dto.setRoomUuid(room.has("uuid") ? room.get("uuid").asText() : null);
                    dto.setRoomName(room.has("name") ? room.get("name").asText() : null);
                    dto.setRoomInitials(room.has("code") ? room.get("code").asText() : null);
                }

                dto.setClassId(entry.getClassId());
                if (entry.getClassId() != null && classMap.containsKey(entry.getClassId())) {
                    final JsonNode classNode = classMap.get(entry.getClassId());
                    dto.setClassUuid(classNode.has("uuid") ? classNode.get("uuid").asText() : null);
                    dto.setClassName(classNode.has("name") ? classNode.get("name").asText() : null);
                    dto.setClassInitials(classNode.has("initials") ? classNode.get("initials").asText() : null);
                }
                dto.setIsLocked(entry.getIsLocked() != null ? entry.getIsLocked() : false);
                dto.setIsDeleted(entry.getIsDeleted() != null ? entry.getIsDeleted() : false);

                dtos.add(dto);
            }

        }

        return dtos;
    }

    @Override
    public List<DtoResTimetableEntry> getAllTimetablesEntriesFlat(final Integer organizationId) {
        final List<EntityTimetable> timetables = repositoryTimetable.findByOrganizationIdAndIsDeletedFalse(organizationId);
        final List<DtoResTimetableEntry> allEntries = new ArrayList<>();
        for (EntityTimetable timetable : timetables) {
            List<EntityTimetableEntry> entryEntities = repositoryTimetableEntry.findByTimetableIdAndIsDeletedFalse(timetable.getId());
            List<DtoResTimetableEntry> entryDtos = convertToEntryDtos(entryEntities, timetable.getId());
            allEntries.addAll(entryDtos);
        }
        return allEntries;
    }

    @Override
    public ApiResponse<List<DtoResTimetableEntry>> getAllTimetablesEntries(final Integer organizationId) {
        List<DtoResTimetableEntry> entries = getAllTimetablesEntriesFlat(organizationId);
        ApiResponse<List<DtoResTimetableEntry>> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setStatus(200);
        response.setData(entries);
        response.setMessage("Successfully retrieved all timetable entries");
        return response;
    }

    @Override
    public List<DtoResTimetableEntry> restoreDeletedEntry(final String timetableUuid, final Integer dayOfWeek, final Integer period) {

            final EntityTimetable timetable = repositoryTimetable.findByUuidAndIsDeletedFalse(timetableUuid)
                    .orElseThrow(() -> new ExceptionTimetableNotFound("Timetable not found with UUID: " + timetableUuid));
            
            List<EntityTimetableEntry> deletedEntries = repositoryTimetableEntry.findByTimetableIdAndDayOfWeekAndPeriodAndIsDeletedTrue(
                    timetable.getId(), dayOfWeek, period);
            

            EntityTimetableEntry entryToRestore = deletedEntries.get(deletedEntries.size() - 1);
            
            entryToRestore.setIsDeleted(false);
            repositoryTimetableEntry.save(entryToRestore);
            
            List<EntityTimetableEntry> restoredEntryList = new ArrayList<>();
            restoredEntryList.add(entryToRestore);
            List<DtoResTimetableEntry> dtoList = convertToEntryDtos(restoredEntryList, timetable.getId());
            
        return dtoList;
    }

}