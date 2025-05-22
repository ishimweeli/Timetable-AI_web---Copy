package com.ist.timetabling.Auth.controller;

import com.ist.timetabling.Auth.dto.req.DtoReqAutRegister;
import com.ist.timetabling.Auth.dto.req.DtoReqAuthLogin;
import com.ist.timetabling.Auth.dto.req.DtoReqAuthRefreshToken;
import com.ist.timetabling.Auth.dto.res.DtoResAuthLogin;
import com.ist.timetabling.Auth.dto.res.DtoResAuthRefreshToken;
import com.ist.timetabling.Auth.service.ServiceAuth;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Core.model.I18n;
import com.ist.timetabling.User.dto.res.DtoResUser;
import com.ist.timetabling.User.entity.EntityUser;
import com.ist.timetabling.User.repository.RepositoryUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import static com.ist.timetabling.Auth.constant.ConstantI18nAuth.*;


@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ControllerAuth {

    private final ServiceAuth serviceAuth;
    private final RepositoryUser repositoryUser;
    private final HttpServletRequest httpServletRequest;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<DtoResUser>> register(@Valid @RequestBody final DtoReqAutRegister dtoReqAutRegister) {
        return ResponseEntity.ok(serviceAuth.register(dtoReqAutRegister));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<DtoResAuthLogin>> login(@Valid @RequestBody final DtoReqAuthLogin dtoReqAuthLogin) {
        return ResponseEntity.ok(serviceAuth.login(dtoReqAuthLogin));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<DtoResUser>> getCurrentUser() {
        return ResponseEntity.ok(serviceAuth.getCurrentUser());
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<DtoResAuthRefreshToken>> refreshToken(@Valid @RequestBody final DtoReqAuthRefreshToken dtoReqAuthRefreshToken) {
        return ResponseEntity.ok(serviceAuth.refreshToken(dtoReqAuthRefreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(final HttpServletRequest httpServletRequest) {
        final String token = httpServletRequest.getHeader("Authorization");
        return ResponseEntity.ok(serviceAuth.logout(token));
    }

    @GetMapping("/check-email")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkEmailExists(@RequestParam final String email) {
        final I18n i18n = new I18n(httpServletRequest);
        final Optional<EntityUser> userOpt = repositoryUser.findByEmailAndIsDeletedFalse(email);
        
        Map<String, Object> result = new HashMap<>();
        
        if(userOpt.isPresent()) {
            EntityUser user = userOpt.get();
            boolean isActive = user.getIsActive();
            
            result.put("exists", true);
            result.put("isInactive", !isActive);
            
            String message = isActive ? i18n.getAuth(I18N_AUTH_EMAIL_ALREADY_EXISTS) : i18n.getAuth(I18N_AUTH_VERIFICATION_EXISTING_INACTIVE_USER);
                
            return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK, message, result));
        }
        
        result.put("exists", false);
        result.put("isInactive", false);
        
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK, "Email available", result));
    }

}
