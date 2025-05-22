package com.ist.timetabling.User.controller;

import com.ist.timetabling.User.dto.req.DtoReqAdminProfile;
import com.ist.timetabling.User.dto.res.DtoResAdminProfile;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.User.service.ServiceAdminProfile;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@Slf4j
@RestController
@RequestMapping("/api/v1/admin-profiles")
public class ControllerAdminProfile {
    private final ServiceAdminProfile serviceAdminProfile;

    public ControllerAdminProfile(final ServiceAdminProfile serviceAdminProfile) {
        this.serviceAdminProfile = serviceAdminProfile;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DtoResAdminProfile>> createAdminProfile(@RequestBody final DtoReqAdminProfile dtoReqAdminProfile) {
        return ResponseEntity.ok(serviceAdminProfile.createAdminProfile(dtoReqAdminProfile));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DtoResAdminProfile>>> getAllProfiles(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(serviceAdminProfile.getAllProfiles(page, size));
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<DtoResAdminProfile>> getAdminProfile(@PathVariable final String uuid) {
        return ResponseEntity.ok(serviceAdminProfile.findByUuid(uuid));
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse<DtoResAdminProfile>> updateAdminProfile(@PathVariable("uuid") String uuid, @RequestBody DtoReqAdminProfile dtoReqAdminProfile) {
            return ResponseEntity.ok(serviceAdminProfile.updateAdminProfile(uuid, dtoReqAdminProfile));

    }

    @PutMapping("/{uuid}/soft-delete")
    public ResponseEntity<ApiResponse<?>> softDeleteAdminProfile(@PathVariable final String uuid) {
        return ResponseEntity.ok(serviceAdminProfile.softDeleteAdminProfile(uuid));
    }

}