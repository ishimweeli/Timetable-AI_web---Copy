import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, User } from "@/type/Auth/TypeAuth.ts";

const getInitialState = (): AuthState => {
  const storedToken = localStorage.getItem("authToken");
  const storedRefreshToken = localStorage.getItem("refreshToken");
  const storedUserData = localStorage.getItem("userData");

  const user = storedUserData ? JSON.parse(storedUserData) : null;

  return {
    user,
    token: storedToken,
    refreshToken: storedRefreshToken,
    isAuthenticated: !!storedToken,
    isLoading: false,
    error: null,
  };
};

const initialState: AuthState = getInitialState();

const sliceAuth = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        refreshToken: string;
      }>,
    ) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;

      // Make sure to save the organization ID as a top-level property for easier access
      if(user.organization?.id && !user.organizationId) {
        state.user = {
          ...user,
          organizationId: user.organization.id
        };
      }

      // Save the data to localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userData", JSON.stringify(user));
    },
    logOut: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("selectedOrganizationId");
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setCredentials, logOut, setError, clearError } =
  sliceAuth.actions;
export default sliceAuth.reducer;
