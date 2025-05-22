# AI Timetable System Documentation

## Overview
The AI Timetable is a module-based system leveraging RESTful APIs to facilitate automated scheduling. The system includes user authentication, role management, and timetable generation while ensuring scalability across multiple organizations.

## Key Modules & Features
- **Auth Module**: JWT and OAuth authentication, secure user sessions
- **User Module**: Profile management with role-based permissions
- **Admin Module**: Organization management and system monitoring
- **Teacher Module**: Teacher scheduling with complex constraints
- **Student Module**: Student profiles and class enrollment
- **Subject Module**: Subject definition and conflict management
- **Class Module**: Class binding and scheduling rules
- **Room Module**: Room allocation and availability tracking
- **Timetable Module**: AI-powered schedule optimization
- **Notification Module**: Multi-channel alerts and updates

## Documentation Index
- [Architecture Overview](./architecture.md)
- [Module Documentation](./modules/)
- [API Documentation](./api/)
- [Frontend Documentation](./frontend/)
- [Database Schema](./database/)
- [Development Guides](./guides/)

## User Roles
1. **Super Admin**: Creates and manages Admin accounts, oversees all organizations
2. **Admin**: Manages multiple organizations, creates Manager accounts
3. **Manager**: Creates teacher and student accounts, manages timetable generation
4. **Sub-Manager**: Approves schedules and handles resource allocation
5. **Teacher**: Views schedules and submits preferences
6. **Student**: Views class timetables and receives notifications

## System Workflow
1. SuperAdmin creates Admins
2. Admins manage multiple Organizations
3. Managers create Teachers & Students
4. Editors fine-tune schedules and approve timetables
5. AI-Based Timetable generates optimized schedules
6. Notifications are sent for any update

# Getting Started

### Reference Documentation
For further reference, please consider the following sections:

* [Official Apache Maven documentation](https://maven.apache.org/guides/index.html)
* [Spring Boot Maven Plugin Reference Guide](https://docs.spring.io/spring-boot/3.4.2/maven-plugin)
* [Create an OCI image](https://docs.spring.io/spring-boot/3.4.2/maven-plugin/build-image.html)
* [Spring Web](https://docs.spring.io/spring-boot/3.4.2/reference/web/servlet.html)
* [Spring Session](https://docs.spring.io/spring-session/reference/)
* [OAuth2 Client](https://docs.spring.io/spring-boot/3.4.2/reference/web/spring-security.html#web.security.oauth2.client)
* [Spring Data JPA](https://docs.spring.io/spring-boot/3.4.2/reference/data/sql.html#data.sql.jpa-and-spring-data)
* [JDBC API](https://docs.spring.io/spring-boot/3.4.2/reference/data/sql.html)
* [Thymeleaf](https://docs.spring.io/spring-boot/3.4.2/reference/web/servlet.html#web.servlet.spring-mvc.template-engines)
* [Spring Security](https://docs.spring.io/spring-boot/3.4.2/reference/web/spring-security.html)

### Guides
The following guides illustrate how to use some features concretely:

* [Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/)
* [Serving Web Content with Spring MVC](https://spring.io/guides/gs/serving-web-content/)
* [Building REST services with Spring](https://spring.io/guides/tutorials/rest/)
* [Accessing Data with JPA](https://spring.io/guides/gs/accessing-data-jpa/)
* [Accessing Relational Data using JDBC with Spring](https://spring.io/guides/gs/relational-data-access/)
* [Managing Transactions](https://spring.io/guides/gs/managing-transactions/)
* [Accessing data with MySQL](https://spring.io/guides/gs/accessing-data-mysql/)
* [Handling Form Submission](https://spring.io/guides/gs/handling-form-submission/)
* [Securing a Web Application](https://spring.io/guides/gs/securing-web/)
* [Spring Boot and OAuth2](https://spring.io/guides/tutorials/spring-boot-oauth2/)
* [Authenticating a User with LDAP](https://spring.io/guides/gs/authenticating-ldap/)

### Maven Parent overrides

Due to Maven's design, elements are inherited from the parent POM to the project POM.
While most of the inheritance is fine, it also inherits unwanted elements like `<license>` and `<developers>` from the parent.
To prevent this, the project POM contains empty overrides for these elements.
If you manually switch to a different parent and actually want the inheritance, you need to remove those overrides.

# Timetable-AI Web

## Teacher Workload Validation

The system now properly validates teacher workload against the actual periods available in the selected plan settings:

1. When creating or updating a binding, the system checks if the teacher's total workload would exceed the maximum periods defined by the selected plan settings (`periodsPerDay * daysPerWeek`).
2. For example, if a plan setting has 8 periods per day and 3 days per week, the maximum workload is 24 periods, not the default 40 periods.
3. If no plan settings are selected, the system falls back to using the teacher's maximum daily hours setting (if available) or a default value of 35 periods.
4. The frontend also displays the workload information using the correct maximum from the selected plan settings.

This ensures that teachers are not assigned more periods than available in the selected schedule.

