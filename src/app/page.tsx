"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/ui/LoadingState";
import { getToken } from "@/lib/auth/authStorage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getToken() ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div className="grid min-h-screen place-items-center bg-[var(--cream)]">
      <LoadingState label="جاري فتح لوحة سَنَد..." />
    </div>
  );
}
