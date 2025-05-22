package com.ist.timetabling.Room.service.impl;

import com.ist.timetabling.Auth.util.UtilAuthContext;
import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Core.exception.CSVImportException;
import com.ist.timetabling.Core.exception.ExceptionCoreNotFound;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.model.CSVImportResult;
import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.Core.util.CSVReaderUtil;
import com.ist.timetabling.Core.util.PaginationUtil;
import com.ist.timetabling.Period.entity.EntityPeriod;
import com.ist.timetabling.Period.entity.EntitySchedule;
import com.ist.timetabling.Period.entity.EntitySchedulePreference;
import com.ist.timetabling.Period.repository.RepositoryPeriod;
import com.ist.timetabling.Period.repository.RepositorySchedule;
import com.ist.timetabling.Period.repository.RepositorySchedulePreference;
import com.ist.timetabling.Room.dto.req.DtoReqRoom;
import com.ist.timetabling.Room.dto.req.DtoReqRoomPreference;
import com.ist.timetabling.Room.dto.req.DtoReqRoomPreferences;
import com.ist.timetabling.Room.dto.res.DtoResRoom;
import com.ist.timetabling.Room.dto.res.DtoResRoomCsvUpload;
import com.ist.timetabling.Room.dto.res.DtoResRoomSchedulePreference;
import com.ist.timetabling.Room.entity.EntityRoom;
import com.ist.timetabling.Room.exception.ExceptionRoomAlreadyExists;
import com.ist.timetabling.Room.repository.RepositoryRoom;
import com.ist.timetabling.Room.service.ServiceRoom;
import com.ist.timetabling.Room.util.RoomCsvMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import static com.ist.timetabling.Room.constant.ConstantRoomI18n.*;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ServiceImplRoom implements ServiceRoom {

    private static final int DEFAULT_PAGE_NUMBER = 0;
    private static final int DEFAULT_PAGE_SIZE = 10;
    private final RepositoryRoom repositoryRoom;
    private final HttpServletRequest httpServletRequest;
    private final RepositoryPeriod repositoryPeriod;
    private final RepositorySchedule scheduleRepository;
    private final RepositorySchedulePreference schedulePreferenceRepository;
    private final UtilAuthContext utilAuthContext;
    private final I18n i18n;
    private final CSVReaderUtil csvReaderUtil;
    private final RoomCsvMapper roomCsvMapper;

    @Autowired
    public ServiceImplRoom(
            RepositoryRoom repositoryRoom,
            HttpServletRequest httpServletRequest,
            RepositoryPeriod repositoryPeriod,
            RepositorySchedule scheduleRepository,
            RepositorySchedulePreference schedulePreferenceRepository,
            UtilAuthContext utilAuthContext,
            I18n i18n,
            CSVReaderUtil csvReaderUtil,
            RoomCsvMapper roomCsvMapper) {
        this.repositoryRoom = repositoryRoom;
        this.httpServletRequest = httpServletRequest;
        this.repositoryPeriod = repositoryPeriod;
        this.scheduleRepository = scheduleRepository;
        this.schedulePreferenceRepository = schedulePreferenceRepository;
        this.utilAuthContext = utilAuthContext;
        this.i18n = i18n;
        this.csvReaderUtil = csvReaderUtil;
        this.roomCsvMapper = roomCsvMapper;
    }

    @Override
    public ApiResponse<DtoResRoom> findRoomByUuid(final String uuid) {
        I18n i18n = new I18n(httpServletRequest);
        EntityRoom entityRoom = repositoryRoom.findByUuidAndIsDeletedFalse(uuid).orElseThrow(() -> new ExceptionCoreNotFound(i18n.getRoom(I18N_ROOM_NOT_FOUND)));


        DtoResRoom dtoResRoom = roomCsvMapper.mapToRoomResponse(entityRoom);
        return ApiResponse.success(HttpStatus.OK, i18n.getRoom(I18N_ROOM_RETRIEVE_SUCCESS), dtoResRoom);
    }

    @Override
    public ApiResponse<Page<DtoResRoom>> findRoomsPaginated(final Pageable pageable) {
        I18n i18n = new I18n(httpServletRequest);

        Page<EntityRoom> roomsPage;
        if(utilAuthContext.isAdmin()) {
            roomsPage = repositoryRoom.findAllByIsDeletedFalse(pageable);
        }else {
            Integer organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
            roomsPage = repositoryRoom.findByOrganizationIdAndIsDeletedFalse(organizationId, pageable);
        }

        if(roomsPage.isEmpty()) {
            throw new ExceptionCoreNotFound(i18n.getRoom(I18N_ROOM_LIST_EMPTY));
        }
        Page<DtoResRoom> dtoResRooms = roomsPage.map(roomCsvMapper::mapToRoomResponse);
        return ApiResponse.success(HttpStatus.OK, i18n.getRoom(I18N_ROOM_LIST_SUCCESS), dtoResRooms);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DtoResRoom>> findAllRooms(
            final Integer page,
            final Integer size,
            final String sortBy,
            final String sortDirection,
            final String keyword,
            final Integer orgId,
            final Integer planSettingsId) {

        final I18n i18n = new I18n(httpServletRequest);

        Integer effectiveOrgId = null;
        if (!utilAuthContext.isAdmin()) {
            effectiveOrgId = utilAuthContext.getCurrentUser().getOrganization().getId();
        } else if (orgId != null) {
            effectiveOrgId = orgId;
        }

        int pageNum = page == null ? DEFAULT_PAGE_NUMBER : page;
        int pageSize = size == null ? DEFAULT_PAGE_SIZE : size;
        String field = sortBy == null ? "name" : sortBy;
        String direction = sortDirection == null ? "asc" : sortDirection;

        Sort sort = Sort.by(Sort.Direction.fromString(direction), field);
        Pageable pageable = PageRequest.of(pageNum, pageSize, sort);

        List<DtoResRoom> dtoResRooms;
        long totalItems;

        try {
            Page<EntityRoom> roomsPage;
            
            if (keyword != null && !keyword.trim().isEmpty()) {
                if (planSettingsId != null) {
                    // Use planSettingsId if available
                    roomsPage = repositoryRoom.searchRoomsWithPlanSettings(
                        keyword, effectiveOrgId, planSettingsId, pageable
                    );
                } else if (effectiveOrgId != null) {
                    // Use existing methods for backwards compatibility
                    roomsPage = repositoryRoom.searchByNameContainingAndOrganizationIdPage(keyword, effectiveOrgId, pageable);
                } else {
                    roomsPage = repositoryRoom.searchByNameContainingNativePage(keyword, pageable);
                }
            } else {
                if (planSettingsId != null && effectiveOrgId != null) {
                    roomsPage = repositoryRoom.findByOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(
                        effectiveOrgId, planSettingsId, pageable
                    );
                } else if (planSettingsId != null) {
                    roomsPage = repositoryRoom.findByPlanSettingsIdAndIsDeletedFalse(planSettingsId, pageable);
                } else if (effectiveOrgId != null) {
                    roomsPage = repositoryRoom.findByOrganizationIdAndIsDeletedFalse(effectiveOrgId, pageable);
                } else {
                    roomsPage = repositoryRoom.findByIsDeletedFalse(pageable);
                }
            }

            dtoResRooms = roomsPage.getContent().stream()
                    .map(roomCsvMapper::mapToRoomResponse)
                    .collect(Collectors.toList());
            totalItems = roomsPage.getTotalElements();

            return ApiResponse.<List<DtoResRoom>>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .message(i18n.getRoom(I18N_ROOM_RETRIEVE_SUCCESS))
                .data(dtoResRooms)
                .totalItems(totalItems)
                .build();
        } catch (Exception e) {
            log.error("Error retrieving rooms with planSettingsId: {}", planSettingsId, e);
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<DtoResRoomCsvUpload> importRoomsFromCsv(final DtoReqCsvUpload uploadRequest) {
        final I18n i18n = new I18n(httpServletRequest);

        
        if(uploadRequest.getFile().isEmpty()) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, "CSV file is empty");
        }

       
        Integer organizationId;
        if(utilAuthContext.isAdmin() && uploadRequest.getOrganizationId() != null) {
            organizationId = uploadRequest.getOrganizationId();
        }else {
            organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
        }

        DtoResRoomCsvUpload result = new DtoResRoomCsvUpload();
        List<DtoResRoom> createdRooms = new ArrayList<>();
        List<DtoResRoomCsvUpload.ImportError> errors = new ArrayList<>();

        try {
            List<CSVRecord> records = csvReaderUtil.parseCSV(
                    uploadRequest.getFile(),
                    RoomCsvMapper.CSV_HEADERS,
                    uploadRequest.getSkipHeaderRow()
            );

            result.setTotalProcessed(records.size());
            int rowNum = uploadRequest.getSkipHeaderRow() ? 2 : 1; 

            for(CSVRecord record : records) {
                try {
                  
                    DtoReqRoom roomRequest = roomCsvMapper.mapToRoomRequest(record, organizationId, rowNum);

                  
                    if(repositoryRoom.existsByCodeAndOrganizationIdAndIsDeletedFalse(
                            roomRequest.getCode(), organizationId)) {
                        throw new Exception(i18n.getRoom(I18N_ROOM_EXISTS));
                    }

                    
                    ApiResponse<DtoResRoom> response = createRoom(roomRequest);

                    if(response.isSuccess()) {
                        createdRooms.add(response.getData());
                    }else {
                        throw new Exception(response.getMessage());
                    }
                }catch(Exception e) {
                    DtoResRoomCsvUpload.ImportError error = new DtoResRoomCsvUpload.ImportError(
                            rowNum,
                            record.toString(),
                            e.getMessage()
                    );
                    errors.add(error);
                   
                }
                rowNum++;
            }

            result.setCreatedRooms(createdRooms);
            result.setErrors(errors);
            result.setSuccessCount(createdRooms.size());
            result.setErrorCount(errors.size());

            String message = result.buildSuccessMessage();
            return ApiResponse.success(HttpStatus.OK, message, result);

        }catch(IOException e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Error reading CSV file: " + e.getMessage());
        }
    }

    @Override
    public ApiResponse<DtoResRoom> createRoom(final DtoReqRoom dtoReqRoom) {
        final I18n i18n = new I18n(httpServletRequest);

        Integer organizationId;
        if(utilAuthContext.isAdmin()) {
            organizationId = dtoReqRoom.getOrganizationId();
        }else {
            organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
        }

        if(repositoryRoom.existsByCodeAndOrganizationIdAndIsDeletedFalse(dtoReqRoom.getCode(), organizationId)) {
            throw new ExceptionRoomAlreadyExists(i18n.getRoom(I18N_ROOM_EXISTS));
        }

        EntityRoom entityRoom = new EntityRoom();
        entityRoom.setName(dtoReqRoom.getName());
        entityRoom.setCode(dtoReqRoom.getCode());
        entityRoom.setCapacity(dtoReqRoom.getCapacity());
        entityRoom.setDescription(dtoReqRoom.getDescription());
        entityRoom.setStatusId(dtoReqRoom.getStatusId());
        entityRoom.setInitials(dtoReqRoom.getInitials());
        entityRoom.setControlNumber(dtoReqRoom.getControlNumber());
        entityRoom.setPriority(dtoReqRoom.getPriority());
        entityRoom.setLocationNumber(dtoReqRoom.getLocationNumber());
        entityRoom.setOrganizationId(organizationId);
        entityRoom.setPlanSettingsId(dtoReqRoom.getPlanSettingsId());
        entityRoom.setCreatedBy(utilAuthContext.getAuthenticatedUserId());
        entityRoom.setModifiedBy(utilAuthContext.getAuthenticatedUserId());
        entityRoom.setUuid(UUID.randomUUID().toString());
        entityRoom.setCreatedDate(LocalDateTime.now());
        entityRoom.setModifiedDate(LocalDateTime.now());
        entityRoom.setIsDeleted(false);

        EntityRoom savedRoom = repositoryRoom.save(entityRoom);

        initializeRoomSchedulePreferences(savedRoom);

        DtoResRoom dtoResRoom = roomCsvMapper.mapToRoomResponse(savedRoom);
        return ApiResponse.success(HttpStatus.CREATED, i18n.getRoom(I18N_ROOM_CREATE_SUCCESS), dtoResRoom);
    }

    @Override
    public ApiResponse<DtoResRoom> updateRoomByUuid(final String uuid, final DtoReqRoom dtoReqRoom) {
        final I18n i18n = new I18n(httpServletRequest);
        EntityRoom entityRoom = repositoryRoom.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getRoom(I18N_ROOM_NOT_FOUND)));

        if(!entityRoom.getCode().equals(dtoReqRoom.getCode()) &&
                repositoryRoom.existsByCodeAndOrganizationIdAndIsDeletedFalse(dtoReqRoom.getCode(), entityRoom.getOrganizationId())) {
            throw new ExceptionRoomAlreadyExists(i18n.getRoom(I18N_ROOM_EXISTS));
        }

        entityRoom.setName(dtoReqRoom.getName());
        entityRoom.setCode(dtoReqRoom.getCode());
        entityRoom.setCapacity(dtoReqRoom.getCapacity());
        entityRoom.setDescription(dtoReqRoom.getDescription());
        entityRoom.setStatusId(dtoReqRoom.getStatusId());
        entityRoom.setInitials(dtoReqRoom.getInitials());
        if(dtoReqRoom.getControlNumber() != null) entityRoom.setControlNumber(dtoReqRoom.getControlNumber());
        if(dtoReqRoom.getPriority() != null) entityRoom.setPriority(dtoReqRoom.getPriority());
        if(dtoReqRoom.getLocationNumber() != null) entityRoom.setLocationNumber(dtoReqRoom.getLocationNumber());
        if(dtoReqRoom.getPlanSettingsId() != null) entityRoom.setPlanSettingsId(dtoReqRoom.getPlanSettingsId());
        entityRoom.setControlNumber(dtoReqRoom.getControlNumber());
        entityRoom.setPriority(dtoReqRoom.getPriority());
        entityRoom.setLocationNumber(dtoReqRoom.getLocationNumber());
        entityRoom.setModifiedBy(utilAuthContext.getAuthenticatedUserId());
        entityRoom.setModifiedDate(LocalDateTime.now());

        EntityRoom updatedRoom = repositoryRoom.save(entityRoom);

        DtoResRoom dtoResRoom = roomCsvMapper.mapToRoomResponse(updatedRoom);
        return ApiResponse.success(HttpStatus.OK, i18n.getRoom(I18N_ROOM_UPDATE_SUCCESS), dtoResRoom);
    }

    @Override
    public ApiResponse<Void> deleteRoomByUuid(final String uuid) {
        final I18n i18n = new I18n(httpServletRequest);
        EntityRoom entityRoom = repositoryRoom.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getRoom(I18N_ROOM_NOT_FOUND)));

        entityRoom.setIsDeleted(true);
        entityRoom.setModifiedBy(utilAuthContext.getAuthenticatedUserId());
        entityRoom.setModifiedDate(LocalDateTime.now());
        repositoryRoom.save(entityRoom);
        return ApiResponse.success(HttpStatus.OK, i18n.getRoom(I18N_ROOM_DELETE_SUCCESS), null);
    }

    @Override
    @Cacheable(value = "roomSchedulePreferences", key = "#roomId")
    public ApiResponse<List<DtoResRoomSchedulePreference>> getRoomSchedulePreferences(final Integer roomId) {
        final I18n i18n = new I18n(httpServletRequest);

        EntityRoom room = repositoryRoom.findById(roomId)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getRoom(I18N_ROOM_NOT_FOUND)));

        List<EntitySchedulePreference> roomPreferences = room.getSchedulePreferences().stream()
                .filter(pref -> !pref.getIsDeleted())
                .collect(Collectors.toList());

        List<DtoResRoomSchedulePreference> dtoList = roomPreferences.stream()
                .map(this::toRoomSchedulePreferenceDTO)
                .collect(Collectors.toList());

        return ApiResponse.success(HttpStatus.OK, i18n.getRoom(I18N_ROOM_SCHEDULE_PREFERENCE_RETRIEVED), dtoList);
    }

    @Override
    @Transactional
    @CacheEvict(value = "roomSchedulePreferences", key = "#roomId")
    public ApiResponse<List<DtoResRoomSchedulePreference>> updateRoomSchedulePreferences(Integer roomId, DtoReqRoomPreferences dtoReqRoomPreferences) {
        final I18n i18n = new I18n(httpServletRequest);

        try {
            EntityRoom room = repositoryRoom.findById(roomId).orElseThrow(() -> new ExceptionCoreNotFound(i18n.getRoom(I18N_ROOM_NOT_FOUND)));

            List<EntityPeriod> allPeriods = repositoryPeriod.findAllByIsDeletedFalse();
            Map<String, EntityPeriod> periodsByCompositeKey = allPeriods.stream()
                    .filter(period -> period.getOrganizationId().equals(room.getOrganizationId()))
                    .collect(Collectors.toMap(
                        period -> period.getOrganizationId() + "-" + (period.getPlanSettingsId() != null ? period.getPlanSettingsId() : "null") + "-" + period.getPeriodNumber(),
                        period -> period
                    ));

            Map<String, EntitySchedulePreference> existingPrefsMap = new HashMap<>();
            for(EntitySchedulePreference pref : room.getSchedulePreferences()) {
                if(pref.getIsDeleted()) continue;
                String key = pref.getDayOfWeek() + "-" + pref.getPeriodId();
                existingPrefsMap.put(key, pref);
            }

            List<EntitySchedulePreference> updatedPreferences = new ArrayList<>();
            List<EntitySchedulePreference> preferencesToDelete = new ArrayList<>(room.getSchedulePreferences());

            for(DtoReqRoomPreference preference : dtoReqRoomPreferences.getPreferences()) {
                try {
                    Integer day = preference.getDay();
                    Integer periodId = preference.getPeriodId();
                    Boolean isAvailable = preference.getIsAvailable();

                    // Find the period by id
                    EntityPeriod period = allPeriods.stream()
                        .filter(p -> p.getId().equals(periodId) && p.getOrganizationId().equals(room.getOrganizationId()))
                        .findFirst().orElse(null);
                    if(period == null) continue;

                    String key = day + "-" + period.getId();
                    EntitySchedulePreference existingPref = existingPrefsMap.get(key);

                    if(existingPref != null) {
                        if(existingPref.getIsAvailable() != null && existingPref.getIsAvailable().equals(isAvailable)) {
                            preferencesToDelete.remove(existingPref);
                            updatedPreferences.add(existingPref);
                            continue;
                        }else {
                            existingPref.setIsAvailable(isAvailable);
                            existingPref.setModifiedBy(utilAuthContext.getAuthenticatedUserId());
                            existingPref.setModifiedDate(LocalDateTime.now());
                            preferencesToDelete.remove(existingPref);
                            updatedPreferences.add(existingPref);
                            continue;
                        }
                    }

                    EntitySchedulePreference newPref = new EntitySchedulePreference();
                    newPref.setPeriodId(period.getId());
                    newPref.setDayOfWeek(day);
                    newPref.setIsAvailable(isAvailable);
                    newPref.setCreatedBy(utilAuthContext.getAuthenticatedUserId());
                    newPref.setModifiedBy(utilAuthContext.getAuthenticatedUserId());
                    newPref.setCreatedDate(LocalDateTime.now());
                    newPref.setModifiedDate(LocalDateTime.now());
                    newPref.setStatusId(1);
                    newPref.setIsDeleted(false);
                    newPref.setOrganizationId(room.getOrganizationId());
                    newPref.setPlanSettingsId(period.getPlanSettingsId());
                    newPref.setUuid(UUID.randomUUID().toString());
                    room.getSchedulePreferences().add(newPref);

                }catch(Exception e) {
                    return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, i18n.getRoom(I18N_ROOM_NOT_FOUND) + e.getMessage(), null);
                }
            }

            for(EntitySchedulePreference pref : preferencesToDelete) {
                pref.setIsDeleted(true);
                pref.setModifiedBy(utilAuthContext.getAuthenticatedUserId());
                pref.setModifiedDate(LocalDateTime.now());
            }

            schedulePreferenceRepository.saveAll(preferencesToDelete);
            List<EntitySchedulePreference> savedPreferences = schedulePreferenceRepository.saveAll(updatedPreferences);

            room.getSchedulePreferences().clear();
            room.getSchedulePreferences().addAll(savedPreferences);
            repositoryRoom.save(room);

            List<DtoResRoomSchedulePreference> dtoList = savedPreferences.stream()
                    .map(this::toRoomSchedulePreferenceDTO)
                    .collect(Collectors.toList());

            return ApiResponse.success(HttpStatus.OK, i18n.getRoom(I18N_ROOM_SCHEDULE_PREFERENCE_UPDATED), dtoList);

        }catch(Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, i18n.getRoom(I18N_ROOM_NOT_FOUND) + e.getMessage(), null);
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = "roomSchedulePreferences", key = "#roomId")
    public ApiResponse<Void> setRoomAvailability(Integer roomId, Boolean isAvailable) {
        final I18n i18n = new I18n(httpServletRequest);

        try {
            EntityRoom room = repositoryRoom.findById(roomId)
                    .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getRoom(I18N_ROOM_NOT_FOUND)));

            List<EntityPeriod> periods = repositoryPeriod.findAllByIsDeletedFalse();

            Map<String, EntitySchedulePreference> existingPrefs = new HashMap<>();
            for(EntitySchedulePreference pref : room.getSchedulePreferences()) {
                if(pref.getIsDeleted()) continue;
                String key = pref.getDayOfWeek() + "-" + pref.getPeriodId();
                existingPrefs.put(key, pref);
            }

            for(EntityPeriod period : periods) {
                List<Integer> days = period.getDays();
                for(Integer day : days) {
                    String key = day + "-" + period.getId();
                    EntitySchedulePreference existingPref = existingPrefs.get(key);

                    if(existingPref != null) {
                        existingPref.setIsAvailable(isAvailable);
                        existingPref.setModifiedBy(utilAuthContext.getAuthenticatedUserId());
                        existingPref.setModifiedDate(LocalDateTime.now());
                    }else {
                        EntitySchedulePreference newPref = new EntitySchedulePreference();
                        newPref.setPeriodId(period.getId());
                        newPref.setDayOfWeek(day);
                        newPref.setIsAvailable(isAvailable);
                        newPref.setCreatedBy(utilAuthContext.getAuthenticatedUserId());
                        newPref.setModifiedBy(utilAuthContext.getAuthenticatedUserId());
                        newPref.setCreatedDate(LocalDateTime.now());
                        newPref.setModifiedDate(LocalDateTime.now());
                        newPref.setStatusId(1);
                        newPref.setIsDeleted(false);
                        newPref.setOrganizationId(room.getOrganizationId());
                        newPref.setPlanSettingsId(period.getPlanSettingsId());
                        newPref.setUuid(UUID.randomUUID().toString());
                        room.getSchedulePreferences().add(newPref);
                    }
                }
            }

            schedulePreferenceRepository.saveAll(room.getSchedulePreferences());
            repositoryRoom.save(room);

            return ApiResponse.success(HttpStatus.OK, i18n.getRoom(I18N_ROOM_AVAILABILITY_UPDATED), null);

        }catch(Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error setting room availability: " + e.getMessage(), null);
        }
    }

    private DtoResRoomSchedulePreference toRoomSchedulePreferenceDTO(EntitySchedulePreference preference) {
        DtoResRoomSchedulePreference dto = new DtoResRoomSchedulePreference();
        dto.setId(preference.getId());
        dto.setUuid(preference.getUuid());
        dto.setDay(preference.getDayOfWeek());
        dto.setPeriodId(preference.getPeriodId());
        dto.setIsAvailable(preference.getIsAvailable() != null ? preference.getIsAvailable() : true);
        return dto;
    }

    @Transactional
    public ApiResponse<Object> initializeRoomSchedulePreferences(EntityRoom room) {
        try {
            List<EntityPeriod> periods = repositoryPeriod.findAllByIsDeletedFalse();
            List<EntitySchedulePreference> preferences = new ArrayList<>();

            for(EntityPeriod period : periods) {
                List<Integer> days = period.getDays();
                for(Integer day : days) {
                    EntitySchedulePreference pref = new EntitySchedulePreference();
                    pref.setPeriodId(period.getId());
                    pref.setDayOfWeek(day);
                    pref.setIsAvailable(true);
                    pref.setCreatedBy(utilAuthContext.getAuthenticatedUserId());
                    pref.setModifiedBy(utilAuthContext.getAuthenticatedUserId());
                    pref.setCreatedDate(LocalDateTime.now());
                    pref.setModifiedDate(LocalDateTime.now());
                    pref.setStatusId(1);
                    pref.setIsDeleted(false);
                    pref.setOrganizationId(room.getOrganizationId());
                    pref.setPlanSettingsId(period.getPlanSettingsId());
                    pref.setUuid(UUID.randomUUID().toString());
                    preferences.add(pref);
                }
            }

            if(!preferences.isEmpty()) {
                List<EntitySchedulePreference> savedPrefs = schedulePreferenceRepository.saveAll(preferences);
                room.getSchedulePreferences().addAll(savedPrefs);
                repositoryRoom.save(room);
            }
        }catch(ExceptionRoomAlreadyExists e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, i18n.getRoom(I18N_ROOM_NOT_FOUND),
                    room.getId().toString(), e.getMessage());
        }
        return null;
    }

    private Pageable createPageable(int page, int size, String sortBy, String sortDirection) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sort = Sort.by(direction, sortBy);
        return PageRequest.of(page, size, sort);
    }

    public ApiResponse<List<EntityRoom>> searchRoomsWithFilters(
            String keyword, Integer organizationId, Integer planSettingsId, Integer statusId,
            Integer page, Integer size, String sortBy, String sortDirection) {

        final I18n i18n = new I18n(httpServletRequest);
        Integer effectiveOrgId = null;

        if (!utilAuthContext.isAdmin()) {
            effectiveOrgId = utilAuthContext.getCurrentUser().getOrganization().getId();
        } else if (organizationId != null) {
            effectiveOrgId = organizationId;
        }

        Pageable pageable = createPageable(
                page == null ? 0 : page,
                size == null ? 10 : size,
                sortBy == null ? "name" : sortBy,
                sortDirection == null ? "asc" : sortDirection
        );

        try {
            Page<EntityRoom> roomsPage;

            if (StringUtils.hasText(keyword)) {
                if (planSettingsId != null) {
                    // Use planSettingsId if available
                    roomsPage = repositoryRoom.searchRoomsWithPlanSettings(
                            keyword, effectiveOrgId, planSettingsId, pageable
                    );
                } else if (effectiveOrgId != null) {
                    // Use existing methods for backwards compatibility
                    roomsPage = repositoryRoom.searchByNameContainingAndOrganizationIdPage(keyword, effectiveOrgId, pageable);
                } else {
                    roomsPage = repositoryRoom.searchByNameContainingNativePage(keyword, pageable);
                }
            } else {
                if (planSettingsId != null && effectiveOrgId != null) {
                    roomsPage = repositoryRoom.findByOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(
                            effectiveOrgId, planSettingsId, pageable
                    );
                } else if (planSettingsId != null) {
                    roomsPage = repositoryRoom.findByPlanSettingsIdAndIsDeletedFalse(planSettingsId, pageable);
                } else if (effectiveOrgId != null) {
                    roomsPage = repositoryRoom.findByOrganizationIdAndIsDeletedFalse(effectiveOrgId, pageable);
                } else {
                    roomsPage = repositoryRoom.findByIsDeletedFalse(pageable);
                }
            }

            List<EntityRoom> rooms = roomsPage.getContent();
            return ApiResponse.<List<EntityRoom>>builder()
                    .status(HttpStatus.OK.value())
                    .success(true)
                    .message("Rooms fetched successfully")
                    .data(rooms)
                    .totalItems(roomsPage.getTotalElements())
                    .build();
        } catch (Exception e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<EntityRoom>> getRoomsByPlanSettingsId(final Integer planSettingsId) {
        final I18n i18n = new I18n(httpServletRequest);
        
        if (planSettingsId == null) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getRoom(I18N_PLAN_SETTING_NOT_FOUND));
        }
        
        Integer organizationId = null;
        if (!utilAuthContext.isAdmin()) {
            organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
        }
        
        List<EntityRoom> rooms;
        Page<EntityRoom> page;
        if (organizationId != null) {
            page = repositoryRoom.findByOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(
                organizationId, planSettingsId, PageRequest.of(0, 1000));
        } else {
            page = repositoryRoom.findByPlanSettingsIdAndIsDeletedFalse(planSettingsId, PageRequest.of(0, 1000));
        }
        rooms = page.getContent();
        
        return ApiResponse.success(HttpStatus.OK, i18n.getRoom(I18N_ROOM_RETRIEVE_SUCCESS), rooms);
    }
}
