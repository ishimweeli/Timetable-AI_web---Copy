package com.ist.timetabling.Period.service;

import com.ist.timetabling.Period.dto.req.DtoReqPeriod;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Period.dto.res.DtoResPeriod;
import com.ist.timetabling.Period.dto.res.DtoResPeriodSchedules;
import com.ist.timetabling.Period.entity.EntityPeriod;

import java.util.List;

public interface ServicePeriod {

    ApiResponse<DtoResPeriod> getPeriodByUuid(final String uuid);

    // Add search parameter
    ApiResponse<List<DtoResPeriod>> getAllPeriods(
            final Integer page,
            final Integer size,
            final String sortBy,
            final String sortDirection,
            final String keyword,
            final Integer orgId,
            final Integer planSettingsId);

    // Keep the original method for backward compatibility
    ApiResponse<List<DtoResPeriod>> getAllPeriods();
    
    // New overload with planSettingsId
    ApiResponse<List<DtoResPeriod>> getAllPeriods(final Integer planSettingsId);

    ApiResponse<List<EntityPeriod>> getPeriodsByOrganizationId(
            final Integer organizationId,
            final Integer planSettingsId,
            final Integer page,
            final Integer size,
            final String sortBy,
            final String sortDirection
    );

    ApiResponse<DtoResPeriod> createPeriod(final DtoReqPeriod dtoReqPeriod);

    ApiResponse<DtoResPeriod> updatePeriodByUuid(final String uuid, final DtoReqPeriod dtoReqPeriod);

    ApiResponse<List<DtoResPeriod>> updateAllowLocationChangeForPeriodsByUuid(List<String> periodUuids, boolean allowLocationChange);

    ApiResponse<Void> deletePeriodByUuid(final String uuid);

    // Original method for backward compatibility
    ApiResponse<List<DtoResPeriodSchedules>> getAllPeriodsSchedules();
    
    // New overload with planSettingsId
    ApiResponse<List<DtoResPeriodSchedules>> getAllPeriodsSchedules(final Integer planSettingsId);

    ApiResponse<List<EntityPeriod>> getPeriodsByPlanSettingsId(final Integer planSettingsId);
}
