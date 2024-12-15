import { UniversityCard } from "@/components/university/UniversityCard";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export default async function UniversityListPage() {
	const supabase = createServerComponentClient<Database>({ cookies });

	// schoolsテーブルから全ての大学情報を取得
	const { data: schools, error } = await supabase
		.from("schools")
		.select(
			`
      id,
      name,
      faculties (
        id,
        name,
        departments (
          id,
          name
        )
      )
    `
		)
		.order("name");

	if (error) {
		console.error("Error fetching schools:", error);
		return (
			<div className="text-center text-red-500">
				データの取得に失敗しました。
			</div>
		);
	}

	return (
		<div>
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">大学一覧</h1>
			</div>
			{schools.length === 0 ? (
				<p className="text-center text-muted-foreground">
					登録されている大学はありません。
				</p>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{schools.map((school) => (
						<UniversityCard
							key={school.id}
							university={{
								id: school.id,
								name: school.name,
							}}
						/>
					))}
				</div>
			)}
		</div>
	);
}
