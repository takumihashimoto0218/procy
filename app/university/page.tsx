import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";
import { GraduationCap, ChevronRight, Users } from 'lucide-react';
import Link from 'next/link';

export default async function UniversityListPage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data: schools, error } = await supabase
    .from("schools")
    .select(`
      id,
      name,
      faculties (
        id,
        name,
        departments (
          id,
          name
        )
      )
    `)
    .order("name");

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-xl font-semibold">
            データの取得に失敗しました
          </div>
          <p className="text-gray-600">
            しばらく時間をおいて再度お試しください
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* 統計情報 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-2xl">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15 9h-5v2h5V9zm0 3h-5v2h5v-2zm0-6h-5v2h5V6zm2 0v14H5V6h2V4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6h-2zM7 19h10v-2H7v2zm10-4H7v-2h10v2zm0-4H7V9h10v2zm0-4H7V5h10v2z"/>
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-600">登録大学数</p>
                <p className="text-2xl font-bold text-gray-900">{schools.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-2xl">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">総学部数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {schools.reduce((acc, school) => acc + (school.faculties?.length || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-2xl">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">総学科数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {schools.reduce((acc, school) => 
                    acc + (school.faculties?.reduce((deptAcc, faculty) => 
                      deptAcc + (faculty.departments?.length || 0), 0) || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 大学一覧 */}
        {schools.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15 9h-5v2h5V9zm0 3h-5v2h5v-2zm0-6h-5v2h5V6zm2 0v14H5V6h2V4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6h-2zM7 19h10v-2H7v2zm10-4H7v-2h10v2zm0-4H7V9h10v2zm0-4H7V5h10v2z"/>
            </svg>
            <h3 className="mt-2 text-sm font-semibold text-gray-900">登録大学なし</h3>
            <p className="mt-1 text-sm text-gray-500">現在登録されている大学はありません。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schools.map((school) => (
              <Link
                href={`/university/${school.id}`}
                key={school.id}
                className="block group bg-white rounded-2xl shadow-sm hover:shadow transition-shadow duration-200 cursor-pointer"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15 9h-5v2h5V9zm0 3h-5v2h5v-2zm0-6h-5v2h5V6zm2 0v14H5V6h2V4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6h-2zM7 19h10v-2H7v2zm10-4H7v-2h10v2zm0-4H7V9h10v2zm0-4H7V5h10v2z"/>
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900">
                        {school.name}
                      </h3>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <GraduationCap className="w-5 h-5 text-purple-600 mr-3" />
                      <span>{school.faculties?.length || 0} 学部</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-5 h-5 text-green-600 mr-3" />
                      <span>
                        {school.faculties?.reduce((acc, faculty) => 
                          acc + (faculty.departments?.length || 0), 0) || 0} 学科
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}