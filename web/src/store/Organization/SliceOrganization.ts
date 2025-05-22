import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAction } from "@reduxjs/toolkit";

interface OrganizationState {
  selectedOrganizationUuid: string | null;
  filter: {
    status?: number;
  };
  sort: {
    field: string;
    direction: "asc" | "desc";
  };
}

const initialState: OrganizationState = {
  selectedOrganizationUuid: null,
  filter: {},
  sort: {
    field: "name",
    direction: "asc",
  },
};

const sliceOrganization = createSlice({
  name: "organization",
  initialState,
  reducers: {
    setSelectedOrganization: (state, action: PayloadAction<string | null>) => {
      state.selectedOrganizationUuid = action.payload;
    },
    setFilter: (state, action: PayloadAction<{ status?: number }>) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    setSort: (
      state,
      action: PayloadAction<{ field: string; direction: "asc" | "desc" }>,
    ) => {
      state.sort = action.payload;
    },
    resetFilters: (state) => {
      state.filter = {};
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setSelectedOrganization, (state, action) => {
      console.log(
        "Redux reducer: Setting selected organization UUID to:",
        action.payload,
      );
      state.selectedOrganizationUuid = action.payload;
    });
  },
});

export const { setSelectedOrganization, setFilter, setSort, resetFilters } =
  sliceOrganization.actions;
export default sliceOrganization.reducer;
