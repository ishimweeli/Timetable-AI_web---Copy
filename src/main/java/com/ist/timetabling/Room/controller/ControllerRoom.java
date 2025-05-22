package com.ist.timetabling.Room.controller;

import com.ist.timetabling.Core.dto.req.DtoReqCsvUpload;
import com.ist.timetabling.Core.model.ApiResponse;
import com.ist.timetabling.Room.dto.req.DtoReqRoom;
import com.ist.timetabling.Room.dto.req.DtoReqRoomPreferences;
import com.ist.timetabling.Room.dto.res.DtoResRoom;
import com.ist.timetabling.Room.dto.res.DtoResRoomCsvUpload;
import com.ist.timetabling.Room.dto.res.DtoResRoomSchedulePreference;
import com.ist.timetabling.Room.service.ServiceRoom;
import com.ist.timetabling.Room.util.UtilRoomCsv;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
@Slf4j
public class ControllerRoom {

    private final ServiceRoom serviceRoom;
    private final UtilRoomCsv utilRoomCsv;

    @GetMapping("/{uuid}")
    public ResponseEntity<ApiResponse<DtoResRoom>> getRoomByUuid(@PathVariable final String uuid) {
        final ApiResponse<DtoResRoom> apiResponse = serviceRoom.findRoomByUuid(uuid);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @GetMapping("/paginated")
    public ResponseEntity<ApiResponse<Page<DtoResRoom>>> getRoomsPaginated(final Pageable pageable) {
        final ApiResponse<Page<DtoResRoom>> apiResponse = serviceRoom.findRoomsPaginated(pageable);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DtoResRoom>>> getAllRooms(@RequestParam(required = false) final Integer page, @RequestParam(required = false) final Integer size, @RequestParam(required = false) final String sortBy, @RequestParam(required = false, defaultValue = "asc") final String sortDirection, @RequestParam(required = false) final String keyword, @RequestParam(required = false) final Integer orgId, @RequestParam(required = false) final Integer planSettingsId) {
        final ApiResponse<List<DtoResRoom>> apiResponse = serviceRoom.findAllRooms(page, size, sortBy, sortDirection, keyword, orgId, planSettingsId);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DtoResRoom>> addRoom(@Valid @RequestBody final DtoReqRoom dtoReqRoom) {
        final ApiResponse<DtoResRoom> apiResponse = serviceRoom.createRoom(dtoReqRoom);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @PutMapping("/{uuid}")
    public ResponseEntity<ApiResponse<DtoResRoom>> updateRoom(@PathVariable final String uuid, @Valid @RequestBody final DtoReqRoom dtoReqRoom) {
        final ApiResponse<DtoResRoom> apiResponse = serviceRoom.updateRoomByUuid(uuid, dtoReqRoom);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable final String uuid) {
        final ApiResponse<Void> apiResponse = serviceRoom.deleteRoomByUuid(uuid);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

  

    @GetMapping("/{roomId}/schedule-preferences")
    public ResponseEntity<ApiResponse<List<DtoResRoomSchedulePreference>>> getRoomSchedulePreferences(@PathVariable final Integer roomId) {
        final ApiResponse<List<DtoResRoomSchedulePreference>> apiResponse = serviceRoom.getRoomSchedulePreferences(roomId);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @PutMapping("/{roomId}/schedule-preferences")
    public ResponseEntity<ApiResponse<List<DtoResRoomSchedulePreference>>> updateRoomSchedulePreferences(@PathVariable final Integer roomId, @Valid @RequestBody final DtoReqRoomPreferences dtoReqRoomPreferences) {
        final ApiResponse<List<DtoResRoomSchedulePreference>> apiResponse = serviceRoom.updateRoomSchedulePreferences(roomId, dtoReqRoomPreferences);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    @PutMapping("/{roomId}/availability")
    public ResponseEntity<ApiResponse<Void>> setRoomAvailability(@PathVariable final Integer roomId, @Valid @RequestBody final Map<String, Boolean> availabilityMap) {
        final Boolean isAvailable = availabilityMap.getOrDefault("isAvailable", true);
        final ApiResponse<Void> apiResponse = serviceRoom.setRoomAvailability(roomId, isAvailable);
        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }

    
    @PostMapping(value = "/import/csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DtoResRoomCsvUpload>> importRoomsFromCsv(
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) Integer organizationId,
            @RequestParam(required = false, defaultValue = "true") Boolean skipHeaderRow) {

        DtoReqCsvUpload uploadRequest = DtoReqCsvUpload.builder()
                .file(file)
                .organizationId(organizationId)
                .skipHeaderRow(skipHeaderRow)
                .build();

        ApiResponse<DtoResRoomCsvUpload> apiResponse =
                serviceRoom.importRoomsFromCsv(uploadRequest);

        return ResponseEntity.status(apiResponse.getStatus()).body(apiResponse);
    }


    @GetMapping("/import/csv/template")
    public ResponseEntity<String> getRoomCsvTemplate() {
        try {
            String template = utilRoomCsv.generateRoomCsvTemplate();

            return ResponseEntity
                    .ok()
                    .header("Content-Disposition", "attachment; filename=\"room_import_template.csv\"")
                    .contentType(MediaType.parseMediaType("text/csv"))
                    .body(template);
        }catch(Exception e) {
            return ResponseEntity
                    .internalServerError()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Error generating template: " + e.getMessage());
        }
    }


    @GetMapping("/export/csv")
    public ResponseEntity<String> exportRoomsToCsv(
            @RequestParam(required = false) final Integer orgId,
            @RequestParam(required = false) final Integer planSettingsId) {
        try {
            
            ApiResponse<List<DtoResRoom>> apiResponse = serviceRoom.findAllRooms(
                    null, 1000, "name", "asc", null, orgId, planSettingsId);

            if(!apiResponse.isSuccess() || apiResponse.getData() == null) {
                return ResponseEntity.status(apiResponse.getStatus())
                        .contentType(MediaType.TEXT_PLAIN)
                        .body("Error fetching rooms: " + apiResponse.getMessage());
            }

           
            String csvContent = "This endpoint would export rooms to CSV based on filters";

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String filename = "rooms_export_" + timestamp + ".csv";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(csvContent);
        }catch(Exception e) {
            return ResponseEntity.internalServerError()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Error generating CSV: " + e.getMessage());
        }
    }
}
