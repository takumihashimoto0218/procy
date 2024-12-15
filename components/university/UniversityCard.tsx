import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { School } from "@/types";

interface UniversityCardProps {
	university: School;
}

export function UniversityCard({ university }: UniversityCardProps) {
	return (
		<Link href={`/university/${university.id}`}>
			<Card className="hover:shadow-lg transition-shadow">
				<CardHeader>
					<CardTitle>{university.name}</CardTitle>
				</CardHeader>
			</Card>
		</Link>
	);
}
