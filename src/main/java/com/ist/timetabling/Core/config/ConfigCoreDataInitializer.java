package com.ist.timetabling.Core.config;

import com.ist.timetabling.Auth.entity.EntityRole;
import com.ist.timetabling.Auth.repository.RepositoryRole;
import com.ist.timetabling.Organization.entity.EntityOrganization;
import com.ist.timetabling.Organization.repository.RepositoryOrganization;
import com.ist.timetabling.User.entity.EntityUser;
import com.ist.timetabling.User.repository.RepositoryUser;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
@Slf4j
public class ConfigCoreDataInitializer implements CommandLineRunner {

    @Value("${admin.default.username}")
    private String adminUsername;

    @Value("${admin.default.password}")
    private String adminPassword;

    private final RepositoryUser repositoryUser;
    private final RepositoryRole repositoryRole;
    private final RepositoryOrganization repositoryOrganization;
    private final PasswordEncoder passwordEncoder;

    public ConfigCoreDataInitializer(
            RepositoryUser repositoryUser,
            RepositoryRole repositoryRole,
            RepositoryOrganization repositoryOrganization,
            PasswordEncoder passwordEncoder) {
        this.repositoryUser = repositoryUser;
        this.repositoryRole = repositoryRole;
        this.repositoryOrganization = repositoryOrganization;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        initializeRoles();
        EntityOrganization defaultOrganization = initializeDefaultOrganization();
        initializeAdminUser(defaultOrganization);
    }

    private void initializeRoles() {
        LocalDateTime now = LocalDateTime.now();

        saveRoleIfNotExists("ADMIN", "Administrator role with full system access", now);
        saveRoleIfNotExists("TEACHER", "Teacher role with teacher system access", now);
        saveRoleIfNotExists("STUDENT", "Student role with student system access", now);
        saveRoleIfNotExists("USER", "Standard user with limited access", now);
        saveRoleIfNotExists("MANAGER", "Organization manager with administrative access", now);
    }

    private void saveRoleIfNotExists(String name, String description, LocalDateTime now) {
        if(repositoryRole.findByNameAndIsDeletedFalse(name).isEmpty()) {
            EntityRole role = new EntityRole();
            role.setName(name);
            role.setDescription(description);
            role.setCreatedBy(1);
            role.setModifiedBy(1);
            role.setStatusId(1);
            role.setIsDeleted(false);
            role.setCreatedDate(now);
            role.setModifiedDate(now);
            repositoryRole.save(role);
            log.info("✅ Role '{}' created.", name);
        }else {
            log.info("🔹 Role '{}' already exists.", name);
        }
    }

    private EntityOrganization initializeDefaultOrganization() {
        String defaultOrgName = "Default Organization";
        String defaultOrgEmail = "admin@defaultorg.com";

        Optional<EntityOrganization> existingOrganization = repositoryOrganization.findByName(defaultOrgName);

        if(existingOrganization.isPresent()) {
            log.info("🔹 Default organization already exists.");
            return existingOrganization.get();
        }

        LocalDateTime now = LocalDateTime.now();
        EntityOrganization defaultOrg = new EntityOrganization();
        defaultOrg.setName(defaultOrgName);
        defaultOrg.setUuid(java.util.UUID.randomUUID().toString());
        defaultOrg.setAddress("Default Address");
        defaultOrg.setContactEmail(defaultOrgEmail);
        defaultOrg.setContactPhone("0000000000");
        defaultOrg.setCreatedBy("1");
        defaultOrg.setModifiedBy("1");
        defaultOrg.setStatusId(1);
        defaultOrg.setIsDeleted(false);
        defaultOrg.setCreatedDate(now);
        defaultOrg.setModifiedDate(now);

        defaultOrg = repositoryOrganization.save(defaultOrg);
        log.info("✅ Default organization created successfully!");

        return defaultOrg;
    }

    private void initializeAdminUser(EntityOrganization organization) {
        Optional<EntityUser> existingAdmin = repositoryUser.findByEmailAndIsDeletedFalse(adminUsername);

        if(existingAdmin.isEmpty()) {
            EntityRole adminEntityRole = repositoryRole.findByNameAndIsDeletedFalse("ADMIN")
                    .orElseThrow(() -> new RuntimeException("Admin role not found"));

            LocalDateTime now = LocalDateTime.now();
            EntityUser admin = new EntityUser();
            admin.setEmail(adminUsername);
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            admin.setFirstName("System");
            admin.setLastName("Administrator");
            admin.setPhone("");
            admin.setIsActive(true);
            admin.setCreatedBy(1);
            admin.setModifiedBy(1);
            admin.setStatusId(1);
            admin.setIsDeleted(false);
            admin.setCreatedDate(now);
            admin.setModifiedDate(now);
            admin.setEntityRole(adminEntityRole);
            admin.setOrganization(organization);

            repositoryUser.save(admin);
            log.info("✅ Admin user created successfully!");
        }else {
            log.info("🔹 Admin user already exists.");
        }
    }
}
