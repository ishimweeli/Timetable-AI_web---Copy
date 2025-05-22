package com.ist.timetabling.User.controller;

import com.ist.timetabling.User.dto.req.DtoResUser;
import com.ist.timetabling.Auth.dto.req.DtoReqAutRegister;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.User.service.ServiceUser;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/user")
@Validated
public class ControllerUser {

    private final ServiceUser serviceUser;

    @Autowired
    public ControllerUser(final ServiceUser serviceUser) {
        this.serviceUser = serviceUser;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<DtoResUser>> registerUser(@Valid @RequestBody final DtoReqAutRegister request) {
        final ApiResponse<DtoResUser> apiResponse = serviceUser.registerUser(request);
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }
}