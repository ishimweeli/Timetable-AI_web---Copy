package com.ist.timetabling.Auth.repository;

import com.ist.timetabling.Auth.entity.EntityRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;


@Repository
public interface RepositoryRole extends JpaRepository<EntityRole, Integer> {

    Optional<EntityRole> findByNameAndIsDeletedFalse(final String name);

    Optional<Object> findByName(String teacher);
}
