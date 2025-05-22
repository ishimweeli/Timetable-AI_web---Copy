package com.ist.timetabling.Timetable.service;

import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Timetable.dto.req.DtoReqManualScheduleEntry;
import com.ist.timetabling.Timetable.dto.req.DtoReqTimetableEntry;
import com.ist.timetabling.Timetable.dto.res.DtoResTimetableEntry;
import com.ist.timetabling.Timetable.entity.EntityTimetableEntry;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;

public interface ServiceTimetableEntry {

    ApiResponse<List<DtoResTimetableEntry>> getAllTimetableEntries(final Integer timetableId, final int page, final int size, final String sortBy, final String direction);

    DtoResTimetableEntry getTimetableEntryByUuid(final String uuid);

    List<DtoResTimetableEntry> getTimetableEntriesByUuid(final String uuid);

    List<DtoResTimetableEntry> getTimetableEntriesByUuidAndDay(final String uuid, final Integer dayOfWeek);

    List<DtoResTimetableEntry> getTimetableEntriesByUuidAndSubject(final String uuid, final Integer subjectId);

    List<DtoResTimetableEntry> getTimetableEntriesByUuidAndRoom(final String uuid, final Integer roomId);

    List<DtoResTimetableEntry> getTimetableEntriesByUuidAndSubjectUuid(final String uuid, final String subjectUuid);

    List<DtoResTimetableEntry> getTimetableEntriesByUuidAndRoomUuid(final String uuid, final String roomUuid);

    ApiResponse<DtoResTimetableEntry> create(final DtoReqTimetableEntry dtoReqTimetableEntry);

    ApiResponse<List<DtoResTimetableEntry>> createAll(final List<DtoReqTimetableEntry> listDtoReqTimetableEntry);

    DtoResTimetableEntry createManualEntry(final DtoReqManualScheduleEntry dtoReqManualScheduleEntry);

    void removeEntry(final Integer entryid);

    void saveEntriesForTimetable(Integer timetableId, List<DtoReqTimetableEntry> entries);
    List<DtoResTimetableEntry> getEntriesForTimetable(Integer timetableId);

    List<EntityTimetableEntry> getEntriesForClass(Integer classId);
    List<EntityTimetableEntry> getEntriesForClassBand(Integer classBandId);

    List<DtoResTimetableEntry> convertToEntryDtos(List<EntityTimetableEntry> entries, Integer timetableId);
    ApiResponse<DtoResTimetableEntry> updateLockStatus(final String uuid, final Boolean isLocked);

    ApiResponse<List<DtoResTimetableEntry>> bulkUpdateLockStatus(final String timetableUuid, final List<String> entryUuids, final Boolean isLocked);
}
