import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Award } from "lucide-react";
import { UniversityDetailCardProps } from "@/types/university";
import Link from 'next/link';

export function UniversityDetailCard({
	faculty,
	department,
}: UniversityDetailCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>試験情報</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div>
					<h3 className="font-semibold mb-2">学部・学科</h3>
					<p>{faculty.name}</p>
					<p className="text-muted-foreground">{department.name}</p>
					<Link href={department.url} className="hover:underline">
						{department.url}
					</Link>
				</div>
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<FileText className="h-5 w-5 text-muted-foreground" />
						<div>
							<p className="font-medium">出願期間</p>
							<p className="text-sm text-muted-foreground">
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
					<div className="flex items-center gap-3">
						<Calendar className="h-5 w-5 text-muted-foreground" />
						<div>
							<p className="font-medium">試験日</p>
							<p className="text-sm text-muted-foreground">
								{department.exam_date || "未定"}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<Award className="h-5 w-5 text-muted-foreground" />
						<div>
							<p className="font-medium">合格発表日</p>
							<p className="text-sm text-muted-foreground">
								{department.result_date || "未定"}
							</p>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
