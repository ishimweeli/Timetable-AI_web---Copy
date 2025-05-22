package com.ist.timetabling.Period.service.impl;

import com.ist.timetabling.Period.entity.EntityPeriod;
import com.ist.timetabling.Period.entity.EntitySchedule;
import com.ist.timetabling.Period.repository.RepositoryPeriod;
import com.ist.timetabling.Period.repository.RepositorySchedule;
import com.ist.timetabling.Period.service.ServiceSchedule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class ServiceScheduleImpl implements ServiceSchedule {

    private final RepositorySchedule repositorySchedule;
    private final RepositoryPeriod repositoryPeriod;

    @Autowired
    public ServiceScheduleImpl(final RepositorySchedule repositorySchedule,
                               final RepositoryPeriod repositoryPeriod) {
        this.repositorySchedule = repositorySchedule;
        this.repositoryPeriod = repositoryPeriod;
    }

    @Override
    public List<EntitySchedule> getAllSchedules() {
        return repositorySchedule.findAll();
    }

    @Override
    public List<EntitySchedule> getSchedulesByDay(final Integer dayOfWeek) {
        return repositorySchedule.findAllByDayOfWeek(dayOfWeek);
    }

    @Override
    public List<EntitySchedule> getSchedulesByPeriod(final Integer periodId) {
        return repositorySchedule.findAllByPeriodId(periodId);
    }

    @Override
    public Optional<EntitySchedule> getScheduleById(final Integer id) {
        return repositorySchedule.findById(id);
    }

    @Override
    public Optional<EntitySchedule> getScheduleByPeriodAndDay(final Integer periodId, final Integer dayOfWeek) {
        return repositorySchedule.findByPeriodIdAndDayOfWeek(periodId, dayOfWeek);
    }

    @Override
    public List<Integer> getAllAvailableDays() {
        return repositorySchedule.findAllDistinctDaysOfWeek();
    }

    @Override
    @Transactional
    public EntitySchedule saveSchedule(final EntitySchedule entitySchedule) {
        return repositorySchedule.save(entitySchedule);
    }

    @Override
    @Transactional
    public EntitySchedule createSchedule(final Integer periodId, final Integer dayOfWeek) {
        final Optional<EntitySchedule> optionalEntitySchedule =
                repositorySchedule.findByPeriodIdAndDayOfWeek(periodId, dayOfWeek);
        if(optionalEntitySchedule.isPresent()) {
            return optionalEntitySchedule.get();
        }

        final EntityPeriod entityPeriod = repositoryPeriod.findById(periodId)
                .orElseThrow(() -> new IllegalArgumentException("Period not found with ID: " + periodId));

        if(entityPeriod.getDays() == null || !entityPeriod.getDays().contains(dayOfWeek)) {
            throw new IllegalArgumentException("Day " + dayOfWeek + " is not allowed for this period.");
        }

        List<EntitySchedule> schedulesOnDay = repositorySchedule.findAllByDayOfWeek(dayOfWeek);
        for(EntitySchedule existingSchedule : schedulesOnDay) {
            if(entityPeriod.getStartTime().equals(existingSchedule.getPeriod().getStartTime()) &&
                    entityPeriod.getEndTime().equals(existingSchedule.getPeriod().getEndTime())) {
                throw new IllegalArgumentException(
                        "A schedule with the same period time already exists on day " + dayOfWeek
                );
            }
        }

        final EntitySchedule entitySchedule = EntitySchedule.builder()
                .period(entityPeriod)
                .dayOfWeek(dayOfWeek)
                .organisationId(entityPeriod.getOrganizationId())
                .createdBy(entityPeriod.getCreatedBy())
                .modifiedBy(entityPeriod.getModifiedBy())
                .statusId(1)
                .isDeleted(false)
                .build();

        return repositorySchedule.save(entitySchedule);
    }

    @Override
    @Transactional
    public void deleteSchedule(final Integer id) {
        repositorySchedule.deleteById(id);
    }

    @Override
    @Transactional
    public EntitySchedule getOrCreateSchedule(final Integer periodId, final Integer dayOfWeek) {
        return getScheduleByPeriodAndDay(periodId, dayOfWeek)
                .orElseGet(() -> createSchedule(periodId, dayOfWeek));
    }

    @Override
    public List<EntitySchedule> getSchedulesByDaySorted(final Integer dayOfWeek) {
        List<EntitySchedule> schedules = repositorySchedule.findAllByDayOfWeek(dayOfWeek);
        schedules.sort(Comparator.comparing(schedule -> schedule.getPeriod().getStartTime()));
        return schedules;
    }
}
