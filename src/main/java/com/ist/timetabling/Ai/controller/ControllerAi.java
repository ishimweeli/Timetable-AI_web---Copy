package com.ist.timetabling.Ai.controller;

import com.ist.timetabling.Ai.dto.req.DtoReqAi;
import com.ist.timetabling.Ai.service.ServiceAi;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Timetable.dto.res.DtoResTimetable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@Slf4j
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class ControllerAi {

    private final ServiceAi serviceAi;

    @PostMapping("/")
    public ResponseEntity<ApiResponse<DtoResTimetable>> chat(@RequestBody final DtoReqAi dtoReqAi) {
        final ApiResponse<DtoResTimetable> response = serviceAi.chat(dtoReqAi);
        if(response.isSuccess()) {
            return ResponseEntity.ok(response);
        }else {
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/data")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAiInputData(
            @RequestParam("planSettingsId") final Integer planSettingsId) {
        final ApiResponse<Map<String, Object>> response = serviceAi.getAiInputData(planSettingsId);
        if(response.isSuccess()) {
            return ResponseEntity.ok(response);
        }else {
            return ResponseEntity.badRequest().body(response);
        }
    }
}