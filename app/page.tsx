
import { GraduationCap } from "lucide-react";
import AuthServerButton from "@/auth/AuthServerButton";


export default function Home() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
			<GraduationCap className="h-16 w-16 mb-6 text-primary" />
			<h1 className="text-4xl font-bold tracking-tight mb-4">
				大学受験スケジュール管理システム
			</h1>
			<p className="text-xl text-muted-foreground mb-8 max-w-[600px]">
				受験スケジュールを簡単に管理し、効率的な受験準備をサポートします。
			</p>
			<div className="flex gap-4">

					<AuthServerButton />

			</div>
		</div>
	);
}
