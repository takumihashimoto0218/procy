export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ApplicationStatus = 'considering' | 'applied' | 'scheduled' | 'completed';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
        }
      }
      schools: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      faculties: {
        Row: {
          id: string
          school_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          school_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          school_id?: string
          name?: string
          created_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          faculty_id: string
          name: string
          application_period_start: string | null
          application_period_end: string | null
          exam_date: string | null
          result_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          faculty_id: string
          name: string
          application_period_start?: string | null
          application_period_end?: string | null
          exam_date?: string | null
          result_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          faculty_id?: string
          name?: string
          application_period_start?: string | null
          application_period_end?: string | null
          exam_date?: string | null
          result_date?: string | null
          created_at?: string
        }
      }
      user_universities: {
        Row: {
          id: string
          user_id: string
          school_id: string
          faculty_id: string
          department_id: string
          status: ApplicationStatus
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          school_id: string
          faculty_id: string
          department_id: string
          status: ApplicationStatus
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          school_id?: string
          faculty_id?: string
          department_id?: string
          status?: ApplicationStatus
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      application_status: ApplicationStatus
    }
  }
}