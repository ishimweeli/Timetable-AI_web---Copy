package com.ist.timetabling.Core.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ist.timetabling.Core.model.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import java.io.IOException;


@Component
public class FilterCoreExceptionHandler {

    private final ObjectMapper objectMapper;

    public FilterCoreExceptionHandler(final ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void handleException(final HttpServletResponse httpServletResponse, final HttpServletRequest httpServletRequest, final Exception exception) throws IOException {
        final ApiResponse<Void> apiResponse = ApiResponse.error(
                HttpStatus.FORBIDDEN,
                "Access Denied" + " : "+ httpServletRequest.getRequestURI()
        );
        httpServletResponse.setContentType(MediaType.APPLICATION_JSON_VALUE);
        httpServletResponse.setStatus(HttpStatus.FORBIDDEN.value());
        httpServletResponse.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }

    public void handleException(final HttpServletResponse httpServletResponse, final HttpServletRequest httpServletRequest, final String message) throws IOException {
        final ApiResponse<Void> apiResponse = ApiResponse.error(
                HttpStatus.FORBIDDEN,
                "Access Denied" +" : "+ message + " : "+ httpServletRequest.getRequestURI()
        );
        httpServletResponse.setContentType(MediaType.APPLICATION_JSON_VALUE);
        httpServletResponse.setStatus(HttpStatus.FORBIDDEN.value());
        httpServletResponse.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }

}
