"use client";

import { useSearchParams } from "next/navigation";

export function SearchParamsWrapper() {
  const searchParams = useSearchParams();
  return <>{searchParams}</>;
}
