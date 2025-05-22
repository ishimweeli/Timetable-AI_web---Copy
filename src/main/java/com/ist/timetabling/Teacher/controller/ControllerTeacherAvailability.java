package com.ist.timetabling.Teacher.controller;

import com.ist.timetabling.Teacher.dto.res.DtoResTeacherAvailability;
import com.ist.timetabling.Teacher.dto.req.DtoReqTeacherAvailability;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Teacher.service.ServiceTeacherAvailability;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/teachers/{teacherId}/availabilities")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class ControllerTeacherAvailability {

    private final ServiceTeacherAvailability serviceTeacherAvailability;

    @Autowired
    public ControllerTeacherAvailability(final ServiceTeacherAvailability serviceTeacherAvailability) {
        this.serviceTeacherAvailability = serviceTeacherAvailability;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DtoResTeacherAvailability>> createAvailability(@Valid @RequestBody final DtoReqTeacherAvailability dtoReqTeacherAvailability,@PathVariable("teacherId") final Integer teacherId ) {
        final ApiResponse<DtoResTeacherAvailability> apiResponse =
                serviceTeacherAvailability.createTeacherAvailability(dtoReqTeacherAvailability, teacherId );
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse<DtoResTeacherAvailability>> updateAvailability(@Valid @RequestBody final DtoReqTeacherAvailability dtoReqTeacherAvailability, @PathVariable("teacherId") final Integer teacherId, @PathVariable("uuid") final String uuid ) {
        final ApiResponse<DtoResTeacherAvailability> apiResponse =
                serviceTeacherAvailability.updateTeacherAvailability(dtoReqTeacherAvailability,teacherId, uuid);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DtoResTeacherAvailability>>> getAllAvailabilities(@PathVariable("teacherId") final Integer teacherId) {
        final ApiResponse<List<DtoResTeacherAvailability>> apiResponse =
                serviceTeacherAvailability.getAllTeacherAvailabilities(teacherId);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<DtoResTeacherAvailability>> getAvailabilityByUuid(@PathVariable("teacherId") final Integer teacherId, @PathVariable("uuid") final String uuid
    ) {
        final ApiResponse<DtoResTeacherAvailability> response =
                serviceTeacherAvailability.getTeacherAvailabilityByUuid(teacherId, uuid);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse<Void>> deleteAvailability(@PathVariable("teacherId") final Integer teacherId, @PathVariable("uuid") final String uuid) {
        final ApiResponse<Void> apiResponse =
                serviceTeacherAvailability.deleteTeacherAvailability(teacherId, uuid);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

}
