"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { ApplicationStatus } from "@/types";
import Link from "next/link";
import { Users, Calendar, ChevronRight, X, Building } from "lucide-react";

interface UniversityWithStatus {
	id: string;
	schoolName: string;
	facultyName: string;
	departmentName: string;
	application_period_start: string | null;
	application_period_end: string | null;
	exam_date: string | null;
	result_date: string | null;
	url: string;
	status: ApplicationStatus;
	userUniversityId: string;
}

interface SupabaseResponse {
	id: string;
	status: ApplicationStatus;
	schools: {
		name: string;
	};
	faculties: {
		name: string;
	};
	departments: {
		name: string;
		application_period_start: string | null;
		application_period_end: string | null;
		exam_date: string | null;
		result_date: string | null;
		url: string;
	};
}

const getDates = () => {
	const today = new Date();
	const currentMonth = today.getMonth() + 1;
	const year =
		currentMonth >= 4 ? today.getFullYear() : today.getFullYear() - 1;
	const startDate = new Date(year, 3, 1);

	return Array.from({ length: 366 }, (_, index) => {
		const date = new Date(startDate);
		date.setDate(startDate.getDate() + index);
		return date;
	});
};

const dates = getDates();

export default function DashboardPage() {
	const [universities, setUniversities] = useState<UniversityWithStatus[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [userName, setUserName] = useState("");
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const gridRef = useRef<HTMLDivElement>(null);

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

	useEffect(() => {
		if (!isLoading && scrollContainerRef.current && gridRef.current) {
			const container = scrollContainerRef.current;
			const grid = gridRef.current;
			const today = new Date();

			const todayIndex = dates.findIndex(
				(date) =>
					date.getDate() === today.getDate() &&
					date.getMonth() === today.getMonth() &&
					date.getFullYear() === today.getFullYear()
			);

			if (todayIndex !== -1) {
				const cellWidth = grid.scrollWidth / dates.length;
				const containerWidth = container.clientWidth;
				const scrollPosition =
					cellWidth * todayIndex - containerWidth / 2 + cellWidth / 2;
				container.scrollLeft = Math.max(0, scrollPosition);
			}
		}
	}, [isLoading, dates]);

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
          status,
          schools:school_id (
            name
          ),
          faculties:faculty_id (
            name
          ),
          departments:department_id (
            name,
            application_period_start,
            application_period_end,
            exam_date,
            result_date,
            url
          )
        `
				)
				.eq("user_id", user.id);

			if (error) throw error;
			if (!data) return;

			const formattedData: UniversityWithStatus[] = (
				data as unknown as SupabaseResponse[]
			).map((item) => ({
				id: item.id,
				schoolName: item.schools?.name ?? "No school name",
				facultyName: item.faculties?.name ?? "No faculty name",
				departmentName: item.departments?.name ?? "No department name",
				application_period_start:
					item.departments?.application_period_start ?? null,
				application_period_end:
					item.departments?.application_period_end ?? null,
				exam_date: item.departments?.exam_date ?? null,
				result_date: item.departments?.result_date ?? null,
				status: item.status,
				userUniversityId: item.id,
				url: item.departments?.url,
			}));

			setUniversities(formattedData);
		} catch (error) {
			console.error("Error fetching universities:", error);
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

			if (dateStr.includes("/")) {
				[month, day] = dateStr.split("/");
			} else if (dateStr.includes("-")) {
				[month, day] = dateStr.split("-");
			} else {
				return null;
			}

			const monthNum = parseInt(month);
			if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) return null;

			const academicYear =
				new Date().getMonth() + 1 >= 4 ? currentYear : currentYear - 1;
			const year =
				monthNum >= 1 && monthNum <= 3 ? academicYear + 1 : academicYear;
			const paddedMonth = month.toString().padStart(2, "0");
			const paddedDay = day.toString().padStart(2, "0");

			return `${year}-${paddedMonth}-${paddedDay}`;
		} catch (error) {
			console.error("Error parsing date:", dateStr, error);
			return null;
		}
	};

	const getCellBackground = (uni: UniversityWithStatus, date: Date): string => {
		const today = new Date();
		const isToday =
			date.getDate() === today.getDate() &&
			date.getMonth() === today.getMonth() &&
			date.getFullYear() === today.getFullYear();

		if (isToday) {
			return "bg-orange-100";
		}

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

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{/* ヘッダー */}
			<header className="bg-white border-b border-gray-200 sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-end items-center h-16">
						<div className="flex items-center space-x-4">
							<div className="flex items-center space-x-2">
								<div className="bg-blue-100 p-2 rounded-full">
									<Users className="h-5 w-5 text-blue-600" />
								</div>
								<span className="flex-end text-sm font-medium text-gray-700">
									{userName || "Loading..."}さん
								</span>
							</div>
						</div>
					</div>
				</div>
			</header>

			<div className="px-8 py-4">
				<div className="flex gap-6">
					{/* サイドバー */}
					<div className="w-[350px] bg-white rounded-2xl border border-gray-200 shadow-sm">
						<div className="p-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-lg font-semibold text-gray-900 flex items-center">
									<Building className="w-5 h-5 mr-2 text-blue-600" />
									受験予定校
								</h2>
							</div>
							<div className="space-y-4 max-h-[calc(100vh-280px)] overflow-y-auto">
								{universities.map((uni) => (
									<div
										key={uni.userUniversityId}
										className="group bg-white rounded-xl hover:bg-gray-50 transition-colors duration-200 p-4"
									>
										<div className="flex items-start gap-3">
											<div className="flex-grow">
												<div className="flex items-start justify-between">
													<div>
														<h3 className="font-medium text-gray-900">
															{uni.schoolName}
														</h3>
														<div className="mt-1 space-y-1">
															<p className="text-sm text-gray-600">
																{uni.facultyName}
															</p>
															<p className="text-sm text-gray-600">
																{uni.departmentName}
															</p>
															<Link
																href={uni.url}
																className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 mt-1"
															>
																<span>公式サイト</span>
																<ChevronRight className="w-4 h-4" />
															</Link>
														</div>
													</div>
													<button
														onClick={() => handleDelete(uni.userUniversityId)}
														className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
													>
														<X className="w-5 h-5" />
													</button>
												</div>
												<div className="mt-3">
													<span
														className={`
                            inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium
                            ${getStatusBadge(uni.status).className}
                          `}
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
					</div>

					{/* ガントチャート */}
					<div
						className="flex-1 border border-gray-200 rounded-2xl bg-white shadow-sm overflow-x-auto"
						ref={scrollContainerRef}
					>
						<div className="p-6">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-lg font-semibold text-gray-900 flex items-center">
									<Calendar className="w-5 h-5 mr-2 text-blue-600" />
									スケジュール
								</h2>
							</div>
							<div className="min-w-[1200px]">
								<div
									className="grid"
									style={{
										gridTemplateColumns: `repeat(${dates.length}, minmax(40px, 1fr))`,
									}}
									ref={gridRef}
								>
									{dates.map((date, index) => {
										const today = new Date();
										const isToday =
											date.getDate() === today.getDate() &&
											date.getMonth() === today.getMonth() &&
											date.getFullYear() === today.getFullYear();

										return (
											<div
												key={`header-${
													date.toISOString().split("T")[0]
												}-${index}`}
												className={`text-center text-sm text-gray-600 py-2 px-1 border-b border-r border-gray-200 ${
													isToday ? "bg-orange-100 font-medium" : ""
												}`}
											>
												{`${date.getMonth() + 1}/${date.getDate()}`}
											</div>
										);
									})}

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
				</div>

				{/* 凡例 */}
				<div className="mt-6 flex justify-center space-x-8">
					{[
						{ color: "bg-blue-200", label: "出願期間" },
						{ color: "bg-red-200", label: "試験日" },
						{ color: "bg-green-200", label: "合格発表日" },
						{ color: "bg-orange-100", label: "今日" },
					].map((item, index) => (
						<div key={index} className="flex items-center space-x-2">
							<div className={`w-4 h-4 ${item.color} rounded-full`}></div>
							<span className="text-sm text-gray-600">{item.label}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
