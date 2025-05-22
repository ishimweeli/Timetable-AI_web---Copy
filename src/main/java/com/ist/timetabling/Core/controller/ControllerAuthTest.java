package com.ist.timetabling.Core.controller;

import com.ist.timetabling.Core.model.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth-test")
@Slf4j
@RequiredArgsConstructor
public class ControllerAuthTest {

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testAdminAccess() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("User '{}' with authorities '{}' accessed admin endpoint", 
                auth.getName(), auth.getAuthorities());
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "You have successfully accessed the admin endpoint");
        response.put("user", auth.getName());
        response.put("authorities", auth.getAuthorities().toString());
        
        return ResponseEntity.ok(ApiResponse.success(response, "Admin access successful"));
    }

    @GetMapping("/manager")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testManagerAccess() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("User '{}' with authorities '{}' accessed manager endpoint", 
                auth.getName(), auth.getAuthorities());
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "You have successfully accessed the manager endpoint");
        response.put("user", auth.getName());
        response.put("authorities", auth.getAuthorities().toString());
        
        return ResponseEntity.ok(ApiResponse.success(response, "Manager access successful"));
    }

    @GetMapping("/admin-or-manager")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testAdminOrManagerAccess() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("User '{}' with authorities '{}' accessed admin-or-manager endpoint", 
                auth.getName(), auth.getAuthorities());
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "You have successfully accessed the admin-or-manager endpoint");
        response.put("user", auth.getName());
        response.put("authorities", auth.getAuthorities().toString());
        
        return ResponseEntity.ok(ApiResponse.success(response, "Admin or Manager access successful"));
    }
}
