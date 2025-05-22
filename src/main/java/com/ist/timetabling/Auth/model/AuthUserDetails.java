package com.ist.timetabling.Auth.model;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;

public class AuthUserDetails implements UserDetails {

    @Getter
    private final Integer id;
    private final String email;
    private final String password;
    private final boolean enabled;
    @Getter
    private final Integer organizationId;
    private final Collection<? extends GrantedAuthority> authorities;

    public AuthUserDetails(
            Integer id,
            String email,
            String password,
            boolean enabled,
            Integer organizationId,
            Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.enabled = enabled;
        this.organizationId = organizationId;
        this.authorities = authorities;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public String toString() {
        return "AuthUserDetails{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", enabled=" + enabled +
                ", organizationId=" + organizationId +
                ", authorities=" + authorities +
                '}';
    }
}