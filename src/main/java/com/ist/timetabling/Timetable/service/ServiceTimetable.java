package com.ist.timetabling.Timetable.service;

import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Timetable.dto.req.DtoReqTimetable;
import com.ist.timetabling.Timetable.dto.req.DtoReqTimetableEntry;
import com.ist.timetabling.Timetable.dto.res.DtoResTimetable;
import com.ist.timetabling.Timetable.dto.res.DtoResTimetableEntry;
import com.ist.timetabling.Timetable.dto.res.DtoResTimetableStats;

import java.util.List;


public interface ServiceTimetable {

    List<DtoResTimetable> getAllTimetables(final Integer organizationId);

    ApiResponse<List<DtoResTimetableEntry>> getAllTimetablesEntries(final Integer organizationId);

    List<DtoResTimetableEntry> getAllTimetablesEntriesFlat(final Integer organizationId);

    DtoResTimetable getTimetableByUuid(final String uuid);

    List<DtoResTimetableEntry> getTimetableEntriesByUuid(final String uuid);

    List<DtoResTimetableEntry> getTimetableEntriesByUuidAndDay(final String uuid, final Integer dayOfWeek);

    List<DtoResTimetableEntry> getTimetableEntriesByUuidAndSubject(final String uuid, final Integer subjectId);

    List<DtoResTimetableEntry> getTimetableEntriesByUuidAndRoom(final String uuid, final Integer roomId);

    List<DtoResTimetableEntry> getTimetableEntriesByUuidAndSubjectUuid(final String uuid, final String subjectUuid);

    List<DtoResTimetableEntry> getTimetableEntriesByUuidAndRoomUuid(final String uuid, final String roomUuid);

    DtoResTimetable getLatestTimetable(final Integer organizationId);


    List<DtoResTimetableEntry> filterTimetableEntries(final String uuid, final List<Integer> subjectIds, final List<Integer> roomIds, final List<Integer> teacherIds,List<Integer> classIds);

    ApiResponse<DtoResTimetable> create(final DtoReqTimetable dtoReqTimetable);
    DtoResTimetable createTimetable(DtoReqTimetable dtoReqTimetable);

    DtoResTimetable findOrCreateTimetable(DtoReqTimetable dtoReqTimetable, boolean createIfNotFound);

    List<DtoResTimetableEntry> updateTimetableEntryPositions(String timetableUuid, List<DtoReqTimetableEntry> entryPositions, String operation);

    DtoResTimetableStats getTimetableStats(final String uuid);

    List<DtoResTimetableEntry> restoreDeletedEntry(final String timetableUuid, final Integer dayOfWeek, final Integer period);

}