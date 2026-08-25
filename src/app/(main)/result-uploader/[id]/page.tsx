'use client';

import { useParams } from "next/navigation";
import ResultUploaderDetail from "../_components/result-uploader-detail";

export default function ResultUploaderDetailPage() {
  const params = useParams();
  return <ResultUploaderDetail tournamentId={params.id as string} />;
}
