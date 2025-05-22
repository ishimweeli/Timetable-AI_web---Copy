package com.ist.timetabling.User.service;

import com.ist.timetabling.Auth.dto.req.DtoReqAutRegister;
import com.ist.timetabling.User.dto.req.DtoResUser;
import com.ist.timetabling.Core.model.ApiResponse;


public interface ServiceUser {

    ApiResponse<DtoResUser> registerUser(final DtoReqAutRegister request);

}
