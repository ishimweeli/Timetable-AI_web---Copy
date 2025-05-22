import { isAnyOf, Middleware } from '@reduxjs/toolkit';
import { apiBinding } from '../Binding/ApiBinding';
import { workloadApi } from '../Workload/ApiWorkload';

/**
 * Middleware that listens for binding mutations and invalidates related workload cache entries
 */
export const workloadInvalidationMiddleware: Middleware = ({ dispatch }) => (next) => (action) => {
  // Process the action first
  const result = next(action);
  
  // Check if the action is a fulfilled binding mutation
  const isBindingMutation = isAnyOf(
    apiBinding.endpoints.createBinding.matchFulfilled,
    apiBinding.endpoints.updateBinding.matchFulfilled,
    apiBinding.endpoints.deleteBinding.matchFulfilled
  )(action);
  
  // If it's a binding mutation, invalidate the workload cache
  if (isBindingMutation) {
    // Extract relevant entity UUIDs from the action payload
    const payload = action.payload?.data;
    
    if (payload) {
      // Invalidate specific entity workloads if we have their IDs
      if (payload.teacherUuid) {
        dispatch(workloadApi.util.invalidateTags([{ type: 'TeacherWorkload', id: payload.teacherUuid }]));
      }
      
      if (payload.classUuid) {
        dispatch(workloadApi.util.invalidateTags([{ type: 'ClassWorkload', id: payload.classUuid }]));
      }
      
      if (payload.subjectUuid) {
        dispatch(workloadApi.util.invalidateTags([{ type: 'SubjectWorkload', id: payload.subjectUuid }]));
      }
      
      if (payload.roomUuid) {
        dispatch(workloadApi.util.invalidateTags([{ type: 'RoomWorkload', id: payload.roomUuid }]));
      }
      
      if (payload.classBandUuid) {
        dispatch(workloadApi.util.invalidateTags([{ type: 'ClassBandWorkload', id: payload.classBandUuid }]));
      }
    }
    
    // Always invalidate all workload data when bindings change
    dispatch(workloadApi.util.invalidateTags(['Bindings']));
  }
  
  return result;
}; 