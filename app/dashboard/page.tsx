"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ApplicationStatus = "considering" | "applied" | "scheduled" | "completed";

interface UniversityWithStatus {
	id: string;
	schoolName: string;
	facultyName: string;
	departmentName: string;
	application_period_start: string | null;
	application_period_end: string | null;
	exam_date: string | null;
	result_date: string | null;
	status: ApplicationStatus;
	userUniversityId: string;
}

export default function DashboardPage() {
	const [universities, setUniversities] = useState<UniversityWithStatus[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [userName, setUserName] = useState("");

	const getStatusBadge = (status: ApplicationStatus) => {
		const statusConfig = {
			considering: { label: "検討中", className: "bg-gray-100 text-gray-800" },
			applied: {
				label: "出願済み",
				className: "bg-yellow-100 text-yellow-800",
			},
			scheduled: { label: "試験予定", className: "bg-blue-100 text-blue-800" },
			completed: { label: "完了", className: "bg-green-100 text-green-800" },
		};
		return statusConfig[status];
	};

	useEffect(() => {
		fetchUserData();
		fetchUniversityData();
	}, []);

	const fetchUserData = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) throw new Error("User not authenticated");

			const { data, error } = await supabase
				.from("profiles")
				.select("name")
				.eq("id", user.id)
				.single();

			if (error) throw error;
			if (data) setUserName(data.name);
		} catch (error) {
			console.error("Error fetching user data:", error);
		}
	};

	const fetchUniversityData = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) throw new Error("User not authenticated");

			const { data, error } = await supabase
				.from("user_universities")
				.select(
					`
          id,
          user_id,
          status,
          schools!inner (
            id,
            name
          ),
          faculties!inner (
            id,
            name
          ),
          departments!inner (
            id,
            name,
            application_period_start,
            application_period_end,
            exam_date,
            result_date
          )
        `
				)
				.eq("user_id", user.id);

			if (error) throw error;
			if (!data) return;

			const formattedData: UniversityWithStatus[] = data.map((item: any) => {
				const formatted = {
					id: item.schools.id,
					schoolName: item.schools.name,
					facultyName: item.faculties.name,
					departmentName: item.departments.name,
					application_period_start: item.departments.application_period_start,
					application_period_end: item.departments.application_period_end,
					exam_date: item.departments.exam_date,
					result_date: item.departments.result_date,
					status: item.status,
					userUniversityId: item.id,
				};
				return formatted;
			});

			setUniversities(formattedData);
		} catch (error) {
			console.log("Error fetching universities:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (userUniversityId: string) => {
		try {
			const { error } = await supabase
				.from("user_universities")
				.delete()
				.eq("id", userUniversityId);

			if (error) throw error;

			setUniversities((prev) =>
				prev.filter((uni) => uni.userUniversityId !== userUniversityId)
			);
		} catch (error) {
			console.error("Error deleting university:", error);
		}
	};

	const adjustToAcademicYear = (
		dateStr: string | null,
		currentYear: number
	): string | null => {
		if (!dateStr) return null;

		try {
			let month: string;
			let day: string;

			// スラッシュ(/)またはハイフン(-)で分割
			if (dateStr.includes("/")) {
				[month, day] = dateStr.split("/");
			} else if (dateStr.includes("-")) {
				[month, day] = dateStr.split("-");
			} else {
				return null;
			}

			const monthNum = parseInt(month);
			if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) return null;

			// 現在の年度を決定（4月始まり）
			const academicYear =
				new Date().getMonth() + 1 >= 4 ? currentYear : currentYear - 1;

			// 1-3月は次の年、4-12月は現在の年度の年を使用
			const year =
				monthNum >= 1 && monthNum <= 3 ? academicYear + 1 : academicYear;

			// 月と日を2桁に揃える
			const paddedMonth = month.toString().padStart(2, "0");
			const paddedDay = day.toString().padStart(2, "0");

			return `${year}-${paddedMonth}-${paddedDay}`;
		} catch (error) {
			console.error("Error parsing date:", dateStr, error);
			return null;
		}
	};

	const getCellBackground = (uni: UniversityWithStatus, date: Date): string => {
		if (
			!uni.application_period_start ||
			!uni.application_period_end ||
			!uni.exam_date ||
			!uni.result_date
		) {
			return "";
		}

		try {
			const currentYear = new Date().getFullYear();
			const currentDateStr = date.toISOString().split("T")[0];

			// DBの日付を現在の年度に調整
			const examDateStr = adjustToAcademicYear(uni.exam_date, currentYear);
			const resultDateStr = adjustToAcademicYear(uni.result_date, currentYear);
			const startDateStr = adjustToAcademicYear(
				uni.application_period_start,
				currentYear
			);
			const endDateStr = adjustToAcademicYear(
				uni.application_period_end,
				currentYear
			);

			if (!examDateStr || !resultDateStr || !startDateStr || !endDateStr) {
				return "";
			}

			if (currentDateStr === examDateStr) {
				return "bg-red-200";
			}
			if (currentDateStr === resultDateStr) {
				return "bg-green-200";
			}

			if (currentDateStr >= startDateStr && currentDateStr <= endDateStr) {
				return "bg-blue-200";
			}
		} catch (error) {
			console.error("Date parsing error:", error);
		}
		return "";
	};

	const getDates = () => {
		const today = new Date();
		const currentMonth = today.getMonth() + 1;

		// 年度の開始日を設定
		const year =
			currentMonth >= 4 ? today.getFullYear() : today.getFullYear() - 1;
		const startDate = new Date(year, 3, 1); // 4月1日から開始

		return Array.from({ length: 366 }, (_, index) => {
			const date = new Date(startDate);
			date.setDate(startDate.getDate() + index);
			return date;
		});
	};

	const dates = getDates();

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-white">
			<header className="border-b border-gray-200 bg-white">
				<div className="px-8 py-3">
					<div className="flex justify-between items-center">
						<div className="flex items-center space-x-2">
							<div className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center text-white font-bold">
								AP
							</div>
							<span className="text-blue-500 font-medium">
								AdmissionPlanner
							</span>
						</div>
						<div className="text-black text-sm">
							Logged in as: {userName || "Loading..."}
						</div>
					</div>
					<nav className="mt-2">
						<ul className="flex space-x-4 text-sm text-black">
							<li className="px-4 py-1 bg-gray-100 rounded">プラン</li>
							<li className="px-4 py-1">検索</li>
							<li className="px-4 py-1">準備</li>
							<li className="px-4 py-1">セッティング</li>
						</ul>
					</nav>
				</div>
			</header>

			<div className="px-8 py-4">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-xl font-medium text-black">
						大学受験スケジュール管理
					</h1>
					<div className="w-[200px]"></div>
				</div>

				<div className="flex gap-6">
					<div className="w-[350px] bg-white rounded border border-gray-200 p-4">
						<h2 className="font-medium text-sm mb-4 text-black">
							大学 / 受験方式
						</h2>
						<div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
							{universities.map((uni) => (
								<div key={uni.userUniversityId} className="group">
									<div className="flex items-start gap-2">
										<span className="text-black">≡</span>
										<div className="flex-grow">
											<div className="flex items-center justify-between">
												<span className="font-medium text-black">
													{uni.schoolName}
												</span>
												<button
													className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
													onClick={() => handleDelete(uni.userUniversityId)}
												>
													ⓧ
												</button>
											</div>
											<div className="text-sm text-black mt-1">
												<div>{uni.facultyName}</div>
												<div>{uni.departmentName}</div>
											</div>
											<div className="mt-2">
												<span
													className={`inline-block px-2 py-0.5 rounded text-xs ${
														getStatusBadge(uni.status).className
													}`}
												>
													{getStatusBadge(uni.status).label}
												</span>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="flex-1 border border-gray-200 rounded bg-white p-6 overflow-x-auto">
						<div className="min-w-[1200px]">
							<div
								className="grid"
								style={{
									gridTemplateColumns: `repeat(${dates.length}, minmax(40px, 1fr))`,
								}}
							>
								{dates.map((date, index) => (
									<div
										key={`header-${date.toISOString().split("T")[0]}-${index}`}
										className="text-center text-sm text-black py-2 px-1 border-b border-r border-gray-200"
									>
										{`${date.getMonth() + 1}/${date.getDate()}`}
									</div>
								))}

								{universities.map((uni) =>
									dates.map((date, dateIndex) => (
										<div
											key={`cell-${uni.userUniversityId}-${
												date.toISOString().split("T")[0]
											}-${dateIndex}`}
											className={`h-24 border-b border-r border-gray-100 ${getCellBackground(
												uni,
												date
											)}`}
										/>
									))
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="mt-6 flex justify-center space-x-6">
					<div className="flex items-center">
						<div className="w-4 h-4 bg-blue-200 rounded mr-2"></div>
						<span className="text-sm text-black">出願期間</span>
					</div>
					<div className="flex items-center">
						<div className="w-4 h-4 bg-red-200 rounded mr-2"></div>
						<span className="text-sm text-black">試験日</span>
					</div>
					<div className="flex items-center">
						<div className="w-4 h-4 bg-green-200 rounded mr-2"></div>
						<span className="text-sm text-black">合格発表日</span>
					</div>
				</div>
			</div>
		</div>
	);
}
