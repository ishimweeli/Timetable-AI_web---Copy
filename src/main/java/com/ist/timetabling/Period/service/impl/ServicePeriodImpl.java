package com.ist.timetabling.Period.service.impl;

import com.ist.timetabling.Auth.util.UtilAuthContext;
import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.Core.util.PaginationUtil;
import com.ist.timetabling.Period.dto.res.DtoResPeriod;
import com.ist.timetabling.Period.dto.res.DtoResPeriodSchedules;
import com.ist.timetabling.Period.entity.EntityPeriod;
import com.ist.timetabling.Period.dto.req.DtoReqPeriod;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Period.entity.EntitySchedule;
import com.ist.timetabling.Period.exception.ExceptionPeriodNotFound;
import com.ist.timetabling.Period.exception.ExceptionScheduleConflict;
import com.ist.timetabling.Period.exception.ExceptionScheduleCreation;
import com.ist.timetabling.Period.repository.RepositoryPeriod;
import com.ist.timetabling.Period.repository.RepositorySchedule;
import com.ist.timetabling.Period.service.ServicePeriod;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import static com.ist.timetabling.Period.constant.ConstantPeriodI18n.*;
import com.ist.timetabling.PlanSetting.dto.res.DtoResPlanningSettings;
import com.ist.timetabling.PlanSetting.service.ServicePlanSetting;


@Service
@RequiredArgsConstructor
public class ServicePeriodImpl implements ServicePeriod {

    private static final int DEFAULT_PAGE_NUMBER = 0 ;
    private static final int DEFAULT_PAGE_SIZE = 10;

    private RepositoryPeriod repositoryPeriod;
    private final HttpServletRequest httpServletRequest;
    private final UtilAuthContext utilAuthContext;
    private final ServicePlanSetting servicePlanSetting;
    private final RepositorySchedule repositorySchedule;
    private static final String ROLE_ADMIN = "ADMIN";

    @Autowired
    public ServicePeriodImpl(final RepositoryPeriod repositoryPeriod, final HttpServletRequest httpServletRequest,final UtilAuthContext utilAuthContext,final ServicePlanSetting servicePlanSetting,final RepositorySchedule repositorySchedule) {
        this.repositoryPeriod = repositoryPeriod;
        this.httpServletRequest = httpServletRequest;
        this.utilAuthContext = utilAuthContext;
        this.servicePlanSetting = servicePlanSetting;
        this.repositorySchedule = repositorySchedule;
    }

    @Override
    public ApiResponse<DtoResPeriod> getPeriodByUuid(final String uuid) {
        final I18n i18n = new I18n(httpServletRequest);
        final EntityPeriod entityPeriod = repositoryPeriod.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionPeriodNotFound(i18n.getPeriod(I18N_PERIOD_NOT_FOUND)));


        if(!utilAuthContext.isAdmin() && !entityPeriod.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, "You do not have permission to view this period");
        }

        final DtoResPeriod dtoResPeriod = toDto(entityPeriod);
        return ApiResponse.success(HttpStatus.FOUND, i18n.getPeriod(I18N_PERIOD_RETRIEVE_SUCCESS), dtoResPeriod);
    }

    @Override
    public ApiResponse<List<DtoResPeriod>> getAllPeriods(
            final Integer page,
            final Integer size,
            final String sortBy,
            final String sortDirection,
            final String keyword,
            final Integer orgId,
            final Integer planSettingsId) {

        final I18n i18n = new I18n(httpServletRequest);
        final int pageNum = (page != null) ? page : 0;
        final int pageSize = (size != null) ? size : 10;
        Integer organizationId;
        if(!utilAuthContext.isAdmin()) {
            organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
        }else {
            organizationId = orgId;
        }

        List<DtoResPeriod> dtoResPeriods;
        long totalItems;
        if(keyword != null && !keyword.trim().isEmpty()) {
            List<EntityPeriod> periods;
            if(utilAuthContext.isAdmin() && organizationId == null) {
                periods = repositoryPeriod.searchByNameContainingNative(keyword.toLowerCase());
            }else {
                periods = repositoryPeriod.searchByNameContainingAndOrganizationId(keyword.toLowerCase(), organizationId);
            }


            if (planSettingsId != null) {
                periods = periods.stream()
                        .filter(p -> planSettingsId.equals(p.getPlanSettingsId()))
                        .collect(Collectors.toList());
            }

            dtoResPeriods = periods.stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
            totalItems = dtoResPeriods.size();
        }else {
            Page<EntityPeriod> pagePeriods;
            if(utilAuthContext.isAdmin() && organizationId == null) {
                pagePeriods = repositoryPeriod.findByIsDeletedFalse(PageRequest.of(pageNum, pageSize));
            }else {
                pagePeriods = repositoryPeriod.findByOrganizationIdAndIsDeletedFalse(organizationId, PageRequest.of(pageNum, pageSize));
            }

            List<EntityPeriod> filteredPeriods = pagePeriods.getContent();
            if (planSettingsId != null) {
                filteredPeriods = filteredPeriods.stream()
                        .filter(p -> planSettingsId.equals(p.getPlanSettingsId()))
                        .collect(Collectors.toList());
            }

            dtoResPeriods = filteredPeriods.stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
            totalItems = planSettingsId != null ? dtoResPeriods.size() : pagePeriods.getTotalElements();
        }
        return ApiResponse.<List<DtoResPeriod>>builder()
                .status(HttpStatus.OK.value())
                .success(true)
                .message(i18n.getPeriod(I18N_PERIOD_LIST_SUCCESS))
                .data(dtoResPeriods)
                .totalItems(totalItems)
                .build();
    }

    @Override
    public ApiResponse<List<DtoResPeriod>> getAllPeriods() {

        return getAllPeriods(null);
    }

    @Override
    public ApiResponse<List<DtoResPeriod>> getAllPeriods(final Integer planSettingsId) {
        final I18n i18n = new I18n(httpServletRequest);

        final List<EntityPeriod> periods;
        if(utilAuthContext.isAdmin()) {
            periods = repositoryPeriod.findAllByIsDeletedFalse();
        }else {
            Integer organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
            periods = repositoryPeriod.findAllByOrganizationIdAndIsDeletedFalse(organizationId);
        }


        List<EntityPeriod> filteredPeriods = periods;
        if (planSettingsId != null) {
            filteredPeriods = periods.stream()
                    .filter(p -> planSettingsId.equals(p.getPlanSettingsId()))
                    .collect(Collectors.toList());
        }

        filteredPeriods.sort(Comparator.comparing(EntityPeriod::getStartTime));

        final List<DtoResPeriod> dtoResPeriods = filteredPeriods.stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        final String message = dtoResPeriods.isEmpty() ? i18n.getPeriod(I18N_PERIOD_LIST_EMPTY)
                : i18n.getPeriod(I18N_PERIOD_LIST_SUCCESS);

        return ApiResponse.success(HttpStatus.OK, message, dtoResPeriods);
    }

    @Override
    @Transactional
    public ApiResponse<List<EntityPeriod>> getPeriodsByOrganizationId(
            final Integer organizationId,
            final Integer planSettingsId,
            final Integer page,
            final Integer size,
            final String sortBy,
            final String sortDirection) {

        final I18n i18n = new I18n(httpServletRequest);
        final Pageable pageable = PaginationUtil.createPageable(page, size, sortBy, sortDirection, DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE);


        if(!utilAuthContext.isAdmin() && !organizationId.equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, "You do not have permission to view periods for this organization");
        }

        Page<EntityPeriod> entityPeriods = repositoryPeriod.findByOrganizationIdAndIsDeletedFalse(organizationId, pageable);


        if (planSettingsId != null) {
            List<EntityPeriod> filteredPeriods = entityPeriods.getContent().stream()
                    .filter(p -> planSettingsId.equals(p.getPlanSettingsId()))
                    .collect(Collectors.toList());

            entityPeriods = new org.springframework.data.domain.PageImpl<>(filteredPeriods, pageable, filteredPeriods.size());
        }

        final String message = entityPeriods.isEmpty() ? i18n.getPeriod(I18N_PERIOD_LIST_EMPTY)
                : i18n.getPeriod(I18N_PERIOD_LIST_SUCCESS);

        return ApiResponse.success(entityPeriods, message);
    }

    @Override
    public ApiResponse<List<DtoResPeriodSchedules>> getAllPeriodsSchedules() {
        return getAllPeriodsSchedules(null);
    }

    @Override
    public ApiResponse<List<DtoResPeriodSchedules>> getAllPeriodsSchedules(final Integer planSettingsId) {
        final I18n i18n = new I18n(httpServletRequest);

        final List<EntityPeriod> periods;
        if(utilAuthContext.isAdmin()) {
            periods = repositoryPeriod.findAllByIsDeletedFalse();
        }else {
            Integer organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
            periods = repositoryPeriod.findAllByOrganizationIdAndIsDeletedFalse(organizationId);
        }


        List<EntityPeriod> filteredPeriods = periods;
        if (planSettingsId != null) {
            filteredPeriods = periods.stream()
                    .filter(p -> planSettingsId.equals(p.getPlanSettingsId()))
                    .collect(Collectors.toList());
        }

        final List<DtoResPeriodSchedules> dtoResPeriodSchedulesList = filteredPeriods.stream()
                .map(this::toPeriodSchedulesDto)
                .collect(Collectors.toList());

        final String message = filteredPeriods.isEmpty()
                ? i18n.getPeriod(I18N_PERIOD_LIST_EMPTY)
                : i18n.getPeriod(I18N_PERIOD_LIST_SUCCESS);

        return ApiResponse.success(HttpStatus.OK, message, dtoResPeriodSchedulesList);
    }

    @Override
    public ApiResponse<DtoResPeriod> createPeriod(final DtoReqPeriod dtoReqPeriod) {
        final I18n i18n = new I18n(httpServletRequest);
        final Integer userId = utilAuthContext.getAuthenticatedUserId();


        Integer organizationId;
        if(utilAuthContext.isAdmin() && dtoReqPeriod.getOrganizationId() != null) {
            organizationId = dtoReqPeriod.getOrganizationId();
        }else {
            organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
            dtoReqPeriod.setOrganizationId(organizationId);
        }

        final EntityPeriod entityPeriod = new EntityPeriod();
        entityPeriod.setName(dtoReqPeriod.getName());
        entityPeriod.setStartTime(LocalTime.parse(dtoReqPeriod.getStartTime()));
        entityPeriod.setEndTime(LocalTime.parse(dtoReqPeriod.getEndTime()));
        entityPeriod.setPeriodNumber(dtoReqPeriod.getPeriodNumber());
        entityPeriod.setDurationMinutes(dtoReqPeriod.getDurationMinutes());
        entityPeriod.setPeriodType(dtoReqPeriod.getPeriodType());
        entityPeriod.setDays(dtoReqPeriod.getDays());
        entityPeriod.setAllowScheduling(dtoReqPeriod.getAllowScheduling());
        entityPeriod.setShowInTimetable(dtoReqPeriod.getShowInTimetable());
        entityPeriod.setAllowConflicts(dtoReqPeriod.getAllowConflicts());
        entityPeriod.setOrganizationId(organizationId);
        entityPeriod.setPlanSettingsId(dtoReqPeriod.getPlanSettingsId());
        entityPeriod.setCreatedBy(userId);
        entityPeriod.setModifiedBy(userId);
        entityPeriod.setStatusId(1);
        entityPeriod.setIsDeleted(false);
        entityPeriod.setAllowLocationChange(dtoReqPeriod.getAllowLocationChange() != null ? dtoReqPeriod.getAllowLocationChange() : false);

        final EntityPeriod savedEntityPeriod = repositoryPeriod.save(entityPeriod);
        final DtoResPeriod dtoResPeriod = toDto(savedEntityPeriod);
        createSchedulesForPeriod(savedEntityPeriod);
        return ApiResponse.success(HttpStatus.CREATED, i18n.getPeriod(I18N_PERIOD_CREATE_SUCCESS), dtoResPeriod);
    }

    @Override
    public ApiResponse<DtoResPeriod> updatePeriodByUuid(final String uuid, final DtoReqPeriod request) {
        final I18n i18n = new I18n(httpServletRequest);
        final Integer userId = utilAuthContext.getAuthenticatedUserId();

        final EntityPeriod existingEntityPeriod = repositoryPeriod.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionPeriodNotFound(i18n.getPeriod(I18N_PERIOD_NOT_FOUND)));

        if(!utilAuthContext.isAdmin() && !existingEntityPeriod.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, "You do not have permission to update this period");
        }

        Integer organizationId;
        if(utilAuthContext.isAdmin() && request.getOrganizationId() != null) {
            organizationId = request.getOrganizationId();
        }else {
            organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
            request.setOrganizationId(organizationId);
        }

        existingEntityPeriod.setName(request.getName());
        existingEntityPeriod.setStartTime(LocalTime.parse(request.getStartTime()));
        existingEntityPeriod.setEndTime(LocalTime.parse(request.getEndTime()));
        existingEntityPeriod.setPeriodNumber(request.getPeriodNumber());
        existingEntityPeriod.setDurationMinutes(request.getDurationMinutes());
        existingEntityPeriod.setPeriodType(request.getPeriodType());
        existingEntityPeriod.setDays(request.getDays());
        existingEntityPeriod.setAllowScheduling(request.getAllowScheduling());
        existingEntityPeriod.setShowInTimetable(request.getShowInTimetable());
        existingEntityPeriod.setAllowConflicts(request.getAllowConflicts());
        existingEntityPeriod.setOrganizationId(organizationId);
        existingEntityPeriod.setPlanSettingsId(request.getPlanSettingsId());
        existingEntityPeriod.setModifiedBy(userId);
        existingEntityPeriod.setAllowLocationChange(request.getAllowLocationChange() != null ? request.getAllowLocationChange() : false);

        final EntityPeriod updatedEntityPeriod = repositoryPeriod.save(existingEntityPeriod);
        final DtoResPeriod dtoResPeriod = toDto(updatedEntityPeriod);
        return ApiResponse.success(HttpStatus.OK, i18n.getPeriod(I18N_PERIOD_UPDATE_SUCCESS), dtoResPeriod);
    }

    @Override
    @Transactional
    public ApiResponse<List<DtoResPeriod>> updateAllowLocationChangeForPeriodsByUuid(List<String> periodUuids, boolean allowLocationChange) {
        List<EntityPeriod> periods = repositoryPeriod.findByUuidInAndIsDeletedFalse(periodUuids);
        for (EntityPeriod period : periods) {
            period.setAllowLocationChange(allowLocationChange);
        }
        repositoryPeriod.saveAll(periods);


        List<DtoResPeriod> updatedDtos = periods.stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        return ApiResponse.success(HttpStatus.OK, "Updated allowLocationChange for selected periods", updatedDtos);
    }

    @Override
    public ApiResponse<Void> deletePeriodByUuid(final String uuid) {
        final I18n i18n = new I18n(httpServletRequest);

        final EntityPeriod existingEntityPeriod = repositoryPeriod.findByUuidAndIsDeletedFalse(uuid)
                .orElseThrow(() -> new ExceptionPeriodNotFound(i18n.getPeriod(I18N_PERIOD_NOT_FOUND)));


        if(!utilAuthContext.isAdmin() && !existingEntityPeriod.getOrganizationId().equals(utilAuthContext.getCurrentUser().getOrganization().getId())) {
            return ApiResponse.error(HttpStatus.FORBIDDEN, "You do not have permission to delete this period");
        }

        existingEntityPeriod.setIsDeleted(true);
        existingEntityPeriod.setStatusId(0);
        existingEntityPeriod.setModifiedBy(utilAuthContext.getAuthenticatedUserId());

        repositoryPeriod.save(existingEntityPeriod);
        return ApiResponse.success(HttpStatus.OK, i18n.getPeriod(I18N_PERIOD_DELETE_SUCCESS), null);
    }

    private DtoResPeriod toDto(final EntityPeriod entityPeriod) {
        final DtoResPeriod dtoResPeriod = new DtoResPeriod();
        dtoResPeriod.setId(entityPeriod.getId());
        dtoResPeriod.setUuid(entityPeriod.getUuid());
        dtoResPeriod.setPeriodNumber(entityPeriod.getPeriodNumber());
        dtoResPeriod.setName(entityPeriod.getName());
        dtoResPeriod.setStartTime(entityPeriod.getStartTime());
        dtoResPeriod.setEndTime(entityPeriod.getEndTime());
        dtoResPeriod.setDurationMinutes(entityPeriod.getDurationMinutes());
        dtoResPeriod.setPeriodType(entityPeriod.getPeriodType());
        dtoResPeriod.setDays(entityPeriod.getDays());
        dtoResPeriod.setAllowScheduling(entityPeriod.getAllowScheduling());
        dtoResPeriod.setShowInTimetable(entityPeriod.getShowInTimetable());
        dtoResPeriod.setAllowConflicts(entityPeriod.getAllowConflicts());
        dtoResPeriod.setOrganizationId(entityPeriod.getOrganizationId());
        dtoResPeriod.setPlanSettingsId(entityPeriod.getPlanSettingsId());
        dtoResPeriod.setAllowLocationChange(entityPeriod.getAllowLocationChange());
        return dtoResPeriod;
    }

    @Transactional
    public void createSchedulesForPeriod(EntityPeriod savedPeriod) {
        EntityPeriod entityPeriod = repositoryPeriod.findByUuid(savedPeriod.getUuid());
        if(entityPeriod == null) {
            return;
        }

        List<Integer> periodDays = entityPeriod.getDays();
        if(periodDays == null || periodDays.isEmpty()) {
            return;
        }

        Collections.sort(periodDays);

        for(Integer dayOfWeek : periodDays) {
            if(dayOfWeek < 1 || dayOfWeek > 7) {
                continue;
            }

            boolean exists = repositorySchedule.existsByDayOfWeekAndPeriodId(dayOfWeek, entityPeriod.getId());
            if(exists) {
                continue;
            }

            List<EntitySchedule> conflicting = repositorySchedule.findConflictingSchedules(
                    dayOfWeek, entityPeriod.getStartTime(), entityPeriod.getEndTime()
            );
//            if(!entityPeriod.isAllowConflicts() && !conflicting.isEmpty()) {
//                List<String> conflictDetails = conflicting.stream()
//                        .map(c -> "Conflict with Period " + c.getPeriod().getName() + " on Day " + c.getDayOfWeek())
//                        .collect(Collectors.toList());
//                throw new ExceptionScheduleConflict(
//                        "Schedule conflicts for " + entityPeriod.getName() +
//                                " on day " + dayOfWeek + ": " + String.join(", ", conflictDetails)
//                );
//            }

            EntitySchedule schedule = EntitySchedule.builder()
                    .period(entityPeriod)
                    .dayOfWeek(dayOfWeek)
                    .organisationId(entityPeriod.getOrganizationId())
                    .createdBy(entityPeriod.getCreatedBy())
                    .modifiedBy(entityPeriod.getModifiedBy())
                    .statusId(1)
                    .isDeleted(false)
                    .build();

            try {
                repositorySchedule.save(schedule);
            }catch(Exception e) {
                throw new ExceptionScheduleCreation(
                        "Failed to create schedule for " + entityPeriod.getName(), e
                );
            }
        }
    }

    private DtoResPeriodSchedules toPeriodSchedulesDto(final EntityPeriod entityPeriod) {
        DtoResPeriodSchedules dtoResPeriodSchedules = new DtoResPeriodSchedules();

        dtoResPeriodSchedules.setUuid(entityPeriod.getUuid());
        dtoResPeriodSchedules.setPlanSettingsId(entityPeriod.getPlanSettingsId());

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("HH:mm");
        String start = dtf.format(entityPeriod.getStartTime());
        String end   = dtf.format(entityPeriod.getEndTime());
        dtoResPeriodSchedules.setTime(start + " - " + end);
        dtoResPeriodSchedules.setDays(entityPeriod.getDays());

        List<EntitySchedule> schedules = repositorySchedule.findAllByPeriodId(entityPeriod.getId());

        List<DtoResPeriodSchedules.ScheduleDto> scheduleDtos = schedules.stream()
                .map(sch -> {
                    DtoResPeriodSchedules.ScheduleDto sd = new DtoResPeriodSchedules.ScheduleDto();
                    sd.setDay(sch.getDayOfWeek());
                    sd.setPeriodId(sch.getPeriod().getId());
                    return sd;
                })
                .collect(Collectors.toList());

        dtoResPeriodSchedules.setSchedules(scheduleDtos);

        return dtoResPeriodSchedules;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ApiResponse<List<EntityPeriod>> getPeriodsByPlanSettingsId(Integer planSettingsId) {
        final I18n i18n = new I18n(httpServletRequest);
        
        if (planSettingsId == null) {
            return ApiResponse.error(HttpStatus.BAD_REQUEST, i18n.getPeriod(I18N_PERIOD_PLAN_REQUIRED));
        }
        
        List<EntityPeriod> periods;
        Integer organizationId = null;
        
        if (!utilAuthContext.isAdmin()) {
            organizationId = utilAuthContext.getCurrentUser().getOrganization().getId();
            periods = repositoryPeriod.findByOrganizationIdAndPlanSettingsIdAndIsDeletedFalse(organizationId, planSettingsId);
        } else {
            periods = repositoryPeriod.findByPlanSettingsIdAndIsDeletedFalse(planSettingsId);
        }
        
        periods.sort(Comparator.comparing(EntityPeriod::getStartTime));
        
        return ApiResponse.success(HttpStatus.OK, i18n.getPeriod(I18N_PERIOD_LIST_SUCCESS), periods);
    }
}