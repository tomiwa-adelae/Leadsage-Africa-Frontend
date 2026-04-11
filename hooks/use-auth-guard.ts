"use client";

import { useEffect } from "react";
import { useAuth } from "@/store/useAuth";
import { useRouter } from "next/navigation";

/** Protects user-only routes (/dashboard, /tickets, etc.)
 *  Redirects to /login if not authenticated.
 *  Returns { user, isReady } — render nothing until isReady is true.
 */
export function useAuthGuard() {
  const { user, _hasHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) {
      router.replace("/login");
    }
  }, [user, _hasHydrated, router]);

  return {
    user,
    isReady: _hasHydrated && !!user,
  };
}
