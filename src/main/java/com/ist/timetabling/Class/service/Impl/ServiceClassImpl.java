package com.ist.timetabling.Class.service.Impl;

import com.ist.timetabling.Auth.util.UtilAuthContext;
import com.ist.timetabling.Class.dto.res.DtoResClassCsvUpload;
import com.ist.timetabling.Class.util.ClassCsvMapper;
import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Core.exception.CSVImportException;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.Class.entity.EntityClass;
import com.ist.timetabling.Class.dto.req.DtoReqClass;
import com.ist.timetabling.Class.dto.req.DtoReqClassUpdate;
import com.ist.timetabling.Core.exception.ExceptionCoreNoChange;
import com.ist.timetabling.Class.exception.ExceptionClassAlreadyExists;
import com.ist.timetabling.Core.exception.ExceptionCoreNotFound;
import com.ist.timetabling.Class.repository.RepositoryClass;
import com.ist.timetabling.Core.util.CSVReaderUtil;
import com.ist.timetabling.Organization.repository.RepositoryOrganization;
import com.ist.timetabling.Class.service.ServiceClass;
import com.ist.timetabling.Core.util.PaginationUtil;
import com.ist.timetabling.Period.dto.req.DtoReqSchedulePreference;
import com.ist.timetabling.Period.dto.res.DtoResSchedulePreference;
import com.ist.timetabling.Period.entity.EntitySchedulePreference;
import com.ist.timetabling.Period.repository.RepositorySchedule;
import com.ist.timetabling.Period.repository.RepositorySchedulePreference;
import com.ist.timetabling.Period.service.ServiceSchedulePreference;
import com.ist.timetabling.PlanSetting.entity.EntityPlanSetting;
import com.ist.timetabling.PlanSetting.entity.EntityTimeBlockType;
import com.ist.timetabling.PlanSetting.repository.RepositoryPlanSetting;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Objects;

import static com.ist.timetabling.Auth.constant.ConstantI18nAuth.I18N_AUTH_UNAUTHORIZED;
import static com.ist.timetabling.Class.constant.ConstantClassI18n.*;

@Slf4j
@Service
public class ServiceClassImpl implements ServiceClass {

    private final RepositoryClass repositoryClass;
    private final RepositoryOrganization repositoryOrganization;
    private final RepositorySchedulePreference repositorySchedulePreference;
    private final RepositorySchedule repositorySchedule;
    private final ServiceSchedulePreference serviceSchedulePreference;
    private final HttpServletRequest httpServletRequest;
    private final UtilAuthContext utilAuthContext;
    private final RepositoryPlanSetting repositoryPlanSetting;
    private final CSVReaderUtil csvReaderUtil;
    private final ClassCsvMapper classCsvMapper;
    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int DEFAULT_PAGE_NUMBER = 0;
    private static final String ROLE_ADMIN = "ADMIN";

    @Autowired
    public ServiceClassImpl(final RepositoryClass repositoryClass,
                            final RepositoryOrganization repositoryOrganization,
                            final HttpServletRequest httpServletRequest,
                            UtilAuthContext utilAuthContext,
                            RepositorySchedulePreference repositorySchedulePreference,
                            RepositorySchedule repositorySchedule,
                            ServiceSchedulePreference serviceSchedulePreference,
                            RepositoryPlanSetting repositoryPlanSetting,
                            CSVReaderUtil csvReaderUtil,
                            ClassCsvMapper classCsvMapper) {
        this.repositoryClass = repositoryClass;
        this.repositoryOrganization = repositoryOrganization;
        this.httpServletRequest = httpServletRequest;
        this.utilAuthContext = utilAuthContext;
        this.repositorySchedulePreference = repositorySchedulePreference;
        this.repositorySchedule = repositorySchedule;
        this.serviceSchedulePreference = serviceSchedulePreference;
        this.repositoryPlanSetting = repositoryPlanSetting;
        this.csvReaderUtil = csvReaderUtil;
        this.classCsvMapper = classCsvMapper;
    }

    @Override
    @Transactional
    public ApiResponse<DtoResClassCsvUpload> importClassesFromCsv(final DtoReqCsvUpload uploadRequest) {
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

     
        if(!repositoryOrganization.existsById(organizationId)) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getClass(I18N_ORGANIZATION_NOT_FOUND));
        }

        DtoResClassCsvUpload result = new DtoResClassCsvUpload();
        List<EntityClass> createdClasses = new ArrayList<>();
        List<DtoResClassCsvUpload.ClassImportError> errors = new ArrayList<>();

        try {
            List<CSVRecord> records = csvReaderUtil.parseCSV(
                    uploadRequest.getFile(),
                    ClassCsvMapper.CSV_HEADERS,
                    uploadRequest.getSkipHeaderRow()
            );

            result.setTotalProcessed(records.size());
            int rowNum = uploadRequest.getSkipHeaderRow() ? 2 : 1;

            for(CSVRecord record : records) {
                try {
                    
                    DtoReqClass classRequest = classCsvMapper.mapToClassRequest(record, organizationId, rowNum);

                  
                    if(repositoryClass.existsByNameAndOrganizationIdAndIsDeletedFalse(
                            classRequest.getName(), organizationId)) {
                        throw new Exception(i18n.getClass(I18N_CLASS_EXISTS));
                    }

                 
                    ApiResponse<EntityClass> response = createClass(classRequest);

                    if(response.isSuccess()) {
                        createdClasses.add(response.getData());
                    }else {
                        throw new Exception(response.getMessage());
                    }
                }catch(Exception e) {
                    DtoResClassCsvUpload.ClassImportError error = new DtoResClassCsvUpload.ClassImportError(
                            rowNum,
                            record.toString(),
                            e.getMessage()
                    );
                    errors.add(error);
                }
                rowNum++;
            }

            result.setCreatedClasses(createdClasses);
            result.setErrors(errors);
            result.setSuccessCount(createdClasses.size());
            result.setErrorCount(errors.size());

            String message = String.format("Processed %d classes: %d created, %d errors",
                    result.getTotalProcessed(), result.getSuccessCount(), result.getErrorCount());

            return ApiResponse.success(HttpStatus.OK, message, result);

        }catch(IOException e) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, "Error reading CSV file: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<EntityClass> createClass(final DtoReqClass dtoReqClass) {
        final I18n i18n = new I18n(httpServletRequest);
        Integer organizationId;
        if(utilAuthContext.isAdmin()) {
            organizationId = dtoReqClass.getOrganizationId();
            dtoReqClass.setOrganizationId(organizationId);
        }else {
            organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
            dtoReqClass.setOrganizationId(organizationId);
        }

        if(repositoryClass.existsByNameAndOrganizationIdAndIsDeletedFalse(
                dtoReqClass.getName(), organizationId)) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getClass(I18N_CLASS_EXISTS));
        }

        if(!repositoryOrganization.existsById(organizationId)) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getClass(I18N_ORGANIZATION_NOT_FOUND));
        }

        int adjustedMaxPeriods = getAdjustedMaxPeriods(organizationId, dtoReqClass.getPlanSettingsId());

        if(dtoReqClass.getMaxLessonsPerDay() != null && dtoReqClass.getMaxLessonsPerDay() > adjustedMaxPeriods) {
            return ApiResponse.error(
                    HttpStatus.BAD_REQUEST,
                    "Max lessons per day (" + dtoReqClass.getMaxLessonsPerDay() +
                            ") cannot exceed " + adjustedMaxPeriods +
                            " (breaks and lunch periods are excluded from this limit)"
            );
        }

        final EntityClass entityClass = new EntityClass();
        entityClass.setName(dtoReqClass.getName());
        entityClass.setInitial(dtoReqClass.getInitial());
        entityClass.setColor(dtoReqClass.getColor());
        entityClass.setSection(dtoReqClass.getSection());
        entityClass.setCapacity(dtoReqClass.getCapacity());
        entityClass.setLocationId(dtoReqClass.getLocationId());
        entityClass.setOrganizationId(dtoReqClass.getOrganizationId());
        entityClass.setDescription(dtoReqClass.getComment());
        entityClass.setMinLessonsPerDay(dtoReqClass.getMinLessonsPerDay());
        entityClass.setMaxLessonsPerDay(dtoReqClass.getMaxLessonsPerDay());
        entityClass.setLatestStartPosition(dtoReqClass.getLatestStartPosition());
        entityClass.setEarliestEnd(dtoReqClass.getEarliestEnd());
        entityClass.setMaxFreePeriods(dtoReqClass.getMaxFreePeriods());
        entityClass.setMainTeacher(dtoReqClass.getMainTeacher());
        entityClass.setPresentEveryDay(dtoReqClass.getPresentEveryDay());
        entityClass.setControlNumber(dtoReqClass.getControlNumber());
        entityClass.setPlanSettingsId(dtoReqClass.getPlanSettingsId());
        String userId = utilAuthContext.getAuthenticatedUserId().toString();
        entityClass.setModifiedBy(userId);
        entityClass.setCreatedBy(userId);
        entityClass.setUuid(UUID.randomUUID().toString());
        entityClass.setStatusId(dtoReqClass.getStatusId());
        entityClass.setCreatedDate(LocalDateTime.now());
        entityClass.setModifiedDate(LocalDateTime.now());
        entityClass.setIsDeleted(false);

        final EntityClass savedClass = repositoryClass.save(entityClass);
        return ApiResponse.success(HttpStatus.CREATED, i18n.getClass(I18N_CLASS_CREATED), savedClass);
    }

    /**
     * Get all classes with pagination and optional search and organization filter.
     * For ADMIN users, an optional "keyword" and "orgId" (filterOrgId) may be provided.
     * Non-admin users always see classes for their own organization.
     */
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "classes", key = "#page + '_' + #size + '_' + #sortBy + '_' + #sortDirection + '_' + (#keyword != null ? #keyword : '') + '_' + (#filterOrgId != null ? #filterOrgId : '') + '_' + @utilAuthContext.getCurrentUser().getOrganization().getId() + '_' + @utilAuthContext.isAdmin()")
    public ApiResponse<List<EntityClass>> getAllClasses(final Integer page,
                                                        final Integer size,
                                                        final String sortBy,
                                                        final String sortDirection,
                                                        final String keyword,
                                                        final Integer filterOrgId,
                                                        final Integer planSettingsId) {
        final I18n i18n = new I18n(httpServletRequest);
        final Pageable pageable = PaginationUtil.createPageable(page, size, sortBy, sortDirection, DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE);

        Page<EntityClass> entityClasses;

        if(planSettingsId != null) {
            if(keyword != null && !keyword.trim().isEmpty()) {
                entityClasses = repositoryClass.searchClassesWithPlanSettings(keyword, filterOrgId, planSettingsId, pageable);
            } else if(filterOrgId != null) {
                entityClasses = repositoryClass.findByOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(filterOrgId, planSettingsId, pageable);
            } else {
                entityClasses = repositoryClass.findByPlanSettingsIdAndIsDeletedFalse(planSettingsId, pageable);
            }
        } else {
            if(utilAuthContext.isAdmin()) {
                if(keyword != null && !keyword.trim().isEmpty()) {
                    entityClasses = repositoryClass.searchClasses(keyword, filterOrgId, pageable);
                } else if(filterOrgId != null) {
                    entityClasses = repositoryClass.findByOrganizationIdAndIsDeletedFalse(filterOrgId, pageable);
                } else {
                    entityClasses = repositoryClass.findByIsDeletedFalse(pageable);
                }
            } else {
                Integer orgId = utilAuthContext.getCurrentUser().getOrganization().getId();
                if(keyword != null && !keyword.trim().isEmpty()) {
                    entityClasses = repositoryClass.searchClasses(keyword, orgId, pageable);
                } else {
                    entityClasses = repositoryClass.findByOrganizationIdAndIsDeletedFalse(orgId, pageable);
                }
            }
        }

        return ApiResponse.<List<EntityClass>>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .time(System.currentTimeMillis())
                .language(LocaleContextHolder.getLocale().getLanguage())
                .message(i18n.getClass(I18N_CLASS_RETRIEVED))
                .totalPages(entityClasses.getTotalPages())
                .totalItems(entityClasses.getTotalElements())
                .currentPage(entityClasses.getNumber())
                .hasNext(entityClasses.hasNext())
                .hasPrevious(entityClasses.hasPrevious())
                .data(entityClasses.getContent())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<EntityClass>> searchClassesByName(final String keyword) {
        final I18n i18n = new I18n(httpServletRequest);
        Pageable pageable = PaginationUtil.createPageable(DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, "name", "asc", DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE);
        Page<EntityClass> entityClasses;
        if(utilAuthContext.isAdmin()) {
            entityClasses = repositoryClass.searchClasses(keyword, null, pageable);
        }else {
            Integer organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
            entityClasses = repositoryClass.searchClasses(keyword, organizationId, pageable);
        }
        List<EntityClass> results = entityClasses.getContent();
        return ApiResponse.<List<EntityClass>>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .message(i18n.getClass(I18N_CLASS_SEARCH_RESULTS))
                .data(results)
                .totalItems(results.size())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<EntityClass>> getClassesByStatus(final Integer statusId, final Integer page, final Integer size) {
        final I18n i18n = new I18n(httpServletRequest);
        final Pageable pageable = PaginationUtil.createPageable(page, size, DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE);

        Page<EntityClass> entityClasses;
        if(utilAuthContext.isAdmin()) {
            entityClasses = repositoryClass.findByStatusIdAndIsDeletedFalse(statusId, pageable);
        }else {
            Integer organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
            entityClasses = repositoryClass.findByStatusIdAndOrganizationIdAndIsDeletedFalse(statusId, organizationId, pageable);
        }

        return ApiResponse.<List<EntityClass>>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .time(System.currentTimeMillis())
                .language(LocaleContextHolder.getLocale().getLanguage())
                .message(i18n.getClass(I18N_CLASS_STATUS_RESULTS))
                .totalPages(entityClasses.getTotalPages())
                .totalItems(entityClasses.getTotalElements())
                .currentPage(entityClasses.getNumber())
                .hasNext(entityClasses.hasNext())
                .hasPrevious(entityClasses.hasPrevious())
                .data(entityClasses.getContent())
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteClassByUuid(final String uuid) {
        final I18n i18n = new I18n(httpServletRequest);
        try {
            final EntityClass entityClass = repositoryClass.findByUuidAndIsDeletedFalse(uuid)
                    .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getClass(I18N_CLASS_NOT_FOUND)));

            if(!utilAuthContext.isAdmin() && !entityClass.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
            }

            entityClass.setIsDeleted(true);
            entityClass.setModifiedBy(utilAuthContext.getAuthenticatedUserId().toString());
            entityClass.setModifiedDate(LocalDateTime.now());
            repositoryClass.save(entityClass);
            return ApiResponse.success(HttpStatus.OK, i18n.getClass(I18N_CLASS_DELETED), null);
        }catch(final ExceptionCoreNotFound e) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<EntityClass> updateClassByUuid(final String uuid, final DtoReqClassUpdate dtoReqClassUpdate) {
        final I18n i18n = new I18n(httpServletRequest);
        try {
            final EntityClass entityClass = repositoryClass.findByUuidAndIsDeletedFalse(uuid)
                    .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getClass(I18N_CLASS_NOT_FOUND)));

            if(dtoReqClassUpdate.getMaxLessonsPerDay() != null) {
                int adjustedMaxPeriods = getAdjustedMaxPeriods(entityClass.getOrganizationId(), entityClass.getPlanSettingsId());
                if(dtoReqClassUpdate.getMaxLessonsPerDay() > adjustedMaxPeriods) {
                    return ApiResponse.error(
                            HttpStatus.BAD_REQUEST,
                            "Max lessons per day (" + dtoReqClassUpdate.getMaxLessonsPerDay() +
                                    ") cannot exceed " + adjustedMaxPeriods +
                                    " (breaks and lunch periods are excluded from this limit)"
                    );
                }
            }

            if(isNoChange(entityClass, dtoReqClassUpdate)) {
                throw new ExceptionCoreNoChange(i18n.getClass(I18N_CLASS_NO_CHANGES));
            }

            if(dtoReqClassUpdate.getName() != null &&
                    !dtoReqClassUpdate.getName().equals(entityClass.getName()) &&
                    repositoryClass.existsByNameAndOrganizationIdAndIsDeletedFalse(
                            dtoReqClassUpdate.getName(), entityClass.getOrganizationId())) {
                throw new ExceptionClassAlreadyExists(i18n.getClass(I18N_CLASS_EXISTS));
            }

            final EntityClass updatedClass = updateClassFields(entityClass, dtoReqClassUpdate);
            return ApiResponse.success(HttpStatus.OK, i18n.getClass(I18N_CLASS_UPDATED), updatedClass);

        }catch(final ExceptionCoreNotFound e) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, e.getMessage());
        }catch(final ExceptionCoreNoChange e) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, e.getMessage());
        }catch(final ExceptionClassAlreadyExists e) {
            return ApiResponse.error(HttpStatus.CONFLICT, e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<EntityClass> getClassByUuid(final String uuid) {
        final I18n i18n = new I18n(httpServletRequest);
        final Optional<EntityClass> entityClassOpt = repositoryClass.findByUuidAndIsDeletedFalse(uuid);
        if(entityClassOpt.isEmpty()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getClass(I18N_CLASS_NOT_FOUND));
        }
        EntityClass entityClass = entityClassOpt.get();
        if(!utilAuthContext.isAdmin() && !entityClass.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
        }
        return ApiResponse.success(HttpStatus.OK, i18n.getClass(I18N_CLASS_RETRIEVED_SINGLE), entityClass);
    }

    @Override
    @Transactional
    public ApiResponse<EntityClass> addSchedulePreferenceToClass(final String classUuid, final Integer periodId, final Integer dayOfWeek, final String preferenceType, final Boolean preferenceValue) {
        final I18n i18n = new I18n(httpServletRequest);
        Optional<EntityClass> classOpt = repositoryClass.findByUuidAndIsDeletedFalse(classUuid);
        if(!classOpt.isPresent()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getClass(I18N_CLASS_NOT_FOUND));
        }
        EntityClass entityClass = classOpt.get();
        if(!utilAuthContext.isAdmin() && !entityClass.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, "You do not have permission to modify this class");
        }
        EntitySchedulePreference preference = EntitySchedulePreference.builder()
                .periodId(periodId)
                .dayOfWeek(dayOfWeek)
                .organizationId(entityClass.getOrganizationId())
                .planSettingsId(entityClass.getPlanSettingsId())
                .createdBy(Integer.parseInt(utilAuthContext.getAuthenticatedUserId().toString()))
                .modifiedBy(Integer.parseInt(utilAuthContext.getAuthenticatedUserId().toString()))
                .isDeleted(false)
                .statusId(1)
                .build();
        switch (preferenceType.toLowerCase()) {
            case "must_not_schedule_class":
                preference.setMustNotScheduleClass(preferenceValue);
                break;
            case "must_schedule_class":
                preference.setMustScheduleClass(preferenceValue);
                break;
            case "prefers_to_schedule_class":
                preference.setPrefersToScheduleClass(preferenceValue);
                break;
            case "prefers_not_to_schedule_class":
                preference.setPrefersNotToScheduleClass(preferenceValue);
                break;
            default:
                return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getClass(I18N_CLASS_STATUS_INVALID) + preferenceType);
        }
        EntitySchedulePreference savedPref = repositorySchedulePreference.save(preference);
        if(!entityClass.getSchedulePreferences().contains(savedPref)) {
            entityClass.getSchedulePreferences().add(savedPref);
        }
        entityClass = repositoryClass.save(entityClass);
        return ApiResponse.success(HttpStatus.OK, i18n.getClass(I18N_CLASS_CREATED), entityClass);
    }

    @Override
    @Transactional
    public ApiResponse<EntityClass> updateSchedulePreference(final String preferenceUuid, final String preferenceType, final Boolean preferenceValue, final Integer periodId, final Integer dayOfWeek) {
        final I18n i18n = new I18n(httpServletRequest);
        try {
            Optional<EntitySchedulePreference> optEntityPref = repositorySchedulePreference.findByUuid(preferenceUuid);
            if(!optEntityPref.isPresent() || optEntityPref.get().getIsDeleted()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getClass(I18N_CLASS_NOT_FOUND));
            }
            EntitySchedulePreference entityPref = optEntityPref.get();
            List<EntityClass> relatedClasses = repositoryClass.findBySchedulePreferencesContaining(entityPref);
            if(!utilAuthContext.isAdmin() && !hasPermissionForClasses(relatedClasses)) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_UNAUTHORIZED));
            }
            entityPref.setMustScheduleClass(null);
            entityPref.setMustNotScheduleClass(null);
            entityPref.setPrefersToScheduleClass(null);
            entityPref.setPrefersNotToScheduleClass(null);
            switch (preferenceType.toLowerCase()) {
                case "must_not_schedule_class":
                    entityPref.setMustNotScheduleClass(preferenceValue);
                    break;
                case "must_schedule_class":
                    entityPref.setMustScheduleClass(preferenceValue);
                    break;
                case "prefers_to_schedule_class":
                    entityPref.setPrefersToScheduleClass(preferenceValue);
                    break;
                case "prefer_not_to_schedule_class":
                    entityPref.setPrefersNotToScheduleClass(preferenceValue);
                    break;
                default:
                    return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getAuth(I18N_AUTH_UNAUTHORIZED) + preferenceType);
            }
            entityPref.setModifiedDate(LocalDateTime.now());
            repositorySchedulePreference.save(entityPref);
            if(relatedClasses.isEmpty()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getClass(I18N_CLASS_NOT_FOUND));
            }
            EntityClass entityClass = relatedClasses.get(0);
            return ApiResponse.success(HttpStatus.OK, i18n.getClass(I18N_CLASS_UPDATED), entityClass);
        }catch(Exception ex) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<?> deleteClassSchedulePreference(final String uuid) {
        final I18n i18n = new I18n(httpServletRequest);
        try {
            Optional<EntitySchedulePreference> schedulePreferenceOpt = repositorySchedulePreference.findByUuid(uuid);
            if(!schedulePreferenceOpt.isPresent()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getClass(I18N_CLASS_NOT_FOUND));
            }
            EntitySchedulePreference schedulePreference = schedulePreferenceOpt.get();
            List<EntityClass> affectedClasses = repositoryClass.findBySchedulePreferencesContaining(schedulePreference);
            if(!utilAuthContext.isAdmin() && !hasPermissionForClasses(affectedClasses)) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, "You do not have permission to delete this preference");
            }
            schedulePreference.setIsDeleted(true);
            schedulePreference.setModifiedDate(LocalDateTime.now());
            repositorySchedulePreference.save(schedulePreference);
            return ApiResponse.success(HttpStatus.OK, i18n.getClass(I18N_CLASS_DELETED), null);
        }catch(Exception ex) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
        }
    }

    @Override
    public ApiResponse<List<EntityClass>> getClassAllPreferences(final String classUuid) {
        final I18n i18n = new I18n(httpServletRequest);
        Optional<EntityClass> classOpt = repositoryClass.findByUuidAndIsDeletedFalse(classUuid);
        if(!classOpt.isPresent()) {
            return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getClass(I18N_CLASS_NOT_FOUND));
        }
        EntityClass entityClass = classOpt.get();
        if(!utilAuthContext.isAdmin() && !entityClass.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, "You do not have permission to view this class");
        }
        List<EntityClass> result = new ArrayList<>();
        result.add(entityClass);
        return ApiResponse.success(HttpStatus.OK, i18n.getClass(I18N_CLASS_RETRIEVED), result);
    }

    @Override
    public ApiResponse<EntityClass> getClassPreferenceForSchedule(final String classUuid, final Integer periodId, final Integer dayOfWeek) {
        final I18n i18n = new I18n(httpServletRequest);
        try {
            Optional<EntityClass> classOpt = repositoryClass.findByUuidAndIsDeletedFalse(classUuid);
            if(!classOpt.isPresent()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getClass(I18N_CLASS_NOT_FOUND));
            }
            EntityClass entityClass = classOpt.get();
            if(!utilAuthContext.isAdmin() && !entityClass.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, "You do not have permission to view this class");
            }
            List<EntitySchedulePreference> filteredPrefs = new ArrayList<>();
            for(EntitySchedulePreference pref : entityClass.getSchedulePreferences()) {
                if(pref.getPeriodId().equals(periodId) && pref.getDayOfWeek().equals(dayOfWeek)) {
                    filteredPrefs.add(pref);
                }
            }
            entityClass.setSchedulePreferences(filteredPrefs);
            return ApiResponse.success(HttpStatus.OK, i18n.getClass(I18N_CLASS_RETRIEVED), entityClass);
        }catch(Exception ex) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
        }
    }

    @Override
    @Transactional
    public ApiResponse<?> clearClassPreferencesForSchedule(final String classUuid, final Integer periodId, final Integer dayOfWeek) {
        final I18n i18n = new I18n(httpServletRequest);
        try {
            Optional<EntityClass> classOpt = repositoryClass.findByUuidAndIsDeletedFalse(classUuid);
            if(!classOpt.isPresent()) {
                return ApiResponse.error(HttpStatus.NOT_FOUND, i18n.getClass(I18N_CLASS_NOT_FOUND));
            }
            EntityClass entityClass = classOpt.get();
            if(!utilAuthContext.isAdmin() && !entityClass.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
                return ApiResponse.error(HttpStatus.FORBIDDEN, "You do not have permission to modify this class");
            }
            List<EntitySchedulePreference> preferencesToRemove = new ArrayList<>();
            for(EntitySchedulePreference pref : entityClass.getSchedulePreferences()) {
                if(pref.getPeriodId().equals(periodId) && pref.getDayOfWeek().equals(dayOfWeek)) {
                    preferencesToRemove.add(pref);
                    pref.setIsDeleted(true);
                    repositorySchedulePreference.save(pref);
                }
            }
            entityClass.getSchedulePreferences().removeAll(preferencesToRemove);
            repositoryClass.save(entityClass);
            return ApiResponse.success(HttpStatus.OK, i18n.getClass(I18N_CLASS_DELETED), null);
        }catch(Exception ex) {
            return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
        }
    }

    private boolean isNoChange(final EntityClass entityClass, final DtoReqClassUpdate dtoReqClassUpdate) {
        return (dtoReqClassUpdate.getName() == null || dtoReqClassUpdate.getName().equals(entityClass.getName())) &&
                (dtoReqClassUpdate.getInitial() == null || dtoReqClassUpdate.getInitial().equals(entityClass.getInitial())) &&
                (dtoReqClassUpdate.getColor() == null || dtoReqClassUpdate.getColor().equals(entityClass.getColor())) &&
                (dtoReqClassUpdate.getSection() == null || dtoReqClassUpdate.getSection().equals(entityClass.getSection())) &&
                (dtoReqClassUpdate.getCapacity() == null || dtoReqClassUpdate.getCapacity().equals(entityClass.getCapacity())) &&
                (dtoReqClassUpdate.getLocationId() == null || dtoReqClassUpdate.getLocationId().equals(entityClass.getLocationId())) &&
                (dtoReqClassUpdate.getComment() == null || dtoReqClassUpdate.getComment().equals(entityClass.getDescription())) &&
                (dtoReqClassUpdate.getMinLessonsPerDay() == null || dtoReqClassUpdate.getMinLessonsPerDay().equals(entityClass.getMinLessonsPerDay())) &&
                (dtoReqClassUpdate.getMaxLessonsPerDay() == null || dtoReqClassUpdate.getMaxLessonsPerDay().equals(entityClass.getMaxLessonsPerDay())) &&
                (dtoReqClassUpdate.getLatestStartPosition() == null || dtoReqClassUpdate.getLatestStartPosition().equals(entityClass.getLatestStartPosition())) &&
                (dtoReqClassUpdate.getEarliestEnd() == null || dtoReqClassUpdate.getEarliestEnd().equals(entityClass.getEarliestEnd())) &&
                (dtoReqClassUpdate.getMaxFreePeriods() == null || dtoReqClassUpdate.getMaxFreePeriods().equals(entityClass.getMaxFreePeriods())) &&
                (dtoReqClassUpdate.getMainTeacher() == null || Objects.equals(entityClass.getMainTeacher(), dtoReqClassUpdate.getMainTeacher())) &&
                (dtoReqClassUpdate.getPresentEveryDay() == null || Objects.equals(entityClass.getPresentEveryDay(), dtoReqClassUpdate.getPresentEveryDay())) &&
                (dtoReqClassUpdate.getControlNumber() == null || Objects.equals(entityClass.getControlNumber(), dtoReqClassUpdate.getControlNumber())) &&
                (dtoReqClassUpdate.getPlanSettingsId() == null || Objects.equals(entityClass.getPlanSettingsId(), dtoReqClassUpdate.getPlanSettingsId())) &&
                dtoReqClassUpdate.getModifiedBy().equals(entityClass.getModifiedBy());
    }

    private EntityClass updateClassFields(final EntityClass entityClass, final DtoReqClassUpdate dtoReqClassUpdate) {
        if(dtoReqClassUpdate.getName() != null) entityClass.setName(dtoReqClassUpdate.getName());
        if(dtoReqClassUpdate.getInitial() != null) entityClass.setInitial(dtoReqClassUpdate.getInitial());
        if(dtoReqClassUpdate.getColor() != null) entityClass.setColor(dtoReqClassUpdate.getColor());
        if(dtoReqClassUpdate.getSection() != null) entityClass.setSection(dtoReqClassUpdate.getSection());
        if(dtoReqClassUpdate.getCapacity() != null) entityClass.setCapacity(dtoReqClassUpdate.getCapacity());
        if(dtoReqClassUpdate.getLocationId() != null) entityClass.setLocationId(dtoReqClassUpdate.getLocationId());
        if(dtoReqClassUpdate.getComment() != null) entityClass.setDescription(dtoReqClassUpdate.getComment());
        if(dtoReqClassUpdate.getMinLessonsPerDay() != null) entityClass.setMinLessonsPerDay(dtoReqClassUpdate.getMinLessonsPerDay());
        if(dtoReqClassUpdate.getMaxLessonsPerDay() != null) entityClass.setMaxLessonsPerDay(dtoReqClassUpdate.getMaxLessonsPerDay());
        if(dtoReqClassUpdate.getLatestStartPosition() != null) entityClass.setLatestStartPosition(dtoReqClassUpdate.getLatestStartPosition());
        if(dtoReqClassUpdate.getEarliestEnd() != null) entityClass.setEarliestEnd(dtoReqClassUpdate.getEarliestEnd());
        if(dtoReqClassUpdate.getMaxFreePeriods() != null) entityClass.setMaxFreePeriods(dtoReqClassUpdate.getMaxFreePeriods());
        if(dtoReqClassUpdate.getMainTeacher() != null) entityClass.setMainTeacher(dtoReqClassUpdate.getMainTeacher());
        if(dtoReqClassUpdate.getPresentEveryDay() != null) entityClass.setPresentEveryDay(dtoReqClassUpdate.getPresentEveryDay());
        if(dtoReqClassUpdate.getControlNumber() != null) entityClass.setControlNumber(dtoReqClassUpdate.getControlNumber());
        if(dtoReqClassUpdate.getPlanSettingsId() != null) entityClass.setPlanSettingsId(dtoReqClassUpdate.getPlanSettingsId());
        entityClass.setModifiedDate(LocalDateTime.now());
        entityClass.setModifiedBy(utilAuthContext.getAuthenticatedUserId().toString());
        return repositoryClass.save(entityClass);
    }

    private int getAdjustedMaxPeriods(Integer organizationId, Integer plansettingId) {
        Optional<EntityPlanSetting> planSettingOpt = repositoryPlanSetting.findByOrganizationIdAndIdAndIsDeletedFalse(String.valueOf(organizationId), plansettingId);
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

    private boolean hasPermissionForClasses(List<EntityClass> classes) {
        if(classes == null || classes.isEmpty()) {
            return false;
        }
        Integer userOrgId = utilAuthContext.getCurrentUser().getOrganization().getId();
        return classes.stream().anyMatch(cls -> cls.getOrganizationId().equals(userOrgId));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<EntityClass>> getClassesByPlanSettingsId(Integer planSettingsId) {
        final I18n i18n = new I18n(httpServletRequest);
        
        if (planSettingsId == null) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getClass(I18N_PLAN_NOT_FOUND));
        }
        
        List<EntityClass> classes = repositoryClass.findByPlanSettingsIdAndIsDeletedFalse(planSettingsId, PageRequest.of(0, 1000)).getContent();
        
        return ApiResponse.success(HttpStatus.OK, i18n.getClass(I18N_CLASS_RETRIEVED), classes);
    }
}
