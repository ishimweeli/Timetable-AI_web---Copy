package com.ist.timetabling.Core.filter;

import com.ist.timetabling.User.repository.RepositoryUser;
import com.ist.timetabling.User.service.impl.ServiceUserDetailsSImpl;
import com.ist.timetabling.Auth.util.UtilAuthJwt;
import com.ist.timetabling.Auth.constant.ConstantI18nAuth;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;


@Slf4j
@Component
@RequiredArgsConstructor
public class FilterCoreJwtRequest extends OncePerRequestFilter {

    public final RepositoryUser repositoryUser;

    private final UtilAuthJwt utilAuthJwt;

    private final MessageSource messageSource;

    private final List<String> PUBLIC_URLS = List.of(
            "/api/v1/auth/login",
            "/api/v1/auth/register",
            "/api/v1/auth/refresh-token",
            "/swagger-ui/index.html",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/api/auth/**"
    );

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    private final ServiceUserDetailsSImpl serviceUserDetailsSImpl;

    @Override
    protected boolean shouldNotFilter(final HttpServletRequest httpServletRequest) {
        String path = httpServletRequest.getServletPath();
        return PUBLIC_URLS.stream().anyMatch(publicUrl -> pathMatcher.match(publicUrl, path));
    }

    @Override
    protected void doFilterInternal(final HttpServletRequest httpServletRequest, final HttpServletResponse httpServletResponse,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String token = parseJwt(httpServletRequest);

            if(token == null) {
                filterChain.doFilter(httpServletRequest, httpServletResponse);
                return;
            }

            if(!utilAuthJwt.validateToken(token)) {
                if(utilAuthJwt.isTokenExpired(token)) {
                    handleAuthenticationFailure(httpServletResponse, ConstantI18nAuth.I18N_AUTH_JWT_EXPIRED);
                }else {
                    handleAuthenticationFailure(httpServletResponse, ConstantI18nAuth.I18N_AUTH_JWT_INVALID);
                }
                return;
            }

            String email = utilAuthJwt.extractUsername(token);

            try {
                UserDetails userDetails = serviceUserDetailsSImpl.loadUserByUsername(email);

                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities());

                log.debug("User authenticated: {} with authorities: {}",
                        userDetails.getUsername(),
                        userDetails.getAuthorities());

                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                filterChain.doFilter(httpServletRequest, httpServletResponse);
            }catch(UsernameNotFoundException e) {
                handleAuthenticationFailure(httpServletResponse, ConstantI18nAuth.I18N_AUTH_USER_NOT_FOUND);
            }
        }catch(Exception e) {
            log.error("Authentication error: ", e);
            handleAuthenticationFailure(httpServletResponse, ConstantI18nAuth.I18N_AUTH_ERROR_RETRIEVING);
        }
    }

    private String parseJwt(final HttpServletRequest httpServletRequest) {
        String headerAuth = httpServletRequest.getHeader("Authorization");

        if(StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }

        HttpSession httpSession = httpServletRequest.getSession(false);
        if(httpSession != null) {
            String sessionToken = (String) httpSession.getAttribute("jwt");
            if(StringUtils.hasText(sessionToken)) {
                return sessionToken;
            }
        }

        return null;
    }

    private void handleAuthenticationFailure(final HttpServletResponse httpServletResponse, final String messageKey) throws IOException {
        String message = messageSource.getMessage(messageKey, null, LocaleContextHolder.getLocale());
        httpServletResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        httpServletResponse.setContentType("application/json");
        httpServletResponse.getWriter().write("{\"error\":\"" + message + "\"}");
    }

}
