import { clearAuthStorage, getToken } from "@/lib/auth/authStorage";

export function hasAuthToken(): boolean {
  return Boolean(getToken());
}

export function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  clearAuthStorage();
  window.location.assign("/login");
}
