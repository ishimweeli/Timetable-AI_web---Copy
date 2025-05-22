package com.ist.timetabling.ClassBand.service.impl;

import com.ist.timetabling.Auth.util.UtilAuthContext;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.ClassBand.entity.EntityClassBand;
import com.ist.timetabling.Class.entity.EntityClass;
import com.ist.timetabling.Class.repository.RepositoryClass;
import com.ist.timetabling.ClassBand.dto.req.DtoReqClassBand;
import com.ist.timetabling.ClassBand.dto.req.DtoReqClassBandUpdate;
import com.ist.timetabling.Core.exception.ExceptionCoreNoChange;
import com.ist.timetabling.Core.exception.ExceptionCoreNotFound;
import com.ist.timetabling.ClassBand.repository.RepositoryClassBand;
import com.ist.timetabling.Organization.repository.RepositoryOrganization;
import com.ist.timetabling.ClassBand.service.ServiceClassBand;
import com.ist.timetabling.Core.util.PaginationUtil;
import com.ist.timetabling.Period.dto.req.DtoReqSchedulePreference;
import com.ist.timetabling.Period.dto.res.DtoResSchedulePreference;
import com.ist.timetabling.Period.entity.EntitySchedulePreference;
import com.ist.timetabling.Period.repository.RepositorySchedule;
import com.ist.timetabling.Period.repository.RepositorySchedulePreference;
import com.ist.timetabling.Period.service.ServiceSchedulePreference;
import com.ist.timetabling.PlanSetting.repository.RepositoryPlanSetting;
import com.ist.timetabling.PlanSetting.entity.EntityPlanSetting;
import com.ist.timetabling.PlanSetting.entity.EntityTimeBlockType;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import static com.ist.timetabling.Auth.constant.ConstantI18nAuth.I18N_AUTH_UNAUTHORIZED;
import static com.ist.timetabling.ClassBand.constant.ConstantClassBandI18n.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Slf4j
@Service
public class ServiceClassBandImpl implements ServiceClassBand {

    private final RepositoryClassBand repositoryClassBand;
    private final RepositoryClass repositoryClass;
    private final RepositoryOrganization repositoryOrganization;
    private final RepositorySchedulePreference repositorySchedulePreference;
    private final RepositorySchedule repositorySchedule;
    private final ServiceSchedulePreference serviceSchedulePreference;
    private final HttpServletRequest httpServletRequest;
    private final UtilAuthContext utilAuthContext;
    private final RepositoryPlanSetting repositoryPlanSetting;
    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int DEFAULT_PAGE_NUMBER = 0;

    @Autowired
    public ServiceClassBandImpl(final RepositoryClassBand repositoryClassBand,
                                final RepositoryClass repositoryClass,
                                final RepositoryOrganization repositoryOrganization,
                                final RepositorySchedulePreference repositorySchedulePreference,
                                final RepositorySchedule repositorySchedule,
                                final ServiceSchedulePreference serviceSchedulePreference,
                                final HttpServletRequest httpServletRequest,
                                final UtilAuthContext utilAuthContext,
                                final RepositoryPlanSetting repositoryPlanSetting) {
        this.repositoryClassBand = repositoryClassBand;
        this.repositoryClass = repositoryClass;
        this.repositoryOrganization = repositoryOrganization;
        this.repositorySchedulePreference = repositorySchedulePreference;
        this.repositorySchedule = repositorySchedule;
        this.serviceSchedulePreference = serviceSchedulePreference;
        this.httpServletRequest = httpServletRequest;
        this.utilAuthContext = utilAuthContext;
        this.repositoryPlanSetting = repositoryPlanSetting;
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<EntityClassBand>> getClassBandsByStatus(final Integer statusId, final Integer page, final Integer size) {
        I18n i18n = new I18n(httpServletRequest);
        Pageable pageable = PaginationUtil.createPageable(page, size, DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE);
        Page<EntityClassBand> entityClassBands;
        if(utilAuthContext.isAdmin()) {
            entityClassBands = repositoryClassBand.findByStatusIdAndIsDeletedFalse(statusId, pageable);
        }else {
            Integer organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
            entityClassBands = repositoryClassBand.findByStatusIdAndOrganizationIdAndIsDeletedFalse(statusId, organizationId, pageable);
        }
        return ApiResponse.success(entityClassBands, i18n.getClassBand(I18N_CLASS_BAND_RETRIEVED_STATUS));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<EntityClassBand>> searchClassBandsByName(final String keyword) {
        I18n i18n = new I18n(httpServletRequest);
        List<EntityClassBand> entityClassBands;
        if(utilAuthContext.isAdmin()) {
            entityClassBands = repositoryClassBand.searchByNameContainingNative(keyword);
        }else {
            Integer organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
            entityClassBands = repositoryClassBand.searchByNameContainingAndOrganizationId(keyword, organizationId);
        }
        return ApiResponse.<List<EntityClassBand>>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .message(i18n.getClassBand(I18N_CLASS_BAND_SEARCH_RESULTS))
                .data(entityClassBands)
                .totalItems(entityClassBands.size())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<EntityClassBand> getClassBandByUuid(final String uuid) {
        I18n i18n = new I18n(httpServletRequest);
        Optional<EntityClassBand> optionalClassBand = repositoryClassBand.findByUuidAndIsDeletedFalse(uuid);
        if(optionalClassBand.isEmpty()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getClassBand(I18N_CLASS_BAND_NOT_FOUND));
        }
        EntityClassBand classBand = optionalClassBand.get();
        if(!utilAuthContext.isAdmin() && !classBand.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN,i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
        }
        return ApiResponse.success(HttpStatus.OK, i18n.getClassBand(I18N_CLASS_BAND_RETRIEVED), classBand);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<EntityClassBand>> getAllClassBands(final Integer page, final Integer size, final String sortBy, final String sortDirection,final String keyword, final Integer orgId, final Integer planSettingsId)
    {
        I18n i18n = new I18n(httpServletRequest);
        if(keyword != null && !keyword.trim().isEmpty()) {
            List<EntityClassBand> entityClassBands;
            if(utilAuthContext.isAdmin()) {
                entityClassBands = repositoryClassBand.searchByNameContainingNative(keyword);
            }else {
                Integer organizationId = (orgId != null)
                        ? orgId
                        : utilAuthContext.getCurrentUser().getOrganization().getId();
                entityClassBands = repositoryClassBand.searchByNameContainingAndOrganizationId(keyword, organizationId);
            }
            return ApiResponse.<List<EntityClassBand>>builder()
                    .status(HttpStatus.OK.value())
                    .success(true)
                    .message(i18n.getClassBand("ClassBands retrieved with search keyword."))
                    .data(entityClassBands)
                    .totalItems(entityClassBands.size())
                    .build();
        }else {
            Pageable pageable = PaginationUtil.createPageable(page, size, DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE);
            Page<EntityClassBand> entityClassBandsPage;
            if(utilAuthContext.isAdmin()) {
                entityClassBandsPage = repositoryClassBand.findByIsDeletedFalse(pageable);
            }else {
                Integer organizationId = (orgId != null)
                        ? orgId
                        : utilAuthContext.getCurrentUser().getOrganization().getId();
                entityClassBandsPage = repositoryClassBand.findByOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(organizationId, planSettingsId,pageable);
            }
            return ApiResponse.<List<EntityClassBand>>builder()
                    .status(HttpStatus.OK.value())
                    .success(true)
                    .message(i18n.getClassBand(I18N_CLASS_BAND_RETRIEVED))
                    .data(entityClassBandsPage.getContent())
                    .totalItems(entityClassBandsPage.getTotalElements())
                    .build();
        }
    }


    @Override
    @Transactional
    public ApiResponse<EntityClassBand> createClassBand(final DtoReqClassBand dtoReqClassBand) {
        I18n i18n = new I18n(httpServletRequest);
        Integer organizationId;
        if(utilAuthContext.isAdmin() && dtoReqClassBand.getOrganizationId() != null) {
            organizationId = dtoReqClassBand.getOrganizationId();
        }else {
            organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
            dtoReqClassBand.setOrganizationId(organizationId);
        }
        
        int adjustedMaxPeriods = getAdjustedMaxPeriods(organizationId, dtoReqClassBand.getPlanSettingsId());
        
        if(dtoReqClassBand.getMaxLessonsPerDay() != null && dtoReqClassBand.getMaxLessonsPerDay() > adjustedMaxPeriods) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, 
                i18n.getClassBand("classBand.validation.maxLessonsPerDayExceedsMax") + " " + adjustedMaxPeriods);
        }
        
        if(dtoReqClassBand.getMinLessonsPerDay() != null && dtoReqClassBand.getMinLessonsPerDay() > adjustedMaxPeriods) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, 
                i18n.getClassBand("classBand.validation.minLessonsPerDayExceedsMax") + " " + adjustedMaxPeriods);
        }
        
        if(repositoryClassBand.existsByNameAndOrganizationIdAndIsDeletedFalse(dtoReqClassBand.getName(), organizationId)) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getClassBand(I18N_CLASS_BAND_EXISTS));
        }
        if(!repositoryOrganization.existsById(organizationId)) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getClassBand(I18N_CLASS_BAND_ORGANIZATION_NOT_FOUND));
        }
        Set<String> uniqueClassUuids;
        try {
            uniqueClassUuids = validateAndGetUniqueClassUuids(dtoReqClassBand.getParticipatingClassUuids(), i18n);
        }catch(IllegalArgumentException e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
        EntityClassBand entityClassBand = toEntity(dtoReqClassBand, uniqueClassUuids, i18n);
        EntityClassBand savedClassBand = repositoryClassBand.save(entityClassBand);
        return ApiResponse.success(HttpStatus.CREATED, i18n.getClassBand(I18N_CLASS_BAND_CREATED), savedClassBand);
    }

    @Override
    @Transactional
    public ApiResponse<EntityClassBand> updateClassBandByUuid(final String uuid, final DtoReqClassBandUpdate dtoReqClassBandUpdate) {
        I18n i18n = new I18n(httpServletRequest);
        try {
            EntityClassBand entityClassBand = repositoryClassBand.findByUuidAndIsDeletedFalse(uuid)
                    .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getClassBand(I18N_CLASS_BAND_NOT_FOUND)));
            
            int adjustedMaxPeriods = getAdjustedMaxPeriods(entityClassBand.getOrganizationId(), entityClassBand.getPlanSettingsId());
            
            if(dtoReqClassBandUpdate.getMaxLessonsPerDay() != null &&
                dtoReqClassBandUpdate.getMaxLessonsPerDay() > adjustedMaxPeriods) {
                return ApiResponse.error(HttpStatus.BAD_REQUEST, 
                    i18n.getClassBand("classBand.validation.maxLessonsPerDayExceedsMax") + " " + adjustedMaxPeriods);
            }
            
            if(dtoReqClassBandUpdate.getMinLessonsPerDay() != null &&
                dtoReqClassBandUpdate.getMinLessonsPerDay() > adjustedMaxPeriods) {
                return ApiResponse.error(HttpStatus.BAD_REQUEST, 
                    i18n.getClassBand("classBand.validation.minLessonsPerDayExceedsMax") + " " + adjustedMaxPeriods);
            }
            
            if(!utilAuthContext.isAdmin() && !entityClassBand.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
            }
            dtoReqClassBandUpdate.setModifiedBy(utilAuthContext.getAuthenticatedUserId().toString());
            if(isNoChange(entityClassBand, dtoReqClassBandUpdate)) {
                throw new ExceptionCoreNoChange(i18n.getClassBand(I18N_CLASS_BAND_NO_CHANGES));
            }
            if(dtoReqClassBandUpdate.getName() != null && !dtoReqClassBandUpdate.getName().equals(entityClassBand.getName()) &&
                    repositoryClassBand.existsByNameAndOrganizationIdAndIsDeletedFalse(dtoReqClassBandUpdate.getName(), entityClassBand.getOrganizationId())) {
                return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getClassBand(I18N_CLASS_BAND_NAME_EXISTS));
            }
            if(dtoReqClassBandUpdate.getParticipatingClassUuids() != null) {
                Set<String> uniqueClassUuids;
                try {
                    uniqueClassUuids = validateAndGetUniqueClassUuids(dtoReqClassBandUpdate.getParticipatingClassUuids(), i18n);
                    if(uniqueClassUuids.size() < 2) {
                        return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getClassBand(I18N_CLASS_BAND_MIN_CLASSES_REQUIRED));
                    }
                    Set<EntityClass> classes = uniqueClassUuids.stream()
                            .map(classUuid -> repositoryClass.findByUuidAndIsDeletedFalse(classUuid)
                                    .orElseThrow(() -> new ExceptionCoreNotFound(String.format(i18n.getClassBand(I18N_CLASS_BAND_CLASS_NOT_FOUND), classUuid))))
                            .collect(Collectors.toSet());
                    entityClassBand.setParticipatingClasses(classes);
                }catch(IllegalArgumentException e) {
                    return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage());
                }
            }
            EntityClassBand updatedClassBand = updateClassBandFields(entityClassBand, dtoReqClassBandUpdate);
            return ApiResponse.success(HttpStatus.OK, i18n.getClassBand(I18N_CLASS_BAND_UPDATED), updatedClassBand);
        }catch(ExceptionCoreNotFound e) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, e.getMessage());
        }catch(ExceptionCoreNoChange e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteClassBandByUuid(final String uuid) {
        I18n i18n = new I18n(httpServletRequest);
        try {
            EntityClassBand entityClassBand = repositoryClassBand.findByUuidAndIsDeletedFalse(uuid)
                    .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getClassBand(I18N_CLASS_BAND_NOT_FOUND)));
            if(!utilAuthContext.isAdmin() && !entityClassBand.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
            }
            entityClassBand.setIsDeleted(true);
            entityClassBand.setModifiedBy(utilAuthContext.getAuthenticatedUserId().toString());
            entityClassBand.setModifiedDate(LocalDateTime.now());
            repositoryClassBand.save(entityClassBand);
            return ApiResponse.success(HttpStatus.OK, i18n.getClassBand(I18N_CLASS_BAND_DELETED), null);
        }catch(ExceptionCoreNotFound e) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<EntityClassBand> updateSchedulePreference(final String preferenceUuid, final String preferenceType, final Boolean preferenceValue) {
        I18n i18n = new I18n(httpServletRequest);
        try {
            Optional<EntitySchedulePreference> optEntityPref = repositorySchedulePreference.findByUuid(preferenceUuid);
            if(!optEntityPref.isPresent() || Boolean.TRUE.equals(optEntityPref.get().getIsDeleted())) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getClassBand(I18N_CLASS_BAND_NOT_FOUND));
            }
            EntitySchedulePreference entityPref = optEntityPref.get();
            List<EntityClassBand> relatedClassBands = repositoryClassBand.findBySchedulePreferencesContaining(entityPref);
            if(!utilAuthContext.isAdmin() && !hasPermissionForClassBands(relatedClassBands)) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
            }
            // Set all class-related preference fields to null before setting the new one
            entityPref.setMustScheduleClass(null);
            entityPref.setMustNotScheduleClass(null);
            entityPref.setPrefersToScheduleClass(null);
            entityPref.setPrefersNotToScheduleClass(null);
            setPreferenceField(entityPref, preferenceType, preferenceValue);
            entityPref.setModifiedBy(utilAuthContext.getAuthenticatedUserId());
            entityPref.setModifiedDate(LocalDateTime.now());
            repositorySchedulePreference.save(entityPref);
            if(relatedClassBands.isEmpty()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getClassBand(I18N_CLASS_BAND_PROFILE_NOT_FOUND));
            }
            EntityClassBand classBand = relatedClassBands.get(0);
            return ApiResponse.success(HttpStatus.OK, i18n.getClassBand(I18N_CLASS_BAND_UPDATED), classBand);
        }catch(Exception ex) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<EntityClassBand> addSchedulePreferenceToClassBand(final String classBandUuid, final Integer periodId, final Integer dayOfWeek, final String preferenceType, final Boolean preferenceValue) {
        I18n i18n = new I18n(httpServletRequest);
        Optional<EntityClassBand> classBandOpt = repositoryClassBand.findByUuidAndIsDeletedFalse(classBandUuid);
        if(classBandOpt.isEmpty()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getClassBand(I18N_CLASS_BAND_NOT_FOUND));
        }
        EntityClassBand classBand = classBandOpt.get();
        if(!utilAuthContext.isAdmin() && !classBand.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
        }
        // Find existing preference for this slot
        EntitySchedulePreference existingPref = classBand.getSchedulePreferences().stream()
            .filter(p -> Objects.equals(p.getPeriodId(), periodId) && Objects.equals(p.getDayOfWeek(), dayOfWeek) && !Boolean.TRUE.equals(p.getIsDeleted()))
            .findFirst().orElse(null);
        if(existingPref != null) {
            // Update the relevant field
            setPreferenceField(existingPref, preferenceType, preferenceValue);
            existingPref.setModifiedBy(utilAuthContext.getAuthenticatedUserId());
            existingPref.setModifiedDate(LocalDateTime.now());
            repositorySchedulePreference.save(existingPref);
        } else {
            EntitySchedulePreference newPref = EntitySchedulePreference.builder()
                .periodId(periodId)
                .dayOfWeek(dayOfWeek)
                .organizationId(classBand.getOrganizationId())
                .createdBy(utilAuthContext.getAuthenticatedUserId())
                .modifiedBy(utilAuthContext.getAuthenticatedUserId())
                .createdDate(LocalDateTime.now())
                .modifiedDate(LocalDateTime.now())
                .statusId(1)
                .isDeleted(false)
                .build();
            setPreferenceField(newPref, preferenceType, preferenceValue);
            repositorySchedulePreference.save(newPref);
            classBand.getSchedulePreferences().add(newPref);
        }
        classBand = repositoryClassBand.save(classBand);
        return ApiResponse.success(HttpStatus.OK, i18n.getClassBand(I18N_CLASS_BAND_CREATED), classBand);
    }

    @Override
    @Transactional
    public ApiResponse<EntityClassBand> addSchedulePreferencesToClassBand(final String classBandUuid, final DtoReqSchedulePreference preferences) {
        I18n i18n = new I18n(httpServletRequest);
        Optional<EntityClassBand> classBandOpt = repositoryClassBand.findByUuidAndIsDeletedFalse(classBandUuid);
        if(!classBandOpt.isPresent()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getClassBand(I18N_CLASS_BAND_NOT_FOUND));
        }
        EntityClassBand classBand = classBandOpt.get();
        if(!utilAuthContext.isAdmin() && !classBand.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
        }
        DtoResSchedulePreference createdPrefResponse = serviceSchedulePreference.createSchedulePreference(preferences);
        Optional<EntitySchedulePreference> optEntityPref = repositorySchedulePreference.findByUuid(createdPrefResponse.getUuid());
        if(!optEntityPref.isPresent()) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, i18n.getClassBand(I18N_CLASS_BAND_NOT_FOUND));
        }
        EntitySchedulePreference entityPref = optEntityPref.get();
        if(!classBand.getSchedulePreferences().contains(entityPref)) {
            classBand.getSchedulePreferences().add(entityPref);
        }
        classBand = repositoryClassBand.save(classBand);
        return ApiResponse.success(HttpStatus.OK, i18n.getClassBand(I18N_CLASS_BAND_CREATED), classBand);
    }

    @Override
    public ApiResponse<List<EntityClassBand>> getClassBandAllPreferences(final String classBandUuid) {
        I18n i18n = new I18n(httpServletRequest);
        Optional<EntityClassBand> classBandOpt = repositoryClassBand.findByUuidAndIsDeletedFalse(classBandUuid);
        if(!classBandOpt.isPresent()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getClassBand(I18N_CLASS_BAND_NOT_FOUND));
        }
        EntityClassBand classBand = classBandOpt.get();
        if(!utilAuthContext.isAdmin() && !classBand.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
        }
        List<EntityClassBand> result = new ArrayList<>();
        result.add(classBand);
        return ApiResponse.success(HttpStatus.OK, i18n.getClassBand(I18N_CLASS_BAND_PREFERENCE_RETRIEVED), result);
    }

    @Override
    public ApiResponse<EntityClassBand> getClassBandPreferenceForSchedule(final String classBandUuid, final Integer periodId, final Integer dayOfWeek) {
        I18n i18n = new I18n(httpServletRequest);
        try {
            Optional<EntityClassBand> classBandOpt = repositoryClassBand.findByUuidAndIsDeletedFalse(classBandUuid);
            if(!classBandOpt.isPresent()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getClassBand(I18N_CLASS_BAND_NOT_FOUND));
            }
            EntityClassBand classBand = classBandOpt.get();
            if(!utilAuthContext.isAdmin() && !classBand.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
            }
            List<EntitySchedulePreference> filteredPrefs = classBand.getSchedulePreferences().stream()
                .filter(pref -> pref.getPeriodId().equals(periodId) && pref.getDayOfWeek().equals(dayOfWeek) && !Boolean.TRUE.equals(pref.getIsDeleted()))
                .collect(Collectors.toList());
            EntityClassBand classBandWithFilteredPrefs = EntityClassBand.builder()
                    .id(classBand.getId())
                    .uuid(classBand.getUuid())
                    .name(classBand.getName())
                    .organizationId(classBand.getOrganizationId())
                    .description(classBand.getDescription())
                    .color(classBand.getColor())
                    .minLessonsPerDay(classBand.getMinLessonsPerDay())
                    .maxLessonsPerDay(classBand.getMaxLessonsPerDay())
                    .latestStartPosition(classBand.getLatestStartPosition())
                    .earliestEnd(classBand.getEarliestEnd())
                    .maxFreePeriods(classBand.getMaxFreePeriods())
                    .presentEveryDay(classBand.getPresentEveryDay())
                    .participatingClasses(classBand.getParticipatingClasses())
                    .statusId(classBand.getStatusId())
                    .isDeleted(classBand.getIsDeleted())
                    .createdBy(classBand.getCreatedBy())
                    .modifiedBy(classBand.getModifiedBy())
                    .createdDate(classBand.getCreatedDate())
                    .modifiedDate(classBand.getModifiedDate())
                    .schedulePreferences(filteredPrefs)
                    .build();
            return ApiResponse.success(HttpStatus.OK, i18n.getClassBand(I18N_CLASS_BAND_PREFERENCE_RETRIEVED), classBandWithFilteredPrefs);
        }catch(Exception ex) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<?> clearClassBandPreferencesForSchedule(final String classBandUuid, final String scheduleUuid) {
        I18n i18n = new I18n(httpServletRequest);
        try {
            Optional<EntityClassBand> classBandOpt = repositoryClassBand.findByUuidAndIsDeletedFalse(classBandUuid);
            if(!classBandOpt.isPresent()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getClassBand(I18N_CLASS_BAND_NOT_FOUND));
            }
            EntityClassBand entityClassBand = classBandOpt.get();
            if(!utilAuthContext.isAdmin() && !entityClassBand.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
            }
            // Remove all logic using pref.getSchedule().getUuid().equals(scheduleUuid)
            // If you want to clear by periodId and dayOfWeek, add those as parameters and filter accordingly
            // For now, just return not implemented
            return ApiResponse.error(HttpStatus.NOT_IMPLEMENTED, "This method is deprecated. Use the new time-slot-based preference clearing.", null);
        }catch(Exception ex) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<EntityClassBand>> getClassBandsByPlanSettingsId(final Integer planSettingsId) {
        I18n i18n = new I18n(httpServletRequest);
        
        if (planSettingsId == null) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getClassBand(I18N_CLASS_BAND_PLAN_NOT_FOUND));
        }
        
        Integer organizationId = null;
        if (!utilAuthContext.isAdmin()) {
            organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
        }
        
        Page<EntityClassBand> entityClassBandsPage;
        List<EntityClassBand> classBands;
        
        if (organizationId != null) {
            entityClassBandsPage = repositoryClassBand.findByOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(
                organizationId, planSettingsId, PageRequest.of(0, 1000));
        } else {
            entityClassBandsPage = repositoryClassBand.findByPlanSettingsIdAndIsDeletedFalse(
                planSettingsId, PageRequest.of(0, 1000));
        }
        
        classBands = entityClassBandsPage.getContent();
        
        return ApiResponse.success(HttpStatus.OK, i18n.getClassBand(I18N_CLASS_BAND_RETRIEVED), classBands);
    }

    private boolean isNoChange(final EntityClassBand entityClassBand, final DtoReqClassBandUpdate dtoReqClassBandUpdate) {
        boolean basicFieldsUnchanged = (dtoReqClassBandUpdate.getName() == null || dtoReqClassBandUpdate.getName().equals(entityClassBand.getName())) &&
                (dtoReqClassBandUpdate.getDescription() == null || dtoReqClassBandUpdate.getDescription().equals(entityClassBand.getDescription())) &&
                (dtoReqClassBandUpdate.getMinLessonsPerDay() == null || dtoReqClassBandUpdate.getMinLessonsPerDay().equals(entityClassBand.getMinLessonsPerDay())) &&
                (dtoReqClassBandUpdate.getMaxLessonsPerDay() == null || dtoReqClassBandUpdate.getMaxLessonsPerDay().equals(entityClassBand.getMaxLessonsPerDay())) &&
                (dtoReqClassBandUpdate.getLatestStartPosition() == null || dtoReqClassBandUpdate.getLatestStartPosition().equals(entityClassBand.getLatestStartPosition())) &&
                (dtoReqClassBandUpdate.getEarliestEnd() == null || dtoReqClassBandUpdate.getEarliestEnd().equals(entityClassBand.getEarliestEnd())) &&
                (dtoReqClassBandUpdate.getMaxFreePeriods() == null || dtoReqClassBandUpdate.getMaxFreePeriods().equals(entityClassBand.getMaxFreePeriods())) &&
                (dtoReqClassBandUpdate.getPresentEveryDay() == null || dtoReqClassBandUpdate.getPresentEveryDay().equals(entityClassBand.getPresentEveryDay())) &&
                (dtoReqClassBandUpdate.getStatusId() == null || dtoReqClassBandUpdate.getStatusId().equals(entityClassBand.getStatusId()));
        if(!basicFieldsUnchanged) {
            return false;
        }
        if(dtoReqClassBandUpdate.getParticipatingClassUuids() == null) {
            return true;
        }
        Set<String> existingUuids = entityClassBand.getParticipatingClasses().stream()
                .map(EntityClass::getUuid).collect(Collectors.toSet());
        return existingUuids.equals(new HashSet<>(dtoReqClassBandUpdate.getParticipatingClassUuids()));
    }

    private EntityClassBand updateClassBandFields(final EntityClassBand entityClassBand, final DtoReqClassBandUpdate dtoReqClassBandUpdate) {
        if(dtoReqClassBandUpdate.getName() != null) entityClassBand.setName(dtoReqClassBandUpdate.getName());
        if(dtoReqClassBandUpdate.getDescription() != null) entityClassBand.setDescription(dtoReqClassBandUpdate.getDescription());
        if(dtoReqClassBandUpdate.getPlanSettingsId() != null) entityClassBand.setPlanSettingsId(dtoReqClassBandUpdate.getPlanSettingsId());
        if(dtoReqClassBandUpdate.getMinLessonsPerDay() != null) entityClassBand.setMinLessonsPerDay(dtoReqClassBandUpdate.getMinLessonsPerDay());
        if(dtoReqClassBandUpdate.getMaxLessonsPerDay() != null) entityClassBand.setMaxLessonsPerDay(dtoReqClassBandUpdate.getMaxLessonsPerDay());
        if(dtoReqClassBandUpdate.getLatestStartPosition() != null) entityClassBand.setLatestStartPosition(dtoReqClassBandUpdate.getLatestStartPosition());
        if(dtoReqClassBandUpdate.getEarliestEnd() != null) entityClassBand.setEarliestEnd(dtoReqClassBandUpdate.getEarliestEnd());
        if(dtoReqClassBandUpdate.getMaxFreePeriods() != null) entityClassBand.setMaxFreePeriods(dtoReqClassBandUpdate.getMaxFreePeriods());
        if(dtoReqClassBandUpdate.getPresentEveryDay() != null) entityClassBand.setPresentEveryDay(dtoReqClassBandUpdate.getPresentEveryDay());
        if(dtoReqClassBandUpdate.getStatusId() != null) entityClassBand.setStatusId(dtoReqClassBandUpdate.getStatusId());
        entityClassBand.setModifiedDate(LocalDateTime.now());
        entityClassBand.setModifiedBy(dtoReqClassBandUpdate.getModifiedBy());
        return repositoryClassBand.save(entityClassBand);
    }

    private Set<String> validateAndGetUniqueClassUuids(List<String> classUuids, I18n i18n) {
        if(classUuids == null || classUuids.isEmpty()) {
            return new HashSet<>();
        }
        Map<String, Long> uuidCount = classUuids.stream().collect(Collectors.groupingBy(uuid -> uuid, Collectors.counting()));
        Optional<String> duplicateUuid = uuidCount.entrySet().stream().filter(entry -> entry.getValue() > 1).map(Map.Entry::getKey).findFirst();
        if(duplicateUuid.isPresent()) {
            throw new IllegalArgumentException(String.format(i18n.getClassBand(I18N_CLASS_BAND_DUPLICATE_CLASS), duplicateUuid.get()));
        }
        return new HashSet<>(classUuids);
    }

    private EntityClassBand toEntity(final DtoReqClassBand dtoReqClassBand, final Set<String> uniqueClassUuids, final I18n i18n) {
        EntityClassBand entityClassBand = new EntityClassBand();
        entityClassBand.setName(dtoReqClassBand.getName());
        entityClassBand.setOrganizationId(dtoReqClassBand.getOrganizationId());
        entityClassBand.setPlanSettingsId(dtoReqClassBand.getPlanSettingsId());
        entityClassBand.setDescription(dtoReqClassBand.getDescription());
        entityClassBand.setMinLessonsPerDay(dtoReqClassBand.getMinLessonsPerDay());
        entityClassBand.setMaxLessonsPerDay(dtoReqClassBand.getMaxLessonsPerDay());
        entityClassBand.setLatestStartPosition(dtoReqClassBand.getLatestStartPosition());
        entityClassBand.setEarliestEnd(dtoReqClassBand.getEarliestEnd());
        entityClassBand.setMaxFreePeriods(dtoReqClassBand.getMaxFreePeriods());
        entityClassBand.setPresentEveryDay(dtoReqClassBand.getPresentEveryDay());
        entityClassBand.setModifiedBy(utilAuthContext.getAuthenticatedUserId().toString());
        entityClassBand.setCreatedBy(utilAuthContext.getAuthenticatedUserId().toString());
        entityClassBand.setUuid(UUID.randomUUID().toString());
        entityClassBand.setStatusId(dtoReqClassBand.getStatusId());
        entityClassBand.setCreatedDate(LocalDateTime.now());
        entityClassBand.setModifiedDate(LocalDateTime.now());
        entityClassBand.setIsDeleted(false);
        entityClassBand.setSchedulePreferences(new ArrayList<>());
        if(!uniqueClassUuids.isEmpty()) {
            Set<EntityClass> classes = uniqueClassUuids.stream()
                    .map(classUuid -> repositoryClass.findByUuidAndIsDeletedFalse(classUuid)
                            .orElseThrow(() -> new ExceptionCoreNotFound(String.format(i18n.getClassBand(I18N_CLASS_BAND_CLASS_NOT_FOUND), classUuid))))
                    .collect(Collectors.toSet());
            entityClassBand.setParticipatingClasses(classes);
        }else {
            entityClassBand.setParticipatingClasses(new HashSet<>());
        }
        return entityClassBand;
    }

    private boolean hasPermissionForClassBands(List<EntityClassBand> classBands) {
        if(classBands == null || classBands.isEmpty()) {
            return false;
        }
        Integer userOrgId = utilAuthContext.getCurrentUser().getOrganization().getId();
        return classBands.stream().anyMatch(cb -> cb.getOrganizationId().equals(userOrgId));
    }

    private int getAdjustedMaxPeriods(Integer organizationId, Integer planSettingId) {
        Optional<EntityPlanSetting> planSettingOpt = repositoryPlanSetting.findByOrganizationIdAndIdAndIsDeletedFalse(organizationId.toString(),planSettingId);

        if(!planSettingOpt.isPresent()) {
            return 10;
        }

        EntityPlanSetting planSetting = planSettingOpt.get();
        Integer maxPeriodsPerDay = planSetting.getPeriodsPerDay();

        if(maxPeriodsPerDay == null || maxPeriodsPerDay <= 0) {
            return 10;
        }

        int breakAndLunchPeriods = 0;

        if(planSetting.getTimeBlockTypes() != null) {
            for(EntityTimeBlockType timeBlockType : planSetting.getTimeBlockTypes()) {
                if(timeBlockType.getIsDeleted()) {
                    continue;
                }
                String name = timeBlockType.getName().toLowerCase();
                if(name.contains("break") || name.contains("lunch")) {
                    breakAndLunchPeriods += timeBlockType.getOccurrences();
                }
            }
        }

        int adjustedMaxPeriods = maxPeriodsPerDay - breakAndLunchPeriods;

        adjustedMaxPeriods = Math.max(1, adjustedMaxPeriods);

        return adjustedMaxPeriods;
    }

    private void setPreferenceField(EntitySchedulePreference pref, String type, Boolean value) {
        switch (type.toLowerCase()) {
            case "cannot_teach":
                pref.setCannotTeach(value);
                break;
            case "prefers_to_teach":
                pref.setPrefersToTeach(value);
                break;
            case "must_teach":
                pref.setMustTeach(value);
                break;
            case "dont_prefer_to_teach":
                pref.setDontPreferToTeach(value);
                break;
            case "must_schedule_class":
                pref.setMustScheduleClass(value);
                break;
            case "must_not_schedule_class":
                pref.setMustNotScheduleClass(value);
                break;
            case "prefers_to_schedule_class":
                pref.setPrefersToScheduleClass(value);
                break;
            case "prefers_not_to_schedule_class":
                pref.setPrefersNotToScheduleClass(value);
                break;
        }
    }

}
