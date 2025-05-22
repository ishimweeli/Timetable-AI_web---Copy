package com.ist.timetabling.Period.controller;

import com.ist.timetabling.Period.entity.EntitySchedule;
import com.ist.timetabling.Period.service.ServiceSchedule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/schedules")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public class ControllerSchedule {

    private final ServiceSchedule serviceSchedule;

    @Autowired
    public ControllerSchedule(final ServiceSchedule serviceSchedule) {
        this.serviceSchedule = serviceSchedule;
    }

    @GetMapping
    public List<EntitySchedule> getAllSchedules() {
        return serviceSchedule.getAllSchedules();
    }

    @GetMapping("/{id}")
    public Optional<EntitySchedule> getScheduleById(@PathVariable final Integer id) {
        return serviceSchedule.getScheduleById(id);
    }

    @GetMapping("/day/{dayOfWeek}")
    public ResponseEntity<List<EntitySchedule>> getSchedulesByDaySorted(@PathVariable Integer dayOfWeek) {
        List<EntitySchedule> schedules = serviceSchedule.getSchedulesByDaySorted(dayOfWeek);
        return ResponseEntity.ok(schedules);
    }

    @PostMapping
    public EntitySchedule createSchedule(
            @RequestParam final Integer periodId,
            @RequestParam final Integer dayOfWeek) {
        return serviceSchedule.createSchedule(periodId, dayOfWeek);
    }

    @DeleteMapping("/{id}")
    public void deleteSchedule(@PathVariable final Integer id) {
        serviceSchedule.deleteSchedule(id);
    }

    @GetMapping("/days")
    public List<Integer> getAllAvailableDays() {
        return serviceSchedule.getAllAvailableDays();
    }
}
