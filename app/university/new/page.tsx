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
				setDepartments(data || []);
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
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
			</div>
		);
	}

	if (!session) return null;

	return (
		<div className="max-w-md mx-auto">
			<div className="text-center mb-8">
				<h2 className="text-3xl font-bold">大学情報登録</h2>
				<p className="mt-2 text-muted-foreground">
					受験予定の大学情報を入力してください
				</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="space-y-2">
					<Label>大学名</Label>
					<div className="flex gap-2">
						<Input
							type="text"
							value={schoolName}
							onChange={(e) => setSchoolName(e.target.value)}
							placeholder="大学名を入力してください"
							required
						/>
						<Button
							type="button"
							onClick={searchUniversity}
							disabled={searching || !schoolName.trim()}
						>
							{searching ? "検索中..." : "検索"}
						</Button>
					</div>
				</div>

				{showSelections && (
					<>
						<div className="space-y-2">
							<Label>学部</Label>
							<select
								className="w-full rounded-md border border-input bg-background px-3 py-2"
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

						<div className="space-y-2">
							<Label>学科</Label>
							<select
								className="w-full rounded-md border border-input bg-background px-3 py-2"
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

						<div className="space-y-2">
							<Label>ステータス</Label>
							<select
								className="w-full rounded-md border border-input bg-background px-3 py-2"
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
					</>
				)}

				<Button
					type="submit"
					className="w-full"
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
	);
}
