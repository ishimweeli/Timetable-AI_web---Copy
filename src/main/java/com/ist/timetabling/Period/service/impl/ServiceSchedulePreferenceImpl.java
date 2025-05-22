package com.ist.timetabling.Period.service.impl;

import com.ist.timetabling.Period.dto.req.DtoReqSchedulePreference;
import com.ist.timetabling.Period.dto.res.DtoResSchedulePreference;
import com.ist.timetabling.Period.entity.EntitySchedule;
import com.ist.timetabling.Period.entity.EntitySchedulePreference;
import com.ist.timetabling.Period.repository.RepositorySchedule;
import com.ist.timetabling.Period.repository.RepositorySchedulePreference;
import com.ist.timetabling.Period.service.ServiceSchedulePreference;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ServiceSchedulePreferenceImpl implements ServiceSchedulePreference {

    private final RepositorySchedulePreference repositorySchedulePreference;
    private final RepositorySchedule repositorySchedule;

    @Autowired
    public ServiceSchedulePreferenceImpl(final RepositorySchedulePreference repositorySchedulePreference,
                                         final RepositorySchedule repositorySchedule) {
        this.repositorySchedulePreference = repositorySchedulePreference;
        this.repositorySchedule = repositorySchedule;
    }

    @Override
    public List<DtoResSchedulePreference> getAllPreferencesBySchedule(final String scheduleUuid) {
        // Removed: getAllPreferencesBySchedule and usage of findAllByScheduleUuid
        return null;
    }

    @Override
    public Optional<DtoResSchedulePreference> getPreferenceByUuid(final String uuid) {
        return repositorySchedulePreference.findByUuid(uuid).map(this::toResponseDTO);
    }

    @Override
    public List<DtoResSchedulePreference> getAllActivePreferencesByOrganization(final Integer organizationId) {
        final List<EntitySchedulePreference> list =
                repositorySchedulePreference.findAllActiveByOrganizationId(Long.valueOf(organizationId), LocalDateTime.now());
        return list.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<DtoResSchedulePreference> getAllPreferencesByDayOfWeek(final Integer dayOfWeek) {
        final List<EntitySchedulePreference> list =
                repositorySchedulePreference.findAllByDayOfWeek(dayOfWeek);
        return list.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<DtoResSchedulePreference> getAllPreferencesByPeriodIdAndDayOfWeek(final Integer periodId, final Integer dayOfWeek) {
        final List<EntitySchedulePreference> list = repositorySchedulePreference.findAllByPeriodIdAndDayOfWeek(periodId, dayOfWeek);
        return list.stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DtoResSchedulePreference createSchedulePreference(final DtoReqSchedulePreference requestDTO) {
        EntitySchedulePreference newEntity = EntitySchedulePreference.builder()
                .periodId(requestDTO.getPeriodId())
                .dayOfWeek(requestDTO.getDayOfWeek())
                .cannotTeach(requestDTO.getCannotTeach() != null ? requestDTO.getCannotTeach() : false)
                .prefersToTeach(requestDTO.getPrefersToTeach() != null ? requestDTO.getPrefersToTeach() : false)
                .mustTeach(requestDTO.getMustTeach() != null ? requestDTO.getMustTeach() : false)
                .dontPreferToTeach(requestDTO.getDontPreferToTeach() != null ? requestDTO.getDontPreferToTeach() : false)
                .mustScheduleClass(requestDTO.getMustScheduleClass() != null ? requestDTO.getMustScheduleClass() : false)
                .mustNotScheduleClass(requestDTO.getMustNotScheduleClass() != null ? requestDTO.getMustNotScheduleClass() : false)
                .prefersToScheduleClass(requestDTO.getPrefersToScheduleClass() != null ? requestDTO.getPrefersToScheduleClass() : false)
                .prefersNotToScheduleClass(requestDTO.getPrefersNotToScheduleClass() != null ? requestDTO.getPrefersNotToScheduleClass() : false)
                .applies(requestDTO.getApplies())
                .reason(requestDTO.getReason())
                .organizationId(requestDTO.getOrganizationId())
                .effectiveFrom(requestDTO.getEffectiveFrom() != null ? requestDTO.getEffectiveFrom() : LocalDateTime.now())
                .effectiveTo(requestDTO.getEffectiveTo())
                .isRecurring(requestDTO.getIsRecurring() != null ? requestDTO.getIsRecurring() : false)
                .statusId(1)
                .isDeleted(false)
                .build();
        return toResponseDTO(repositorySchedulePreference.save(newEntity));
    }

    @Override
    @Transactional
    public DtoResSchedulePreference updateSchedulePreference(final String uuid, final DtoReqSchedulePreference requestDTO) {
        final Optional<EntitySchedulePreference> optEntity = repositorySchedulePreference.findByUuid(uuid);
        if(!optEntity.isPresent()) {
            throw new IllegalArgumentException("Schedule preference not found with UUID: " + uuid);
        }
        EntitySchedulePreference entity = optEntity.get();
        if(requestDTO.getPeriodId() != null) {
            entity.setPeriodId(requestDTO.getPeriodId());
        }
        if(requestDTO.getDayOfWeek() != null) {
            entity.setDayOfWeek(requestDTO.getDayOfWeek());
        }
        entity.setCannotTeach(requestDTO.getCannotTeach() != null ? requestDTO.getCannotTeach() : false);
        entity.setPrefersToTeach(requestDTO.getPrefersToTeach() != null ? requestDTO.getPrefersToTeach() : false);
        entity.setMustTeach(requestDTO.getMustTeach() != null ? requestDTO.getMustTeach() : false);
        entity.setDontPreferToTeach(requestDTO.getDontPreferToTeach() != null ? requestDTO.getDontPreferToTeach() : false);
        entity.setMustScheduleClass(requestDTO.getMustScheduleClass() != null ? requestDTO.getMustScheduleClass() : false);
        entity.setMustNotScheduleClass(requestDTO.getMustNotScheduleClass() != null ? requestDTO.getMustNotScheduleClass() : false);
        entity.setPrefersToScheduleClass(requestDTO.getPrefersToScheduleClass() != null ? requestDTO.getPrefersToScheduleClass() : false);
        entity.setPrefersNotToScheduleClass(requestDTO.getPrefersNotToScheduleClass() != null ? requestDTO.getPrefersNotToScheduleClass() : false);
        entity.setApplies(requestDTO.getApplies());
        entity.setReason(requestDTO.getReason());
        entity.setEffectiveFrom(requestDTO.getEffectiveFrom());
        entity.setEffectiveTo(requestDTO.getEffectiveTo());
        entity.setIsRecurring(requestDTO.getIsRecurring() != null ? requestDTO.getIsRecurring() : false);
        entity.setOrganizationId(requestDTO.getOrganizationId());
        entity.setStatusId(1);
        entity.setIsDeleted(false);
        return toResponseDTO(repositorySchedulePreference.save(entity));
    }

    @Override
    @Transactional
    public void deletePreference(final String uuid, final Integer userId) {
        final Optional<EntitySchedulePreference> optEntity = repositorySchedulePreference.findByUuid(uuid);
        if(optEntity.isPresent()) {
            EntitySchedulePreference entity = optEntity.get();
            entity.setIsDeleted(true);
            entity.setModifiedBy(userId);
            repositorySchedulePreference.save(entity);
        }
    }

    private DtoResSchedulePreference toResponseDTO(final EntitySchedulePreference e) {
        return DtoResSchedulePreference.builder()
                .id(e.getId())
                .uuid(e.getUuid())
                .periodId(e.getPeriodId())
                .dayOfWeek(e.getDayOfWeek())
                .cannotTeach(e.getCannotTeach())
                .prefersToTeach(e.getPrefersToTeach())
                .mustTeach(e.getMustTeach())
                .dontPreferToTeach(e.getDontPreferToTeach())
                .mustScheduleClass(e.getMustScheduleClass())
                .mustNotScheduleClass(e.getMustNotScheduleClass())
                .prefersToScheduleClass(e.getPrefersToScheduleClass())
                .prefersNotToScheduleClass(e.getPrefersNotToScheduleClass())
                .applies(e.getApplies())
                .reason(e.getReason())
                .effectiveFrom(e.getEffectiveFrom())
                .effectiveTo(e.getEffectiveTo())
                .isRecurring(e.getIsRecurring())
                .organizationId(e.getOrganizationId())
                .createdBy(e.getCreatedBy())
                .modifiedBy(e.getModifiedBy())
                .createdDate(e.getCreatedDate())
                .modifiedDate(e.getModifiedDate())
                .statusId(e.getStatusId())
                .isDeleted(e.getIsDeleted())
                .build();
    }
}
