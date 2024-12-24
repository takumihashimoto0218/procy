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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
              <div className="bg-blue-100 p-2 rounded-xl">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <span className="font-semibold text-xl text-gray-900">PROPSHEET</span>
            </Link>
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/dashboard"
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/dashboard"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                ダッシュボード
              </Link>
              <Link
                href="/university"
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/university"
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                大学一覧
              </Link>
              {session && (
                <Link
                  href="/university/new"
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50`}
                >
                  大学を登録する
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center">
            {session ? (
              <Button 
                variant="ghost" 
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                ログアウト
              </Button>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <Button 
                    variant="ghost"
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    ログイン
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    className="bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                  >
                    新規登録
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}