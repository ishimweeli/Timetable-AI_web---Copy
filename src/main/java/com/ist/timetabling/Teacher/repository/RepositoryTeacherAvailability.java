package com.ist.timetabling.Teacher.repository;

import com.ist.timetabling.Teacher.entity.EntityTeacherAvailability;
import com.ist.timetabling.User.entity.EntityUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;


@Repository
public interface RepositoryTeacherAvailability extends JpaRepository<EntityTeacherAvailability, Integer> {

    Optional<EntityTeacherAvailability> findByUuidAndIsDeletedFalse(final String uuid);

    Optional<EntityTeacherAvailability> findByTeacherIdAndUuidAndIsDeletedFalse(final Integer teacherId, final String uuid);

    List<EntityTeacherAvailability> findByTeacherIdAndIsDeletedFalse(final Integer teacherId);

    List<EntityTeacherAvailability> findByTeacherIdAndDayOfWeekAndIsDeletedFalse(final Integer teacherId, final Integer dayOfWeek);

    long countByIsDeletedFalse();

}
