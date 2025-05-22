package com.ist.timetabling.PlanSetting.service.impl;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import com.ist.timetabling.Auth.util.UtilAuthContext;
import com.ist.timetabling.Core.exception.ExceptionCoreNotFound;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.model.I18n;
import static com.ist.timetabling.PlanSetting.Constant.ConstantPlanningSettingsI18n.I18N_PLANNING_SETTINGS_CREATE_SUCCESS;
import static com.ist.timetabling.PlanSetting.Constant.ConstantPlanningSettingsI18n.I18N_PLANNING_SETTINGS_DELETE_SUCCESS;
import static com.ist.timetabling.PlanSetting.Constant.ConstantPlanningSettingsI18n.I18N_PLANNING_SETTINGS_EXISTS;
import static com.ist.timetabling.PlanSetting.Constant.ConstantPlanningSettingsI18n.I18N_PLANNING_SETTINGS_LIST_EMPTY;
import static com.ist.timetabling.PlanSetting.Constant.ConstantPlanningSettingsI18n.I18N_PLANNING_SETTINGS_LIST_SUCCESS;
import static com.ist.timetabling.PlanSetting.Constant.ConstantPlanningSettingsI18n.I18N_PLANNING_SETTINGS_NOT_FOUND;
import static com.ist.timetabling.PlanSetting.Constant.ConstantPlanningSettingsI18n.I18N_PLANNING_SETTINGS_ORG_LIST_EMPTY;
import static com.ist.timetabling.PlanSetting.Constant.ConstantPlanningSettingsI18n.I18N_PLANNING_SETTINGS_ORG_LIST_SUCCESS;
import static com.ist.timetabling.PlanSetting.Constant.ConstantPlanningSettingsI18n.I18N_PLANNING_SETTINGS_RETRIEVE_SUCCESS;
import static com.ist.timetabling.PlanSetting.Constant.ConstantPlanningSettingsI18n.I18N_PLANNING_SETTINGS_UPDATE_SUCCESS;
import static com.ist.timetabling.Auth.constant.ConstantI18nAuth.I18N_AUTH_UNAUTHORIZED;
import com.ist.timetabling.PlanSetting.dto.req.DtoReqPlanningSettings;
import com.ist.timetabling.PlanSetting.dto.req.DtoReqTimeBlockType;
import com.ist.timetabling.PlanSetting.dto.res.DtoResPlanningSettings;
import com.ist.timetabling.PlanSetting.dto.res.DtoResTimeBlockType;
import com.ist.timetabling.PlanSetting.entity.EntityPlanSetting;
import com.ist.timetabling.PlanSetting.entity.EntityTimeBlockType;
import com.ist.timetabling.PlanSetting.exception.ExceptionPlanningSettingsAlreadyExists;
import com.ist.timetabling.PlanSetting.exception.ExceptionPlanningSettingsTimeConstraintViolation;
import com.ist.timetabling.PlanSetting.repository.RepositoryPlanSetting;
import com.ist.timetabling.PlanSetting.service.ServicePlanSetting;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class ServicePlanSettingImpl implements ServicePlanSetting {

    private final RepositoryPlanSetting repositoryPlanSetting;
    private final HttpServletRequest httpServletRequest;
    private final UtilAuthContext utilAuthContext;

    @Autowired
    public ServicePlanSettingImpl(RepositoryPlanSetting repositoryPlanSetting, HttpServletRequest httpServletRequest, UtilAuthContext utilAuthContext) {
        this.repositoryPlanSetting = repositoryPlanSetting;
        this.httpServletRequest = httpServletRequest;
        this.utilAuthContext = utilAuthContext;
    }

    @Override
    public ApiResponse<DtoResPlanningSettings> findPlanningSettingsByUuid(final String uuid) {
        I18n i18n = new I18n(httpServletRequest);
        EntityPlanSetting entityPlanningSettings = repositoryPlanSetting.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getPlanSetting(I18N_PLANNING_SETTINGS_NOT_FOUND)));

        // Check if user has access to the organization
        if(!utilAuthContext.isAdmin() &&
                !entityPlanningSettings.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId().toString())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
        }

        DtoResPlanningSettings dtoResPlanningSettings = toDTO(entityPlanningSettings);
        return ApiResponse.success(HttpStatus.OK, i18n.getPlanSetting(I18N_PLANNING_SETTINGS_RETRIEVE_SUCCESS), dtoResPlanningSettings);
    }

    @Override
    public ApiResponse<DtoResPlanningSettings> findPlanningSettingsByOrganizationIdAndCategory(final String organizationId, final String category) {
        I18n i18n = new I18n(httpServletRequest);

        // Check if user has access to the organization
        if(!utilAuthContext.isAdmin() &&
                !organizationId.equals(utilAuthContext.getCurrentUser().getOrganization().getId().toString())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
        }

        EntityPlanSetting entityPlanSetting = repositoryPlanSetting.findByOrganizationIdAndCategoryAndIsDeletedFalse(organizationId, category)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getPlanSetting(I18N_PLANNING_SETTINGS_NOT_FOUND)));

        DtoResPlanningSettings dtoResPlanningSettings = toDTO(entityPlanSetting);
        return ApiResponse.success(HttpStatus.OK, i18n.getPlanSetting(I18N_PLANNING_SETTINGS_RETRIEVE_SUCCESS), dtoResPlanningSettings);
    }

    @Override
    public ApiResponse<List<DtoResPlanningSettings>> findPlanningSettingsByOrganizationId(final String organizationId) {
        I18n i18n = new I18n(httpServletRequest);

        // Check if user has access to the organization
        if(!utilAuthContext.isAdmin() &&
                !organizationId.equals(utilAuthContext.getCurrentUser().getOrganization().getId().toString())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
        }

        List<EntityPlanSetting> entityPlanSettings = repositoryPlanSetting.findAllByOrganizationIdAndIsDeletedFalse(organizationId);
        if(entityPlanSettings.isEmpty()) {
            throw new ExceptionCoreNotFound(i18n.getPlanSetting(I18N_PLANNING_SETTINGS_ORG_LIST_EMPTY));
        }
        List<DtoResPlanningSettings> dtoResPlanningSettings = entityPlanSettings.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        return ApiResponse.success(HttpStatus.OK, i18n.getPlanSetting(I18N_PLANNING_SETTINGS_ORG_LIST_SUCCESS), dtoResPlanningSettings);
    }

    @Override
    public ApiResponse<Page<DtoResPlanningSettings>> findPlanningSettingsByOrganizationIdPaginated(final String organizationId, final Pageable pageable, final String search) {
        I18n i18n = new I18n(httpServletRequest);

        // Check if user has access to the organization
        if(!utilAuthContext.isAdmin() &&
                !organizationId.equals(utilAuthContext.getCurrentUser().getOrganization().getId().toString())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
        }

        Page<EntityPlanSetting> planningSettingsPage;

        if(search != null && !search.isEmpty()) {
            planningSettingsPage = repositoryPlanSetting.findAllByOrganizationIdAndNameContainingIgnoreCaseAndIsDeletedFalse(
                    organizationId, search, pageable);
        }else {
            planningSettingsPage = repositoryPlanSetting.findAllByOrganizationIdAndIsDeletedFalse(organizationId, pageable);
        }

        if(planningSettingsPage.isEmpty()) {
            throw new ExceptionCoreNotFound(i18n.getPlanSetting(I18N_PLANNING_SETTINGS_ORG_LIST_EMPTY));
        }

        Page<DtoResPlanningSettings> dtoResPlanningSettingsPage = planningSettingsPage.map(this::toDTO);
        return ApiResponse.success(HttpStatus.OK, i18n.getPlanSetting(I18N_PLANNING_SETTINGS_ORG_LIST_SUCCESS), dtoResPlanningSettingsPage);
    }

    @Override
    public ApiResponse<Page<DtoResPlanningSettings>> findPlanningSettingsPaginated(final Pageable pageable, final String search) {
        I18n i18n = new I18n(httpServletRequest);
        Page<EntityPlanSetting> planningSettingsPage;
        if(!utilAuthContext.isAdmin()) {
            String organizationId = utilAuthContext.getCurrentUser().getOrganization().getId().toString();
            if(search != null && !search.isEmpty()) {
                planningSettingsPage = repositoryPlanSetting.findAllByOrganizationIdAndNameContainingIgnoreCaseAndIsDeletedFalse(
                        organizationId, search, pageable);
            }else {
                planningSettingsPage = repositoryPlanSetting.findAllByOrganizationIdAndIsDeletedFalse(organizationId, pageable);
            }
        }else {
            if(search != null && !search.isEmpty()) {
                planningSettingsPage = repositoryPlanSetting.findAllByNameContainingIgnoreCaseAndIsDeletedFalse(search, pageable);
            }else {
                planningSettingsPage = repositoryPlanSetting.findAllByIsDeletedFalse(pageable);
            }
        }
        if(planningSettingsPage.isEmpty()) {
            throw new ExceptionCoreNotFound(i18n.getPlanSetting(I18N_PLANNING_SETTINGS_LIST_EMPTY));
        }
        Page<DtoResPlanningSettings> dtoResPlanningSettingsPage = planningSettingsPage.map(this::toDTO);
        return ApiResponse.<Page<DtoResPlanningSettings>>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .message(i18n.getPlanSetting(I18N_PLANNING_SETTINGS_LIST_SUCCESS))
                .data(dtoResPlanningSettingsPage)
                .totalItems(dtoResPlanningSettingsPage.getTotalElements())
                .build();
    }

    @Override
    public ApiResponse<List<DtoResPlanningSettings>> findAllPlanningSettings(
            final Integer page,
            final Integer size,
            final String sortBy,
            final String sortDirection,
            final String keyword,
            final String orgId) {
        final I18n i18n = new I18n(httpServletRequest);
        int pageNumber = (page != null) ? page : 0;
        int pageSize = (size != null) ? size : 10;
        String organizationId;
        if(!utilAuthContext.isAdmin()) {
            organizationId = utilAuthContext.getCurrentUser().getOrganization().getId().toString();
        }else {
            organizationId = orgId;
        }
        List<DtoResPlanningSettings> dtoPlanSettings;
        long totalItems;
        if(keyword != null && !keyword.trim().isEmpty()) {
            List<EntityPlanSetting> planSettings;
            if(utilAuthContext.isAdmin() && organizationId == null) {
                planSettings = repositoryPlanSetting.searchByNameContainingNative(keyword.toLowerCase());
            }else {
                planSettings = repositoryPlanSetting.searchByNameContainingAndOrganizationId(keyword.toLowerCase(), organizationId);
            }
            dtoPlanSettings = planSettings.stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
            totalItems = dtoPlanSettings.size();
        }else {
            Page<EntityPlanSetting> pagePlanSettings;
            if(utilAuthContext.isAdmin() && organizationId == null) {
                pagePlanSettings = repositoryPlanSetting.findAllByIsDeletedFalse(PageRequest.of(pageNumber, pageSize));
            }else {
                pagePlanSettings = repositoryPlanSetting.findAllByOrganizationIdAndIsDeletedFalse(organizationId, PageRequest.of(pageNumber, pageSize));
            }
            dtoPlanSettings = pagePlanSettings.getContent().stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
            totalItems = pagePlanSettings.getTotalElements();
        }
        return ApiResponse.<List<DtoResPlanningSettings>>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .message(i18n.getPlanSetting(I18N_PLANNING_SETTINGS_LIST_SUCCESS))
                .data(dtoPlanSettings)
                .totalItems(totalItems)
                .build();
    }

    @Override
    public ApiResponse<DtoResPlanningSettings> createPlanningSettings(final DtoReqPlanningSettings dtoReqPlanningSettings) {
        final I18n i18n = new I18n(httpServletRequest);
        String category = dtoReqPlanningSettings.getCategory() != null ?
                dtoReqPlanningSettings.getCategory() : "DEFAULT";

        // Set organization ID based on authenticated user if not admin
        String organizationId;
        if(utilAuthContext.isAdmin()) {
            organizationId = dtoReqPlanningSettings.getOrganizationId();
        }else {
            organizationId = utilAuthContext.getCurrentUser().getOrganization().getId().toString();
            dtoReqPlanningSettings.setOrganizationId(organizationId);
        }

        if(repositoryPlanSetting.existsByOrganizationIdAndCategoryAndIsDeletedFalse(
                organizationId, category)) {
            throw new ExceptionPlanningSettingsAlreadyExists(i18n.getPlanSetting(I18N_PLANNING_SETTINGS_EXISTS));
        }

        validateTimeConstraints(dtoReqPlanningSettings);
        validatePlanPeriod(dtoReqPlanningSettings);

        EntityPlanSetting entityPlanSetting = new EntityPlanSetting();
        entityPlanSetting.setName(dtoReqPlanningSettings.getName());
        entityPlanSetting.setDescription(dtoReqPlanningSettings.getDescription());
        entityPlanSetting.setPeriodsPerDay(dtoReqPlanningSettings.getPeriodsPerDay());
        entityPlanSetting.setDaysPerWeek(dtoReqPlanningSettings.getDaysPerWeek());
        entityPlanSetting.setStartTime(dtoReqPlanningSettings.getStartTime());
        entityPlanSetting.setEndTime(dtoReqPlanningSettings.getEndTime());
        entityPlanSetting.setOrganizationId(organizationId);
        entityPlanSetting.setCategory(category);
        entityPlanSetting.setUuid(UUID.randomUUID().toString());
        entityPlanSetting.setCreatedBy(utilAuthContext.getAuthenticatedUserId());
        entityPlanSetting.setModifiedBy(utilAuthContext.getAuthenticatedUserId());
        entityPlanSetting.setCreatedDate(LocalDateTime.now());
        entityPlanSetting.setModifiedDate(LocalDateTime.now());
        entityPlanSetting.setIsDeleted(false);
        entityPlanSetting.setPlanStartDate(dtoReqPlanningSettings.getPlanStartDate());
        entityPlanSetting.setPlanEndDate(dtoReqPlanningSettings.getPlanEndDate());
        entityPlanSetting.setIncludeWeekends(dtoReqPlanningSettings.getIncludeWeekends());

        List<EntityTimeBlockType> timeBlockTypes = new ArrayList<>();
        for(DtoReqTimeBlockType timeBlockTypeReq : dtoReqPlanningSettings.getTimeBlockTypes()) {
            EntityTimeBlockType timeBlockType = new EntityTimeBlockType();
            timeBlockType.setName(timeBlockTypeReq.getName());
            timeBlockType.setDurationMinutes(timeBlockTypeReq.getDurationMinutes());
            timeBlockType.setOccurrences(timeBlockTypeReq.getOccurrences());
            timeBlockType.setPlanningSettings(entityPlanSetting);
            timeBlockType.setCreatedBy(utilAuthContext.getAuthenticatedUserId());
            timeBlockType.setModifiedBy(utilAuthContext.getAuthenticatedUserId());
            timeBlockTypes.add(timeBlockType);
        }

        entityPlanSetting.setTimeBlockTypes(timeBlockTypes);
        EntityPlanSetting savedPlanningSettings = repositoryPlanSetting.save(entityPlanSetting);

        DtoResPlanningSettings dtoResPlanningSettings = toDTO(savedPlanningSettings);
        return ApiResponse.success(HttpStatus.CREATED, i18n.getPlanSetting(I18N_PLANNING_SETTINGS_CREATE_SUCCESS), dtoResPlanningSettings);
    }

    @Override
    public ApiResponse<DtoResPlanningSettings> updatePlanningSettingsByUuid(final String uuid, final DtoReqPlanningSettings dtoReqPlanningSettings) {
        final I18n i18n = new I18n(httpServletRequest);
        EntityPlanSetting entityPlanSetting = repositoryPlanSetting.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getPlanSetting(I18N_PLANNING_SETTINGS_NOT_FOUND)));

        // Check if user has access to the organization
        if(!utilAuthContext.isAdmin() &&
                !entityPlanSetting.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId().toString())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
        }

        String category = dtoReqPlanningSettings.getCategory() != null ?
                dtoReqPlanningSettings.getCategory() : "DEFAULT";

        // Set organization ID based on authenticated user if not admin
        String organizationId;
        if(utilAuthContext.isAdmin()) {
            organizationId = dtoReqPlanningSettings.getOrganizationId();
        }else {
            organizationId = utilAuthContext.getCurrentUser().getOrganization().getId().toString();
            dtoReqPlanningSettings.setOrganizationId(organizationId);
        }

        if((!entityPlanSetting.getUuid().equals(uuid) ||
                !entityPlanSetting.getOrganizationId().equals(organizationId) ||
                !entityPlanSetting.getCategory().equals(category)) &&
                repositoryPlanSetting.existsByOrganizationIdAndCategoryAndIsDeletedFalse(organizationId, category)) {
            throw new ExceptionPlanningSettingsAlreadyExists(i18n.getPlanSetting(I18N_PLANNING_SETTINGS_EXISTS));
        }

        validateTimeConstraints(dtoReqPlanningSettings);
        validatePlanPeriod(dtoReqPlanningSettings);

        entityPlanSetting.setName(dtoReqPlanningSettings.getName());
        entityPlanSetting.setDescription(dtoReqPlanningSettings.getDescription());
        entityPlanSetting.setPeriodsPerDay(dtoReqPlanningSettings.getPeriodsPerDay());
        entityPlanSetting.setDaysPerWeek(dtoReqPlanningSettings.getDaysPerWeek());
        entityPlanSetting.setStartTime(dtoReqPlanningSettings.getStartTime());
        entityPlanSetting.setEndTime(dtoReqPlanningSettings.getEndTime());
        entityPlanSetting.setOrganizationId(organizationId);
        entityPlanSetting.setCategory(category);
        entityPlanSetting.setModifiedBy(utilAuthContext.getAuthenticatedUserId());
        entityPlanSetting.setModifiedDate(LocalDateTime.now());
        entityPlanSetting.setPlanStartDate(dtoReqPlanningSettings.getPlanStartDate());
        entityPlanSetting.setPlanEndDate(dtoReqPlanningSettings.getPlanEndDate());
        entityPlanSetting.setIncludeWeekends(dtoReqPlanningSettings.getIncludeWeekends());

        Map<String, EntityTimeBlockType> existingTimeBlockTypes = entityPlanSetting.getTimeBlockTypes().stream()
                .collect(Collectors.toMap(EntityTimeBlockType::getUuid, timeBlock -> timeBlock));

        List<EntityTimeBlockType> updatedTimeBlockTypes = new ArrayList<>();

        for(DtoReqTimeBlockType timeBlockTypeReq : dtoReqPlanningSettings.getTimeBlockTypes()) {
            EntityTimeBlockType timeBlockType;
            if(timeBlockTypeReq.getUuid() != null && existingTimeBlockTypes.containsKey(timeBlockTypeReq.getUuid())) {
                timeBlockType = existingTimeBlockTypes.get(timeBlockTypeReq.getUuid());
                timeBlockType.setName(timeBlockTypeReq.getName());
                timeBlockType.setDurationMinutes(timeBlockTypeReq.getDurationMinutes());
                timeBlockType.setOccurrences(timeBlockTypeReq.getOccurrences());
                timeBlockType.setModifiedBy(utilAuthContext.getAuthenticatedUserId());
                timeBlockType.setModifiedDate(LocalDateTime.now());
            }else {
                timeBlockType = new EntityTimeBlockType();
                timeBlockType.setName(timeBlockTypeReq.getName());
                timeBlockType.setDurationMinutes(timeBlockTypeReq.getDurationMinutes());
                timeBlockType.setOccurrences(timeBlockTypeReq.getOccurrences());
                timeBlockType.setPlanningSettings(entityPlanSetting);
                timeBlockType.setCreatedBy(utilAuthContext.getAuthenticatedUserId());
                timeBlockType.setModifiedBy(utilAuthContext.getAuthenticatedUserId());
                timeBlockType.setCreatedDate(LocalDateTime.now());
                timeBlockType.setModifiedDate(LocalDateTime.now());
            }
            updatedTimeBlockTypes.add(timeBlockType);
        }

        entityPlanSetting.getTimeBlockTypes().clear();
        entityPlanSetting.getTimeBlockTypes().addAll(updatedTimeBlockTypes);

        EntityPlanSetting updatedPlanningSettings = repositoryPlanSetting.save(entityPlanSetting);

        DtoResPlanningSettings dtoResPlanningSettings = toDTO(updatedPlanningSettings);
        return ApiResponse.success(HttpStatus.OK, i18n.getPlanSetting(I18N_PLANNING_SETTINGS_UPDATE_SUCCESS), dtoResPlanningSettings);
    }

    @Override
    public ApiResponse<Void> deletePlanningSettingsByUuid(final String uuid) {
        final I18n i18n = new I18n(httpServletRequest);
        EntityPlanSetting entityPlanningSettings = repositoryPlanSetting.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getPlanSetting(I18N_PLANNING_SETTINGS_NOT_FOUND)));

        // Check if user has access to the organization
        if(!utilAuthContext.isAdmin() &&
                !entityPlanningSettings.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId().toString())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
        }

        entityPlanningSettings.setIsDeleted(true);
        entityPlanningSettings.setModifiedBy(utilAuthContext.getAuthenticatedUserId());
        entityPlanningSettings.setModifiedDate(LocalDateTime.now());
        repositoryPlanSetting.save(entityPlanningSettings);
        return ApiResponse.success(HttpStatus.OK, i18n.getPlanSetting(I18N_PLANNING_SETTINGS_DELETE_SUCCESS), null);
    }

    @Override
    public Integer getMaxControlNumber(String organizationId, String category) {
        EntityPlanSetting planSetting = repositoryPlanSetting.findByOrganizationIdAndCategoryAndIsDeletedFalse(organizationId, category)
            .orElseThrow(() -> new RuntimeException("PlanSetting not found for organization and category"));
        return planSetting.getPeriodsPerDay() * planSetting.getDaysPerWeek();
    }

    @Override
    public ApiResponse<EntityPlanSetting> getPlanSettingById(final Integer planSettingId) {
        final I18n i18n = new I18n(httpServletRequest);
        
        if (planSettingId == null) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getPlanSetting(I18N_PLANNING_SETTINGS_NOT_FOUND));
        }
        
        Optional<EntityPlanSetting> planSettingOpt = repositoryPlanSetting.findById(planSettingId);
        
        if (planSettingOpt.isEmpty() || Boolean.TRUE.equals(planSettingOpt.get().getIsDeleted())) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getPlanSetting(I18N_PLANNING_SETTINGS_NOT_FOUND));
        }
        
        EntityPlanSetting planSetting = planSettingOpt.get();
        
        if (!utilAuthContext.isAdmin() && 
            !planSetting.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId().toString())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
        }
        
        return ApiResponse.success(HttpStatus.OK, i18n.getPlanSetting(I18N_PLANNING_SETTINGS_RETRIEVE_SUCCESS), planSetting);
    }

    private void validateTimeConstraints(DtoReqPlanningSettings request) {
        LocalTime startTime = request.getStartTime();
        LocalTime endTime = request.getEndTime();

        if(endTime.isBefore(startTime) || endTime.equals(startTime)) {
            throw new ExceptionPlanningSettingsTimeConstraintViolation("End time must be after start time");
        }

        long availableMinutes = Duration.between(startTime, endTime).toMinutes();

        long totalRequiredMinutes = request.getTimeBlockTypes().stream()
                .mapToLong(type -> (long) type.getDurationMinutes() * type.getOccurrences())
                .sum();

        if(totalRequiredMinutes > availableMinutes) {
            throw new ExceptionPlanningSettingsTimeConstraintViolation(
                    String.format("Total time block duration (%d minutes) exceeds available time (%d minutes)",
                            totalRequiredMinutes, availableMinutes));
        }
    }

    private void validatePlanPeriod(DtoReqPlanningSettings request) {
        final java.time.LocalDate planStartDate = request.getPlanStartDate();
        final java.time.LocalDate planEndDate = request.getPlanEndDate();
        if(planStartDate == null || planEndDate == null) {
            throw new IllegalArgumentException("planStartDate and planEndDate must not be null");
        }
        if(!planEndDate.isAfter(planStartDate)) {
            throw new IllegalArgumentException("planEndDate must be after planStartDate");
        }
    }

    private DtoResPlanningSettings toDTO(final EntityPlanSetting entityPlanningSettings) {
        DtoResPlanningSettings dtoResPlanningSettings = new DtoResPlanningSettings();
        dtoResPlanningSettings.setId(entityPlanningSettings.getId());
        dtoResPlanningSettings.setUuid(entityPlanningSettings.getUuid());
        dtoResPlanningSettings.setName(entityPlanningSettings.getName());
        dtoResPlanningSettings.setDescription(entityPlanningSettings.getDescription());
        dtoResPlanningSettings.setPeriodsPerDay(entityPlanningSettings.getPeriodsPerDay());
        dtoResPlanningSettings.setDaysPerWeek(entityPlanningSettings.getDaysPerWeek());
        dtoResPlanningSettings.setStartTime(entityPlanningSettings.getStartTime());
        dtoResPlanningSettings.setEndTime(entityPlanningSettings.getEndTime());
        dtoResPlanningSettings.setOrganizationId(entityPlanningSettings.getOrganizationId());
        dtoResPlanningSettings.setCategory(entityPlanningSettings.getCategory());
        dtoResPlanningSettings.setCreatedBy(entityPlanningSettings.getCreatedBy());
        dtoResPlanningSettings.setModifiedBy(entityPlanningSettings.getModifiedBy());
        dtoResPlanningSettings.setCreatedDate(entityPlanningSettings.getCreatedDate());
        dtoResPlanningSettings.setModifiedDate(entityPlanningSettings.getModifiedDate());
        dtoResPlanningSettings.setPlanStartDate(entityPlanningSettings.getPlanStartDate());
        dtoResPlanningSettings.setPlanEndDate(entityPlanningSettings.getPlanEndDate());
        dtoResPlanningSettings.setIncludeWeekends(entityPlanningSettings.getIncludeWeekends());

        List<DtoResTimeBlockType> timeBlockTypes = entityPlanningSettings.getTimeBlockTypes().stream()
                .map(this::toTimeBlockTypeDTO)
                .collect(Collectors.toList());
        dtoResPlanningSettings.setTimeBlockTypes(timeBlockTypes);

        if (entityPlanningSettings.getPeriodsPerDay() != null && entityPlanningSettings.getDaysPerWeek() != null) {
            dtoResPlanningSettings.setMaxControlNumber(entityPlanningSettings.getPeriodsPerDay() * entityPlanningSettings.getDaysPerWeek());
        } else {
            dtoResPlanningSettings.setMaxControlNumber(null);
        }

        return dtoResPlanningSettings;
    }

    private DtoResTimeBlockType toTimeBlockTypeDTO(final EntityTimeBlockType entityTimeBlockType) {
        DtoResTimeBlockType dtoResTimeBlockType = new DtoResTimeBlockType();
        dtoResTimeBlockType.setId(entityTimeBlockType.getId());
        dtoResTimeBlockType.setUuid(entityTimeBlockType.getUuid());
        dtoResTimeBlockType.setName(entityTimeBlockType.getName());
        dtoResTimeBlockType.setDurationMinutes(entityTimeBlockType.getDurationMinutes());
        dtoResTimeBlockType.setOccurrences(entityTimeBlockType.getOccurrences());
        dtoResTimeBlockType.setCreatedBy(entityTimeBlockType.getCreatedBy());
        dtoResTimeBlockType.setModifiedBy(entityTimeBlockType.getModifiedBy());
        dtoResTimeBlockType.setCreatedDate(entityTimeBlockType.getCreatedDate());
        dtoResTimeBlockType.setModifiedDate(entityTimeBlockType.getModifiedDate());
        return dtoResTimeBlockType;
    }
}
