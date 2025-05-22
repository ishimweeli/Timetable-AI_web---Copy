# Auth Module

## Overview
The Auth Module handles secure authentication via JWT and OAuth protocols, providing login, logout, and password reset functionalities while ensuring secure user sessions and API access.

## Key Features
- Multiple authentication methods:
    - Email & password
    - Phone number & password
    - OAuth2 (Google, Facebook, Apple ID)
- Secure JWT implementation
- Password reset workflow
- Session management
- Token refresh mechanism

## API Endpoints
- `POST /auth/login` - Email/password login
- `POST /auth/login/phone` - Phone number login
- `GET /auth/oauth/{provider}` - OAuth2 providers (Google, Facebook, Apple)
- `POST /auth/logout` - Log out current session
- `POST /auth/password/reset` - Request password reset
- `POST /auth/password/reset/confirm` - Confirm password reset
- `GET /auth/token/refresh` - Refresh JWT token
- `GET /auth/verify` - Verify current token

## Security Implementation
- JWT Token Structure:
    - Header: Algorithm and token type
    - Payload: User ID, roles, organization ID, expiration time
    - Signature: Encrypted with server's secret key
- Token Lifetime:
    - Access Token: 1 hour
    - Refresh Token: 2 weeks
- Token Storage:
    - Client-side: HTTP-only secure cookies
    - Server-side: Redis for token blacklisting
- Password Security:
    - Stored using bcrypt with appropriate salt rounds
    - Minimum 8 characters
    - Must include uppercase, lowercase, number, and special character
    - Account lockout after 5 failed attempts for 15 minutes
