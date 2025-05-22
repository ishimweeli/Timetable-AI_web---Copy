package com.ist.timetabling.User.dto.req;

import com.ist.timetabling.User.entity.EntityUser;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DtoResUser {

    private String firstName;
    private String lastName;
    private String email;
    private Integer role = 0;
    private Boolean isActive;

    public DtoResUser(EntityUser entityUser) {
        this.firstName = entityUser.getFirstName();
        this.lastName = entityUser.getLastName();
        this.email = entityUser.getEmail();
        this.isActive = entityUser.getIsActive();
    }

}
