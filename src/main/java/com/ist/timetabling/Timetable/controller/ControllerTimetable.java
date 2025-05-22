package com.ist.timetabling.Timetable.controller;

import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Timetable.dto.res.DtoResTimetable;
import com.ist.timetabling.Timetable.dto.res.DtoResTimetableEntry;
import com.ist.timetabling.Timetable.dto.req.DtoReqTimetable;
import com.ist.timetabling.Timetable.dto.req.DtoReqTimetableEntry;
import com.ist.timetabling.Timetable.dto.res.DtoResTimetableStats;
import com.ist.timetabling.Timetable.service.ServiceTimetable;
import com.ist.timetabling.Timetable.service.ServiceTimetableEntry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/timetables")
public class ControllerTimetable {

    private final ServiceTimetable serviceTimetable;
    private final ServiceTimetableEntry serviceTimetableEntry;
 

    @Autowired
    public ControllerTimetable(ServiceTimetable serviceTimetable,ServiceTimetableEntry serviceTimetableEntry) {
        this.serviceTimetable = serviceTimetable;
        this.serviceTimetableEntry = serviceTimetableEntry;
    }

    @GetMapping
    public ResponseEntity<List<DtoResTimetable>> getAllTimetables(@RequestParam Integer organizationId) {
        List<DtoResTimetable> timetables = serviceTimetable.getAllTimetables(organizationId);
        return ResponseEntity.ok(timetables);
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<DtoResTimetable> getTimetableByUuid(@PathVariable String uuid) {
        DtoResTimetable timetable = serviceTimetable.getTimetableByUuid(uuid);
        return ResponseEntity.ok(timetable);
    }

    @GetMapping("/{uuid}/entries")
    public ResponseEntity<ApiResponse<List<DtoResTimetableEntry>>> getTimetableEntries(
            @PathVariable String uuid,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {
        

        DtoResTimetable timetable = serviceTimetable.getTimetableByUuid(uuid);
        Integer timetableId = timetable.getId();
        
        ApiResponse<List<DtoResTimetableEntry>> apiResponse = serviceTimetableEntry.getAllTimetableEntries(
                timetableId, page, size, sortBy, direction);
        
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping("/{uuid}/entries/day/{dayOfWeek}")
    public ResponseEntity<List<DtoResTimetableEntry>> getTimetableEntriesByDay(@PathVariable String uuid, @PathVariable Integer dayOfWeek) {
        List<DtoResTimetableEntry> entries = serviceTimetable.getTimetableEntriesByUuidAndDay(uuid, dayOfWeek);
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/{uuid}/entries/subject/{subjectUuid}")
    public ResponseEntity<List<DtoResTimetableEntry>> getTimetableEntriesBySubject(@PathVariable String uuid, @PathVariable String subjectUuid) {
        List<DtoResTimetableEntry> entries = serviceTimetable.getTimetableEntriesByUuidAndSubjectUuid(uuid, subjectUuid);
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/{uuid}/entries/room/{roomUuid}")
    public ResponseEntity<List<DtoResTimetableEntry>> getTimetableEntriesByRoom(@PathVariable String uuid, @PathVariable String roomUuid) {
        List<DtoResTimetableEntry> entries = serviceTimetable.getTimetableEntriesByUuidAndRoomUuid(uuid, roomUuid);
        return ResponseEntity.ok(entries);
    }

    @GetMapping("/latest")
    public ResponseEntity<DtoResTimetable> getLatestTimetable(@RequestParam Integer organizationId) {
        DtoResTimetable timetable = serviceTimetable.getLatestTimetable(organizationId);
        return ResponseEntity.ok(timetable);
    }

    @GetMapping("/{uuid}/filter")
    public ResponseEntity<List<DtoResTimetableEntry>> filterTimetableEntries(@PathVariable final String uuid, @RequestParam(required = false) final List<Integer> teacherIds, @RequestParam(required = false) final List<Integer> roomIds, @RequestParam(required = false) final List<Integer> subjectIds, @RequestParam(required = false) final List<Integer> classIds) {
        try {
            final List<DtoResTimetableEntry> filteredEntries = serviceTimetable.filterTimetableEntries(uuid, teacherIds, roomIds, subjectIds, classIds);
            return ResponseEntity.ok(filteredEntries);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{uuid}/entry-positions")
    public ResponseEntity<List<DtoResTimetableEntry>> updateTimetableEntryPositions(@PathVariable String uuid, @RequestBody List<DtoReqTimetableEntry> entryPositions, @RequestParam(required = false, defaultValue = "swap") String operation) {
        List<DtoResTimetableEntry> response = serviceTimetable.updateTimetableEntryPositions(uuid, entryPositions, operation);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{uuid}/stats")
    public ResponseEntity<DtoResTimetableStats> getTimetableStats(@PathVariable String uuid) {
        DtoResTimetableStats stats = serviceTimetable.getTimetableStats(uuid);
        return ResponseEntity.ok(stats);
    }

    @PostMapping
    public ResponseEntity<DtoResTimetable> createTimetable(@RequestBody DtoReqTimetable dtoReqTimetable) {
        DtoResTimetable timetable = serviceTimetable.createTimetable(dtoReqTimetable);
        return ResponseEntity.status(HttpStatus.CREATED).body(timetable);
    }

    @PostMapping("/find-or-create")
    public ResponseEntity<DtoResTimetable> findOrCreateTimetable(@RequestBody DtoReqTimetable dtoReqTimetable, @RequestParam(defaultValue = "true") boolean createIfNotFound) {
        DtoResTimetable timetable = serviceTimetable.findOrCreateTimetable(dtoReqTimetable, createIfNotFound);
        return ResponseEntity.ok(timetable);
    }

    @PutMapping("/entries/{uuid}/lock")
    public ResponseEntity<ApiResponse<DtoResTimetableEntry>> updateEntryLockStatus(
            @PathVariable final String uuid,
            @RequestParam final Boolean isLocked
    ) {
        final ApiResponse<DtoResTimetableEntry> response = serviceTimetableEntry.updateLockStatus(uuid, isLocked);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/entries/bulk-lock")
    public ResponseEntity<ApiResponse<List<DtoResTimetableEntry>>> bulkUpdateEntryLockStatus(@RequestParam final String timetableUuid, @RequestBody final List<String> entryUuids, @RequestParam final Boolean isLocked) {
        final ApiResponse<List<DtoResTimetableEntry>> response = serviceTimetableEntry.bulkUpdateLockStatus(timetableUuid, entryUuids, isLocked);
        
        if (response.isSuccess()) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/{uuid}/restore-entry")
    public ResponseEntity<List<DtoResTimetableEntry>> restoreDeletedEntry(@PathVariable final String uuid, @RequestParam final Integer dayOfWeek, @RequestParam final Integer period) {
        final List<DtoResTimetableEntry> response = serviceTimetable.restoreDeletedEntry(uuid, dayOfWeek, period);
        return ResponseEntity.ok(response);
    }
}