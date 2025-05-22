// src/store/Binding/SliceBinding.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Binding } from "@/type/Binding/TypeBinding";

interface BindingState {
  selectedBindingUuid: string | null;
  isLoading: boolean;
  error: string | null;
  bindings: Binding[];
  currentView: "list" | "grid" | "detail";
  filter: {
    teacher?: string;
    subject?: string;
    class?: string;
    room?: string;
  };
  sort: {
    field?: "teacher_name" | "subject_name" | "class_name" | "room_name";
    direction: "asc" | "desc";
  };
}

const initialState: BindingState = {
  selectedBindingUuid: null,
  isLoading: false,
  error: null,
  bindings: [],
  currentView: "list",
  filter: {},
  sort: {
    field: "teacher_name",
    direction: "asc",
  },
};

const sliceBinding = createSlice({
  name: "binding",
  initialState,
  reducers: {
    setSelectedBinding(state, action: PayloadAction<string | null | Binding>) {
      // Handle both string and Binding object
      if(action.payload === null) {
        state.selectedBindingUuid = null;
      } else if(typeof action.payload === 'string') {
        state.selectedBindingUuid = action.payload;
      }else {
        // If a Binding object is passed, extract the UUID
        state.selectedBindingUuid = action.payload.uuid;
      }
    },
    
    // For backward compatibility
    setSelectedAssignment: (state, action: PayloadAction<string | null | Binding>) => {
      if(action.payload === null) {
        state.selectedBindingUuid = null;
      } else if(typeof action.payload === 'string') {
        state.selectedBindingUuid = action.payload;
      }else {
        state.selectedBindingUuid = action.payload.uuid;
      }
    },
    
    setBindingLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    
    setBindingError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    
    setBindings(state, action: PayloadAction<Binding[]>) {
      state.bindings = action.payload;
    },
    
    // For backward compatibility
    setAssignments(state, action: PayloadAction<Binding[]>) {
      state.bindings = action.payload;
    },
    
    addBinding(state, action: PayloadAction<Binding>) {
      state.bindings.push(action.payload);
    },
    
    // For backward compatibility
    addAssignment(state, action: PayloadAction<Binding>) {
      state.bindings.push(action.payload);
    },
    
    updateBinding(state, action: PayloadAction<Binding>) {
      const index = state.bindings.findIndex(
        (b) => b.uuid === action.payload.uuid
      );
      if(index !== -1) {
        state.bindings[index] = action.payload;
      }
    },
    
    // For backward compatibility
    updateAssignment(state, action: PayloadAction<Binding>) {
      const index = state.bindings.findIndex(
        (b) => b.uuid === action.payload.uuid
      );
      if(index !== -1) {
        state.bindings[index] = action.payload;
      }
    },
    
    removeBinding(state, action: PayloadAction<string>) {
      state.bindings = state.bindings.filter(
        (b) => b.uuid !== action.payload
      );
    },
    
    // For backward compatibility
    removeAssignment(state, action: PayloadAction<string>) {
      state.bindings = state.bindings.filter(
        (b) => b.uuid !== action.payload
      );
    },
    
    setCurrentView(state, action: PayloadAction<"list" | "grid" | "detail">) {
      state.currentView = action.payload;
    },
    
    setFilter(
      state,
      action: PayloadAction<{
        teacher?: string;
        subject?: string;
        class?: string;
        room?: string;
      }>
    ) {
      state.filter = action.payload;
    },
    
    setSort(
      state,
      action: PayloadAction<{
        field?: "teacher_name" | "subject_name" | "class_name" | "room_name";
        direction: "asc" | "desc";
      }>
    ) {
      state.sort = action.payload;
    },
  },
});

export const {
  setSelectedBinding,
  setSelectedAssignment, // For backward compatibility
  setBindingLoading,
  setBindingError,
  setBindings,
  setAssignments, // For backward compatibility
  addBinding,
  addAssignment, // For backward compatibility
  updateBinding,
  updateAssignment, // For backward compatibility
  removeBinding,
  removeAssignment, // For backward compatibility
  setCurrentView,
  setFilter,
  setSort,
} = sliceBinding.actions;

export default sliceBinding.reducer;
