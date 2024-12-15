import "./globals.css";
import { Header } from "@/components/layout/Header";


export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {

	return (
		<html lang="ja">
			<body>
				<Header />
				{children}
			</body>
		</html>
	);
}
