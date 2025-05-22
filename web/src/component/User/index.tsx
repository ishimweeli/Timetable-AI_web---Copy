import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/hook/useAppRedux";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/component/Ui/card";
import { Button } from "@/component/Ui/button";
import { Input } from "@/component/Ui/input";
import { Label } from "@/component/Ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/component/Ui/select";
import { toast } from "@/component/Ui/use-toast";
import { UserProfile } from "@/type/User/TypeUser";
import OrganizationSelector from "@/component/Organization/OrganizationSelector";

interface UserComponentProps {
  user?: UserProfile;
  onSave?: (userData: any) => void;
}

const UserComponent: React.FC<UserComponentProps> = ({ user, onSave }) => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const isAdmin = currentUser?.roleName === "ADMIN";

  const [userData, setUserData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    roleId: user?.roleId || 3, // Default to teacher role
    organizationId:
      user?.organizationId || user?.preferences?.organizationId || null,
  });

  const [selectedOrganizationId, setSelectedOrganizationId] = useState<
    number | null
  >(userData.organizationId);

  // Update local state if user prop changes
  useEffect(() => {
    if(user) {
      setUserData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        roleId: user.roleId || 3,
        organizationId:
          user.organizationId || user.preferences?.organizationId || null,
      });

      setSelectedOrganizationId(
        user.organizationId || user.preferences?.organizationId || null,
      );
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: string) => {
    setUserData((prev) => ({ ...prev, roleId: parseInt(value) }));
  };

  const handleOrganizationChange = (orgId: number) => {
    setSelectedOrganizationId(orgId);
    setUserData((prev) => ({
      ...prev,
      organizationId: orgId,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If the user is an admin, include the organizationId
    const dataToSubmit = {
      ...userData,
      ...(isAdmin && { organizationId: selectedOrganizationId }),
    };

    if(onSave) {
      onSave(dataToSubmit);
    }else {
      toast({
        title: "Form Submitted",
        description: "User information has been updated.",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{user ? "Edit User" : "Create New User"}</CardTitle>
        <CardDescription>
          {user
            ? "Update user information"
            : "Fill in the details to create a new user"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={userData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={userData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={userData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={userData.phone || ""}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              onValueChange={handleRoleChange}
              value={userData.roleId.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Admin</SelectItem>
                <SelectItem value="2">Manager</SelectItem>
                <SelectItem value="3">Teacher</SelectItem>
                <SelectItem value="4">Student</SelectItem>
                <SelectItem value="5">Parent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isAdmin && (
            <div className="space-y-2">
              <OrganizationSelector
                value={selectedOrganizationId}
                onChange={handleOrganizationChange}
                label="Organization"
                required={true}
                error={!selectedOrganizationId && isAdmin}
                errorMessage="Please select an organization"
              />
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit">
              {user ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserComponent;
