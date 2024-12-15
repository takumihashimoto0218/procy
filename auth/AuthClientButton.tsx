"use client";

import {
	Session,
	createClientComponentClient,
} from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

const AuthClientButton = ({ session }: { session: Session | null }) => {
	const router = useRouter();
	const supabase = createClientComponentClient();
	console.log(session);

	const handleSignIn = async () => {
		await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${location.origin}/auth/callback`,
			},
		});
	};

	const handleSignOut = async () => {
		await supabase.auth.signOut();
		router.refresh();
	};

	return (
		<>
			{session ? (
				<button onClick={handleSignOut}>ログアウト</button>
			) : (
				<button onClick={handleSignIn}>サインイン</button>
			)}
		</>
	);
};

export default AuthClientButton;
