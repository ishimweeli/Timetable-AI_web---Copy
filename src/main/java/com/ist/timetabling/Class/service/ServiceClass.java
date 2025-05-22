package com.ist.timetabling.Class.service;

import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Class.entity.EntityClass;
import com.ist.timetabling.Class.dto.req.DtoReqClass;
import com.ist.timetabling.Class.dto.req.DtoReqClassUpdate;
import com.ist.timetabling.Class.dto.res.DtoResClassCsvUpload;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ServiceClass {


    ApiResponse<List<EntityClass>> getAllClasses(final Integer page,
                                                 final Integer size,
                                                 final String sortBy,
                                                 final String sortDirection,
                                                 final String keyword,
                                                 final Integer filterOrgId,
                                                 final Integer planSettingsId);


    ApiResponse<EntityClass> getClassByUuid(final String uuid);


    @Transactional
    ApiResponse<DtoResClassCsvUpload> importClassesFromCsv(DtoReqCsvUpload uploadRequest);

    ApiResponse<EntityClass> createClass(final DtoReqClass dtoReqClass);


    ApiResponse<List<EntityClass>> searchClassesByName(final String keyword);


    ApiResponse<List<EntityClass>> getClassesByStatus(final Integer statusId, final Integer page, final Integer size);


    ApiResponse<Void> deleteClassByUuid(final String uuid);

    ApiResponse<EntityClass> updateClassByUuid(final String uuid, final DtoReqClassUpdate dtoReqClassUpdate);

    ApiResponse<EntityClass> updateSchedulePreference(final String preferenceUuid,
                                                      final String preferenceType,
                                                      final Boolean preferenceValue,
                                                      final Integer periodId,
                                                      final Integer dayOfWeek);

    ApiResponse<?> deleteClassSchedulePreference(final String uuid);

    ApiResponse<EntityClass> addSchedulePreferenceToClass(final String classUuid,
                                                          final Integer periodId,
                                                          final Integer dayOfWeek,
                                                          final String preferenceType,
                                                          final Boolean preferenceValue);

    ApiResponse<List<EntityClass>> getClassAllPreferences(final String classUuid);

    ApiResponse<EntityClass> getClassPreferenceForSchedule(final String classUuid,
                                                           final Integer periodId,
                                                           final Integer dayOfWeek);

    ApiResponse<?> clearClassPreferencesForSchedule(final String classUuid, final Integer periodId, final Integer dayOfWeek);

    ApiResponse<List<EntityClass>> getClassesByPlanSettingsId(final Integer planSettingsId);

}