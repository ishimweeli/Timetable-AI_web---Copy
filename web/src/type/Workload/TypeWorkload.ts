export interface WorkloadItem {
  uuid: string;
  name: string;
  workload: number;
  // Add other relevant fields
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}