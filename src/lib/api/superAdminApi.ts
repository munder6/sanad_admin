import { apiRequest } from "@/lib/api/apiClient";

export type SuperAdminUser = {
  id: number;
  name: string;
  phone: string;
  is_super_admin: boolean;
};

type RawLoginData = {
  token?: string;
  access_token?: string;
  plainTextToken?: string;
  user?: Partial<SuperAdminUser>;
  admin?: Partial<SuperAdminUser>;
};

export type SuperAdminLoginResponse = {
  token: string;
  user: SuperAdminUser;
};

export type SuperAdminOverview = {
  shops_count: number;
  users_count: number;
  customers_count: number;
  ledger_entries_count: number;
  ai_commands_count: number;
};

export const emptyOverview: SuperAdminOverview = {
  shops_count: 0,
  users_count: 0,
  customers_count: 0,
  ledger_entries_count: 0,
  ai_commands_count: 0,
};

export const superAdminApi = {
  async login(phone: string, password: string): Promise<SuperAdminLoginResponse> {
    const response = await apiRequest<RawLoginData>("/super-admin/auth/login", {
      method: "POST",
      body: { phone, password },
      auth: false,
    });

    const data = response.data ?? {};
    const token = data.token ?? data.access_token ?? data.plainTextToken;
    const rawUser = data.user ?? data.admin;

    if (!token) {
      throw new Error("لم يرجع الخادم رمز دخول صالح.");
    }

    return {
      token,
      user: normalizeUser(rawUser),
    };
  },

  async me(): Promise<SuperAdminUser> {
    const response = await apiRequest<Partial<SuperAdminUser> | { user?: Partial<SuperAdminUser> }>(
      "/super-admin/auth/me",
    );
    const data = response.data ?? {};
    const user = hasUserPayload(data) ? data.user : data;
    return normalizeUser(user);
  },

  async logout(): Promise<void> {
    await apiRequest("/super-admin/auth/logout", { method: "POST" });
  },

  async overview(): Promise<SuperAdminOverview> {
    const response = await apiRequest<
      Partial<SuperAdminOverview> | { overview?: Partial<SuperAdminOverview>; counts?: Partial<SuperAdminOverview> }
    >("/super-admin/overview");

    const data = response.data ?? {};
    const overview = getOverviewPayload(data);

    return {
      shops_count: toNumber(overview?.shops_count),
      users_count: toNumber(overview?.users_count),
      customers_count: toNumber(overview?.customers_count),
      ledger_entries_count: toNumber(overview?.ledger_entries_count),
      ai_commands_count: toNumber(overview?.ai_commands_count),
    };
  },
};

function normalizeUser(rawUser?: Partial<SuperAdminUser>): SuperAdminUser {
  return {
    id: toNumber(rawUser?.id),
    name: String(rawUser?.name ?? "مشرف سَنَد"),
    phone: String(rawUser?.phone ?? ""),
    is_super_admin: Boolean(rawUser?.is_super_admin),
  };
}

function hasUserPayload(value: unknown): value is { user?: Partial<SuperAdminUser> } {
  return Boolean(value && typeof value === "object" && "user" in value);
}

function getOverviewPayload(
  value: Partial<SuperAdminOverview> | { overview?: Partial<SuperAdminOverview>; counts?: Partial<SuperAdminOverview> },
): Partial<SuperAdminOverview> {
  if ("overview" in value && value.overview) return value.overview;
  if ("counts" in value && value.counts) return value.counts;
  return value as Partial<SuperAdminOverview>;
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}
