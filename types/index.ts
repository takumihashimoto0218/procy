export interface User {
  id: string;
  name: string;
  email: string;
}

export interface School {
  id: string;
  name: string;
}

export interface Faculty {
  id: string;
  school_id: string;
  name: string;
}

export interface Department {
  id: string;
  faculty_id: string;
  name: string;
  application_period_start: string | null;
  application_period_end: string | null;
  exam_date: string | null;
  result_date: string | null;
}

export interface UserUniversity {
  id: string;
  user_id: string;
  school_id: string;  // 追加
  faculty_id: string; 
  department_id: string;
  status: ApplicationStatus;
}



export type ApplicationStatus = 'considering' | 'applied' | 'scheduled' | 'completed';