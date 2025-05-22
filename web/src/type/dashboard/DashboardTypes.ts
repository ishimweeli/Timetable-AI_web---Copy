export interface DashboardStats {
    countOrganization: number;
    countUser: number;
    countAdmin: number;
    countManager: number;
    countTeacher: number;
    countStudent: number;
    countTimetable: number;
    countClass: number;
    countCalendar: number;
    countRoom: number;
    countSubject: number;
    countRule: number;
  }

  export interface OrgStatistics {
    countUser: number;
    countTeacher: number;
    countStudent: number;
    countClass: number;
    countRoom: number;
    countSubject: number;
    countRule: number;
    countTimetable: number;
    countCalendar: number;
  }

  export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
    timestamp: string;
    code: number;
  }