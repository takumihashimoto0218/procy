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
}

export interface UserUniversity {
  id: string;
  user_id: string;
  school_id: string;
  faculty_id: string;
  department_id: string;
  status: ApplicationStatus;
  created_at: string;
}



export type ApplicationStatus = 'considering' | 'applied' | 'scheduled' | 'completed';