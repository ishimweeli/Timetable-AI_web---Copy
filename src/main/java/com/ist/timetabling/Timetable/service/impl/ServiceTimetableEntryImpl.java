package com.ist.timetabling.Timetable.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ist.timetabling.Class.entity.EntityClass;
import com.ist.timetabling.Class.repository.RepositoryClass;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.Core.util.PaginationUtil;
import com.ist.timetabling.Period.entity.EntityPeriod;
import com.ist.timetabling.Period.repository.RepositoryPeriod;
import com.ist.timetabling.Room.entity.EntityRoom;
import com.ist.timetabling.Room.repository.RepositoryRoom;
import com.ist.timetabling.Subject.entity.EntitySubject;
import com.ist.timetabling.Subject.repository.RepositorySubject;
import com.ist.timetabling.Teacher.entity.EntityTeacherProfile;
import com.ist.timetabling.Teacher.repository.RepositoryTeacherProfile;
import com.ist.timetabling.Timetable.dto.req.DtoReqManualScheduleEntry;
import com.ist.timetabling.Timetable.dto.req.DtoReqTimetableEntry;
import com.ist.timetabling.Timetable.dto.res.DtoResTimetableEntry;
import com.ist.timetabling.Timetable.entity.EntityTimetable;
import com.ist.timetabling.Timetable.entity.EntityTimetableEntry;
import com.ist.timetabling.Timetable.exception.ExceptionTimetableNotFound;
import com.ist.timetabling.Timetable.repository.RepositoryTimetable;
import com.ist.timetabling.Timetable.repository.RepositoryTimetableEntry;
import com.ist.timetabling.Timetable.service.ServiceTimetableEntry;
import com.ist.timetabling.User.entity.EntityUser;
import com.ist.timetabling.User.repository.RepositoryUser;
import com.ist.timetabling.binding.entity.EntityBinding;
import com.ist.timetabling.binding.repository.RepositoryBinding;
import com.ist.timetabling.ClassBand.repository.RepositoryClassBand;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import jakarta.servlet.http.HttpServletRequest;

import java.util.*;

@Service
public class ServiceTimetableEntryImpl implements ServiceTimetableEntry {

    private static final Logger log = LoggerFactory.getLogger(ServiceTimetableEntryImpl.class);
    private final RepositoryTimetableEntry repositoryTimetableEntry;
    private final ObjectMapper objectMapper;
    private final RepositorySubject repositorySubject;
    private final RepositoryUser repositoryUser;
    private final RepositoryRoom repositoryRoom;
    private final RepositoryTeacherProfile repositoryTeacherProfile;
    private final RepositoryTimetable repositoryTimetable;
    private final RepositoryBinding repositoryBinding;
    private final RepositoryPeriod repositoryPeriod;
    private final RepositoryClass repositoryClass;
    private final RepositoryClassBand classBandRepository;
    private final HttpServletRequest httpServletRequest;

    @Autowired
    public ServiceTimetableEntryImpl(
            RepositoryTimetableEntry repositoryTimetableEntry,
            RepositorySubject repositorySubject,
            RepositoryUser repositoryUser,
            RepositoryRoom repositoryRoom,
            RepositoryTeacherProfile repositoryTeacherProfile,
            RepositoryTimetable repositoryTimetable,
            RepositoryBinding repositoryBinding,
            RepositoryPeriod repositoryPeriod,
            RepositoryClass repositoryClass,
            RepositoryClassBand classBandRepository,
            HttpServletRequest httpServletRequest) {
        this.repositoryTimetableEntry = repositoryTimetableEntry;
        this.repositorySubject = repositorySubject;
        this.repositoryUser = repositoryUser;
        this.repositoryRoom = repositoryRoom;
        this.repositoryTeacherProfile = repositoryTeacherProfile;
        this.repositoryTimetable = repositoryTimetable;
        this.repositoryBinding = repositoryBinding;
        this.repositoryPeriod = repositoryPeriod;
        this.repositoryClass = repositoryClass;
        this.classBandRepository = classBandRepository;
        this.objectMapper = new ObjectMapper();
        this.httpServletRequest = httpServletRequest;
    }


    @Override
    public DtoResTimetableEntry getTimetableEntryByUuid(final String uuid) {
        final EntityTimetableEntry timetable = repositoryTimetableEntry.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionTimetableNotFound("Timetable not found with UUID: " + uuid));

        List<EntityTimetableEntry> entries = new ArrayList<>();
        entries.add(timetable);
        List<DtoResTimetableEntry> dtos = convertToEntryDtos(entries, timetable.getTimetableId());

        return dtos.isEmpty() ? new DtoResTimetableEntry() : dtos.get(0);
    }

    @Override
    public List<DtoResTimetableEntry> getTimetableEntriesByUuid(final String uuid) {
        final EntityTimetableEntry timetable = repositoryTimetableEntry.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionTimetableNotFound("Timetable not found with UUID: " + uuid));

        final List<EntityTimetableEntry> entries = repositoryTimetableEntry.findByTimetableId(timetable.getId());
        return convertToEntryDtos(entries, timetable.getId());
    }

    @Override
    public List<DtoResTimetableEntry> getTimetableEntriesByUuidAndDay(final String uuid, final Integer dayOfWeek) {
        final EntityTimetableEntry timetable = repositoryTimetableEntry.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionTimetableNotFound("Timetable not found with UUID: " + uuid));

        final List<EntityTimetableEntry> entries = repositoryTimetableEntry.findByTimetableIdAndDayOfWeek(timetable.getId(), dayOfWeek);
        return convertToEntryDtos(entries, timetable.getId());
    }

    @Override
    public List<DtoResTimetableEntry> getTimetableEntriesByUuidAndSubject(final String uuid, final Integer subjectId) {
        final EntityTimetableEntry entityTimetableEntry = repositoryTimetableEntry.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionTimetableNotFound("Timetable not found with UUID: " + uuid));

        final List<EntityTimetableEntry> entries = repositoryTimetableEntry.findByTimetableIdAndSubjectId(entityTimetableEntry.getId(), subjectId);
        return convertToEntryDtos(entries, entityTimetableEntry.getId());
    }

    @Override
    public List<DtoResTimetableEntry> getTimetableEntriesByUuidAndRoom(final String uuid, final Integer roomId) {
        final EntityTimetableEntry entityTimetableEntry = repositoryTimetableEntry.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionTimetableNotFound("Timetable not found with UUID: " + uuid));

        final List<EntityTimetableEntry> entries = repositoryTimetableEntry.findByTimetableIdAndRoomId(entityTimetableEntry.getId(), roomId);
        return convertToEntryDtos(entries, entityTimetableEntry.getId());
    }

    @Override
    public List<DtoResTimetableEntry> getTimetableEntriesByUuidAndSubjectUuid(final String uuid, final String subjectUuid) {
        final EntityTimetableEntry entityTimetableEntry = repositoryTimetableEntry.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionTimetableNotFound("Timetable not found with UUID: " + uuid));

        final EntitySubject subject = repositorySubject.findByUuidAndIsDeletedFalse(subjectUuid)
                .orElseThrow(() -> new RuntimeException("Subject not found with UUID: " + subjectUuid));

        final List<EntityTimetableEntry> entries = repositoryTimetableEntry.findByTimetableIdAndSubjectId(entityTimetableEntry.getId(), subject.getId());
        return convertToEntryDtos(entries, entityTimetableEntry.getId());
    }

    @Override
    public List<DtoResTimetableEntry> getTimetableEntriesByUuidAndRoomUuid(final String uuid, final String roomUuid) {
        final EntityTimetableEntry entityTimetableEntry = repositoryTimetableEntry.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionTimetableNotFound("Timetable not found with UUID: " + uuid));

        final EntityRoom room = repositoryRoom.findByUuidAndIsDeletedFalse(roomUuid)
                .orElseThrow(() -> new RuntimeException("Room not found with UUID: " + roomUuid));

        final List<EntityTimetableEntry> entries = repositoryTimetableEntry.findByTimetableIdAndRoomId(entityTimetableEntry.getId(), room.getId());
        return convertToEntryDtos(entries, entityTimetableEntry.getId());
    }

    @Override
    public ApiResponse<DtoResTimetableEntry> create(DtoReqTimetableEntry dtoReqTimetableEntry) {
        final ApiResponse<DtoResTimetableEntry> apiResponse = new ApiResponse<>();

        final EntityTimetableEntry entityTimetable = new EntityTimetableEntry();
        entityTimetable.setTimetableId(dtoReqTimetableEntry.getTimetableId());
        entityTimetable.setDayOfWeek(dtoReqTimetableEntry.getDayOfWeek());
        entityTimetable.setPeriod(dtoReqTimetableEntry.getPeriod());
        entityTimetable.setRoomId(dtoReqTimetableEntry.getRoomId());
        entityTimetable.setSubjectId(dtoReqTimetableEntry.getSubjectId());
        entityTimetable.setTeacherId(dtoReqTimetableEntry.getTeacherId());
        entityTimetable.setDurationMinutes(dtoReqTimetableEntry.getDurationMinutes());
        entityTimetable.setPeriodType(dtoReqTimetableEntry.getPeriodType());
        entityTimetable.setPeriodNumber(dtoReqTimetableEntry.getPeriod());
        entityTimetable.setStatus(dtoReqTimetableEntry.getStatus());
        entityTimetable.setClassId(dtoReqTimetableEntry.getClassId());
        entityTimetable.setIsLocked(dtoReqTimetableEntry.getIsLocked() != null ? dtoReqTimetableEntry.getIsLocked() : false);
        entityTimetable.setIsDeleted(false);
        entityTimetable.setIsClassBandEntry(dtoReqTimetableEntry.getIsClassBandEntry());
        entityTimetable.setClassBandId(dtoReqTimetableEntry.getClassBandId());

        repositoryTimetableEntry.save(entityTimetable);

        List<EntityTimetableEntry> entries = new ArrayList<>();
        entries.add(entityTimetable);
        List<DtoResTimetableEntry> dtos = convertToEntryDtos(entries, entityTimetable.getTimetableId());
        DtoResTimetableEntry dtoResTimetable = dtos.isEmpty() ? new DtoResTimetableEntry() : dtos.get(0);

        apiResponse.setSuccess(true);
        apiResponse.setData(dtoResTimetable);

        return apiResponse;
    }

    @Override
    public ApiResponse<List<DtoResTimetableEntry>> createAll(final List<DtoReqTimetableEntry> listDtoReqTimetableEntry) {
        final ApiResponse<List<DtoResTimetableEntry>> apiResponse = new ApiResponse<>();
        final List<EntityTimetableEntry> savedEntities = new ArrayList<>();
        Integer timetableId = null;

        for (DtoReqTimetableEntry dtoReqTimetableEntry : listDtoReqTimetableEntry) {
            final EntityTimetableEntry entityTimetable = new EntityTimetableEntry();
            entityTimetable.setTimetableId(dtoReqTimetableEntry.getTimetableId());
            entityTimetable.setDayOfWeek(dtoReqTimetableEntry.getDayOfWeek());
            entityTimetable.setPeriod(dtoReqTimetableEntry.getPeriod());
            entityTimetable.setRoomId(dtoReqTimetableEntry.getRoomId());
            entityTimetable.setSubjectId(dtoReqTimetableEntry.getSubjectId());
            entityTimetable.setTeacherId(dtoReqTimetableEntry.getTeacherId());
            entityTimetable.setDurationMinutes(dtoReqTimetableEntry.getDurationMinutes());
            entityTimetable.setPeriodType(dtoReqTimetableEntry.getPeriodType());
            entityTimetable.setPeriodNumber(dtoReqTimetableEntry.getPeriod());
            entityTimetable.setStatus(dtoReqTimetableEntry.getStatus());
            entityTimetable.setClassId(dtoReqTimetableEntry.getClassId());
            entityTimetable.setIsLocked(dtoReqTimetableEntry.getIsLocked() != null ? dtoReqTimetableEntry.getIsLocked() : false);
            entityTimetable.setIsDeleted(false);
            entityTimetable.setIsClassBandEntry(dtoReqTimetableEntry.getIsClassBandEntry());
            entityTimetable.setClassBandId(dtoReqTimetableEntry.getClassBandId());

            repositoryTimetableEntry.save(entityTimetable);
            savedEntities.add(entityTimetable);

            if (timetableId == null && entityTimetable.getTimetableId() != null) {
                timetableId = entityTimetable.getTimetableId();
            }
        }

        final List<DtoResTimetableEntry> responses = convertToEntryDtos(savedEntities, timetableId);

        apiResponse.setSuccess(true);
        apiResponse.setData(responses);

        return apiResponse;
    }

    @Override
    public DtoResTimetableEntry createManualEntry(final DtoReqManualScheduleEntry dtoReqManualScheduleEntry) {
        final EntityTimetable timetable = repositoryTimetable.findByUuidAndIsDeletedFalse(dtoReqManualScheduleEntry.getTimetableId().toString())
                .orElseThrow(() -> new ExceptionTimetableNotFound("Timetable not found with UUID: " + dtoReqManualScheduleEntry.getTimetableId()));

        final EntityBinding binding = repositoryBinding.findById(dtoReqManualScheduleEntry.getBindingId())
                .orElseThrow(() -> new RuntimeException("Binding not found with UUID: " + dtoReqManualScheduleEntry.getBindingId()));
        final Optional<EntityPeriod> entityPeriod = repositoryPeriod.findById(dtoReqManualScheduleEntry.getPeriodId());

        final EntityTimetableEntry entityTimetableEntry = new EntityTimetableEntry();
        entityTimetableEntry.setTimetableId(timetable.getId());
        entityTimetableEntry.setTeacherId(binding.getTeacherId());
        entityTimetableEntry.setClassId(binding.getClassId());
        entityTimetableEntry.setSubjectId(binding.getSubjectId());
        entityTimetableEntry.setRoomId(binding.getRoomId());
        entityTimetableEntry.setDayOfWeek(dtoReqManualScheduleEntry.getDayOfWeek());
        entityTimetableEntry.setPeriod(dtoReqManualScheduleEntry.getPeriodId());
        entityTimetableEntry.setIsDeleted(false);
        entityTimetableEntry.setStatus("Active");


        if (binding.getClassBandId() != null) {
            entityTimetableEntry.setClassBandId(binding.getClassBandId());
            entityTimetableEntry.setIsClassBandEntry(true);
        } else {

            entityTimetableEntry.setIsClassBandEntry(false);
        }

        if (entityPeriod.isPresent()) {
            entityTimetableEntry.setDurationMinutes(entityPeriod.get().getDurationMinutes());
            entityTimetableEntry.setPeriodType(entityPeriod.get().getPeriodType());
        } else {
            entityTimetableEntry.setDurationMinutes(45);
            entityTimetableEntry.setPeriodType("Regular");
        }

        entityTimetableEntry.setPeriodNumber(dtoReqManualScheduleEntry.getPeriodId());

        repositoryTimetableEntry.save(entityTimetableEntry);

        List<EntityTimetableEntry> entries = new ArrayList<>();
        entries.add(entityTimetableEntry);
        List<DtoResTimetableEntry> dtos = convertToEntryDtos(entries, timetable.getId());

        return dtos.isEmpty() ? new DtoResTimetableEntry() : dtos.get(0);
    }

    @Override
    public void removeEntry(final Integer entryId) {
        repositoryTimetableEntry.deleteById(entryId);
    }

    @Override
    public List<DtoResTimetableEntry> getEntriesForTimetable(final Integer timetableId) {
        List<EntityTimetableEntry> entities = repositoryTimetableEntry.findByTimetableIdAndIsDeletedFalse(timetableId);
        return convertToEntryDtos(entities, timetableId);
    }

    @Override
    public void saveEntriesForTimetable(final Integer timetableId, List<DtoReqTimetableEntry> entries) {
        List<EntityTimetableEntry> oldEntries = repositoryTimetableEntry.findByTimetableIdAndIsDeletedFalse(timetableId);

        repositoryTimetableEntry.saveAll(oldEntries);

        List<EntityTimetableEntry> newEntities = new ArrayList<>();
        for (DtoReqTimetableEntry dto : entries) {
            EntityTimetableEntry entityTimetableEntry = new EntityTimetableEntry();
            entityTimetableEntry.setTimetableId(timetableId);
            entityTimetableEntry.setClassId(dto.getClassId());
            entityTimetableEntry.setDayOfWeek(dto.getDayOfWeek());
            entityTimetableEntry.setPeriod(dto.getPeriod());
            entityTimetableEntry.setRoomId(dto.getRoomId());
            entityTimetableEntry.setStatus(dto.getStatus());
            entityTimetableEntry.setSubjectId(dto.getSubjectId());
            entityTimetableEntry.setTeacherId(dto.getTeacherId());
            entityTimetableEntry.setDurationMinutes(dto.getDurationMinutes());
            entityTimetableEntry.setPeriodType(dto.getPeriodType());
            entityTimetableEntry.setPeriodNumber(dto.getPeriod());
            entityTimetableEntry.setIsDeleted(false);
            entityTimetableEntry.setIsClassBandEntry(dto.getIsClassBandEntry());
            entityTimetableEntry.setClassBandId(dto.getClassBandId());

            repositoryTimetableEntry.save(entityTimetableEntry);
            newEntities.add(entityTimetableEntry);
        }
    }

    @Override
    public List<EntityTimetableEntry> getEntriesForClass(Integer classId) {
        List<Integer> bandIds = classBandRepository.findBandIdsByClassId(classId);
        return repositoryTimetableEntry.findEntriesForClassOrBands(classId, bandIds);
    }

    @Override
    public List<EntityTimetableEntry> getEntriesForClassBand(Integer classBandId) {
        return repositoryTimetableEntry.findByClassBandIdAndIsClassBandEntryTrueAndIsDeletedFalse(classBandId);
    }

    @Override
    public List<DtoResTimetableEntry> convertToEntryDtos(final List<EntityTimetableEntry> entries, final Integer timetableId) {
        if (entries == null || entries.isEmpty()) {
            return new ArrayList<>();
        }

        final List<DtoResTimetableEntry> dtos = new ArrayList<>();

        Set<Integer> subjectIds = new HashSet<>();
        Set<Integer> teacherIds = new HashSet<>();
        Set<Integer> roomIds = new HashSet<>();
        Set<Integer> classIds = new HashSet<>();

        for (EntityTimetableEntry entry : entries) {
            if (entry.getSubjectId() != null) subjectIds.add(entry.getSubjectId());
            if (entry.getTeacherId() != null) teacherIds.add(entry.getTeacherId());
            if (entry.getRoomId() != null) roomIds.add(entry.getRoomId());
            if (entry.getClassId() != null) classIds.add(entry.getClassId());
        }

        Map<Integer, EntitySubject> subjectMap = new HashMap<>();
        if (!subjectIds.isEmpty()) {
            try {
                List<EntitySubject> subjects = repositorySubject.findAllById(new ArrayList<>(subjectIds));
                for (EntitySubject subject : subjects) {
                    subjectMap.put(subject.getId(), subject);
                }
            } catch (Exception e) {
                log.error("Error fetching subjects: {}", e.getMessage());
            }
        }

        Map<Integer, EntityTeacherProfile> teacherProfileMap = new HashMap<>();
        Map<Integer, EntityUser> userMap = new HashMap<>();
        if (!teacherIds.isEmpty()) {
            try {
                List<EntityTeacherProfile> teacherProfiles = repositoryTeacherProfile.findAllById(new ArrayList<>(teacherIds));

                Set<Integer> userIds = new HashSet<>();
                for (EntityTeacherProfile profile : teacherProfiles) {
                    teacherProfileMap.put(profile.getId(), profile);
                    if (profile.getUserId() != null) {
                        userIds.add(profile.getUserId());
                    }
                }

                if (!userIds.isEmpty()) {
                    List<EntityUser> users = repositoryUser.findAllById(new ArrayList<>(userIds));
                    for (EntityUser user : users) {
                        userMap.put(user.getId(), user);
                    }
                }
            } catch (Exception e) {
                log.error("Error fetching teacher profiles: {}", e.getMessage());
            }
        }

        Map<Integer, EntityRoom> roomMap = new HashMap<>();
        if (!roomIds.isEmpty()) {
            try {
                List<EntityRoom> rooms = repositoryRoom.findAllById(new ArrayList<>(roomIds));
                for (EntityRoom room : rooms) {
                    roomMap.put(room.getId(), room);
                }
            } catch (Exception e) {
                log.error("Error fetching rooms: {}", e.getMessage());
            }
        }

        Map<Integer, EntityClass> classMap = new HashMap<>();
        if (!classIds.isEmpty()) {
            try {
                List<EntityClass> classes = repositoryClass.findAllById(new ArrayList<>(classIds));
                for (EntityClass classEntity : classes) {
                    classMap.put(classEntity.getId(), classEntity);
                }
            } catch (Exception e) {
                log.error("Error fetching classes: {}", e.getMessage());
            }
        }

        for (EntityTimetableEntry entry : entries) {
            final DtoResTimetableEntry dtoResTimetableEntry = new DtoResTimetableEntry();
            dtoResTimetableEntry.setId(entry.getId());
            dtoResTimetableEntry.setUuid(entry.getUuid());
            dtoResTimetableEntry.setTimetableId(entry.getTimetableId());
            dtoResTimetableEntry.setDayOfWeek(entry.getDayOfWeek());
            dtoResTimetableEntry.setPeriod(entry.getPeriod());
            dtoResTimetableEntry.setDurationMinutes(entry.getDurationMinutes());
            dtoResTimetableEntry.setPeriodType(entry.getPeriodType());
            dtoResTimetableEntry.setStatus(entry.getStatus());

            dtoResTimetableEntry.setClassId(entry.getClassId());


            dtoResTimetableEntry.setClassBandId(entry.getClassBandId());
            dtoResTimetableEntry.setIsClassBandEntry(entry.getIsClassBandEntry());


            dtoResTimetableEntry.setSubjectId(entry.getSubjectId());
            if (entry.getSubjectId() != null && subjectMap.containsKey(entry.getSubjectId())) {
                EntitySubject subject = subjectMap.get(entry.getSubjectId());
                dtoResTimetableEntry.setSubjectUuid(subject.getUuid());
                dtoResTimetableEntry.setSubjectName(subject.getName());
                dtoResTimetableEntry.setSubjectColor(subject.getColor());
                dtoResTimetableEntry.setSubjectInitials(subject.getInitials());
            }


            dtoResTimetableEntry.setTeacherId(entry.getTeacherId());
            if (entry.getTeacherId() != null && teacherProfileMap.containsKey(entry.getTeacherId())) {
                EntityTeacherProfile teacherProfile = teacherProfileMap.get(entry.getTeacherId());
                dtoResTimetableEntry.setTeacherUuid(teacherProfile.getUuid());
                dtoResTimetableEntry.setTeacherInitials(teacherProfile.getInitials());

                if (teacherProfile.getUserId() != null && userMap.containsKey(teacherProfile.getUserId())) {
                    EntityUser user = userMap.get(teacherProfile.getUserId());
                    dtoResTimetableEntry.setTeacherName(user.getFirstName() + " " + user.getLastName());
                } else {
                    dtoResTimetableEntry.setTeacherName("");
                }
            }


            dtoResTimetableEntry.setRoomId(entry.getRoomId());
            if (entry.getRoomId() != null && roomMap.containsKey(entry.getRoomId())) {
                EntityRoom room = roomMap.get(entry.getRoomId());
                dtoResTimetableEntry.setRoomUuid(room.getUuid());
                dtoResTimetableEntry.setRoomName(room.getName());
                dtoResTimetableEntry.setRoomInitials(room.getCode());
            }


            dtoResTimetableEntry.setClassId(entry.getClassId());
            if (entry.getClassId() != null && classMap.containsKey(entry.getClassId())) {
                EntityClass classEntity = classMap.get(entry.getClassId());
                dtoResTimetableEntry.setClassUuid(classEntity.getUuid());
                dtoResTimetableEntry.setClassName(classEntity.getName());
                dtoResTimetableEntry.setClassInitials(classEntity.getInitial());
            }


            Boolean lockStatus = entry.getIsLocked();
            dtoResTimetableEntry.setIsLocked(lockStatus != null ? lockStatus : false);

            dtos.add(dtoResTimetableEntry);
        }

        return dtos;
    }

    @Override
    public ApiResponse<DtoResTimetableEntry> updateLockStatus(final String uuid, final Boolean isLocked) {
        final ApiResponse<DtoResTimetableEntry> apiResponse = new ApiResponse<>();

        try {

            final EntityTimetableEntry entityTimetableEntry = repositoryTimetableEntry.findByUuidAndIsDeletedFalse(uuid)
                    .orElseThrow(() -> new RuntimeException("Timetable entry not found with UUID: " + uuid));

            entityTimetableEntry.setIsLocked(isLocked);


            final EntityTimetableEntry savedEntry = repositoryTimetableEntry.save(entityTimetableEntry);



            final List<EntityTimetableEntry> entries = new ArrayList<>();
            entries.add(savedEntry);
            final List<DtoResTimetableEntry> dtoEntries = convertToEntryDtos(entries, savedEntry.getTimetableId());


            apiResponse.setSuccess(true);
            apiResponse.setData(dtoEntries.isEmpty() ? new DtoResTimetableEntry() : dtoEntries.get(0));
            apiResponse.setMessage("Timetable entry lock status updated successfully");
        } catch (Exception e) {
            apiResponse.setSuccess(false);
            apiResponse.setMessage("Failed to update timetable entry lock status: " + e.getMessage());
        }

        return apiResponse;
    }

    @Override
    public ApiResponse<List<DtoResTimetableEntry>> getAllTimetableEntries(final Integer timetableId, final int page, final int size, final String sortBy, final String direction) {
        final I18n i18n = new I18n(httpServletRequest);
        

        String effectiveSortBy = sortBy;
        if (effectiveSortBy != null && effectiveSortBy.equalsIgnoreCase("id")) {
            effectiveSortBy = "id";
        }
        
        final Pageable pageable = PaginationUtil.createPageable(page, size, effectiveSortBy, direction, 
                0, 10);
        
        final Page<EntityTimetableEntry> timetableEntries = repositoryTimetableEntry.findByTimetableIdAndIsDeletedFalse(timetableId, pageable);

        List<DtoResTimetableEntry> dtoList = new ArrayList<>();
        for (EntityTimetableEntry entry : timetableEntries.getContent()) {
            List<EntityTimetableEntry> entryList = new ArrayList<>();
            entryList.add(entry);
            List<DtoResTimetableEntry> dtos = convertToEntryDtos(entryList, timetableId);
            if (!dtos.isEmpty()) {
                dtoList.add(dtos.get(0));
            }
        }
        

        return ApiResponse.<List<DtoResTimetableEntry>>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .message("Timetable entries retrieved successfully")
                .data(dtoList)
                .totalItems(timetableEntries.getTotalElements())
                .totalPages(timetableEntries.getTotalPages())
                .hasNext(timetableEntries.hasNext())
                .hasPrevious(timetableEntries.hasPrevious())
                .currentPage(timetableEntries.getNumber())
                .build();
    }

    @Override
    public ApiResponse<List<DtoResTimetableEntry>> bulkUpdateLockStatus(final String timetableUuid, final List<String> entryUuids, final Boolean isLocked) {
        final ApiResponse<List<DtoResTimetableEntry>> apiResponse = new ApiResponse<>();

        try {

            final EntityTimetable timetable = repositoryTimetable.findByUuidAndIsDeletedFalse(timetableUuid)
                    .orElseThrow(() -> new RuntimeException("Timetable not found with UUID: " + timetableUuid));
            

            final List<EntityTimetableEntry> entries = repositoryTimetableEntry.findByUuidInAndIsDeletedFalse(entryUuids);
            
            if (entries.isEmpty()) {
                throw new RuntimeException("No timetable entries found with the provided UUIDs");
            }
            

            for (EntityTimetableEntry entry : entries) {
                entry.setIsLocked(isLocked);
            }
            

            final List<EntityTimetableEntry> savedEntries = repositoryTimetableEntry.saveAll(entries);

            final List<DtoResTimetableEntry> dtoEntries = convertToEntryDtos(savedEntries, timetable.getId());
            
            apiResponse.setSuccess(true);
            apiResponse.setData(dtoEntries);
            apiResponse.setMessage("Timetable entries lock status updated successfully");
        } catch (Exception e) {
            apiResponse.setSuccess(false);
            apiResponse.setMessage("Failed to update timetable entries lock status: " + e.getMessage());
        }
        
        return apiResponse;
    }
}