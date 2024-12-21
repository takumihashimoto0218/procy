"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

export default function RegisterPage() {
	const router = useRouter();
	const supabase = createClientComponentClient<Database>();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setIsLoading(true);
			const { data: authData, error: authError } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: {
						name,
					},
				},
			});

			if (authError) throw authError;

			if (authData?.user) {
				const { error: profileError } = await supabase.from("profiles").insert({
					id: authData.user.id,
					name,
					email,
				});

				if (profileError) throw profileError;
				router.push("/dashboard");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="max-w-md mx-auto">
			<h1 className="text-2xl font-bold text-center mb-6">新規登録</h1>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="name" className="block text-sm font-medium mb-1">
						名前
					</label>
					<Input
						id="name"
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
					/>
				</div>
				<div>
					<label htmlFor="email" className="block text-sm font-medium mb-1">
						メールアドレス
					</label>
					<Input
						id="email"
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</div>
				<div>
					<label htmlFor="password" className="block text-sm font-medium mb-1">
						パスワード
					</label>
					<Input
						id="password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>
				<Button type="submit" className="w-full" disabled={isLoading}>
					{isLoading ? "登録中..." : "登録"}
				</Button>
				<p className="text-center text-sm">
					すでにアカウントをお持ちの方は{" "}
					<Link href="/login" className="text-primary hover:underline">
						ログイン
					</Link>
				</p>
			</form>
		</div>
	);
}
