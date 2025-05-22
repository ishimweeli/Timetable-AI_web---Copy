package com.ist.timetabling.Period.service;

import com.ist.timetabling.Period.dto.req.DtoReqSchedulePreference;
import com.ist.timetabling.Period.dto.res.DtoResSchedulePreference;
import java.util.List;
import java.util.Optional;

public interface ServiceSchedulePreference {

    List<DtoResSchedulePreference> getAllPreferencesBySchedule(final String scheduleUuid);

    Optional<DtoResSchedulePreference> getPreferenceByUuid(final String uuid);

    List<DtoResSchedulePreference> getAllActivePreferencesByOrganization(final Integer organizationId);

    List<DtoResSchedulePreference> getAllPreferencesByDayOfWeek(final Integer dayOfWeek);

    List<DtoResSchedulePreference> getAllPreferencesByPeriodIdAndDayOfWeek(final Integer periodId, final Integer dayOfWeek);

    DtoResSchedulePreference createSchedulePreference(final DtoReqSchedulePreference requestDTO);

    DtoResSchedulePreference updateSchedulePreference(final String uuid, final DtoReqSchedulePreference requestDTO);

    void deletePreference(final String uuid, final Integer userId);
}
