import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Award } from "lucide-react";
import { UniversityDetailCardProps } from "@/types/university";
import Link from 'next/link';

export function UniversityDetailCard({
  faculty,
  department,
}: UniversityDetailCardProps) {
  return (
    <Card className="bg-white/50 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-6 w-6 text-blue-600" />
          試験情報
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="bg-gray-50 p-4 rounded-xl">
          <h3 className="font-semibold mb-3 text-gray-900">学部・学科</h3>
          <div className="space-y-2">
            <p className="text-lg font-medium text-blue-600">{faculty.name}</p>
            <p className="text-gray-600">{department.name}</p>
            <Link 
              href={department.url} 
              className="text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-2 mt-2 group"
            >
              <span className="group-hover:underline">公式サイト</span>
              <svg 
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="group hover:bg-gray-50 p-4 rounded-xl transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-100 p-2.5 rounded-lg group-hover:scale-110 transition-transform">
                <FileText className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">出願期間</p>
                <p className="text-sm text-gray-600">
                  {department.application_period_start &&
                  department.application_period_end ? (
                    <>
                      {department.application_period_start} 〜{" "}
                      {department.application_period_end}
                    </>
                  ) : (
                    "未定"
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="group hover:bg-gray-50 p-4 rounded-xl transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 p-2.5 rounded-lg group-hover:scale-110 transition-transform">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">試験日</p>
                <p className="text-sm text-gray-600">
                  {department.exam_date || "未定"}
                </p>
              </div>
            </div>
          </div>

          <div className="group hover:bg-gray-50 p-4 rounded-xl transition-colors">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-2.5 rounded-lg group-hover:scale-110 transition-transform">
                <Award className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">合格発表日</p>
                <p className="text-sm text-gray-600">
                  {department.result_date || "未定"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}