package com.ist.timetabling.Period.controller;

import com.ist.timetabling.Period.dto.req.DtoReqSchedulePreference;
import com.ist.timetabling.Period.dto.res.DtoResSchedulePreference;
import com.ist.timetabling.Period.service.ServiceSchedulePreference;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/schedule-preferences")
public class ControllerSchedulePreference {

    private final ServiceSchedulePreference serviceSchedulePreference;

    @Autowired
    public ControllerSchedulePreference(final ServiceSchedulePreference serviceSchedulePreference) {
        this.serviceSchedulePreference = serviceSchedulePreference;
    }

    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<List<DtoResSchedulePreference>> getActivePreferencesByOrganization(
            @PathVariable final Integer organizationId) {
        return ResponseEntity.ok(serviceSchedulePreference.getAllActivePreferencesByOrganization(organizationId));
    }

    @GetMapping("/day/{dayOfWeek}")
    public ResponseEntity<List<DtoResSchedulePreference>> getPreferencesByDayOfWeek(
            @PathVariable final Integer dayOfWeek) {
        return ResponseEntity.ok(serviceSchedulePreference.getAllPreferencesByDayOfWeek(dayOfWeek));
    }

    @GetMapping("/period/{periodId}/day/{dayOfWeek}")
    public ResponseEntity<List<DtoResSchedulePreference>> getPreferencesByPeriodIdAndDayOfWeek(
            @PathVariable final Integer periodId,
            @PathVariable final Integer dayOfWeek) {
        return ResponseEntity.ok(serviceSchedulePreference.getAllPreferencesByPeriodIdAndDayOfWeek(periodId, dayOfWeek));
    }

    @PostMapping
    public ResponseEntity<DtoResSchedulePreference> createSchedulePreference(
            @RequestBody final DtoReqSchedulePreference requestDTO) {
        return new ResponseEntity<>(serviceSchedulePreference.createSchedulePreference(requestDTO), HttpStatus.CREATED);
    }

    @PutMapping("/uuid/{uuid}")
    public ResponseEntity<DtoResSchedulePreference> updateSchedulePreference(
            @PathVariable final String uuid,
            @RequestBody final DtoReqSchedulePreference requestDTO) {
        return ResponseEntity.ok(serviceSchedulePreference.updateSchedulePreference(uuid, requestDTO));
    }

    @DeleteMapping("/uuid/{uuid}")
    public ResponseEntity<Void> deletePreference(
            @PathVariable final String uuid,
            @RequestParam final Integer userId) {
        serviceSchedulePreference.deletePreference(uuid, userId);
        return ResponseEntity.noContent().build();
    }
}
