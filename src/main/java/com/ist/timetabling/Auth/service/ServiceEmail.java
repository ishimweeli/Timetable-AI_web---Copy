package com.ist.timetabling.Auth.service;

import com.ist.timetabling.Auth.dto.res.DtoEmailResponse;
import com.ist.timetabling.Auth.dto.req.DtoEmailRequest;
import com.ist.timetabling.Core.model.ApiResponse;


public interface ServiceEmail {

    ApiResponse<DtoEmailResponse> sendEmail(final DtoEmailRequest emailRequest);

}
