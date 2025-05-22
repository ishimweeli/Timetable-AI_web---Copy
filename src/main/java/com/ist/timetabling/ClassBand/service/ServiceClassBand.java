package com.ist.timetabling.ClassBand.service;

import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.ClassBand.entity.EntityClassBand;
import com.ist.timetabling.ClassBand.dto.req.DtoReqClassBand;
import com.ist.timetabling.ClassBand.dto.req.DtoReqClassBandUpdate;
import com.ist.timetabling.Period.dto.req.DtoReqSchedulePreference;
import com.ist.timetabling.ClassBand.dto.res.DtoResClassBand;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ServiceClassBand {

    ApiResponse<EntityClassBand> getClassBandByUuid(final String uuid);

    ApiResponse<List<EntityClassBand>> searchClassBandsByName(final String keyword);

    ApiResponse<List<EntityClassBand>> getClassBandsByStatus(final Integer statusId, final Integer page, final Integer size);

    ApiResponse<List<EntityClassBand>> getAllClassBands(final Integer page,
                                                        final Integer size,
                                                        final String sortBy,
                                                        final String sortDirection,
                                                        final String keyword,
                                                        final Integer orgId,
                                                        final Integer planSettingsId);

    ApiResponse<EntityClassBand> createClassBand(final DtoReqClassBand dtoReqClassBand);

    ApiResponse<Void> deleteClassBandByUuid(final String uuid);

    ApiResponse<EntityClassBand> updateClassBandByUuid(final String uuid, final DtoReqClassBandUpdate dtoReqClassBandUpdate);

    @Transactional
    ApiResponse<EntityClassBand> updateSchedulePreference(final String preferenceUuid, final String preferenceType, final Boolean preferenceValue);

    ApiResponse<EntityClassBand> addSchedulePreferenceToClassBand(final String classBandUuid, final Integer periodId, final Integer dayOfWeek, final String preferenceType, final Boolean preferenceValue);

    ApiResponse<EntityClassBand> addSchedulePreferencesToClassBand(final String classBandUuid, final DtoReqSchedulePreference preferences);

    ApiResponse<List<EntityClassBand>> getClassBandAllPreferences(final String classBandUuid);

    ApiResponse<EntityClassBand> getClassBandPreferenceForSchedule(final String classBandUuid, final Integer periodId, final Integer dayOfWeek);

    ApiResponse<?> clearClassBandPreferencesForSchedule(final String classBandUuid, final String scheduleUuid);
    
    ApiResponse<List<EntityClassBand>> getClassBandsByPlanSettingsId(final Integer planSettingsId);
}