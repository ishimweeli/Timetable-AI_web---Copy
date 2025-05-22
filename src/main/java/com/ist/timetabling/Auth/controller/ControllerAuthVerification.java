package com.ist.timetabling.Auth.controller;

import com.ist.timetabling.Auth.dto.req.DtoReqAuthCodeVerification;
import com.ist.timetabling.Auth.service.ServiceAuth;
import com.ist.timetabling.Core.model.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth/verification")
@RequiredArgsConstructor
public class ControllerAuthVerification {

    private final ServiceAuth serviceAuth;

    @PostMapping("/verify-code")
    public ResponseEntity<ApiResponse<Void>> verifyCode(
        @RequestBody DtoReqAuthCodeVerification request
    ) {
        ApiResponse<Void> response = serviceAuth.verifyRegistrationCode(request);
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/resend-code")
    public ResponseEntity<ApiResponse<Void>> resendCode(
        @RequestBody DtoReqAuthCodeVerification request
    ) {
        ApiResponse<Void> response = serviceAuth.resendVerificationCode(request.getEmail());
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}