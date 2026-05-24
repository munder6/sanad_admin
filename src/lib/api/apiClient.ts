import { getToken } from "@/lib/auth/authStorage";
import { normalizeDigitsDeep } from "@/lib/formatters/number";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost/sanad_api/public/api";

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  auth?: boolean;
};

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, auth = true }: RequestOptions = {},
): Promise<ApiEnvelope<T>> {
  const headers = new Headers({
    Accept: "application/json",
    "Content-Type": "application/json",
  });

  if (auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = normalizeDigitsDeep(await readJson<ApiEnvelope<T>>(response));

  if (!response.ok || payload.success === false) {
    const message = extractErrorMessage(payload) || defaultErrorMessage(response.status);
    const error = new ApiError(message, response.status, payload);

    if (response.status === 401 && onUnauthorized) {
      onUnauthorized();
    }

    throw error;
  }

  return payload;
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError("تعذر قراءة استجابة الخادم.", response.status);
  }
}

function defaultErrorMessage(status: number): string {
  if (status === 401) return "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.";
  if (status === 403) return "لا تملك صلاحية الوصول إلى هذه الصفحة.";
  if (status >= 500) return "حدث خطأ في الخادم. حاول مرة أخرى لاحقاً.";
  return "تعذر تنفيذ الطلب.";
}

function extractErrorMessage(payload: ApiEnvelope<unknown>): string | null {
  if (payload.message) return payload.message;

  const errors = getValidationErrors(payload);
  if (!errors) return null;

  const firstError = Object.values(errors).flat().find((message) => typeof message === "string");
  return firstError ?? null;
}

function getValidationErrors(payload: ApiEnvelope<unknown>): Record<string, string[]> | null {
  const rawPayload = payload as { errors?: unknown };
  if (!rawPayload.errors || typeof rawPayload.errors !== "object" || Array.isArray(rawPayload.errors)) {
    return null;
  }

  return rawPayload.errors as Record<string, string[]>;
}
