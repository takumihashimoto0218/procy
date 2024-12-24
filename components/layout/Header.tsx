"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";

export function Header() {
	const pathname = usePathname();
	const router = useRouter();
	const [session, setSession] = useState<Session | null>(null);

	useEffect(() => {
		// 現在のセッション状態を取得
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
		});

		// セッション状態の変更を監視
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});

		return () => subscription.unsubscribe();
	}, []);

	const handleSignOut = async () => {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
			router.push("/login");
		} catch (error) {
			console.error("Error signing out:", error);
		}
	};

	return (
		<header className="border-b">
			<div className="container mx-auto px-4 h-16 flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<Link href="/" className="flex items-center space-x-2">
						<GraduationCap className="h-6 w-6" />
						<span className="font-bold text-xl">PROPSHEET</span>
					</Link>
					<nav className="hidden md:flex items-center space-x-4">
						<Link
							href="/dashboard"
							className={`${
								pathname === "/dashboard"
									? "text-primary font-medium"
									: "text-muted-foreground"
							}`}
						>
							ダッシュボード
						</Link>
						<Link
							href="/university"
							className={`${
								pathname === "/university"
									? "text-primary font-medium"
									: "text-muted-foreground"
							}`}
						>
							大学一覧
						</Link>
					</nav>
				</div>
				<div className="flex items-center space-x-4">
					{session ? (
						<>
							<Link href="/university/new">
								<Button variant="outline">大学を登録する</Button>
							</Link>
							<Button variant="ghost" onClick={handleSignOut}>
								ログアウト
							</Button>
						</>
					) : (
						<>
							<Link href="/login">
								<Button variant="ghost">ログイン</Button>
							</Link>
							<Link href="/register">
								<Button>新規登録</Button>
							</Link>
						</>
					)}
				</div>
			</div>
		</header>
	);
}
