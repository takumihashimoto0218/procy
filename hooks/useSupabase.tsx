// "use client";
// import { createContext, JSX, useContext, useEffect, useState } from "react";
// import { Session, User } from "@supabase/supabase-js";
// import { supabase } from "@/lib/supabase";
// import { useRouter } from "next/navigation";

// interface SupabaseContextType {
// 	user: User | null;
// 	session: Session | null;
// 	signOut: () => Promise<void>;
// 	isLoading: boolean; // ローディング状態を追加
// }

// const SupabaseContext = createContext<SupabaseContextType>({
// 	user: null,
// 	session: null,
// 	signOut: async () => {},
// 	isLoading: true,
// });

// interface SupabaseProviderProps {
// 	children: React.ReactNode;
// }

// export function SupabaseProvider({
// 	children,
// }: SupabaseProviderProps): JSX.Element {
// 	const [user, setUser] = useState<User | null>(null);
// 	const [session, setSession] = useState<Session | null>(null);
// 	const [isLoading, setIsLoading] = useState(true);
// 	const router = useRouter();

// 	useEffect(() => {
// 		// 初期セッションの取得
// 		const initializeSession = async () => {
// 			try {
// 				// 現在のセッションを取得
// 				const {
// 					data: { session: currentSession },
// 				} = await supabase.auth.getSession();
// 				setSession(currentSession);
// 				setUser(currentSession?.user ?? null);
// 			} catch (error) {
// 				console.error("セッションの初期化エラー:", error);
// 			} finally {
// 				setIsLoading(false);
// 			}
// 		};

// 		initializeSession();

// 		// セッション変更の監視を設定
// 		const {
// 			data: { subscription },
// 		} = supabase.auth.onAuthStateChange(async (_event, newSession) => {
// 			setSession(newSession);
// 			setUser(newSession?.user ?? null);
// 			setIsLoading(false);
// 		});

// 		return () => {
// 			subscription.unsubscribe();
// 		};
// 	}, []);

// 	const signOut = async (): Promise<void> => {
// 		try {
// 			const { error } = await supabase.auth.signOut();
// 			if (error) throw error;

// 			setSession(null);
// 			setUser(null);
// 			router.push("/");
// 		} catch (error) {
// 			console.error("サインアウトエラー:", error);
// 		}
// 	};

// 	const value: SupabaseContextType = {
// 		user,
// 		session,
// 		signOut,
// 		isLoading,
// 	};

// 	return (
// 		<SupabaseContext.Provider value={value}>
// 			{children}
// 		</SupabaseContext.Provider>
// 	);
// }

// export const useSupabase = (): SupabaseContextType => {
// 	const context = useContext(SupabaseContext);
// 	if (!context) {
// 		throw new Error("useSupabase must be used within a SupabaseProvider");
// 	}
// 	return context;
// };
