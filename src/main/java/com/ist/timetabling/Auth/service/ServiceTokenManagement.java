 package com.ist.timetabling.Auth.service;

import com.ist.timetabling.Auth.entity.EntityAuthRefreshToken;
import com.ist.timetabling.User.entity.EntityUser;
import java.util.Optional;


public interface ServiceTokenManagement {

    Optional<EntityAuthRefreshToken> findByToken(final String token);

    EntityAuthRefreshToken createRefreshToken(final EntityUser user);

    void blacklistToken(final String token);

    void revokeRefreshToken(final String token);

    void revokeAllUserRefreshTokens(final EntityUser user);

}
