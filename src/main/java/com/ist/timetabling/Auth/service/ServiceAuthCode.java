package com.ist.timetabling.Auth.service;

import com.ist.timetabling.Auth.dto.req.DtoReqAuthCodeVerification;
import com.ist.timetabling.Auth.entity.EntityAuthCode;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.User.entity.EntityUser;

public interface ServiceAuthCode {

    ApiResponse<Void> generateVerificationCode(EntityUser user, EntityAuthCode.AuthCodeType type, String ipAddress);

    ApiResponse<Void> verifyAuthCode(DtoReqAuthCodeVerification verificationRequest, EntityUser user);

} 