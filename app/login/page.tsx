"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setIsLoading(true);
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			if (error) throw error;
			router.push("/dashboard");
		} catch (error: any) {
			setError(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50">
			<div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
				<div className="text-center">
					<h2 className="mt-6 text-3xl font-bold text-gray-900">
						受験スケジュール管理
					</h2>
					<p className="mt-2 text-sm text-gray-600">ログインしてください</p>
				</div>
				<form onSubmit={handleSubmit} className="mt-8 space-y-6">
					<div className="space-y-4">
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700"
							>
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
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
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
					</div>
					{error && <p className="text-red-500 text-sm text-center">{error}</p>}
					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? "ログイン中..." : "ログイン"}
					</Button>
					<p className="text-center text-sm">
						アカウントをお持ちでない方は{" "}
						<Link href="/register" className="text-primary hover:underline">
							新規登録
						</Link>
					</p>
				</form>
			</div>
		</div>
	);
}

// "use client";

// import { useState } from "react";
// import { supabase } from "@/lib/supabase";

// const Auth = () => {
// 	const [email, setEmail] = useState("");
// 	const [password, setPassword] = useState("");
// 	const [isLoading, setIsLoading] = useState(false);

// 	const handleLogin = async () => {
// 		try {
// 			setIsLoading(true);
// 			const { error } = await supabase.auth.signInWithPassword({
// 				email,
// 				password,
// 			});
// 			if (error) throw error;
// 			alert("Login successful!");
// 		} catch (error) {
// 			console.log("error");
// 		} finally {
// 			setIsLoading(false);
// 		}
// 	};

// 	const handleSignUp = async () => {
// 		try {
// 			setIsLoading(true);
// 			const { error } = await supabase.auth.signUp({
// 				email,
// 				password,
// 			});
// 			if (error) throw error;
// 			alert("Sign up successful!");
// 		} catch (error) {

// 		} finally {
// 			setIsLoading(false);
// 		}
// 	};

// 	return (
// 		<div>
// 			<input
// 				type="email"
// 				placeholder="Email"
// 				value={email}
// 				onChange={(e) => setEmail(e.target.value)}
// 			/>
// 			<input
// 				type="password"
// 				placeholder="Password"
// 				value={password}
// 				onChange={(e) => setPassword(e.target.value)}
// 			/>
// 			<button onClick={handleLogin} disabled={isLoading}>
// 				Login
// 			</button>
// 			<button onClick={handleSignUp} disabled={isLoading}>
// 				Sign Up
// 			</button>
// 		</div>
// 	);
// };

// export default Auth;