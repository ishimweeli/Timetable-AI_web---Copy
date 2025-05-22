package com.ist.timetabling.Timetable.controller;

import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Timetable.dto.req.DtoReqManualScheduleEntry;
import com.ist.timetabling.Timetable.dto.req.DtoReqTimetableEntry;
import com.ist.timetabling.Timetable.dto.res.DtoResScheduleValidation;
import com.ist.timetabling.Timetable.dto.res.DtoResTimetableEntry;
import com.ist.timetabling.Timetable.service.ServiceManualScheduling;
import com.ist.timetabling.Timetable.service.ServiceTimetableEntry;
import org.springframework.beans.factory.annotation.Autowired;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/v1/manual-scheduling")
@Slf4j
@SuppressWarnings("unchecked")
public class ControllerManualScheduling {

    private final ServiceManualScheduling serviceManualScheduling;
    private final ServiceTimetableEntry serviceTimetableEntry;

    @Autowired
    public ControllerManualScheduling(ServiceManualScheduling serviceManualScheduling, ServiceTimetableEntry serviceTimetableEntry) {
        this.serviceManualScheduling = serviceManualScheduling;
        this.serviceTimetableEntry = serviceTimetableEntry;
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<DtoResScheduleValidation>> validateScheduleEntry(@RequestBody DtoReqManualScheduleEntry dtoReqManualScheduleEntry) {
        DtoResScheduleValidation validation = serviceManualScheduling.validateScheduleEntry(dtoReqManualScheduleEntry);
        ApiResponse<DtoResScheduleValidation> apiResponse = ApiResponse.success(
                HttpStatus.OK,
                "Schedule entry validation result",
                validation
        );
        return ResponseEntity.ok(apiResponse);
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<DtoResScheduleValidation>> createScheduleEntry(@RequestBody DtoReqManualScheduleEntry dtoReqManualScheduleEntry) {
        DtoResScheduleValidation validation = serviceManualScheduling.validateScheduleEntry(dtoReqManualScheduleEntry);
        if (validation.getIsValid() == null || !validation.getIsValid()) {
            return ResponseEntity.badRequest().body(
                    ApiResponse.error(HttpStatus.BAD_REQUEST, "Invalid schedule entry")
            );
        }
        serviceTimetableEntry.createManualEntry(dtoReqManualScheduleEntry);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success(HttpStatus.CREATED, "Schedule entry created successfully", null)
        );
    }

    @DeleteMapping("/entry/{entryId}")
    public ResponseEntity<ApiResponse<Void>> removeScheduleEntry(@PathVariable Integer entryId) {
        serviceTimetableEntry.removeEntry(entryId);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).body(
                ApiResponse.success(HttpStatus.NO_CONTENT, "Schedule entry removed successfully", null)
        );
    }

    @GetMapping("/entries/{timetableId}")
    public ResponseEntity<ApiResponse<List<DtoResTimetableEntry>>> getEntriesForTimetable(@PathVariable Integer timetableId) {
        List<DtoResTimetableEntry> entries = serviceTimetableEntry.getEntriesForTimetable(timetableId);
        return ResponseEntity.ok(
                ApiResponse.success(HttpStatus.OK, "Entries retrieved successfully", entries)
        );
    }

    @PostMapping("/entries/{timetableId}")
    public ResponseEntity<ApiResponse<Void>> saveEntriesForTimetable(
            @PathVariable Integer timetableId,
            @RequestBody List<DtoReqTimetableEntry> entries) {
        serviceTimetableEntry.saveEntriesForTimetable(timetableId, entries);
        return ResponseEntity.ok(
                ApiResponse.success(HttpStatus.OK, "Entries saved successfully", null)
        );
    }

    @GetMapping("/entries/class/{classId}")
    public ResponseEntity<ApiResponse<List<DtoResTimetableEntry>>> getEntriesForClass(@PathVariable Integer classId) {
        List<DtoResTimetableEntry> entries = serviceTimetableEntry.convertToEntryDtos(serviceTimetableEntry.getEntriesForClass(classId), null);
        return ResponseEntity.ok(
                ApiResponse.success(HttpStatus.OK, "Entries for class (including class band entries) retrieved successfully", entries)
        );
    }

    @GetMapping("/entries/class-band/{classBandId}")
    public ResponseEntity<ApiResponse<List<DtoResTimetableEntry>>> getEntriesForClassBand(@PathVariable Integer classBandId) {
        List<DtoResTimetableEntry> entries = serviceTimetableEntry.convertToEntryDtos(serviceTimetableEntry.getEntriesForClassBand(classBandId), null);
        return ResponseEntity.ok(
                ApiResponse.success(HttpStatus.OK, "Entries for class band retrieved successfully", entries)
        );
    }
}