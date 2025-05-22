package com.ist.timetabling.binding.service.impl;

import com.ist.timetabling.Auth.util.UtilAuthContext;
import com.ist.timetabling.Class.dto.res.DtoResClass;
import com.ist.timetabling.ClassBand.entity.EntityClassBand;
import com.ist.timetabling.ClassBand.repository.RepositoryClassBand;
import com.ist.timetabling.Core.exception.ExceptionCoreNotFound;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.Core.util.PaginationUtil;
import com.ist.timetabling.Organization.entity.EntityOrganization;
import com.ist.timetabling.Organization.repository.RepositoryOrganization;
import com.ist.timetabling.Period.dto.res.DtoResPeriod;
import com.ist.timetabling.Room.dto.res.DtoResRoom;
import com.ist.timetabling.Rule.entity.EntityRule;
import com.ist.timetabling.Rule.repository.RepositoryRule;
import com.ist.timetabling.Teacher.entity.EntityTeacherProfile;
import com.ist.timetabling.Teacher.repository.RepositoryTeacherProfile;
import com.ist.timetabling.Class.entity.EntityClass;
import com.ist.timetabling.Class.repository.RepositoryClass;
import com.ist.timetabling.Subject.entity.EntitySubject;
import com.ist.timetabling.Subject.repository.RepositorySubject;
import com.ist.timetabling.Room.entity.EntityRoom;
import com.ist.timetabling.Room.repository.RepositoryRoom;
import com.ist.timetabling.User.entity.EntityUser;
import com.ist.timetabling.User.repository.RepositoryUser;
import com.ist.timetabling.binding.Exception.ExceptionBindingBadRequest;
import com.ist.timetabling.binding.Exception.ExceptionBindingForbidden;
import com.ist.timetabling.binding.dto.req.DtoReqBinding;
import com.ist.timetabling.binding.dto.req.DtoReqBindingSearch;
import com.ist.timetabling.binding.dto.req.DtoReqBindingReplace;
import com.ist.timetabling.binding.dto.req.DtoReqBindingUpdate;
import com.ist.timetabling.binding.dto.res.DtoResBinding;
import com.ist.timetabling.binding.dto.res.DtoResBindingReplaceResult;
import com.ist.timetabling.binding.entity.EntityBinding;
import com.ist.timetabling.binding.repository.RepositoryBinding;
import com.ist.timetabling.binding.service.ServiceBinding;
import com.ist.timetabling.binding.util.BindingValidationUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static com.ist.timetabling.Auth.constant.ConstantI18nAuth.*;
import static com.ist.timetabling.binding.constant.ConstantBindingI18n.*;
import com.ist.timetabling.PlanSetting.entity.EntityPlanSetting;
import com.ist.timetabling.PlanSetting.repository.RepositoryPlanSetting;

@Service
public class ServiceBindingImpl implements ServiceBinding {
    private static final int DEFAULT_PAGE_SIZE = 10;
    private static final int DEFAULT_PAGE_NUMBER = 0;

    private final RepositoryBinding repositoryBinding;
    private final RepositoryRule repositoryRule;
    private final RepositoryTeacherProfile repositoryTeacherProfile;
    private final RepositoryClass repositoryClass;
    private final RepositoryClassBand repositoryClassBand;
    private final RepositorySubject repositorySubject;
    private final RepositoryRoom repositoryRoom;
    private final HttpServletRequest httpServletRequest;
    private final UtilAuthContext utilAuthContext;
    private final RepositoryUser repositoryUser;
    private final I18n i18n;
    private final RepositoryOrganization repositoryOrganization;
    private final BindingValidationUtil bindingValidationUtil;
    private final RepositoryPlanSetting repositoryPlanSetting;

    public ServiceBindingImpl(
            RepositoryBinding repositoryBinding,
            RepositoryRule repositoryRule,
            RepositoryTeacherProfile repositoryTeacherProfile,
            RepositoryClass repositoryClass,
            RepositoryClassBand repositoryClassBand,
            RepositorySubject repositorySubject,
            RepositoryRoom repositoryRoom,
            HttpServletRequest httpServletRequest,
            UtilAuthContext utilAuthContext,
            RepositoryUser repositoryUser,
            I18n i18n,
            RepositoryOrganization repositoryOrganization,
            BindingValidationUtil bindingValidationUtil,
            RepositoryPlanSetting repositoryPlanSetting) {
        this.repositoryBinding = repositoryBinding;
        this.repositoryRule = repositoryRule;
        this.repositoryTeacherProfile = repositoryTeacherProfile;
        this.repositoryClass = repositoryClass;
        this.repositoryClassBand = repositoryClassBand;
        this.repositorySubject = repositorySubject;
        this.repositoryRoom = repositoryRoom;
        this.httpServletRequest = httpServletRequest;
        this.utilAuthContext = utilAuthContext;
        this.repositoryUser = repositoryUser;
        this.i18n = i18n;
        this.repositoryOrganization = repositoryOrganization;
        this.bindingValidationUtil = bindingValidationUtil;
        this.repositoryPlanSetting = repositoryPlanSetting;
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<DtoResBinding> getBindingByUuid(final String uuid) {
        I18n i18n = new I18n(httpServletRequest);

        if(uuid == null || uuid.trim().isEmpty()) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_UUID));
        }

        EntityBinding entityBinding = repositoryBinding.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getBinding(I18N_BINDING_NOT_FOUND)));

        if(!utilAuthContext.isAdmin() &&
                !entityBinding.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
            throw new ExceptionBindingForbidden(i18n.getBinding(I18N_AUTH_UNAUTHORIZED));
        }

        DtoResBinding dtoResBinding = mapEntityToDto(entityBinding);
        return ApiResponse.success(HttpStatus.OK, i18n.getBinding(I18N_BINDING_RETRIEVED), dtoResBinding);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DtoResBinding>> getAllBindings(final Integer page, final Integer size, final String sortBy, final String sortDirection, final String keyword, String orgId, final String teacherUuid, final Integer planSettingsId) {
        I18n i18n = new I18n(httpServletRequest);
        // Map frontend sortBy to valid EntityBinding property
        String mappedSortBy = sortBy;
        if (sortBy != null) {
            switch (sortBy) {
                case "teacher_name":
                    mappedSortBy = "teacherId";
                    break;
                case "subject_name":
                    mappedSortBy = "subjectId";
                    break;
                case "class_name":
                    mappedSortBy = "classId";
                    break;
                case "room_name":
                    mappedSortBy = "roomId";
                    break;
                default:
                    mappedSortBy = sortBy;
            }
        } else {
            mappedSortBy = "teacherId";
        }
        Pageable pageable = PaginationUtil.createPageable(page, size, mappedSortBy, sortDirection, DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE);

        Integer organizationId = null;
        if(utilAuthContext.isAdmin()) {
            if(orgId != null && !orgId.trim().isEmpty()) {
                Optional<EntityOrganization> entityOrganization = repositoryOrganization.findById(Integer.valueOf(orgId));
                if(entityOrganization.isPresent()) {
                    organizationId = entityOrganization.get().getId();
                }else {
                    throw new ExceptionCoreNotFound(i18n.getBinding(I18N_BINDING_ORGANIZATION_NOT_FOUND));
                }
            }
        }else {
            organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
        }

        Integer teacherId = null;
        if(teacherUuid != null && !teacherUuid.trim().isEmpty()) {
            try {
                teacherId = getTeacherProfileIdFromUserUuid(teacherUuid);
            }catch(Exception e) {
            }
        }

        Page<EntityBinding> pageData;

        // --- PLAN SETTINGS FILTERING LOGIC ---
        if (planSettingsId != null) {
            if (keyword != null && !keyword.trim().isEmpty() && organizationId != null) {
                // Use native query for keyword + org + planSettingsId
                List<EntityBinding> bindings = repositoryBinding.searchByKeywordAndPlanSettingsIdAndOrganizationId(keyword, planSettingsId, organizationId);
                pageData = PaginationUtil.toPage(bindings, pageable);
            } else if (teacherId != null && organizationId != null) {
                pageData = repositoryBinding.findByTeacherIdAndOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(teacherId, organizationId, planSettingsId, pageable);
            } else if (organizationId != null) {
                pageData = repositoryBinding.findByOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(organizationId, planSettingsId, pageable);
            } else {
                pageData = repositoryBinding.findByPlanSettingsIdAndIsDeletedFalse(planSettingsId, pageable);
            }
        } else {
            if(keyword != null && !keyword.trim().isEmpty() && organizationId != null) {
                pageData = repositoryBinding.searchByKeywordAndOrganizationId(keyword, organizationId, pageable);
            } else if(teacherId != null && organizationId != null) {
                pageData = repositoryBinding.findByTeacherIdAndOrganizationIdAndIsDeletedFalse(
                        teacherId, organizationId, pageable);
            } else if(organizationId != null) {
                pageData = repositoryBinding.findByOrganizationIdAndIsDeletedFalse(organizationId, pageable);
            } else if(utilAuthContext.isAdmin()) {
                pageData = repositoryBinding.findByOrganizationIdAndIsDeletedFalse(organizationId, pageable);
            }else {
                pageData = Page.empty(pageable);
            }
        }

        List<DtoResBinding> dtos = pageData.getContent().stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());

        return ApiResponse.<List<DtoResBinding>>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .time(System.currentTimeMillis())
                .language(LocaleContextHolder.getLocale().getLanguage())
                .message(i18n.getBinding(I18N_BINDING_RETRIEVED_ALL))
                .totalPages(pageData.getTotalPages())
                .totalItems(pageData.getTotalElements())
                .currentPage(pageData.getNumber())
                .hasNext(pageData.hasNext())
                .hasPrevious(pageData.hasPrevious())
                .data(dtos)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DtoResBinding>> searchBindingsByName(final String keyword) {
        I18n i18n = new I18n(httpServletRequest);
        if(keyword == null || keyword.trim().isEmpty()) {
            throw new ExceptionBindingBadRequest(i18n.get(I18N_BINDING_INVALID_SEARCH));
        }
        Pageable pageable = PaginationUtil.createPageable(DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, "id", "asc", DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE);
        Integer orgFilter = utilAuthContext.isAdmin() ? null : utilAuthContext.getCurrentUser().getOrganization().getId();
        Page<EntityBinding> searchResults = repositoryBinding.searchByKeywordAndOrganizationId(keyword, orgFilter, pageable);
        List<DtoResBinding> dtos = searchResults.getContent().stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
        return ApiResponse.<List<DtoResBinding>>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .message(i18n.getBinding(I18N_BINDING_SEARCH_RESULTS))
                .data(dtos)
                .totalItems(searchResults.getTotalElements())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DtoResBinding>> getBindingsByStatus(final Integer statusId, final Integer page, final Integer size) {
        I18n i18n = new I18n(httpServletRequest);

        if(statusId == null) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_STATUS));
        }

        Pageable pageable = PaginationUtil.createPageable(page, size, DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE);
        Integer orgFilter = utilAuthContext.isAdmin() ? null : utilAuthContext.getCurrentUser().getOrganization().getId();

        Page<EntityBinding> pageData = utilAuthContext.isAdmin()
                ? repositoryBinding.findByStatusIdAndIsDeletedFalse(statusId, pageable)
                : repositoryBinding.findByStatusIdAndOrganizationIdAndIsDeletedFalse(statusId, orgFilter, pageable);

        List<DtoResBinding> dtos = pageData.getContent().stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());

        return ApiResponse.<List<DtoResBinding>>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .time(System.currentTimeMillis())
                .language(LocaleContextHolder.getLocale().getLanguage())
                .message(i18n.getBinding(I18N_BINDING_RETRIEVED_STATUS))
                .totalPages(pageData.getTotalPages())
                .totalItems(pageData.getTotalElements())
                .currentPage(pageData.getNumber())
                .hasNext(pageData.hasNext())
                .hasPrevious(pageData.hasPrevious())
                .data(dtos)
                .build();
    }

    @Override
    @Transactional
    public ApiResponse<DtoResBinding> createBinding(DtoReqBinding dtoReqBinding) {
        I18n i18n = new I18n(httpServletRequest);

        // Validate basic request
        validateBindingRequest(dtoReqBinding, i18n);

        EntityOrganization entityOrganization = repositoryOrganization.findEntityOrganizationByUuid(dtoReqBinding.getOrganizationUuid());
        if(entityOrganization == null) {
            throw new ExceptionCoreNotFound(i18n.getBinding(I18N_BINDING_ORGANIZATION_NOT_FOUND));
        }

        Integer organizationId = entityOrganization.getId();

        // Use the enhanced validation utility
        bindingValidationUtil.validateBindingCreation(dtoReqBinding, i18n, organizationId);

        Integer teacherProfileId = getTeacherProfileIdFromUserUuid(dtoReqBinding.getTeacherUuid());
        Integer subjectId = getSubjectIdFromUuid(dtoReqBinding.getSubjectUuid());
        Integer roomId = getRoomIdFromUuid(dtoReqBinding.getRoomUuid());

        // Validate workload constraints
        Integer currentPeriods = getTeacherTotalPeriodsByPlanSettings(dtoReqBinding.getTeacherUuid(), dtoReqBinding.getPlanSettingsId());
        Optional<EntityTeacherProfile> teacherProfile = repositoryTeacherProfile.findById(teacherProfileId);

        // Get the actual max periods from plan settings instead of using a hardcoded value
        int maxWeeklyHours = 35; // Default fallback value
        if (dtoReqBinding.getPlanSettingsId() != null) {
            try {
                // Assuming there's a repository method to find plan settings by ID
                Optional<EntityPlanSetting> planSetting = repositoryPlanSetting.findById(dtoReqBinding.getPlanSettingsId());
                if (planSetting.isPresent()) {
                    maxWeeklyHours = planSetting.get().getPeriodsPerDay() * planSetting.get().getDaysPerWeek();
                }
            } catch (Exception e) {
                System.err.println("Error getting plan settings: " + e.getMessage());
            }
        } else if (teacherProfile.isPresent() && teacherProfile.get().getMaxDailyHours() != null) {
            maxWeeklyHours = teacherProfile.get().getMaxDailyHours() * 5;
        }

        if(currentPeriods + dtoReqBinding.getPeriodsPerWeek() > maxWeeklyHours) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_TEACHER_WORKLOAD_EXCEEDED));
        }

        EntityBinding entityBinding = new EntityBinding();
        entityBinding.setUuid(UUID.randomUUID().toString());
        entityBinding.setOrganizationId(organizationId);
        entityBinding.setTeacherId(teacherProfileId);
        entityBinding.setSubjectId(subjectId);
        entityBinding.setRoomId(roomId);
        entityBinding.setPeriodsPerWeek(dtoReqBinding.getPeriodsPerWeek());
        entityBinding.setIsFixed(dtoReqBinding.getIsFixed());
        entityBinding.setPriority(dtoReqBinding.getPriority());
        entityBinding.setNotes(dtoReqBinding.getNotes());
        entityBinding.setStatusId(dtoReqBinding.getStatusId());
        entityBinding.setCreatedBy(utilAuthContext.getAuthenticatedUserId());
        entityBinding.setModifiedBy(utilAuthContext.getAuthenticatedUserId());
        entityBinding.setIsDeleted(false);
        entityBinding.setPlanSettingsId(dtoReqBinding.getPlanSettingsId() != null ? dtoReqBinding.getPlanSettingsId() : 0);

        boolean hasClass = dtoReqBinding.getClassUuid() != null && !dtoReqBinding.getClassUuid().isEmpty();
        boolean hasClassBand = dtoReqBinding.getClassBandUuid() != null && !dtoReqBinding.getClassBandUuid().isEmpty();


        if(!hasClass && !hasClassBand) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_EITHER_CLASS_OR_CLASS_BAND));
        }

//        if(!bindingValidationUtil.validateTotalPeriodsAgainstScheduleCount(
//                organizationId,
//                dtoReqBinding.getPeriodsPerWeek(),
//                getTeacherTotalPeriods(dtoReqBinding.getTeacherUuid()))) {
//            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_EXCEEDS_AVAILABLE_SCHEDULES));
//        }

        if(hasClass) {
            entityBinding.setClassId(getClassIdFromUuid(dtoReqBinding.getClassUuid()));
            entityBinding.setClassBandId(null);

            // Check for duplicate teacher-subject-class binding
            if(teacherProfileId != null && subjectId != null && entityBinding.getClassId() != null) {
                Integer count = repositoryBinding.countByTeacherIdAndSubjectIdAndClassIdAndIsDeletedFalse(
                        teacherProfileId, subjectId, entityBinding.getClassId());
                if(count > 0) {
                    throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_DUPLICATE_TEACHER_SUBJECT_CLASS));
                }
            }
        }else {
            entityBinding.setClassId(null);
            entityBinding.setClassBandId(getClassBandIdFromUuid(dtoReqBinding.getClassBandUuid()));

            // Check for duplicate teacher-subject-classband binding
            if(dtoReqBinding.getTeacherUuid() != null && dtoReqBinding.getSubjectUuid() != null && dtoReqBinding.getClassBandUuid() != null) {
                List<EntityBinding> existingBindings = repositoryBinding.findByTeacherUuidAndSubjectUuidAndClassBandUuidAndIsDeletedFalse(
                        dtoReqBinding.getTeacherUuid(), dtoReqBinding.getSubjectUuid(), dtoReqBinding.getClassBandUuid());
                if(!existingBindings.isEmpty()) {
                    throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_DUPLICATE_TEACHER_SUBJECT_CLASSBAND));
                }
            }
        }

        // Process rules
        if(dtoReqBinding.getRuleUuids() != null && !dtoReqBinding.getRuleUuids().isEmpty()) {
            List<EntityRule> rules = new ArrayList<>();
            for(String ruleUuid : dtoReqBinding.getRuleUuids()) {
                EntityRule rule = repositoryRule.findByUuidAndIsDeletedFalse(ruleUuid)
                        .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getBinding(I18N_BINDING_RULE_NOT_FOUND)));
                rules.add(rule);
            }
            entityBinding.setRules(rules);
        }

        EntityBinding saved = repositoryBinding.save(entityBinding);
        return ApiResponse.success(HttpStatus.CREATED, i18n.getBinding(I18N_BINDING_CREATED), mapEntityToDto(saved));
    }


    @Override
    @Transactional
    public ApiResponse<DtoResBinding> updateBindingByUuid(final String uuid, final DtoReqBindingUpdate dtoReqBindingUpdate) {
        Optional<EntityBinding> entityBinding=repositoryBinding.findByUuidAndIsDeletedFalse(uuid);
        Integer organizationId=entityBinding.get().getOrganizationId();
        I18n i18n = new I18n(httpServletRequest);

        if(uuid == null || uuid.trim().isEmpty()) {
            throw new ExceptionBindingBadRequest(i18n.get(I18N_BINDING_INVALID_UUID));
        }

        EntityBinding binding = repositoryBinding.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getBinding(I18N_BINDING_NOT_FOUND)));

        // Check authorization
        if(!utilAuthContext.isAdmin() &&
                !binding.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
            throw new ExceptionBindingForbidden(i18n.getBinding(I18N_AUTH_UNAUTHORIZED));
        }

        DtoReqBinding fullRequest = buildFullRequestFromUpdate(binding, dtoReqBindingUpdate);

//        if(!bindingValidationUtil.validateTotalPeriodsAgainstScheduleCount(
//                organizationId,
//                dtoReqBindingUpdate.getPeriodsPerWeek(),
//                getTeacherTotalPeriods(dtoReqBindingUpdate.getTeacherUuid()))) {
//            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_EXCEEDS_AVAILABLE_SCHEDULES));
//        }
        bindingValidationUtil.validateBindingUpdate(fullRequest, uuid, i18n, binding.getOrganizationId());

        Integer newTeacherId = binding.getTeacherId();
        if(dtoReqBindingUpdate.getTeacherUuid() != null) {
            newTeacherId = getTeacherProfileIdFromUserUuid(dtoReqBindingUpdate.getTeacherUuid());
            binding.setTeacherId(newTeacherId);
        }

        // Handle subject update
        Integer newSubjectId = binding.getSubjectId();
        if(dtoReqBindingUpdate.getSubjectUuid() != null) {
            newSubjectId = getSubjectIdFromUuid(dtoReqBindingUpdate.getSubjectUuid());
            binding.setSubjectId(newSubjectId);
        }

        boolean classUpdated = dtoReqBindingUpdate.getClassUuid() != null;
        boolean classBandUpdated = dtoReqBindingUpdate.getClassBandUuid() != null;

        Integer newClassId = binding.getClassId();
        Integer newClassBandId = binding.getClassBandId();

        if(classUpdated) {
            newClassId = getClassIdFromUuid(dtoReqBindingUpdate.getClassUuid());
            binding.setClassId(newClassId);
            binding.setClassBandId(null);
            newClassBandId = null;
        }

        if(classBandUpdated) {
            newClassBandId = getClassBandIdFromUuid(dtoReqBindingUpdate.getClassBandUuid());
            binding.setClassBandId(newClassBandId);
            binding.setClassId(null);
            newClassId = null;
        }

        // Check for duplicate bindings after updates
        if(newClassId != null) {
            Integer count = repositoryBinding.countByTeacherIdAndSubjectIdAndClassIdAndUuidNotAndIsDeletedFalse(
                    newTeacherId, newSubjectId, newClassId, uuid);
            if(count > 0) {
                throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_DUPLICATE_TEACHER_SUBJECT_CLASS));
            }
        } else if(newClassBandId != null) {
            Integer count = repositoryBinding.countByTeacherIdAndSubjectIdAndClassBandIdAndUuidNotAndIsDeletedFalse(
                    newTeacherId, newSubjectId, newClassBandId, uuid);
            if(count > 0) {
                throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_DUPLICATE_TEACHER_SUBJECT_CLASSBAND));
            }
        }

        if(dtoReqBindingUpdate.getRoomUuid() != null) {
            binding.setRoomId(getRoomIdFromUuid(dtoReqBindingUpdate.getRoomUuid()));
        }

        if(dtoReqBindingUpdate.getPeriodsPerWeek() != null) {
            int additionalPeriods = dtoReqBindingUpdate.getPeriodsPerWeek() - binding.getPeriodsPerWeek();
            if(additionalPeriods > 0) {
                String teacherUuid = dtoReqBindingUpdate.getTeacherUuid();
                Integer planSettingsId = dtoReqBindingUpdate.getPlanSettingsId() != null ? dtoReqBindingUpdate.getPlanSettingsId() : binding.getPlanSettingsId();
                if(teacherUuid == null) {
                    Optional<EntityTeacherProfile> teacherProfile = repositoryTeacherProfile.findById(binding.getTeacherId());
                    if(teacherProfile.isPresent()) {
                        Optional<EntityUser> teacher = repositoryUser.findById(teacherProfile.get().getUserId());
                        if(teacher.isPresent()) {
                            teacherUuid = teacher.get().getUuid();
                        }
                    }
                }
                Integer currentPeriods = getTeacherTotalPeriodsByPlanSettings(teacherUuid, planSettingsId);

                // Get the actual max periods from plan settings instead of using a hardcoded value
                int maxWeeklyHours = 35; // Default fallback value
                if (planSettingsId != null) {
                    try {
                        // Assuming there's a repository method to find plan settings by ID
                        Optional<EntityPlanSetting> planSetting = repositoryPlanSetting.findById(planSettingsId);
                        if (planSetting.isPresent()) {
                            // Calculate max periods from plan settings: periodsPerDay * daysPerWeek
                            maxWeeklyHours = planSetting.get().getPeriodsPerDay() * planSetting.get().getDaysPerWeek();
                        }
                    } catch (Exception e) {
                        // Log error but continue with default value
                        System.err.println("Error getting plan settings: " + e.getMessage());
                    }
                } else {
                    // Fallback to teacher's max daily hours if available
                    Optional<EntityTeacherProfile> teacherProfile = repositoryTeacherProfile.findById(newTeacherId);
                    if (teacherProfile.isPresent() && teacherProfile.get().getMaxDailyHours() != null) {
                        maxWeeklyHours = teacherProfile.get().getMaxDailyHours() * 5;
                    }
                }

                if(currentPeriods + additionalPeriods > maxWeeklyHours) {
                    throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_TEACHER_WORKLOAD_EXCEEDED));
                }
            }
            binding.setPeriodsPerWeek(dtoReqBindingUpdate.getPeriodsPerWeek());
        }

        if(dtoReqBindingUpdate.getIsFixed() != null) {
            binding.setIsFixed(dtoReqBindingUpdate.getIsFixed());
        }

        if(dtoReqBindingUpdate.getPriority() != null) {
            binding.setPriority(dtoReqBindingUpdate.getPriority());
        }

        if(dtoReqBindingUpdate.getPlanSettingsId() != null) {
            binding.setPlanSettingsId(dtoReqBindingUpdate.getPlanSettingsId());
        }

        if(dtoReqBindingUpdate.getNotes() != null) {
            binding.setNotes(dtoReqBindingUpdate.getNotes());
        }

        if(dtoReqBindingUpdate.getStatusId() != null) {
            binding.setStatusId(dtoReqBindingUpdate.getStatusId());
        }

        if(dtoReqBindingUpdate.getRuleUuids() != null) {
            List<EntityRule> rules = new ArrayList<>();
            for(String ruleUuid : dtoReqBindingUpdate.getRuleUuids()) {
                if(ruleUuid == null || ruleUuid.trim().isEmpty()) {
                    continue;
                }
                EntityRule rule = repositoryRule.findByUuidAndIsDeletedFalse(ruleUuid)
                        .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getBinding(I18N_BINDING_RULE_NOT_FOUND)));

                if(!utilAuthContext.isAdmin() && !rule.getOrganizationId().equals(binding.getOrganizationId())) {
                    throw new ExceptionBindingForbidden(i18n.getBinding(I18N_AUTH_UNAUTHORIZED));
                }

                rules.add(rule);
            }
            binding.setRules(rules);
        }

        binding.setModifiedBy(utilAuthContext.getAuthenticatedUserId());
        binding.setModifiedDate(LocalDateTime.now());

        EntityBinding updatedBinding = repositoryBinding.save(binding);
        return ApiResponse.success(HttpStatus.OK, i18n.getBinding(I18N_BINDING_UPDATED), mapEntityToDto(updatedBinding));
    }

    @Override
    @Transactional
    public ApiResponse<Void> deleteBindingByUuid(String uuid) {
        I18n i18n = new I18n(httpServletRequest);

        if(uuid == null || uuid.trim().isEmpty()) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_UUID));
        }

        EntityBinding binding = repositoryBinding.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.get(I18N_BINDING_NOT_FOUND)));

        if(!utilAuthContext.isAdmin() &&
                !binding.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
            throw new ExceptionBindingForbidden(i18n.getBinding(I18N_AUTH_UNAUTHORIZED));
        }

        binding.setIsDeleted(true);
        binding.setModifiedBy(utilAuthContext.getAuthenticatedUserId());
        binding.setModifiedDate(LocalDateTime.now());
        repositoryBinding.save(binding);

        return ApiResponse.success(HttpStatus.OK, i18n.getBinding(I18N_BINDING_DELETED), null);
    }


    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DtoResBinding>> getTeacherBindings(String teacherUuid) {
        return getTeacherBindings(teacherUuid, null);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DtoResBinding>> getClassBindings(String classUuid) {
        return getClassBindings(classUuid, null);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DtoResBinding>> getRoomBindings(final String roomUuid) {
        return getRoomBindings(roomUuid, null);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DtoResBinding>> getSubjectBindings(final String subjectUuid) {
        return getSubjectBindings(subjectUuid, null);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DtoResBinding>> getTeacherBindings(String teacherUuid, Integer planSettingsId) {
        I18n i18n = new I18n(httpServletRequest);

        if(teacherUuid == null || teacherUuid.trim().isEmpty()) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_TEACHER_UUID));
        }

        Integer teacherProfileId = getTeacherProfileIdFromUserUuid(teacherUuid);

        List<EntityBinding> bindings;
        if (planSettingsId != null) {
            // Filter bindings by planSettingsId if provided
            bindings = repositoryBinding.findByTeacherIdAndIsDeletedFalse(teacherProfileId)
                .stream()
                .filter(binding -> planSettingsId.equals(binding.getPlanSettingsId()))
                .collect(Collectors.toList());
        } else {
            // Get all bindings if no planSettingsId is provided
            bindings = repositoryBinding.findByTeacherIdAndIsDeletedFalse(teacherProfileId);
        }

        List<DtoResBinding> dtos = bindings.stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());

        return ApiResponse.success(HttpStatus.OK, i18n.getBinding(I18N_BINDING_RETRIEVED), dtos);
    }

    @Override
    public Integer getTeacherTotalPeriods(final String teacherUuid) {
        if(teacherUuid == null || teacherUuid.trim().isEmpty()) {
            return 0;
        }

        Integer teacherProfileId;
        try {
            teacherProfileId = getTeacherProfileIdFromUserUuid(teacherUuid);
        }catch(Exception e) {
            return 0;
        }

        if(teacherProfileId == null) {
            return 0;
        }

        Integer periods = repositoryBinding.getTeacherWorkloadTotalPeriods(teacherProfileId);
        return periods != null ? periods : 0;
    }

    @Override
    @Transactional
    public ApiResponse<DtoResBinding> addRuleToBinding(final String bindingUuid, final String ruleUuid) {
        I18n i18n = new I18n(httpServletRequest);

        if(bindingUuid == null || bindingUuid.trim().isEmpty()) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_UUID));
        }

        if(ruleUuid == null || ruleUuid.trim().isEmpty()) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_RULE_UUID));
        }

        EntityBinding entityBinding = repositoryBinding.findByUuidAndIsDeletedFalse(bindingUuid)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getBinding(I18N_BINDING_NOT_FOUND)));

        if(!utilAuthContext.isAdmin() &&
                !entityBinding.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
            throw new ExceptionBindingForbidden(i18n.getBinding(I18N_AUTH_UNAUTHORIZED));
        }

        EntityRule rule = repositoryRule.findByUuidAndIsDeletedFalse(ruleUuid)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.get(I18N_BINDING_RULE_NOT_FOUND)));

        if(!utilAuthContext.isAdmin() && !rule.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
            throw new ExceptionBindingForbidden(i18n.getBinding(I18N_AUTH_UNAUTHORIZED));
        }

        if(!entityBinding.getRules().contains(rule)) {
            entityBinding.getRules().add(rule);
            entityBinding.setModifiedBy(utilAuthContext.getAuthenticatedUserId());
            entityBinding.setModifiedDate(LocalDateTime.now());
            entityBinding = repositoryBinding.save(entityBinding);
        }

        return ApiResponse.success(HttpStatus.OK, i18n.getBinding(I18N_BINDING_UPDATED), mapEntityToDto(entityBinding));
    }

    @Override
    @Transactional
    public ApiResponse<DtoResBinding> removeRuleFromBinding(final String bindingUuid, final String ruleUuid) {
        I18n i18n = new I18n(httpServletRequest);

        if(bindingUuid == null || bindingUuid.trim().isEmpty()) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_UUID));
        }

        if(ruleUuid == null || ruleUuid.trim().isEmpty()) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_RULE_UUID));
        }

        EntityBinding entityBinding = repositoryBinding.findByUuidAndIsDeletedFalse(bindingUuid)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.get(I18N_BINDING_NOT_FOUND)));

        if(!utilAuthContext.isAdmin() &&
                !entityBinding.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
            throw new ExceptionBindingForbidden(i18n.getBinding(I18N_AUTH_UNAUTHORIZED));
        }

        EntityRule rule = repositoryRule.findByUuidAndIsDeletedFalse(ruleUuid)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getBinding(I18N_BINDING_RULE_NOT_FOUND)));

        if(entityBinding.getRules().remove(rule)) {
            entityBinding.setModifiedBy(utilAuthContext.getAuthenticatedUserId());
            entityBinding.setModifiedDate(LocalDateTime.now());
            entityBinding = repositoryBinding.save(entityBinding);
        }

        return ApiResponse.success(HttpStatus.OK, i18n.getBinding(I18N_BINDING_UPDATED), mapEntityToDto(entityBinding));
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DtoResBinding>> getClassBindings(String classUuid, Integer planSettingsId) {
        I18n i18n = new I18n(httpServletRequest);

        if(classUuid == null || classUuid.trim().isEmpty()) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_CLASS_UUID));
        }

        Integer classId = getClassIdFromUuid(classUuid);

        List<EntityBinding> bindings;
        if (planSettingsId != null) {
            // Filter bindings by planSettingsId if provided
            bindings = repositoryBinding.findByClassIdAndIsDeletedFalse(classId)
                .stream()
                .filter(binding -> planSettingsId.equals(binding.getPlanSettingsId()))
                .collect(Collectors.toList());
        } else {
            // Get all bindings if no planSettingsId is provided
            bindings = repositoryBinding.findByClassIdAndIsDeletedFalse(classId);
        }

        List<DtoResBinding> dtos = bindings.stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());

        return ApiResponse.success(HttpStatus.OK, i18n.getBinding(I18N_BINDING_RETRIEVED), dtos);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DtoResBinding>> getClassBandBindings(final String classBandUuid) {
        I18n i18n = new I18n(httpServletRequest);

        if(classBandUuid == null || classBandUuid.trim().isEmpty()) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_CLASSBAND_UUID));
        }

        // Use the new repository method to fetch by classBandUuid directly
        List<EntityBinding> bindings = repositoryBinding.findByClassBandUuidAndIsDeletedFalse(classBandUuid);
        List<DtoResBinding> dtos = bindings.stream().map(this::mapEntityToDto).collect(Collectors.toList());
        return ApiResponse.success(HttpStatus.OK, i18n.getBinding(I18N_BINDING_RETRIEVED), dtos);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DtoResBinding>> getClassBandBindings(final String classBandUuid, final Integer planSettingsId) {
        I18n i18n = new I18n(httpServletRequest);

        if(classBandUuid == null || classBandUuid.trim().isEmpty()) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_CLASSBAND_UUID));
        }

        Integer classBandId = getClassBandIdFromUuid(classBandUuid);

        List<EntityBinding> bindings;
        if (planSettingsId != null) {
            // Filter bindings by planSettingsId if provided
            bindings = repositoryBinding.findByClassBandUuidAndIsDeletedFalse(classBandUuid)
                .stream()
                .filter(binding -> planSettingsId.equals(binding.getPlanSettingsId()))
                .collect(Collectors.toList());
        } else {
            // Get all bindings if no planSettingsId is provided
            bindings = repositoryBinding.findByClassBandUuidAndIsDeletedFalse(classBandUuid);
        }

        List<DtoResBinding> dtos = bindings.stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());

        return ApiResponse.success(HttpStatus.OK, i18n.getBinding(I18N_BINDING_RETRIEVED), dtos);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DtoResBinding>> getBindingsByPlanSettings(final Integer planSettingsId) {
        I18n i18n = new I18n(httpServletRequest);

        if(planSettingsId == null) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_PLAN_SETTINGS));
        }

        Integer orgId = utilAuthContext.isAdmin() ? null : utilAuthContext.getCurrentUser().getOrganization().getId();

        List<EntityBinding> bindings = orgId != null
            ? repositoryBinding.findByOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(orgId, planSettingsId)
            : repositoryBinding.findByPlanSettingsIdAndIsDeletedFalse(planSettingsId);

        List<DtoResBinding> dtos = bindings.stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());

        return ApiResponse.success(HttpStatus.OK, i18n.getBinding(I18N_BINDING_RETRIEVED_PLAN_SETTINGS), dtos);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DtoResBinding>> getRoomBindings(String roomUuid, Integer planSettingsId) {
        I18n i18n = new I18n(httpServletRequest);

        if(roomUuid == null || roomUuid.trim().isEmpty()) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_ROOM_UUID));
        }

        Integer roomId = getRoomIdFromUuid(roomUuid);

        List<EntityBinding> bindings;
        if (planSettingsId != null) {
            // Filter bindings by planSettingsId if provided
            bindings = repositoryBinding.findByRoomIdAndIsDeletedFalse(roomId)
                .stream()
                .filter(binding -> planSettingsId.equals(binding.getPlanSettingsId()))
                .collect(Collectors.toList());
        } else {
            // Get all bindings if no planSettingsId is provided
            bindings = repositoryBinding.findByRoomIdAndIsDeletedFalse(roomId);
        }

        List<DtoResBinding> dtos = bindings.stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());

        return ApiResponse.success(HttpStatus.OK, i18n.getBinding(I18N_BINDING_RETRIEVED), dtos);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DtoResBinding>> getSubjectBindings(String subjectUuid, Integer planSettingsId) {
        I18n i18n = new I18n(httpServletRequest);

        if(subjectUuid == null || subjectUuid.trim().isEmpty()) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_SUBJECT_UUID));
        }

        Integer subjectId = getSubjectIdFromUuid(subjectUuid);

        List<EntityBinding> bindings;
        if (planSettingsId != null) {
            // Filter bindings by planSettingsId if provided
            bindings = repositoryBinding.findBySubjectIdAndIsDeletedFalse(subjectId)
                .stream()
                .filter(binding -> planSettingsId.equals(binding.getPlanSettingsId()))
                .collect(Collectors.toList());
        } else {
            // Get all bindings if no planSettingsId is provided
            bindings = repositoryBinding.findBySubjectIdAndIsDeletedFalse(subjectId);
        }

        List<DtoResBinding> dtos = bindings.stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());

        return ApiResponse.success(HttpStatus.OK, i18n.getBinding(I18N_BINDING_RETRIEVED), dtos);
    }

    private void validateBindingRequest(DtoReqBinding dtoReqBinding, I18n i18n) {
        if(dtoReqBinding == null) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_REQUEST));
        }

        if(dtoReqBinding.getOrganizationUuid() == null || dtoReqBinding.getOrganizationUuid().trim().isEmpty()) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_ORGANIZATION));
        }

        if(dtoReqBinding.getTeacherUuid() == null || dtoReqBinding.getTeacherUuid().trim().isEmpty()) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_TEACHER));
        }

        if(dtoReqBinding.getSubjectUuid() == null || dtoReqBinding.getSubjectUuid().trim().isEmpty()) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_SUBJECT));
        }

        if(dtoReqBinding.getRoomUuid() == null || dtoReqBinding.getRoomUuid().trim().isEmpty()) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_ROOM));
        }

        if(dtoReqBinding.getPeriodsPerWeek() == null || dtoReqBinding.getPeriodsPerWeek() <= 0) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_PERIODS));
        }

        if(dtoReqBinding.getStatusId() == null) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_STATUS));
        }

        boolean hasClass = dtoReqBinding.getClassUuid() != null && !dtoReqBinding.getClassUuid().isEmpty();
        boolean hasClassBand = dtoReqBinding.getClassBandUuid() != null && !dtoReqBinding.getClassBandUuid().isEmpty();



        if(!hasClass && !hasClassBand) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_EITHER_CLASS_OR_CLASS_BAND));
        }
    }

    private boolean validateTeacherWorkload(final String teacherUuid, final Integer additionalPeriods) {
        if(teacherUuid == null || additionalPeriods == null || additionalPeriods <= 0) {
            return true;
        }

        Integer teacherProfileId;
        try {
            teacherProfileId = getTeacherProfileIdFromUserUuid(teacherUuid);
        }catch(Exception e) {
            return false;
        }

        if(teacherProfileId == null) {
            return false;
        }

        Optional<EntityTeacherProfile> profile = repositoryTeacherProfile.findById(teacherProfileId);
        if(profile.isEmpty()) {
            return false;
        }

        Integer current = getTeacherTotalPeriods(teacherUuid);
        Integer max = profile.get().getMaxDailyHours() != null ? profile.get().getMaxDailyHours() * 5 : 35;
        return current + additionalPeriods <= max;
    }

    private Integer getTeacherProfileIdFromUserUuid(final String teacherUuid) {
        I18n i18n = new I18n(httpServletRequest);

        if(teacherUuid == null || teacherUuid.trim().isEmpty()) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_TEACHER_UUID));
        }

        EntityTeacherProfile teacher = getTeacherByUuid(teacherUuid);
        if(teacher == null) {
            throw new ExceptionCoreNotFound(i18n.getBinding(I18N_BINDING_TEACHER_NOT_FOUND));
        }

//        Optional<EntityTeacherProfile> teacherProfile = repositoryTeacherProfile.findByUserId(teacher.getId());
//        if(teacherProfile.isEmpty()) {
//            throw new ExceptionCoreNotFound(i18n.getBinding(I18N_BINDING_TEACHER_PROFILE_NOT_FOUND));
//        }

        return teacher.getId();
    }

    private EntityTeacherProfile getTeacherByUuid(final String teacherUuid) {
        try {
            Optional<EntityTeacherProfile> entityTeacherProfile= repositoryTeacherProfile.findByUuid(teacherUuid);
//            System.out.println("Teacher found12: " + entityTeacherProfile);
//            Optional<EntityUser> teacher = repositoryUser.findByUuid(teacherUuid);
//            System.out.println("Teacher found: " + teacher);
            return entityTeacherProfile.orElse(null);
        }catch(Exception e) {
            return null;
        }
    }

    private Integer getClassIdFromUuid(final String classUuid) {
        I18n i18n = new I18n(httpServletRequest);

        if(classUuid == null || classUuid.isEmpty()) {
            return null;
        }

        return repositoryClass.findByUuidAndIsDeletedFalse(classUuid)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getBinding(I18N_BINDING_CLASS_NOT_FOUND)))
                .getId();
    }

    private Integer getSubjectIdFromUuid(final String subjectUuid) {
        I18n i18n = new I18n(httpServletRequest);

        if(subjectUuid == null || subjectUuid.isEmpty()) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_SUBJECT_UUID));
        }

        return repositorySubject.findByUuidAndIsDeletedFalse(subjectUuid)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getBinding(I18N_BINDING_SUBJECT_NOT_FOUND)))
                .getId();
    }

    private Integer getClassBandIdFromUuid(final String classBandUuid) {
        I18n i18n = new I18n(httpServletRequest);

        if(classBandUuid == null || classBandUuid.isEmpty()) {
            return null;
        }

        return repositoryClassBand.findByUuidAndIsDeletedFalse(classBandUuid)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getBinding(I18N_BINDING_CLASSBAND_NOT_FOUND)))
                .getId();
    }

    private Integer getRoomIdFromUuid(final String roomUuid) {
        I18n i18n = new I18n(httpServletRequest);

        if(roomUuid == null || roomUuid.isEmpty()) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_ROOM_UUID));
        }

        return repositoryRoom.findByUuidAndIsDeletedFalse(roomUuid)
                .orElseThrow(() -> new ExceptionCoreNotFound(i18n.getBinding(I18N_BINDING_ROOM_NOT_FOUND)))
                .getId();
    }

    private DtoResBinding mapEntityToDto(EntityBinding entityBinding) {
        DtoResBinding dtoResBinding = new DtoResBinding();
        dtoResBinding.setUuid(entityBinding.getUuid());
        dtoResBinding.setSubjectId(entityBinding.getSubjectId());
        dtoResBinding.setClassId(entityBinding.getClassId());
        dtoResBinding.setClassBandId(entityBinding.getClassBandId());
        dtoResBinding.setRoomId(entityBinding.getRoomId());
        dtoResBinding.setTeacherId(entityBinding.getTeacherId());
        dtoResBinding.setId(entityBinding.getId());
        dtoResBinding.setPeriodsPerWeek(entityBinding.getPeriodsPerWeek());
        dtoResBinding.setIsFixed(entityBinding.getIsFixed());
        dtoResBinding.setPriority(entityBinding.getPriority());
        dtoResBinding.setNotes(entityBinding.getNotes());
        dtoResBinding.setStatusId(entityBinding.getStatusId());
        dtoResBinding.setCreatedDate(entityBinding.getCreatedDate());
        dtoResBinding.setModifiedDate(entityBinding.getModifiedDate());
        dtoResBinding.setPlanSettingsId(entityBinding.getPlanSettingsId());

        try {
            if(entityBinding.getOrganizationId() != null) {
                Optional<EntityOrganization> organization = repositoryOrganization.findById(entityBinding.getOrganizationId());
                if(organization.isPresent()) {
                    dtoResBinding.setOrganizationUuid(organization.get().getUuid());
                    dtoResBinding.setOrganizationName(organization.get().getName());
                }else {
                    dtoResBinding.setOrganizationUuid("org-" + entityBinding.getOrganizationId());
                    dtoResBinding.setOrganizationName("Organization " + entityBinding.getOrganizationId());
                }
            }

            if(entityBinding.getTeacherId() != null) {
                repositoryTeacherProfile.findById(entityBinding.getTeacherId())
                        .ifPresent(teacherProfile -> {
                            Integer userId = teacherProfile.getUserId();
                            if(userId != null) {
                                repositoryUser.findById(userId)
                                        .ifPresent(teacher -> {
                                            dtoResBinding.setTeacherUuid(teacher.getUuid());
                                            dtoResBinding.setTeacherFirstName(teacher.getFirstName());
                                            dtoResBinding.setTeacherLastName(teacher.getLastName());
                                            dtoResBinding.setTeacherFullName(teacher.getFirstName() + " " + teacher.getLastName());
                                        });
                            }
                        });
            }

            if(entityBinding.getSubjectId() != null) {
                repositorySubject.findById(entityBinding.getSubjectId())
                        .ifPresent(subject -> {
                            dtoResBinding.setSubjectUuid(subject.getUuid());
                            dtoResBinding.setSubjectName(subject.getName());
                            dtoResBinding.setSubjectInitials(subject.getInitials());
                        });
            }

            if(entityBinding.getClassId() != null) {
                repositoryClass.findById(entityBinding.getClassId())
                        .ifPresent(clazz -> {
                            dtoResBinding.setClassUuid(clazz.getUuid());
                            dtoResBinding.setClassName(clazz.getName());
                            dtoResBinding.setClassSection(clazz.getSection());
                        });
            }

            if(entityBinding.getClassBandId() != null) {
                repositoryClassBand.findById(entityBinding.getClassBandId())
                        .ifPresent(classBand -> {
                            dtoResBinding.setClassBandUuid(classBand.getUuid());
                            dtoResBinding.setClassBandName(classBand.getName());
                        });
            }

            if(entityBinding.getRoomId() != null) {
                repositoryRoom.findById(entityBinding.getRoomId())
                        .ifPresent(room -> {
                            dtoResBinding.setRoomUuid(room.getUuid());
                            dtoResBinding.setRoomName(room.getName());
                            dtoResBinding.setRoomCode(room.getCode());
                        });
            }
        }catch(Exception e) {
        }

        if(entityBinding.getRules() != null && !entityBinding.getRules().isEmpty()) {
            dtoResBinding.setRuleUuids(entityBinding.getRules().stream()
                    .map(EntityRule::getUuid)
                    .collect(Collectors.toList()));
        }

        return dtoResBinding;
    }


    private DtoReqBinding buildFullRequestFromUpdate(EntityBinding entityBinding, DtoReqBindingUpdate update) {
        DtoReqBinding fullRequest = new DtoReqBinding();

        Optional<EntityOrganization> org = repositoryOrganization.findById(entityBinding.getOrganizationId());
        fullRequest.setOrganizationUuid(org.isPresent() ? org.get().getUuid() : "org-" + entityBinding.getOrganizationId());

        if(update.getTeacherUuid() != null) {
            fullRequest.setTeacherUuid(update.getTeacherUuid());
        }else {
            Optional<EntityTeacherProfile> profile = repositoryTeacherProfile.findById(entityBinding.getTeacherId());
            if(profile.isPresent()) {
                Optional<EntityUser> user = repositoryUser.findById(profile.get().getUserId());
                if(user.isPresent()) {
                    fullRequest.setTeacherUuid(user.get().getUuid());
                }
            }
        }

        if(update.getSubjectUuid() != null) {
            fullRequest.setSubjectUuid(update.getSubjectUuid());
        }else {
            Optional<EntitySubject> subject = repositorySubject.findById(entityBinding.getSubjectId());
            if(subject.isPresent()) {
                fullRequest.setSubjectUuid(subject.get().getUuid());
            }
        }

        if(update.getClassUuid() != null) {
            fullRequest.setClassUuid(update.getClassUuid());
        } else if(entityBinding.getClassId() != null && entityBinding.getClassId() > 0) {
            Optional<EntityClass> clazz = repositoryClass.findById(entityBinding.getClassId());
            if(clazz.isPresent()) {
                fullRequest.setClassUuid(clazz.get().getUuid());
            }
        }

        if(update.getClassBandUuid() != null) {
            fullRequest.setClassBandUuid(update.getClassBandUuid());
        } else if(entityBinding.getClassBandId() != null && entityBinding.getClassBandId() > 0) {
            Optional<EntityClassBand> classBand = repositoryClassBand.findById(entityBinding.getClassBandId());
            if(classBand.isPresent()) {
                fullRequest.setClassBandUuid(classBand.get().getUuid());
            }
        }

        if(update.getRoomUuid() != null) {
            fullRequest.setRoomUuid(update.getRoomUuid());
        }else {
            Optional<EntityRoom> room = repositoryRoom.findById(entityBinding.getRoomId());
            if(room.isPresent()) {
                fullRequest.setRoomUuid(room.get().getUuid());
            }
        }

        fullRequest.setPeriodsPerWeek(update.getPeriodsPerWeek() != null ? update.getPeriodsPerWeek() : entityBinding.getPeriodsPerWeek());
        fullRequest.setIsFixed(update.getIsFixed() != null ? update.getIsFixed() : entityBinding.getIsFixed());
        fullRequest.setPriority(update.getPriority() != null ? update.getPriority() : entityBinding.getPriority());
        fullRequest.setNotes(update.getNotes() != null ? update.getNotes() : entityBinding.getNotes());
        fullRequest.setStatusId(update.getStatusId() != null ? update.getStatusId() : entityBinding.getStatusId());
        fullRequest.setPlanSettingsId(update.getPlanSettingsId() != null ? update.getPlanSettingsId() : entityBinding.getPlanSettingsId());

        if(update.getRuleUuids() != null) {
            fullRequest.setRuleUuids(update.getRuleUuids());
        } else if(entityBinding.getRules() != null && !entityBinding.getRules().isEmpty()) {
            fullRequest.setRuleUuids(entityBinding.getRules().stream()
                    .map(EntityRule::getUuid)
                    .collect(Collectors.toList()));
        }

        return fullRequest;
    }

    @Override
    public ApiResponse<List<DtoResBinding>> searchBindings(DtoReqBindingSearch dtoReqBindingSearch) {
        I18n i18n = new I18n(httpServletRequest);
        String fieldType = dtoReqBindingSearch.getFieldType().toLowerCase();
        if(!Arrays.asList("teacher", "subject", "room").contains(fieldType)) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_FIELD_TYPE));
        }

        String fieldUuid = dtoReqBindingSearch.getFieldUuid();
        Integer orgId = dtoReqBindingSearch.getOrgId();

        List<EntityBinding> matchingBindings;

        switch (fieldType) {
            case "teacher":
                validateTeacherExists(fieldUuid);
                matchingBindings = repositoryBinding.findByTeacherUuidAndIsDeletedFalse(fieldUuid);
                break;
            case "subject":
                validateSubjectExists(fieldUuid);
                matchingBindings = repositoryBinding.findBySubjectUuidAndIsDeletedFalse(fieldUuid);
                break;
            case "room":
                validateRoomExists(fieldUuid);
                matchingBindings = repositoryBinding.findByRoomUuidAndIsDeletedFalse(fieldUuid);
                break;
            default:
                throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_FIELD_TYPE));
        }

        if(orgId != null) {
            matchingBindings = matchingBindings.stream()
                    .filter(binding -> binding.getOrganizationId() != null && binding.getOrganizationId().equals(orgId))
                    .collect(Collectors.toList());
        }

        List<DtoResBinding> dtoResBindings = matchingBindings.stream().map(this::mapEntityToDto).collect(Collectors.toList());

        return ApiResponse.<List<DtoResBinding>>builder().status(HttpStatus.OK.value()).data(dtoResBindings).message(i18n.getBinding(
                        dtoResBindings.isEmpty() ? I18N_BINDING_NO_MATCHES_FOUND : I18N_BINDING_SEARCH_SUCCESS)).build();
    }

    @Override
    @Transactional
    public ApiResponse<DtoResBindingReplaceResult> replaceBindings(DtoReqBindingReplace dtoReqBindingReplace) {
        I18n i18n = new I18n(httpServletRequest);

        String fieldType = dtoReqBindingReplace.getFieldType().toLowerCase();
        if(!Arrays.asList("teacher", "subject", "room").contains(fieldType)) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_FIELD_TYPE));
        }

        String mode = dtoReqBindingReplace.getMode().toLowerCase();
        if(!Arrays.asList("all", "single", "selected").contains(mode)) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_REPLACEMENT_MODE));
        }

        String searchUuid = dtoReqBindingReplace.getSearchUuid();
        String replaceUuid = dtoReqBindingReplace.getReplaceUuid();

        if(searchUuid.equals(replaceUuid)) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_SAME_SEARCH_REPLACE));
        }

        switch (fieldType) {
            case "teacher":
                validateTeacherExists(searchUuid);
                validateTeacherExists(replaceUuid);
                break;
            case "subject":
                validateSubjectExists(searchUuid);
                validateSubjectExists(replaceUuid);
                break;
            case "room":
                validateRoomExists(searchUuid);
                validateRoomExists(replaceUuid);
                break;
        }

        if("selected".equals(mode) && (dtoReqBindingReplace.getBindingUuids() == null
                || dtoReqBindingReplace.getBindingUuids().isEmpty())) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_SELECTED_UUIDS_REQUIRED));
        }

        List<EntityBinding> matchingBindings;

        switch (fieldType) {
            case "teacher":
                matchingBindings = repositoryBinding.findByTeacherUuidAndIsDeletedFalse(searchUuid);
                break;
            case "subject":
                matchingBindings = repositoryBinding.findBySubjectUuidAndIsDeletedFalse(searchUuid);
                break;
            case "room":
                matchingBindings = repositoryBinding.findByRoomUuidAndIsDeletedFalse(searchUuid);
                break;
            default:
                matchingBindings = Collections.emptyList();
        }

        if(dtoReqBindingReplace.getOrgId() != null) {
            Integer orgId = dtoReqBindingReplace.getOrgId();
            matchingBindings = matchingBindings.stream()
                    .filter(binding -> binding.getOrganizationId() != null && binding.getOrganizationId().equals(orgId))
                    .collect(Collectors.toList());
        }

        if(matchingBindings.isEmpty()) {
            DtoResBindingReplaceResult result = new DtoResBindingReplaceResult(0, i18n.getBinding(I18N_BINDING_NO_MATCHES_FOUND));
            return ApiResponse.<DtoResBindingReplaceResult>builder().status(HttpStatus.OK.value()).data(result).message(i18n.getBinding(I18N_BINDING_NO_MATCHES_FOUND)).build();
        }

        List<EntityBinding> bindingsToUpdate;

        switch (mode) {
            case "all":
                bindingsToUpdate = matchingBindings;
                break;
            case "single":
                bindingsToUpdate = matchingBindings.stream().limit(1).collect(Collectors.toList());
                break;
            case "selected":
                List<String> selectedUuids = dtoReqBindingReplace.getBindingUuids();
                bindingsToUpdate = matchingBindings.stream().filter(binding -> selectedUuids.contains(binding.getUuid())).collect(Collectors.toList());
                break;
            default:
                bindingsToUpdate = Collections.emptyList();
        }

        for(EntityBinding binding : bindingsToUpdate) {
            switch (fieldType) {
                case "teacher":
                    Integer teacherId = getTeacherProfileIdFromUserUuid(replaceUuid);
                    if(teacherId != null) {
                        binding.setTeacherId(teacherId);
                    }
                    break;
                case "subject":
                    Integer subjectId = getSubjectIdFromUuid(replaceUuid);
                    if(subjectId != null) {
                        binding.setSubjectId(subjectId);
                    }
                    break;
                case "room":
                    Integer roomId = getRoomIdFromUuid(replaceUuid);
                    if(roomId != null) {
                        binding.setRoomId(roomId);
                    }
                    break;
            }

            binding.setModifiedDate(LocalDateTime.now());
            binding.setModifiedBy(utilAuthContext.getAuthenticatedUserId());

            repositoryBinding.save(binding);
        }

        int replacedCount = bindingsToUpdate.size();
        String successMessage = i18n.getBinding(I18N_BINDING_REPLACE_SUCCESS);
        DtoResBindingReplaceResult result = new DtoResBindingReplaceResult();
        result.setMessage(successMessage);
        result.setCount(replacedCount);

        return ApiResponse.<DtoResBindingReplaceResult>builder().status(HttpStatus.OK.value()).data(result).message(i18n.getBinding(I18N_BINDING_REPLACE_SUCCESS)).build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<EntityBinding>> getBindingsByPlanSettingsId(Integer planSettingsId) {
        I18n i18n = new I18n(httpServletRequest);
        
        if (planSettingsId == null) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_PLAN_NOT_FOUND));
        }
        
        List<EntityBinding> bindings = repositoryBinding.findByPlanSettingsIdAndIsDeletedFalse(planSettingsId);
        
        return ApiResponse.success(HttpStatus.OK, i18n.getBinding(I18N_BINDING_RETRIEVED), bindings);
    }

    private boolean validateRoomExists(final String searchUuid) {
        Integer roomId=repositoryRoom.findIdByUuidAndIsDeletedFalse(searchUuid);
        return repositoryRoom.existsById(roomId);
    }

    private boolean validateSubjectExists(final String searchUuid) {
        Integer  subjectId=repositorySubject.findIdByUuidAndIsDeletedFalse(searchUuid);
        return repositorySubject.existsById(subjectId);
    }

    private boolean validateTeacherExists(final String searchUuid) {
        EntityTeacherProfile user=repositoryTeacherProfile.findByUserUuid(searchUuid);
        return repositoryTeacherProfile.existsById(user.getId());
    }

    private DtoReqBinding convertEntityToReqDto(EntityBinding entity) {
        DtoReqBinding dtoReqBinding = new DtoReqBinding();

        if(entity.getOrganizationId() != null) {
            Optional<EntityOrganization> org = repositoryOrganization.findById(entity.getOrganizationId());
            if(org.isPresent()) {
                dtoReqBinding.setOrganizationUuid(org.get().getUuid());
            }
        }

        if(entity.getTeacherId() != null) {
            Optional<EntityTeacherProfile> teacherProfile = repositoryTeacherProfile.findById(entity.getTeacherId());
            if(teacherProfile.isPresent() && teacherProfile.get().getUserId() != null) {
                Optional<EntityUser> user = repositoryUser.findById(teacherProfile.get().getUserId());
                if(user.isPresent()) {
                    dtoReqBinding.setTeacherUuid(user.get().getUuid());
                }
            }
        }

        if(entity.getSubjectId() != null) {
            Optional<EntitySubject> subject = repositorySubject.findById(entity.getSubjectId());
            if(subject.isPresent()) {
                dtoReqBinding.setSubjectUuid(subject.get().getUuid());
            }
        }

        if(entity.getClassId() != null && entity.getClassId() > 0) {
            Optional<EntityClass> clazz = repositoryClass.findById(entity.getClassId());
            if(clazz.isPresent()) {
                dtoReqBinding.setClassUuid(clazz.get().getUuid());
            }
        }

        if(entity.getClassBandId() != null && entity.getClassBandId() > 0) {
            Optional<EntityClassBand> classBand = repositoryClassBand.findById(entity.getClassBandId());
            if(classBand.isPresent()) {
                dtoReqBinding.setClassBandUuid(classBand.get().getUuid());
            }
        }

        if(entity.getRoomId() != null) {
            Optional<EntityRoom> room = repositoryRoom.findById(entity.getRoomId());
            if(room.isPresent()) {
                dtoReqBinding.setRoomUuid(room.get().getUuid());
            }
        }

        dtoReqBinding.setPeriodsPerWeek(entity.getPeriodsPerWeek());
        dtoReqBinding.setIsFixed(entity.getIsFixed());
        dtoReqBinding.setPriority(entity.getPriority());
        dtoReqBinding.setNotes(entity.getNotes());
        dtoReqBinding.setStatusId(entity.getStatusId());

        if(entity.getRules() != null && !entity.getRules().isEmpty()) {
            dtoReqBinding.setRuleUuids(entity.getRules().stream().map(EntityRule::getUuid).collect(Collectors.toList()));
        }

        return dtoReqBinding;
    }

    public boolean isUser(final EntityUser user) {
        return repositoryTeacherProfile.existsById(user.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DtoResClass>> getClassesByTeacherId(final Integer teacherId) {
        I18n i18n = new I18n(httpServletRequest);

        if(teacherId == null) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_TEACHER));
        }

        // Get class IDs from bindings
        List<Integer> classIds = repositoryBinding.findClassIdsByTeacherIdAndIsDeletedFalse(teacherId);

        // Get class entities
        List<EntityClass> classes = repositoryClass.findByIdInAndIsDeletedFalse(classIds);

        // Map to DTOs
        List<DtoResClass> dtoClasses = classes.stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());

        return ApiResponse.success(HttpStatus.OK, i18n.getBinding(I18N_BINDING_RETRIEVED), dtoClasses);
    }


    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DtoResClass>> getClassesByRoomId(final Integer roomId) {
        I18n i18n = new I18n(httpServletRequest);

        if(roomId == null) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_ROOM));
        }

        // Get class IDs from bindings
        List<Integer> classIds = repositoryBinding.findClassIdsByRoomIdAndIsDeletedFalse(roomId);

        // Get class entities
        List<EntityClass> classes = repositoryClass.findByIdInAndIsDeletedFalse(classIds);

        // Map to DTOs
        List<DtoResClass> dtoResClasses = classes.stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());

        return ApiResponse.success(HttpStatus.OK, i18n.getBinding(I18N_BINDING_RETRIEVED), dtoResClasses);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiResponse<List<DtoResClass>> getClassesBySubjectId(final Integer subjectId) {
        I18n i18n = new I18n(httpServletRequest);

        if(subjectId == null) {
            throw new ExceptionBindingBadRequest(i18n.getBinding(I18N_BINDING_INVALID_SUBJECT));
        }

        // Get class IDs from bindings
        List<Integer> classIds = repositoryBinding.findClassIdsBySubjectIdAndIsDeletedFalse(subjectId);

        // Get class entities
        List<EntityClass> classes = repositoryClass.findByIdInAndIsDeletedFalse(classIds);

        // Map to DTOs
        List<DtoResClass> dtoResClasses = classes.stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());

        return ApiResponse.success(HttpStatus.OK, i18n.getBinding(I18N_BINDING_RETRIEVED), dtoResClasses);
    }

    private DtoResClass mapEntityToDto(EntityClass entity) {
        return DtoResClass.builder()
                .id(entity.getId())
                .organizationId(entity.getOrganizationId())
                .uuid(entity.getUuid())
                .name(entity.getName())
                .initial(entity.getInitial())
                .color(entity.getColor())
                .section(entity.getSection())
                .capacity(entity.getCapacity())
                .locationId(entity.getLocationId())
                .comment(entity.getDescription()) // Assuming description maps to comment
                .minLessonsPerDay(entity.getMinLessonsPerDay())
                .maxLessonsPerDay(entity.getMaxLessonsPerDay())
                .latestStartPosition(entity.getLatestStartPosition())
                .earliestEnd(entity.getEarliestEnd())
                .maxFreePeriods(entity.getMaxFreePeriods())
                .mainTeacher(entity.getMainTeacher())
                .presentEveryDay(entity.getPresentEveryDay())
                .statusId(entity.getStatusId())
                .modifiedBy(entity.getModifiedBy())
                .build();
    }


    public Integer getTeacherTotalPeriodsByPlanSettings(String teacherUuid, Integer planSettingsId) {
        if (teacherUuid == null || planSettingsId == null) return 0;
        Integer teacherProfileId = getTeacherProfileIdFromUserUuid(teacherUuid);
        if (teacherProfileId == null) return 0;
        return repositoryBinding.getTeacherWorkloadTotalPeriodsByPlanSettings(teacherProfileId, planSettingsId);
    }

}
