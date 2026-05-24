import { clearAuthStorage, getToken } from "@/lib/auth/authStorage";
import { withBasePath } from "@/lib/constants/basePath";

export function hasAuthToken(): boolean {
  return Boolean(getToken());
}

export function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  clearAuthStorage();
  window.location.assign(withBasePath("/login"));
}
