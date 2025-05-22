import {
  useGetCurrentUserQuery,
  useUpdateUserProfileMutation,
  useUpdateUserSettingsMutation,
} from "./ApiUser";
import { useAppSelector } from "@/hook/useAppRedux";

export const useUserService = () => {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const {
    data: currentUser,
    isLoading: isLoadingUser,
    refetch: refetchUser,
    error: userError,
  } = useGetCurrentUserQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [updateProfile, { isLoading: isUpdatingProfile }] =
    useUpdateUserProfileMutation();
  const [updateSettings, { isLoading: isUpdatingSettings }] =
    useUpdateUserSettingsMutation();

  // Check if user is admin - using both currentUser from API and user from Redux state
  // Now specifically checking for ADMIN (uppercase) rather than admin (lowercase)
  const isAdmin =
    currentUser?.roleName === "ADMIN" || user?.roleName === "ADMIN";

  return {
    currentUser,
    isLoadingUser,
    refetchUser,
    userError,
    updateProfile,
    isUpdatingProfile,
    updateSettings,
    isUpdatingSettings,
    isAdmin,
  };
};
