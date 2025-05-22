package com.ist.timetabling.PlanSetting.service;

import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.PlanSetting.dto.req.DtoReqPlanningSettings;
import com.ist.timetabling.PlanSetting.dto.res.DtoResPlanningSettings;
import com.ist.timetabling.PlanSetting.entity.EntityPlanSetting;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ServicePlanSetting {

    ApiResponse<DtoResPlanningSettings> findPlanningSettingsByUuid(final String uuid);

    ApiResponse<DtoResPlanningSettings> findPlanningSettingsByOrganizationIdAndCategory(final String organizationId, final String category);

    ApiResponse<List<DtoResPlanningSettings>> findPlanningSettingsByOrganizationId(final String organizationId);

    ApiResponse<Page<DtoResPlanningSettings>> findPlanningSettingsByOrganizationIdPaginated(final String organizationId, final Pageable pageable, final String search);

    ApiResponse<Page<DtoResPlanningSettings>> findPlanningSettingsPaginated(final Pageable pageable, final String search);

    ApiResponse<List<DtoResPlanningSettings>> findAllPlanningSettings(
            final Integer page,
            final Integer size,
            final String sortBy,
            final String sortDirection,
            final String keyword,
            final String orgId);

    ApiResponse<DtoResPlanningSettings> createPlanningSettings(final DtoReqPlanningSettings dtoReqPlanningSettings);

    ApiResponse<DtoResPlanningSettings> updatePlanningSettingsByUuid(final String uuid, final DtoReqPlanningSettings dtoReqPlanningSettings);

    ApiResponse<Void> deletePlanningSettingsByUuid(final String uuid);

    Integer getMaxControlNumber(String organizationId, String category);

    ApiResponse<EntityPlanSetting> getPlanSettingById(final Integer planSettingId);
}