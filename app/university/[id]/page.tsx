import { notFound } from "next/navigation";
import { UniversityDetailCard } from "@/components/university/UniversityDetailCard";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
import { School, ChevronRight, GraduationCap } from 'lucide-react';
import Link from 'next/link';

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
          created_at,
          url
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* ブレッドクラムナビゲーション */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link 
            href="/university" 
            className="hover:text-blue-600 transition-colors"
          >
            大学一覧
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{school.name}</span>
        </nav>

        {/* 大学名ヘッダー */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <School className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{school.name}</h1>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <GraduationCap className="w-5 h-5 mr-2" />
              <span>{school.faculties?.length || 0} 学部</span>
            </div>
            <div className="flex items-center">
              <span>
                {school.faculties?.reduce((acc, faculty) => 
                  acc + (faculty.departments?.length || 0), 0) || 0} 学科
              </span>
            </div>
          </div>
        </div>

        {/* 学部・学科リスト */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {school.faculties?.map((faculty) => (
            <div key={faculty.id} className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {faculty.name}
                </h2>
              </div>
              <div className="space-y-6">
                {faculty.departments?.map((department) => (
                  <UniversityDetailCard
                    key={department.id}
                    faculty={faculty}
                    department={department}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}