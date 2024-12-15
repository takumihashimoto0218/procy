import { Database } from "@/types/supabase";

type Faculty = Database['public']['Tables']['faculties']['Row'];
type Department = Database['public']['Tables']['departments']['Row'];

interface UniversityDetailCardProps {
  faculty: Faculty;
  department: Department;
}

export type { UniversityDetailCardProps, Faculty, Department };