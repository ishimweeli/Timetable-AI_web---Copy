package com.ist.timetabling.Auth.exception;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.model.I18n;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.access.AccessDeniedHandler;

import java.io.IOException;

import static com.ist.timetabling.Auth.constant.ConstantI18nAuth.I18N_AUTH_ACCESS_DENIED;

@Slf4j
public class ExceptionAuthAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(final HttpServletRequest httpServletRequest, final HttpServletResponse response, final AccessDeniedException accessDeniedException) throws IOException, ServletException {
        final I18n i18n = new I18n(httpServletRequest);

        // Get current authentication
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : "unknown";
        String authorities = auth != null ? auth.getAuthorities().toString() : "none";
        String requestURI = httpServletRequest.getRequestURI();

        log.error("Access denied for user: {} with authorities: {} trying to access: {}",
                username, authorities, requestURI);
        log.error("Exception details: {}", accessDeniedException.getMessage());

        ApiResponse<Object> apiResponse = ApiResponse.error(
                HttpStatus.FORBIDDEN, i18n.getAuth(I18N_AUTH_ACCESS_DENIED)
        );
        response.setContentType("application/json");
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.getWriter().write(new ObjectMapper().writeValueAsString(apiResponse));
    }
}