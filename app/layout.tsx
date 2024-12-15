import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// // cookiesを直接渡す
	// const supabase = createServerComponentClient({ cookies });

	return (
		<html lang="ja">
			<body>
				<Header />
				{children}
			</body>
		</html>
	);
}
