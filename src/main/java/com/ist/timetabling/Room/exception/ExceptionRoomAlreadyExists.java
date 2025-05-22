package com.ist.timetabling.Room.exception;

public class ExceptionRoomAlreadyExists extends RuntimeException {
    public ExceptionRoomAlreadyExists(String message) {
        super(message);
    }
}