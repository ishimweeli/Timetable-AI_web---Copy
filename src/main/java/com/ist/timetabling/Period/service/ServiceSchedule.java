package com.ist.timetabling.Period.service;

import com.ist.timetabling.Period.entity.EntitySchedule;

import java.util.List;
import java.util.Optional;

public interface ServiceSchedule {

    List<EntitySchedule> getAllSchedules();

    List<EntitySchedule> getSchedulesByDay(final Integer dayOfWeek);

    List<EntitySchedule> getSchedulesByPeriod(final Integer periodId);

    Optional<EntitySchedule> getScheduleById(final Integer id);

    Optional<EntitySchedule> getScheduleByPeriodAndDay(final Integer periodId, final Integer dayOfWeek);

    List<Integer> getAllAvailableDays();

    EntitySchedule saveSchedule(final EntitySchedule entitySchedule);

    EntitySchedule createSchedule(final Integer periodId, final Integer dayOfWeek);

    void deleteSchedule(final Integer id);

    EntitySchedule getOrCreateSchedule(final Integer periodId, final Integer dayOfWeek);

    List<EntitySchedule> getSchedulesByDaySorted(final Integer dayOfWeek);
}
