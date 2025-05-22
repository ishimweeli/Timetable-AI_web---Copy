package com.ist.timetabling.Room.exception;

import com.ist.timetabling.Core.exception.ExceptionCoreNotFound;
import com.ist.timetabling.Core.model.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class ExceptionHandlerRoom {

    @ExceptionHandler(ExceptionRoomAlreadyExists.class)
    public ResponseEntity<ApiResponse<Object>> handleRoomAlreadyExistsException( final ExceptionRoomAlreadyExists ex) {
        final ApiResponse<Object> response = ApiResponse.error(
                HttpStatus.CONFLICT,
                ex.getMessage(),
                null
        );
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(ExceptionCoreNotFound.class)
    public ResponseEntity<ApiResponse<Object>> handleRoomNotFoundException(final ExceptionCoreNotFound ex) {
        final ApiResponse<Object> response = ApiResponse.error(
                HttpStatus.NOT_FOUND,
                ex.getMessage(),
                null
        );
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(final Exception ex) {
        final ApiResponse<Object> response = ApiResponse.error(
                HttpStatus.INTERNAL_SERVER_ERROR,
                ex.getMessage(),
                null
        );
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
