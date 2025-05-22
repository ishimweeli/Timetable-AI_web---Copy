package com.ist.timetabling.Auth.service;

import com.ist.timetabling.Auth.dto.req.DtoReqAuthCodeVerification;
import com.ist.timetabling.Auth.dto.req.DtoReqAuthLogin;
import com.ist.timetabling.Auth.dto.req.DtoReqAuthRefreshToken;
import com.ist.timetabling.Auth.dto.req.DtoReqAutRegister;
import com.ist.timetabling.Auth.dto.res.DtoResAuthLogin;
import com.ist.timetabling.Auth.dto.res.DtoResAuthRefreshToken;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.User.dto.res.DtoResUser;


public interface ServiceAuth {

    ApiResponse<DtoResUser> register(final DtoReqAutRegister dtoReqAutRegister);

    ApiResponse<DtoResAuthLogin> login(final DtoReqAuthLogin dtoReqAuthLogin);

    ApiResponse<DtoResUser> getCurrentUser();

    ApiResponse<DtoResAuthRefreshToken> refreshToken(final DtoReqAuthRefreshToken dtoReqAuthRefreshToken);

    ApiResponse<Void> logout(final String token);

    ApiResponse<Void> verifyRegistrationCode(DtoReqAuthCodeVerification request);

    ApiResponse<Void> resendVerificationCode(String email);
}
