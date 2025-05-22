package com.ist.timetabling.User.service;

import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.User.dto.res.DtoResUserProfile;
import org.springframework.security.core.Authentication;


public interface ServiceUserProfile {

    ApiResponse<DtoResUserProfile> getCurrentUserProfile(final Authentication authentication);

    DtoResUserProfile getUserProfile(final String email);

}
