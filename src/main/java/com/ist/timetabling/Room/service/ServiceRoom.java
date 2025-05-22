package com.ist.timetabling.Room.service;

import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Room.dto.req.DtoReqRoom;
import com.ist.timetabling.Room.dto.req.DtoReqRoomPreferences;
import com.ist.timetabling.Room.dto.res.DtoResRoom;
import com.ist.timetabling.Room.dto.res.DtoResRoomCsvUpload;
import com.ist.timetabling.Room.dto.res.DtoResRoomSchedulePreference;
import com.ist.timetabling.Room.entity.EntityRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ServiceRoom {
    ApiResponse<DtoResRoom> findRoomByUuid(final String uuid);

    ApiResponse<Page<DtoResRoom>> findRoomsPaginated(final Pageable pageable);

    ApiResponse<List<DtoResRoom>> findAllRooms(
            final Integer page,
            final Integer size,
            final String sortBy,
            final String sortDirection,
            final String keyword,
            final Integer orgId,
            final Integer planSettingsId
    );

    ApiResponse<DtoResRoom> createRoom(final DtoReqRoom dtoReqRoom);

    ApiResponse<DtoResRoom> updateRoomByUuid(final String uuid, final DtoReqRoom dtoReqRoom);

    ApiResponse<Void> deleteRoomByUuid(final String uuid);

    ApiResponse<List<DtoResRoomSchedulePreference>> getRoomSchedulePreferences(final Integer roomId);

    ApiResponse<List<DtoResRoomSchedulePreference>> updateRoomSchedulePreferences(final Integer roomId, final DtoReqRoomPreferences dtoReqRoomPreferences);

    ApiResponse<Void> setRoomAvailability(final Integer roomId, Boolean isAvailable);

    ApiResponse<DtoResRoomCsvUpload> importRoomsFromCsv(final DtoReqCsvUpload uploadRequest);

    ApiResponse<List<EntityRoom>> getRoomsByPlanSettingsId(final Integer planSettingsId);
}