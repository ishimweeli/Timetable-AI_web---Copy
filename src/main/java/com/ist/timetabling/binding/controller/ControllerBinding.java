package com.ist.timetabling.binding.controller;

import com.ist.timetabling.Class.dto.res.DtoResClass;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.binding.dto.req.DtoReqBinding;
import com.ist.timetabling.binding.dto.req.DtoReqBindingSearch;
import com.ist.timetabling.binding.dto.req.DtoReqBindingReplace;
import com.ist.timetabling.binding.dto.req.DtoReqBindingUpdate;
import com.ist.timetabling.binding.dto.res.DtoResBinding;
import com.ist.timetabling.binding.dto.res.DtoResBindingReplaceResult;
import com.ist.timetabling.binding.service.ServiceBinding;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/bindings")
@Slf4j
@RequiredArgsConstructor
public class ControllerBinding {

    private final ServiceBinding serviceBinding;

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<DtoResBinding>> getBindingByUuid(@PathVariable final String uuid) {
        ApiResponse<DtoResBinding> response = serviceBinding.getBindingByUuid(uuid);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DtoResBinding>>> getAllBindings(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String sortDirection,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String orgId,
            @RequestParam(required = false) String teacherUuid,
            @RequestParam(required = false) Integer planSettingsId) {
        ApiResponse<List<DtoResBinding>> response = serviceBinding.getAllBindings(
                page, size, sortBy, sortDirection, keyword, orgId, teacherUuid, planSettingsId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<DtoResBinding>>> searchBindingsByName(@RequestParam final  String keyword) {
        ApiResponse<List<DtoResBinding>> response = serviceBinding.searchBindingsByName(keyword);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/status/{statusId}")
    public ResponseEntity<ApiResponse<List<DtoResBinding>>> getBindingsByStatus(@PathVariable final Integer statusId, @RequestParam(required = false) Integer page, @RequestParam(required = false) Integer size) {
        ApiResponse<List<DtoResBinding>> response = serviceBinding.getBindingsByStatus(statusId, page, size);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DtoResBinding>> createBinding(@Valid @RequestBody DtoReqBinding dtoReqBinding) {
        ApiResponse<DtoResBinding> response = serviceBinding.createBinding(dtoReqBinding);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse<DtoResBinding>> updateBinding(@PathVariable final String uuid, @Valid @RequestBody DtoReqBindingUpdate dtoReqBindingUpdate) {
        ApiResponse<DtoResBinding> response = serviceBinding.updateBindingByUuid(uuid, dtoReqBindingUpdate);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse<Void>> deleteBinding(@PathVariable final String uuid) {
        ApiResponse<Void> response = serviceBinding.deleteBindingByUuid(uuid);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/teachers/{teacherUuid}")
    public ResponseEntity<ApiResponse<List<DtoResBinding>>> getTeacherBindings(
            @PathVariable final String teacherUuid,
            @RequestParam(required = false) Integer planSettingsId) {
        ApiResponse<List<DtoResBinding>> response = serviceBinding.getTeacherBindings(teacherUuid, planSettingsId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PutMapping("/{uuid}/rules/{ruleUuid}")
    public ResponseEntity<ApiResponse<DtoResBinding>> addRuleToBinding(@PathVariable final String uuid, @PathVariable final  String ruleUuid
    ) {
        ApiResponse<DtoResBinding> response = serviceBinding.addRuleToBinding(uuid, ruleUuid);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @DeleteMapping("/{uuid}/rules/{ruleUuid}")
    public ResponseEntity<ApiResponse<DtoResBinding>> removeRuleFromBinding(@PathVariable final String uuid, @PathVariable final String ruleUuid) {
        ApiResponse<DtoResBinding> response = serviceBinding.removeRuleFromBinding(uuid, ruleUuid);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/classes/{classUuid}")
    public ResponseEntity<ApiResponse<List<DtoResBinding>>> getClassBindings(
            @PathVariable final String classUuid,
            @RequestParam(required = false) Integer planSettingsId) {
        ApiResponse<List<DtoResBinding>> response = serviceBinding.getClassBindings(classUuid, planSettingsId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/rooms/{roomUuid}")
    public ResponseEntity<ApiResponse<List<DtoResBinding>>> getRoomBindings(
            @PathVariable final String roomUuid,
            @RequestParam(required = false) Integer planSettingsId) {
        ApiResponse<List<DtoResBinding>> response = serviceBinding.getRoomBindings(roomUuid, planSettingsId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/subjects/{subjectUuid}")
    public ResponseEntity<ApiResponse<List<DtoResBinding>>> getSubjectBindings(
            @PathVariable final  String subjectUuid,
            @RequestParam(required = false) Integer planSettingsId) {
        ApiResponse<List<DtoResBinding>> response = serviceBinding.getSubjectBindings(subjectUuid, planSettingsId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/class-bands/{classBandUuid}")
    public ResponseEntity<ApiResponse<List<DtoResBinding>>> getClassBandBindings(
            @PathVariable final String classBandUuid,
            @RequestParam(required = false) Integer planSettingsId) {
        ApiResponse<List<DtoResBinding>> response = serviceBinding.getClassBandBindings(classBandUuid, planSettingsId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/plan-settings/{planSettingsId}")
    public ResponseEntity<ApiResponse<List<DtoResBinding>>> getBindingsByPlanSettings(@PathVariable final Integer planSettingsId) {
        ApiResponse<List<DtoResBinding>> response = serviceBinding.getBindingsByPlanSettings(planSettingsId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<DtoResBinding>>> searchBindings(@Valid @RequestBody DtoReqBindingSearch dtoReqBindingSearch) {
        ApiResponse<List<DtoResBinding>> response = serviceBinding.searchBindings(dtoReqBindingSearch);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/replace")
    public ResponseEntity<ApiResponse<DtoResBindingReplaceResult>> replaceBindings(@Valid @RequestBody DtoReqBindingReplace dtoReqBindingReplace) {
        ApiResponse<DtoResBindingReplaceResult> response = serviceBinding.replaceBindings(dtoReqBindingReplace);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/teachers/{teacherId}/classes")
    public ResponseEntity<ApiResponse<List<DtoResClass>>> getClassesByTeacherId(@PathVariable final Integer teacherId) {
        ApiResponse<List<DtoResClass>> response = serviceBinding.getClassesByTeacherId(teacherId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/rooms/{roomId}/classes")
    public ResponseEntity<ApiResponse<List<DtoResClass>>> getClassesByRoomId(@PathVariable final Integer roomId) {
        ApiResponse<List<DtoResClass>> response = serviceBinding.getClassesByRoomId(roomId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @GetMapping("/subjects/{subjectId}/classes")
    public ResponseEntity<ApiResponse<List<DtoResClass>>> getClassesBySubjectId(@PathVariable final Integer subjectId) {
        ApiResponse<List<DtoResClass>> response = serviceBinding.getClassesBySubjectId(subjectId);
        return ResponseEntity.status(response.getStatus()).body(response);
    }




}