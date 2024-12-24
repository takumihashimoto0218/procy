"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Database } from "@/types/supabase";
import { ApplicationStatus, Faculty, Department } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Session } from "@supabase/supabase-js";
import { School, Search, BookOpen, GraduationCap, Clock } from "lucide-react";


export default function RegisterPage() {
	const router = useRouter();
	const supabase = useMemo(() => createClientComponentClient<Database>(), []);

	const [schoolName, setSchoolName] = useState("");
	const [selectedSchoolId, setSelectedSchoolId] = useState<string>("");
	const [faculties, setFaculties] = useState<Faculty[]>([]);
	const [departments, setDepartments] = useState<Department[]>([]);
	const [showSelections, setShowSelections] = useState(false);

	const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");
	const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
	const [status, setStatus] = useState<ApplicationStatus>("considering");
	const [loading, setLoading] = useState(false);
	const [searching, setSearching] = useState(false);
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const initialize = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			setSession(session);
			setIsLoading(false);
		};
		initialize();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});

		return () => subscription.unsubscribe();
	}, [supabase]);

	useEffect(() => {
		if (!isLoading && !session) {
			router.replace("/login");
		}
	}, [isLoading, session, router]);

	const resetSelections = () => {
		setSelectedSchoolId("");
		setFaculties([]);
		setSelectedFacultyId("");
		setDepartments([]);
		setSelectedDepartmentId("");
		setShowSelections(false);
	};

	const searchUniversity = async () => {
		if (!schoolName.trim()) return;

		setSearching(true);
		resetSelections();

		try {
			// schoolsテーブルから完全一致で検索
			const { data: schoolData, error: schoolError } = await supabase
				.from("schools")
				.select("id")
				.eq("name", schoolName.trim())
				.single();

			if (schoolError) {
				if (schoolError.code === "PGRST116") {
					alert("該当する大学が見つかりませんでした");
					return;
				}
				throw schoolError;
			}

			if (schoolData) {
				setSelectedSchoolId(schoolData.id);
				setShowSelections(true);
			}
		} catch (error) {
			console.error("Error:", error);
			alert("検索中にエラーが発生しました");
		} finally {
			setSearching(false);
		}
	};

	// 学部データの取得
	useEffect(() => {
		if (!selectedSchoolId) return;

		const fetchFaculties = async () => {
			try {
				const { data, error } = await supabase
					.from("faculties")
					.select("*")
					.eq("school_id", selectedSchoolId)
					.order("name");

				if (error) throw error;
				setFaculties(data || []);
			} catch (error) {
				console.error("Error fetching faculties:", error);
			}
		};

		fetchFaculties();
	}, [selectedSchoolId, supabase]);

	// 学科データの取得
	useEffect(() => {
		if (!selectedFacultyId) return;

		const fetchDepartments = async () => {
			try {
				const { data, error } = await supabase
					.from("departments")
					.select("*")
					.eq("faculty_id", selectedFacultyId)
					.order("name");

				if (error) throw error;
				setDepartments(data);
			} catch (error) {
				console.error("Error fetching departments:", error);
			}
		};

		fetchDepartments();
	}, [selectedFacultyId, supabase]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (
			!selectedSchoolId ||
			!selectedFacultyId ||
			!selectedDepartmentId ||
			!session?.user
		)
			return;

		setLoading(true);
		try {
			const { error } = await supabase.from("user_universities").insert({
				user_id: session.user.id,
				school_id: selectedSchoolId,
				faculty_id: selectedFacultyId,
				department_id: selectedDepartmentId,
				status,
			});

			if (error) throw error;
			router.push("/dashboard");
		} catch (error) {
			console.error("Error:", error);
			alert("登録に失敗しました");
		} finally {
			setLoading(false);
		}
	};

	if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* ヘッダー */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <School className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">大学情報登録</h2>
            <p className="mt-2 text-sm text-gray-600">
              受験予定の大学情報を入力してください
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 大学名検索 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-900">大学名</Label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="大学名を入力してください"
                    required
                    className="pl-10"
                  />
                </div>
                <Button
                  type="button"
                  onClick={searchUniversity}
                  disabled={searching || !schoolName.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  {searching ? "検索中..." : "検索"}
                </Button>
              </div>
            </div>

            {showSelections && (
              <div className="space-y-6 bg-gray-50 p-6 rounded-xl">
                {/* 学部選択 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-600" />
                    学部
                  </Label>
                  <select
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    value={selectedFacultyId}
                    onChange={(e) => setSelectedFacultyId(e.target.value)}
                    required
                  >
                    <option value="">学部を選択してください</option>
                    {faculties.map((faculty) => (
                      <option key={faculty.id} value={faculty.id}>
                        {faculty.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 学科選択 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600" />
                    学科
                  </Label>
                  <select
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    value={selectedDepartmentId}
                    onChange={(e) => setSelectedDepartmentId(e.target.value)}
                    required
                  >
                    <option value="">学科を選択してください</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* ステータス選択 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    ステータス
                  </Label>
                  <select
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                    required
                  >
                    <option value="considering">検討中</option>
                    <option value="applied">出願済み</option>
                    <option value="scheduled">試験予定</option>
                    <option value="completed">完了</option>
                  </select>
                </div>
              </div>
            )}

            {/* 登録ボタン */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
              disabled={
                loading ||
                !selectedSchoolId ||
                !selectedFacultyId ||
                !selectedDepartmentId
              }
            >
              {loading ? "登録中..." : "登録する"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}