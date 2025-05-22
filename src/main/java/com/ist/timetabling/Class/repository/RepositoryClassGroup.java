package com.ist.timetabling.Class.repository;

import com.ist.timetabling.Class.entity.EntityClassGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepositoryClassGroup extends JpaRepository<EntityClassGroup, Integer> {
    
    Optional<EntityClassGroup> findByUuid(String uuid);
    
    List<EntityClassGroup> findByOrganizationIdAndIsDeletedFalse(Integer organizationId);
    
    @Query("SELECT cg FROM EntityClassGroup cg JOIN cg.classes c WHERE c.id = :classId AND cg.isDeleted = false")
    List<EntityClassGroup> findGroupsByClassId(@Param("classId") Integer classId);
    
    @Query("SELECT CASE WHEN COUNT(cg) > 0 THEN true ELSE false END FROM EntityClassGroup cg JOIN cg.classes c1 JOIN cg.classes c2 WHERE c1.id = :classId1 AND c2.id = :classId2 AND cg.isDeleted = false")
    boolean areClassesInSameGroup(@Param("classId1") Integer classId1, @Param("classId2") Integer classId2);
} 