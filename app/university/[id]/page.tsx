import { notFound } from "next/navigation";
import { UniversityDetailCard } from "@/components/university/UniversityDetailCard";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";


interface PageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function UniversityDetailPage({ 
  params,

}: PageProps) {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  const { data: school, error } = await supabase
    .from("schools")
    .select(
      `
      id,
      name,
      faculties (
        id,
        name,
        school_id,
        created_at,
        departments (
          id,
          name,
          faculty_id,
          application_period_start,
          application_period_end,
          exam_date,
          result_date,
          created_at
        )
      )
    `
    )
    .eq("id", params.id)
    .single();

  if (error || !school) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{school.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {school.faculties?.map((faculty) => (
          <div key={faculty.id} className="space-y-6">
            <h2 className="text-2xl font-semibold">{faculty.name}</h2>
            {faculty.departments?.map((department) => (
              <UniversityDetailCard
                key={department.id}
                faculty={faculty}
                department={department}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}