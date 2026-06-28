import { apiRequest } from "@/lib/api/apiClient";
import { normalizeLocalPhoneDisplay } from "@/lib/formatters/number";

export type SuperAdminUser = {
  id: number;
  name: string;
  phone: string | null;
  email?: string | null;
  status?: string | null;
  is_active?: boolean;
  is_suspended?: boolean;
  suspended_at?: string | null;
  suspended_reason?: string | null;
  suspension_message?: string | null;
  role?: string | null;
  role_label?: string | null;
  is_super_admin: boolean;
  phone_verified_at?: string | null;
  email_verified_at?: string | null;
  current_shop?: SuperAdminUserCurrentShop | null;
  shops_count?: number;
  ledger_entries_count?: number;
  ai_commands_count?: number;
  last_activity_at?: string | null;
  sms_wallet?: SmsWalletSummary | null;
  created_at?: string | null;
  updated_at?: string | null;
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

export type SuperAdminProfile = SuperAdminUser;

export type UpdateMyProfileInput = {
  name?: string;
  phone?: string;
  email?: string | null;
};

export type ChangeMyPasswordInput = {
  current_password: string;
  password: string;
  password_confirmation: string;
};

export type SuperAdminOverview = {
  shops_count: number;
  users_count: number;
  customers_count: number;
  ledger_entries_count: number;
  ai_commands_count: number;
  kpis: SuperAdminOverviewKpis;
  debt_trend: SuperAdminDebtTrendPoint[];
  ai_distribution: SuperAdminAiDistributionItem[];
  recent_activity: SuperAdminRecentActivityItem[];
  platform_monitoring: SuperAdminPlatformMonitoringItem[];
};

export type SuperAdminOverviewRange = "30d" | "90d" | "1y";

export type SuperAdminOverviewKpis = {
  shops_count: number;
  users_count: number;
  customers_count: number;
  ledger_entries_count: number;
  ai_commands_count: number;
};

export type SuperAdminDebtTrendPoint = {
  date: string;
  debt_minor: number;
  payment_minor: number;
  debt_text: string | null;
  payment_text?: string | null;
};

export type SuperAdminAiDistributionItem = {
  status: string;
  label: string;
  count: number;
  percentage: number;
};

export type SuperAdminRecentActivityItem = {
  type: string;
  label: string;
  shop_name: string | null;
  customer_name: string | null;
  amount_minor: number | null;
  amount_text: string | null;
  source: string | null;
  source_label: string | null;
  status: string | null;
  status_label: string | null;
  description?: string | null;
  created_at: string | null;
  url?: string | null;
};

export type SuperAdminPlatformMonitoringItem = {
  type: string;
  label: string;
  description: string | null;
  severity: "info" | "warning" | "critical" | string;
  created_at: string | null;
  url?: string | null;
};

export type SuperAdminSearchResult = {
  type: string;
  label: string;
  subtitle: string | null;
  url: string;
};

export type SuperAdminSearchResponse = {
  query: string;
  results: SuperAdminSearchResult[];
};

export type SuperAdminUserCurrentShop = {
  id: number | null;
  name: string | null;
};

export type SuperAdminUsersParams = {
  search?: string;
  status?: string;
  role?: string;
  is_super_admin?: boolean;
  is_suspended?: boolean;
  verified?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

export type SuperAdminPaginationMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};

export type SuperAdminUserListResponse = {
  users: SuperAdminUser[];
  meta: SuperAdminPaginationMeta;
};

export type SuperAdminUserShop = {
  id: number;
  name: string | null;
  status: string | null;
  city: string | null;
  business_type: string | null;
  current_debt_minor: number;
  current_debt_text: string | null;
  customers_count: number;
};

export type SuperAdminUserRecentTransaction = {
  id: number;
  shop: SuperAdminUserCurrentShop | null;
  customer: {
    id?: number | null;
    uuid?: string | null;
    name?: string | null;
    phone?: string | null;
  } | null;
  entry_type: string | null;
  amount_minor: number | null;
  signed_amount_minor: number | null;
  amount_text: string | null;
  signed_amount_text: string | null;
  source: string | null;
  status: string | null;
  items_count: number;
  posted_at?: string | null;
  created_at: string | null;
};

export type SuperAdminUserRecentAiCommand = {
  id: number;
  shop: SuperAdminUserCurrentShop | null;
  raw_text: string | null;
  intent: string | null;
  status: string | null;
  customer_name: string | null;
  amount_minor: number | null;
  amount_text: string | null;
  items_count: number;
  created_at: string | null;
};

export type SuperAdminUserAuditEvent = {
  id?: number | null;
  event_type: string | null;
  severity: string | null;
  shop: SuperAdminUserCurrentShop | null;
  metadata_summary: Record<string, unknown> | null;
  created_at: string | null;
};

export type SuperAdminUserDetail = {
  user: SuperAdminUser & {
    current_shop_id?: number | null;
    updated_at?: string | null;
    suspended_by?: {
      id: number;
      name: string | null;
      phone: string | null;
    } | null;
  };
  summary: {
    shops_count: number;
    customers_count: number;
    ledger_entries_count: number;
    ai_commands_count: number;
    last_activity_at: string | null;
    tokens_count: number;
    audit_events_count: number;
  };
  shops: SuperAdminUserShop[];
  recent_transactions: SuperAdminUserRecentTransaction[];
  recent_ai_commands: SuperAdminUserRecentAiCommand[];
  sms: SuperAdminUserSmsProfile;
  audit_events: SuperAdminUserAuditEvent[];
};

export type SuperAdminUserResetShop = {
  id: number;
  name: string | null;
  status: string | null;
  owner_user_id: number | null;
};

export type SuperAdminUserResetPreview = {
  user: Partial<SuperAdminUser>;
  shops: SuperAdminUserResetShop[];
  counts: Record<string, number>;
  warnings: string[];
  safe_to_reset: boolean;
  block_message: string | null;
  block_status: number | null;
};

export type SuperAdminUserResetPayload = {
  admin_password: string;
  confirmation_text: "RESET";
  notes?: string | null;
};

export type SuperAdminUserResetResponse = {
  success: boolean;
  message: string;
  deleted_counts: Record<string, number>;
};

export type CreateSuperAdminUserInput = {
  name: string;
  phone: string;
  email?: string | null;
  password: string;
  password_confirmation: string;
  shop_name: string;
  notes?: string | null;
};

export type UpdateSuperAdminUserInput = {
  name?: string;
  phone?: string;
  email?: string | null;
  shop_name?: string;
  is_active?: boolean;
  notes?: string | null;
};

export type ChangeSuperAdminUserPasswordInput = {
  admin_password: string;
  password: string;
  password_confirmation: string;
};

export type PromoteUserToSuperAdminInput = {
  admin_password: string;
  notes?: string | null;
};

export type SuperAdminUserDeletePreview = {
  user: Partial<SuperAdminUser>;
  shops: SuperAdminUserResetShop[];
  counts: Record<string, number>;
  warnings: string[];
  safe_to_delete: boolean;
  block_message: string | null;
  block_status: number | null;
};

export type SuperAdminUserDeletePayload = {
  admin_password: string;
  confirmation_text: "DELETE";
  notes?: string | null;
};

export type SuperAdminUserDeleteResponse = {
  success: boolean;
  message: string;
  deleted_counts: Record<string, number>;
};

export type SuperAdminShopOwner = {
  id: number | null;
  name: string | null;
  phone: string | null;
  email?: string | null;
  status?: string | null;
  phone_verified_at?: string | null;
};

export type SuperAdminShop = {
  id: number;
  uuid: string | null;
  name: string | null;
  owner: SuperAdminShopOwner | null;
  city: string | null;
  business_type: string | null;
  currency: string | null;
  status: string | null;
  customers_count: number;
  ledger_entries_count: number;
  ai_commands_count: number;
  current_debt_minor: number;
  current_debt_text: string | null;
  last_activity_at: string | null;
  created_at: string | null;
};

export type SuperAdminShopsParams = {
  search?: string;
  status?: string;
  city?: string;
  sort?: string;
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

export type SuperAdminShopListResponse = {
  shops: SuperAdminShop[];
  meta: SuperAdminPaginationMeta;
};

export type SuperAdminRecentTransaction = {
  id: number;
  customer: {
    id?: number | null;
    uuid?: string | null;
    name?: string | null;
    phone?: string | null;
  } | null;
  entry_type: string | null;
  amount_minor: number | null;
  signed_amount_minor: number | null;
  amount_text: string | null;
  signed_amount_text: string | null;
  source: string | null;
  status: string | null;
  items_count: number;
  created_at: string | null;
  posted_at?: string | null;
};

export type SuperAdminRecentAiCommand = {
  id: number;
  raw_text: string | null;
  intent: string | null;
  status: string | null;
  customer_name: string | null;
  amount_minor: number | null;
  amount_text: string | null;
  items_count: number;
  created_at: string | null;
};

export type SuperAdminTopDebtCustomer = {
  id: number;
  uuid: string | null;
  name: string | null;
  phone: string | null;
  debt_minor: number;
  debt_text: string | null;
};

export type SuperAdminShopDetail = {
  shop: {
    id: number;
    uuid: string | null;
    name: string | null;
    city: string | null;
    business_type: string | null;
    currency: string | null;
    status: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
  owner: SuperAdminShopOwner | null;
  summary: {
    customers_count: number;
    ledger_entries_count: number;
    debt_entries_count: number;
    payment_entries_count: number;
    ai_commands_count: number;
    current_debt_minor: number;
    current_debt_text: string | null;
    last_activity_at: string | null;
  };
  recent_transactions: SuperAdminRecentTransaction[];
  recent_ai_commands: SuperAdminRecentAiCommand[];
  top_debt_customers: SuperAdminTopDebtCustomer[];
};

export type SuperAdminCustomerShop = {
  id: number | null;
  name: string | null;
  owner?: {
    id?: number | null;
    name?: string | null;
    phone?: string | null;
  } | null;
  city?: string | null;
  business_type?: string | null;
  status?: string | null;
};

export type SuperAdminCustomer = {
  id: number;
  uuid: string | null;
  name: string | null;
  phone: string | null;
  status: string | null;
  shop: SuperAdminCustomerShop | null;
  balance_minor: number;
  balance_text: string | null;
  balance_status: string | null;
  balance_status_label: string | null;
  ledger_entries_count: number;
  debt_entries_count: number;
  payment_entries_count: number;
  items_count: number;
  last_entry_at: string | null;
  last_entry_text: string | null;
  created_at: string | null;
};

export type SuperAdminCustomersParams = {
  search?: string;
  shop_id?: number | string;
  status?: string;
  balance_status?: string;
  has_debt?: boolean;
  sort?: string;
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

export type SuperAdminCustomerListResponse = {
  customers: SuperAdminCustomer[];
  meta: SuperAdminPaginationMeta;
};

export type SuperAdminCustomerAlias = {
  id?: number | null;
  alias: string | null;
};

export type SuperAdminCustomerLedgerItem = {
  id?: number | null;
  uuid?: string | null;
  name?: string | null;
  quantity_text?: string | null;
  unit_text?: string | null;
  amount_minor?: number | null;
  amount_text?: string | null;
  currency?: string | null;
  raw_text?: string | null;
  sort_order?: number | null;
};

export type SuperAdminCustomerLedgerEntry = {
  id: number;
  uuid: string | null;
  entry_type: string | null;
  amount_minor: number | null;
  signed_amount_minor: number | null;
  amount_text: string | null;
  signed_amount_text: string | null;
  source: string | null;
  status: string | null;
  raw_text: string | null;
  note: string | null;
  items_count: number;
  items: SuperAdminCustomerLedgerItem[];
  posted_at?: string | null;
  created_at: string | null;
};

export type SuperAdminCustomerAiCommand = {
  id: number;
  raw_text: string | null;
  intent: string | null;
  status: string | null;
  customer_name: string | null;
  amount_minor: number | null;
  amount_text: string | null;
  items_count: number;
  created_at: string | null;
};

export type SuperAdminCustomerDetail = {
  customer: {
    id: number;
    uuid: string | null;
    name: string | null;
    phone: string | null;
    notes: string | null;
    status: string | null;
    aliases: SuperAdminCustomerAlias[];
    created_at: string | null;
    updated_at: string | null;
  };
  shop: SuperAdminCustomerShop | null;
  balance: {
    currency?: string | null;
    balance_minor: number;
    balance_text: string | null;
    balance_status: string | null;
    balance_status_label: string | null;
    total_debt_minor: number;
    total_debt_text: string | null;
    total_payment_minor: number;
    total_payment_text: string | null;
  };
  summary: {
    ledger_entries_count: number;
    debt_entries_count: number;
    payment_entries_count: number;
    ai_commands_count: number;
    items_count: number;
    last_entry_at: string | null;
    last_activity_at: string | null;
    balance_minor: number;
    balance_text: string | null;
    balance_status: string | null;
    balance_status_label: string | null;
  };
  ledger_entries: SuperAdminCustomerLedgerEntry[];
  ai_commands: SuperAdminCustomerAiCommand[];
};

export type SuperAdminTransactionShop = {
  id: number | null;
  name: string | null;
  owner?: {
    id?: number | null;
    name?: string | null;
    phone?: string | null;
  } | null;
  city?: string | null;
  business_type?: string | null;
};

export type SuperAdminTransactionCustomer = {
  id: number | null;
  uuid?: string | null;
  name: string | null;
  phone: string | null;
  balance_minor?: number | null;
  balance_text?: string | null;
  balance_status?: string | null;
  balance_status_label?: string | null;
};

export type SuperAdminTransactionCreatedBy = {
  id: number | null;
  name: string | null;
  phone: string | null;
};

export type SuperAdminTransactionItem = {
  id?: number | null;
  uuid?: string | null;
  name?: string | null;
  quantity_text?: string | null;
  unit_text?: string | null;
  amount_minor?: number | null;
  amount_text?: string | null;
  currency?: string | null;
  raw_text?: string | null;
  sort_order?: number | null;
};

export type SuperAdminTransaction = {
  id: number;
  uuid: string | null;
  shop: SuperAdminTransactionShop | null;
  customer: SuperAdminTransactionCustomer | null;
  created_by: SuperAdminTransactionCreatedBy | null;
  entry_type: string | null;
  entry_type_label: string | null;
  direction: string | null;
  amount_minor: number | null;
  amount_text: string | null;
  signed_amount_minor: number | null;
  signed_amount_text: string | null;
  currency: string | null;
  source: string | null;
  source_label: string | null;
  status: string | null;
  status_label: string | null;
  raw_text: string | null;
  note: string | null;
  items_count: number;
  items: SuperAdminTransactionItem[];
  created_at: string | null;
  posted_at?: string | null;
  voided_at: string | null;
};

export type SuperAdminTransactionsParams = {
  search?: string;
  shop_id?: number | string;
  customer_id?: number | string;
  user_id?: number | string;
  entry_type?: "all" | "debt" | "payment" | string;
  status?: "posted" | "voided" | "all" | string;
  source?: "manual" | "ai" | "voice" | "system" | "all" | string;
  has_items?: boolean;
  amount_min?: number | string;
  amount_max?: number | string;
  date_from?: string;
  date_to?: string;
  sort?: string;
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

export type SuperAdminTransactionListResponse = {
  transactions: SuperAdminTransaction[];
  meta: SuperAdminPaginationMeta;
};

export type SuperAdminLinkedAiCommand = {
  id: number;
  raw_text: string | null;
  normalized_text: string | null;
  intent: string | null;
  status: string | null;
  customer_name: string | null;
  amount_minor: number | null;
  amount_text: string | null;
  items_count: number;
  created_at: string | null;
  parsed_json_summary: Record<string, unknown>;
};

export type SuperAdminTransactionAuditEvent = {
  id?: number | null;
  event_type: string | null;
  user: SuperAdminTransactionCreatedBy | null;
  metadata_summary: Record<string, unknown> | null;
  created_at: string | null;
};

export type SuperAdminTransactionDetail = {
  transaction: SuperAdminTransaction & {
    updated_at?: string | null;
    posted_at?: string | null;
    void_reason?: string | null;
    voided_by?: SuperAdminTransactionCreatedBy | null;
  };
  shop: SuperAdminTransactionShop | null;
  customer: SuperAdminTransactionCustomer | null;
  created_by: SuperAdminTransactionCreatedBy | null;
  items_count: number;
  items: SuperAdminTransactionItem[];
  linked_ai_command: SuperAdminLinkedAiCommand | null;
  audit_events: SuperAdminTransactionAuditEvent[];
};

export type SuperAdminAiCommandShop = {
  id: number | null;
  name: string | null;
  owner?: {
    id?: number | null;
    name?: string | null;
    phone?: string | null;
  } | null;
  city?: string | null;
  business_type?: string | null;
};

export type SuperAdminAiCommandUser = {
  id: number | null;
  name: string | null;
  phone: string | null;
  status?: string | null;
};

export type SuperAdminAiCommandCustomer = {
  id: number | null;
  uuid?: string | null;
  name: string | null;
  phone: string | null;
  balance_minor?: number | null;
  balance_text?: string | null;
};

export type SuperAdminAiLinkedLedgerEntry = {
  id: number;
  uuid: string | null;
  entry_type?: string | null;
  entry_type_label?: string | null;
  amount_minor?: number | null;
  amount_text?: string | null;
  signed_amount_minor?: number | null;
  signed_amount_text?: string | null;
  currency?: string | null;
  status: string | null;
  source?: string | null;
  items_count?: number;
  created_at?: string | null;
};

export type SuperAdminAiCommandItem = {
  name?: string | null;
  quantity_text?: string | null;
  unit_text?: string | null;
  amount_minor?: number | null;
  amount_text?: string | null;
  currency?: string | null;
  raw_text?: string | null;
};

export type SuperAdminAiCommandAttempt = {
  id: number;
  uuid?: string | null;
  provider?: string | null;
  model?: string | null;
  prompt_version?: string | null;
  status?: string | null;
  latency_ms?: number | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  total_tokens?: number | null;
  error_message?: string | null;
  request_summary?: Record<string, unknown> | null;
  response_summary?: Record<string, unknown> | null;
  parsed_json?: Record<string, unknown> | unknown[] | null;
  created_at?: string | null;
};

export type SuperAdminAiCommandAuditEvent = {
  id?: number | null;
  event_type: string | null;
  user: SuperAdminAiCommandUser | null;
  metadata_summary: Record<string, unknown> | null;
  created_at: string | null;
};

export type SuperAdminAiCommandCustomerMatch = {
  id?: number | null;
  name?: string | null;
  phone?: string | null;
  score?: number | null;
  match_type?: string | null;
  balance_text?: string | null;
};

export type SuperAdminAiCommand = {
  id: number;
  uuid: string | null;
  shop: SuperAdminAiCommandShop | null;
  user: SuperAdminAiCommandUser | null;
  customer: SuperAdminAiCommandCustomer | null;
  raw_text: string | null;
  normalized_text: string | null;
  source: string | null;
  source_label: string | null;
  intent: string | null;
  intent_label: string | null;
  status: string | null;
  status_label: string | null;
  customer_name: string | null;
  amount_minor: number | null;
  amount_text: string | null;
  currency: string | null;
  items_count: number;
  linked_ledger_entry: SuperAdminAiLinkedLedgerEntry | null;
  model: string | null;
  latency_ms: number | null;
  attempts_count: number;
  created_at: string | null;
};

export type SuperAdminAiCommandsParams = {
  search?: string;
  shop_id?: number | string;
  user_id?: number | string;
  customer_id?: number | string;
  status?: string;
  intent?: string;
  source?: string;
  has_items?: boolean;
  has_ledger_entry?: boolean;
  failed_only?: boolean;
  unknown_only?: boolean;
  date_from?: string;
  date_to?: string;
  sort?: string;
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

export type SuperAdminAiCommandListResponse = {
  ai_commands: SuperAdminAiCommand[];
  meta: SuperAdminPaginationMeta;
};

export type SuperAdminAiCommandDetail = {
  command: SuperAdminAiCommand & {
    confidence?: number | null;
    updated_at?: string | null;
    confirmed_at?: string | null;
    cancelled_at?: string | null;
    cancellation_reason?: string | null;
  };
  shop: SuperAdminAiCommandShop | null;
  user: SuperAdminAiCommandUser | null;
  customer: SuperAdminAiCommandCustomer | null;
  items_count: number;
  items: SuperAdminAiCommandItem[];
  parsed_json: Record<string, unknown> | unknown[] | null;
  customer_matches: SuperAdminAiCommandCustomerMatch[];
  attempts: SuperAdminAiCommandAttempt[];
  linked_ledger_entry: SuperAdminAiLinkedLedgerEntry | null;
  audit_events: SuperAdminAiCommandAuditEvent[];
};

export type DailyJournalRange = "30d" | "90d" | "1y";

export type SuperAdminDailyJournalMoneyTotals = {
  sales_minor: number;
  sales_text: string | null;
  purchases_minor: number;
  purchases_text: string | null;
  expenses_minor: number;
  expenses_text: string | null;
  remaining_debts_minor: number;
  remaining_debts_text: string | null;
  profit_minor: number;
  profit_text: string | null;
};

export type SuperAdminDailyJournalEntity = {
  id: number | null;
  name: string | null;
  phone?: string | null;
  status?: string | null;
};

export type SuperAdminDailyJournalEntry = {
  id: number;
  uuid: string | null;
  shop: SuperAdminDailyJournalEntity | null;
  user: SuperAdminDailyJournalEntity | null;
  entry_type: string | null;
  entry_type_label: string | null;
  entry_date: string | null;
  amount_minor: number;
  amount_text: string | null;
  currency: string | null;
  source: string | null;
  source_label: string | null;
  status: string | null;
  status_label: string | null;
  raw_text: string | null;
  note: string | null;
  created_at: string | null;
  updated_at?: string | null;
  voided_at?: string | null;
};

export type SuperAdminDailyJournalAiDraft = {
  id: number;
  uuid: string | null;
  shop: SuperAdminDailyJournalEntity | null;
  user: SuperAdminDailyJournalEntity | null;
  raw_text: string | null;
  source: string | null;
  intent: string | null;
  intent_label: string | null;
  status: string | null;
  status_label: string | null;
  entry_type: string | null;
  entry_type_label: string | null;
  amount_minor: number | null;
  amount_text: string | null;
  currency: string | null;
  entry_date: string | null;
  confirmed_entry: { id?: number | null; uuid?: string | null; status?: string | null } | null;
  created_at: string | null;
  confirmed_at?: string | null;
  cancelled_at?: string | null;
};

export type SuperAdminDailyJournalDistributionItem = {
  value: string;
  label: string;
  count: number;
  percentage: number;
};

export type SuperAdminDailyJournalOverview = {
  kpis: {
    entries_count: number;
    active_shops_count: number;
    ai_drafts_count: number;
    posted_entries_count: number;
    voided_entries_count: number;
  };
  totals: SuperAdminDailyJournalMoneyTotals;
  trend: (SuperAdminDailyJournalMoneyTotals & { date: string })[];
  entry_type_distribution: SuperAdminDailyJournalDistributionItem[];
  source_distribution: SuperAdminDailyJournalDistributionItem[];
  recent_entries: SuperAdminDailyJournalEntry[];
  recent_ai_drafts: SuperAdminDailyJournalAiDraft[];
  monitoring: {
    type: string;
    label: string;
    description: string | null;
    severity: string;
  }[];
};

export type SuperAdminDailyJournalEntriesParams = {
  search?: string;
  shop_id?: number | string;
  user_id?: number | string;
  entry_type?: string;
  source?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  sort?: string;
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

export type SuperAdminDailyJournalEntryListResponse = {
  entries: SuperAdminDailyJournalEntry[];
  meta: SuperAdminPaginationMeta;
};

export type SuperAdminDailyJournalEntryDetail = {
  entry: SuperAdminDailyJournalEntry & {
    client_request_id?: string | null;
    void_reason?: string | null;
  };
  shop: (SuperAdminDailyJournalEntity & {
    owner?: SuperAdminDailyJournalEntity | null;
    city?: string | null;
    business_type?: string | null;
  }) | null;
  user: SuperAdminDailyJournalEntity | null;
  related_ai_draft: Pick<SuperAdminDailyJournalAiDraft, "id" | "uuid" | "raw_text" | "intent" | "intent_label" | "status" | "status_label" | "created_at"> | null;
};

export type SuperAdminDailyJournalReportsParams = {
  period?: "today" | "week" | "month" | string;
  date?: string;
  shop_id?: number | string;
  date_from?: string;
  date_to?: string;
};

export type SuperAdminDailyJournalReport = {
  period: string;
  date_from: string | null;
  date_to: string | null;
  totals: SuperAdminDailyJournalMoneyTotals;
  recorded_days_count: number;
  missing_days_count: number;
  shops_count: number;
  formula_note: string | null;
  daily_breakdown: (SuperAdminDailyJournalMoneyTotals & {
    date: string;
    entries_count: number;
    has?: Record<string, boolean>;
    is_complete_for_profit?: boolean;
  })[];
  per_shop_summary: {
    shop: SuperAdminDailyJournalEntity | null;
    entries_count: number;
    recorded_days_count: number;
    missing_days_count: number;
    totals: SuperAdminDailyJournalMoneyTotals;
  }[];
};

export type SuperAdminDailyJournalAiDraftsParams = {
  search?: string;
  shop_id?: number | string;
  user_id?: number | string;
  intent?: string;
  status?: string;
  entry_type?: string;
  date_from?: string;
  date_to?: string;
  sort?: string;
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

export type SuperAdminDailyJournalAiDraftListResponse = {
  ai_drafts: SuperAdminDailyJournalAiDraft[];
  meta: SuperAdminPaginationMeta;
};

export type SuperAdminDailyJournalAiDraftDetail = {
  draft: SuperAdminDailyJournalAiDraft & {
    period_type?: string | null;
    period_type_label?: string | null;
    period_start?: string | null;
    period_end?: string | null;
    answer_type?: string | null;
    assistant_reply?: string | null;
    updated_at?: string | null;
  };
  shop: SuperAdminDailyJournalEntryDetail["shop"];
  user: SuperAdminDailyJournalEntity | null;
  confirmed_entry: SuperAdminDailyJournalEntry | null;
  parsed_json: Record<string, unknown> | unknown[] | null;
  answer_json: Record<string, unknown> | unknown[] | null;
};

export type SuperAdminAuditEventUser = {
  id: number | null;
  name: string | null;
  phone: string | null;
};

export type SuperAdminAuditEventShop = {
  id: number | null;
  name: string | null;
};

export type SuperAdminAuditEvent = {
  id: number;
  event_type: string | null;
  event_label: string | null;
  severity: "info" | "warning" | "critical" | string | null;
  severity_label: string | null;
  user: SuperAdminAuditEventUser | null;
  shop: SuperAdminAuditEventShop | null;
  subject_type: string | null;
  subject_id: number | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata_summary: string | null;
  created_at: string | null;
};

export type SuperAdminAuditEventsParams = {
  search?: string;
  event_type?: string;
  severity?: "info" | "warning" | "critical" | string;
  user_id?: number | string;
  shop_id?: number | string;
  subject_type?: string;
  subject_id?: number | string;
  date_from?: string;
  date_to?: string;
  sort?: string;
  direction?: "asc" | "desc";
  per_page?: number;
  page?: number;
};

export type SuperAdminAuditEventListResponse = {
  audit_events: SuperAdminAuditEvent[];
  meta: SuperAdminPaginationMeta;
};

export type SuperAdminAuditEventDetail = SuperAdminAuditEvent & {
  metadata: Record<string, unknown> | unknown[] | null;
};

export type SuperAdminSystemHealth = {
  app: {
    name: string | null;
    environment: string | null;
    debug: boolean;
    laravel_version: string | null;
    php_version: string | null;
    timezone: string | null;
    url: string | null;
  };
  database: {
    status: string | null;
    driver: string | null;
    database: string | null;
    latency_ms: number | null;
  };
  cache: {
    default_store: string | null;
    status: string | null;
  };
  queue: {
    connection: string | null;
    status: string | null;
  };
  gemini: {
    configured: boolean;
    model: string | null;
    base_url: string | null;
    timeout: number | null;
  };
  storage: {
    logs_size_bytes: number;
    storage_writable: boolean;
    cache_writable: boolean;
  };
  counts: {
    shops: number;
    users: number;
    customers: number;
    ledger_entries: number;
    ai_commands: number;
    audit_events: number;
  };
  recent_errors: string[];
};

export type SuperAdminFeatureFlagKey = "public_registration_enabled";

export type SuperAdminFeatureFlag = {
  key: SuperAdminFeatureFlagKey;
  value: boolean;
  description: string | null;
  updated_at: string | null;
};

type RawFeatureFlag = Partial<Omit<SuperAdminFeatureFlag, "key">> & {
  key?: string | null;
};

export type SuperAdminPlatformSettingKey =
  | "account_suspension_title_ar"
  | "account_suspension_message_ar"
  | "account_suspension_support_url"
  | "maintenance_enabled"
  | "maintenance_title_ar"
  | "maintenance_message_ar"
  | "maintenance_support_url";

export type SuperAdminPlatformSetting = {
  key: SuperAdminPlatformSettingKey;
  value: string | boolean;
  description: string | null;
  updated_at: string | null;
};

export type SuperAdminAppStatus = {
  server: {
    healthy: boolean;
    maintenance_enabled: boolean;
    maintenance_title_ar: string;
    maintenance_message_ar: string;
    maintenance_support_url: string;
  };
  support: {
    account_suspension_title_ar: string;
    account_suspension_message_ar: string;
    account_suspension_url: string;
  };
};

export type SuperAdminPlatformSettingsResponse = {
  settings: SuperAdminPlatformSetting[];
  status: SuperAdminAppStatus;
};

export type UpdatePlatformSettingsInput = {
  account_suspension_title_ar?: string;
  account_suspension_message_ar?: string;
  account_suspension_support_url?: string;
  maintenance_enabled: boolean;
  maintenance_title_ar?: string;
  maintenance_message_ar?: string;
  maintenance_support_url?: string;
};

export type SmsProviderAuthMode = "api_token" | "user_password";
export type SmsProviderMessageType = "auto" | "0" | "1" | "2";
export type SmsProviderRequestMethod = "GET" | "POST";

export type SuperAdminSmsProviderSettings = {
  enabled: boolean;
  provider: string;
  auth_mode: SmsProviderAuthMode;
  user_name: string | null;
  user_pass_masked: string | null;
  api_token_masked: string | null;
  sender: string | null;
  send_url: string;
  balance_url: string;
  default_message_type: SmsProviderMessageType;
  request_method: SmsProviderRequestMethod;
  msg_id: boolean;
  timeout_seconds: number;
  last_balance: string | null;
  last_balance_checked_at: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type UpdateSmsProviderSettingsInput = {
  enabled: boolean;
  auth_mode: SmsProviderAuthMode;
  api_token?: string | null;
  user_name?: string | null;
  user_pass?: string | null;
  sender?: string | null;
  send_url: string;
  balance_url: string;
  default_message_type: SmsProviderMessageType;
  request_method: SmsProviderRequestMethod;
  msg_id: boolean;
  timeout_seconds: number;
};

export type SmsProviderBalanceResult = {
  success: boolean;
  balance: string | null;
  code: string | null;
  message: string;
  raw_response?: string | null;
};

export type SmsProviderTestSendInput = {
  mobile: string;
  text: string;
  type?: SmsProviderMessageType;
};

export type SmsProviderTestSendResult = {
  success: boolean;
  code: string | null;
  message: string;
  provider_message_id: string | null;
  balance_after?: string | null;
  raw_response?: string | null;
  warning?: string | null;
};

export type SmsProviderMessageLog = {
  id: number;
  provider: string;
  sent_by_super_admin_id: number | null;
  sent_by_name: string | null;
  shop: SmsEntity | null;
  user: SmsEntity | null;
  wallet_id: number | null;
  wallet_transaction_id: number | null;
  sms_source: string | null;
  segments_count: number;
  balance_before: number | null;
  mobile: string;
  mobile_normalized: string | null;
  sender: string | null;
  message_text: string;
  message_type: string | null;
  provider_code: string | null;
  provider_message_id: string | null;
  provider_raw_response: string | null;
  success: boolean;
  error_message: string | null;
  balance_after: string | number | null;
  sent_at: string | null;
  created_at: string | null;
  updated_at?: string | null;
};

export type SmsProviderMessageLogsParams = {
  page?: number;
  per_page?: number;
  success?: boolean;
  user_id?: number | string;
  shop_id?: number | string;
  wallet_id?: number | string;
  sms_source?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
};

export type SmsProviderMessageLogListResponse = {
  logs: SmsProviderMessageLog[];
  meta: SuperAdminPaginationMeta;
};

export type SmsEntity = {
  id: number | null;
  name: string | null;
  phone?: string | null;
  email?: string | null;
  status?: string | null;
};

export type SmsWalletSummary = {
  id: number | null;
  shop_id: number | null;
  user_id: number | null;
  monthly_quota: number;
  monthly_used: number;
  monthly_remaining: number;
  topup_balance: number;
  reserved_balance: number;
  available_balance: number;
  monthly_period: string | null;
  sms_enabled: boolean;
  global_sms_enabled?: boolean;
  effective_sms_enabled?: boolean;
  disabled_message?: string | null;
};

export type SuperAdminSmsOverview = {
  total_wallets: number;
  enabled_wallets: number;
  disabled_wallets: number;
  total_monthly_quota: number;
  total_monthly_used: number;
  total_topup_balance: number;
  total_available_balance: number;
  pending_recharge_requests: number;
  sms_sent_this_month: number;
  monthly_period: string | null;
  global_sms_enabled: boolean;
  default_monthly_quota: number;
};

export type SuperAdminSmsWallet = SmsWalletSummary & {
  id: number;
  shop: SmsEntity | null;
  user: SmsEntity | null;
  last_sent_at: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type SuperAdminSmsWalletListResponse = {
  wallets: SuperAdminSmsWallet[];
  meta: SuperAdminPaginationMeta;
};

export type SuperAdminSmsWalletsParams = {
  page?: number;
  per_page?: number;
  search?: string;
  sms_enabled?: boolean;
  low_balance?: boolean;
};

export type SmsWalletTransaction = {
  id: number;
  wallet_id: number;
  shop: SmsEntity | null;
  user: SmsEntity | null;
  type: string;
  quantity: number;
  balance_before: number | null;
  balance_after: number | null;
  monthly_quota_before: number | null;
  monthly_quota_after: number | null;
  performed_by_user: SmsEntity | null;
  performed_by_admin: SmsEntity | null;
  related_request_id: number | null;
  related_message_log_id: number | null;
  notes: string | null;
  metadata: Record<string, unknown> | unknown[] | null;
  created_at: string | null;
  updated_at?: string | null;
};

export type SmsWalletTransactionListResponse = {
  transactions: SmsWalletTransaction[];
  meta: SuperAdminPaginationMeta;
};

export type SmsWalletTransactionsParams = {
  page?: number;
  per_page?: number;
  wallet_id?: number | string;
  user_id?: number | string;
  shop_id?: number | string;
  type?: string;
  date_from?: string;
  date_to?: string;
};

export type SmsRechargeRequest = {
  id: number;
  shop: SmsEntity | null;
  user: SmsEntity | null;
  requested_quantity: number;
  notes: string | null;
  status: string;
  approved_quantity: number | null;
  admin_notes: string | null;
  reviewed_by_admin: SmsEntity | null;
  reviewed_at: string | null;
  created_at: string | null;
  updated_at?: string | null;
};

export type SmsRechargeRequestListResponse = {
  requests: SmsRechargeRequest[];
  meta: SuperAdminPaginationMeta;
};

export type SmsRechargeRequestsParams = {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  user_id?: number | string;
  shop_id?: number | string;
  date_from?: string;
  date_to?: string;
};

export type SuperAdminSmsWalletDetail = {
  wallet: SuperAdminSmsWallet;
  transactions: SmsWalletTransaction[];
  message_logs: SmsProviderMessageLog[];
  recharge_requests: SmsRechargeRequest[];
};

export type SuperAdminUserSmsProfile = {
  summary: SmsWalletSummary | null;
  wallets: {
    id: number;
    shop: SmsEntity | null;
    user: SmsEntity | null;
    summary: SmsWalletSummary;
  }[];
  message_logs: SmsProviderMessageLog[];
  transactions: SmsWalletTransaction[];
  recharge_requests: SmsRechargeRequest[];
};

type RawPlatformSetting = Partial<Omit<SuperAdminPlatformSetting, "key">> & {
  key?: string | null;
};

type RawPlatformSettingsResponse = {
  settings?: RawPlatformSetting[];
  status?: Partial<SuperAdminAppStatus>;
};

type RawSmsProviderSettings = Partial<SuperAdminSmsProviderSettings>;
type RawSmsProviderBalanceResult = Partial<SmsProviderBalanceResult>;
type RawSmsProviderTestSendResult = Partial<SmsProviderTestSendResult>;
type RawSmsProviderMessageLog = Partial<SmsProviderMessageLog>;
type RawSmsEntity = Partial<SmsEntity>;
type RawSmsWalletSummary = Partial<SmsWalletSummary>;
type RawSuperAdminSmsOverview = Partial<SuperAdminSmsOverview>;
type RawSuperAdminSmsWallet = Partial<SuperAdminSmsWallet>;
type RawSmsWalletTransaction = Partial<SmsWalletTransaction>;
type RawSmsRechargeRequest = Partial<SmsRechargeRequest>;
type RawSuperAdminSmsWalletDetail = Partial<SuperAdminSmsWalletDetail>;

export const emptyOverview: SuperAdminOverview = {
  shops_count: 0,
  users_count: 0,
  customers_count: 0,
  ledger_entries_count: 0,
  ai_commands_count: 0,
  kpis: {
    shops_count: 0,
    users_count: 0,
    customers_count: 0,
    ledger_entries_count: 0,
    ai_commands_count: 0,
  },
  debt_trend: [],
  ai_distribution: [],
  recent_activity: [],
  platform_monitoring: [],
};

export const emptyDailyJournalOverview: SuperAdminDailyJournalOverview = {
  kpis: {
    entries_count: 0,
    active_shops_count: 0,
    ai_drafts_count: 0,
    posted_entries_count: 0,
    voided_entries_count: 0,
  },
  totals: normalizeDailyJournalTotals({}),
  trend: [],
  entry_type_distribution: [],
  source_distribution: [],
  recent_entries: [],
  recent_ai_drafts: [],
  monitoring: [],
};

export type SuperAdminWallet = {
  id: number;
  name_ar: string;
  is_active: boolean;
  sort_order: number;
  entries_count: number;
  created_at?: string | null;
  updated_at?: string | null;
};

export type SuperAdminWalletsParams = {
  search?: string;
  is_active?: number;
  page?: number;
  per_page?: number;
};

export type SuperAdminWalletListResponse = {
  wallets: SuperAdminWallet[];
  meta: SuperAdminPaginationMeta;
};

export type CreateSuperAdminWalletInput = {
  name_ar: string;
  sort_order?: number;
};

export type UpdateSuperAdminWalletInput = {
  name_ar?: string;
  is_active?: boolean;
  sort_order?: number;
};

export type SuperAdminShopWallet = {
  id: number;
  name_ar: string;
  is_active: boolean;
  is_frozen_for_shop: boolean;
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

  async getMyProfile(): Promise<SuperAdminProfile> {
    const response = await apiRequest<Partial<SuperAdminProfile>>("/super-admin/profile");
    return normalizeUser(response.data);
  },

  async updateMyProfile(payload: UpdateMyProfileInput): Promise<SuperAdminProfile> {
    const response = await apiRequest<Partial<SuperAdminProfile>>("/super-admin/profile", {
      method: "PATCH",
      body: {
        name: payload.name?.trim(),
        phone: payload.phone?.trim(),
        email: payload.email?.trim() || null,
      },
    });

    return normalizeUser(response.data);
  },

  async changeMyPassword(payload: ChangeMyPasswordInput): Promise<{ success: boolean; message: string }> {
    const response = await apiRequest<{ success?: boolean }>("/super-admin/profile/password", {
      method: "PATCH",
      body: {
        current_password: payload.current_password,
        password: payload.password,
        password_confirmation: payload.password_confirmation,
      },
    });

    return {
      success: Boolean(response.data?.success ?? response.success),
      message: response.message ?? "تم تغيير كلمة المرور بنجاح.",
    };
  },

  async logout(): Promise<void> {
    await apiRequest("/super-admin/auth/logout", { method: "POST" });
  },

  async overview(range: SuperAdminOverviewRange = "30d"): Promise<SuperAdminOverview> {
    const query = buildQuery({ range });
    const response = await apiRequest<
      Partial<SuperAdminOverview> | { overview?: Partial<SuperAdminOverview>; counts?: Partial<SuperAdminOverview> }
    >(`/super-admin/overview${query}`);

    const data = response.data ?? {};
    const overview = getOverviewPayload(data);
    const kpis = normalizeOverviewKpis(overview?.kpis ?? overview);

    return {
      ...kpis,
      kpis,
      debt_trend: Array.isArray(overview?.debt_trend) ? overview.debt_trend.map(normalizeDebtTrendPoint) : [],
      ai_distribution: Array.isArray(overview?.ai_distribution) ? overview.ai_distribution.map(normalizeAiDistributionItem) : [],
      recent_activity: Array.isArray(overview?.recent_activity) ? overview.recent_activity.map(normalizeRecentActivityItem) : [],
      platform_monitoring: Array.isArray(overview?.platform_monitoring) ? overview.platform_monitoring.map(normalizePlatformMonitoringItem) : [],
    };
  },

  async search(queryText: string): Promise<SuperAdminSearchResponse> {
    const query = buildQuery({ q: queryText });
    const response = await apiRequest<Partial<SuperAdminSearchResponse>>(`/super-admin/search${query}`);
    const data = response.data ?? {};

    return {
      query: String(data.query ?? queryText),
      results: Array.isArray(data.results) ? data.results.map(normalizeSearchResult) : [],
    };
  },

  async getShops(params: SuperAdminShopsParams = {}): Promise<SuperAdminShopListResponse> {
    const query = buildQuery(params);
    const response = await apiRequest<SuperAdminShop[]>(`/super-admin/shops${query}`);

    return {
      shops: Array.isArray(response.data) ? response.data.map(normalizeShop) : [],
      meta: normalizePaginationMeta(response.meta),
    };
  },

  async getShop(id: number | string): Promise<SuperAdminShopDetail> {
    const response = await apiRequest<Partial<SuperAdminShopDetail>>(`/super-admin/shops/${id}`);
    return normalizeShopDetail(response.data);
  },

  async getWallets(params: SuperAdminWalletsParams = {}): Promise<SuperAdminWalletListResponse> {
    const query = buildQuery(params);
    const response = await apiRequest<SuperAdminWallet[]>(`/super-admin/wallets${query}`);

    return {
      wallets: Array.isArray(response.data) ? response.data.map(normalizeWallet) : [],
      meta: normalizePaginationMeta(response.meta),
    };
  },

  async createWallet(payload: CreateSuperAdminWalletInput): Promise<SuperAdminWallet> {
    const response = await apiRequest<Partial<SuperAdminWallet>>("/super-admin/wallets", {
      method: "POST",
      body: {
        name_ar: payload.name_ar.trim(),
        sort_order: payload.sort_order ?? 0,
      },
    });

    return normalizeWallet(response.data);
  },

  async updateWallet(id: number | string, payload: UpdateSuperAdminWalletInput): Promise<SuperAdminWallet> {
    const body: Record<string, unknown> = {};
    if (payload.name_ar !== undefined) body.name_ar = payload.name_ar.trim();
    if (payload.is_active !== undefined) body.is_active = payload.is_active;
    if (payload.sort_order !== undefined) body.sort_order = payload.sort_order;

    const response = await apiRequest<Partial<SuperAdminWallet>>(`/super-admin/wallets/${id}`, {
      method: "PATCH",
      body,
    });

    return normalizeWallet(response.data);
  },

  async getShopWallets(shopId: number | string): Promise<SuperAdminShopWallet[]> {
    const response = await apiRequest<SuperAdminShopWallet[]>(`/super-admin/shops/${shopId}/wallets`);
    return Array.isArray(response.data) ? response.data.map(normalizeShopWallet) : [];
  },

  async setShopWalletFreeze(
    shopId: number | string,
    walletId: number | string,
    isFrozen: boolean,
  ): Promise<SuperAdminShopWallet> {
    const response = await apiRequest<Partial<SuperAdminShopWallet>>(
      `/super-admin/shops/${shopId}/wallets/${walletId}`,
      {
        method: "PATCH",
        body: { is_frozen: isFrozen },
      },
    );

    return normalizeShopWallet(response.data);
  },

  async getUsers(params: SuperAdminUsersParams = {}): Promise<SuperAdminUserListResponse> {
    const query = buildQuery(params);
    const response = await apiRequest<SuperAdminUser[]>(`/super-admin/users${query}`);

    return {
      users: Array.isArray(response.data) ? response.data.map(normalizeUser) : [],
      meta: normalizePaginationMeta(response.meta),
    };
  },

  async getUser(id: number | string): Promise<SuperAdminUserDetail> {
    const response = await apiRequest<Partial<SuperAdminUserDetail>>(`/super-admin/users/${id}`);
    return normalizeUserDetail(response.data);
  },

  async createUser(payload: CreateSuperAdminUserInput): Promise<SuperAdminUserDetail> {
    const response = await apiRequest<Partial<SuperAdminUserDetail>>("/super-admin/users", {
      method: "POST",
      body: {
        name: payload.name.trim(),
        phone: payload.phone.trim(),
        email: payload.email?.trim() || null,
        password: payload.password,
        password_confirmation: payload.password_confirmation,
        shop_name: payload.shop_name.trim(),
        notes: payload.notes?.trim() || null,
      },
    });

    return normalizeUserDetail(response.data);
  },

  async updateUser(id: number | string, payload: UpdateSuperAdminUserInput): Promise<SuperAdminUserDetail> {
    const response = await apiRequest<Partial<SuperAdminUserDetail>>(`/super-admin/users/${id}`, {
      method: "PATCH",
      body: {
        name: payload.name?.trim(),
        phone: payload.phone?.trim(),
        email: payload.email?.trim() || null,
        shop_name: payload.shop_name?.trim(),
        is_active: payload.is_active,
        notes: payload.notes?.trim() || null,
      },
    });

    return normalizeUserDetail(response.data);
  },

  async changeUserPassword(
    id: number | string,
    payload: ChangeSuperAdminUserPasswordInput,
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiRequest<{ success?: boolean }>(`/super-admin/users/${id}/password`, {
      method: "PATCH",
      body: {
        admin_password: payload.admin_password,
        password: payload.password,
        password_confirmation: payload.password_confirmation,
      },
    });

    return {
      success: Boolean(response.data?.success ?? response.success),
      message: response.message ?? "تم تحديث كلمة مرور المستخدم بنجاح.",
    };
  },

  async promoteUserToSuperAdmin(
    id: number | string,
    payload: PromoteUserToSuperAdminInput,
  ): Promise<SuperAdminUserDetail> {
    const response = await apiRequest<Partial<SuperAdminUserDetail>>(`/super-admin/users/${id}/promote-to-super-admin`, {
      method: "POST",
      body: {
        admin_password: payload.admin_password,
        notes: payload.notes?.trim() || null,
      },
    });

    return normalizeUserDetail(response.data);
  },

  async getUserResetPreview(id: number | string): Promise<SuperAdminUserResetPreview> {
    const response = await apiRequest<Partial<SuperAdminUserResetPreview>>(`/super-admin/users/${id}/reset-preview`);
    return normalizeUserResetPreview(response.data);
  },

  async resetUserData(
    id: number | string,
    payload: SuperAdminUserResetPayload,
  ): Promise<SuperAdminUserResetResponse> {
    const response = await apiRequest<Partial<SuperAdminUserResetResponse>>(`/super-admin/users/${id}/reset-data`, {
      method: "POST",
      body: {
        admin_password: payload.admin_password,
        confirmation_text: payload.confirmation_text,
        notes: payload.notes?.trim() || null,
      },
    });

    return {
      success: Boolean(response.data?.success ?? response.success),
      message: response.data?.message ?? response.message ?? "تم تصفير بيانات الحساب بنجاح.",
      deleted_counts: normalizeResetCounts(response.data?.deleted_counts),
    };
  },

  async suspendUser(
    id: number | string,
    input: { reason?: string; suspension_message?: string } = {},
  ): Promise<SuperAdminUserDetail> {
    const response = await apiRequest<Partial<SuperAdminUserDetail>>(`/super-admin/users/${id}/suspend`, {
      method: "POST",
      body: {
        reason: input.reason?.trim() || null,
        suspension_message: input.suspension_message?.trim() || null,
      },
    });

    return normalizeUserDetail(response.data);
  },

  async unsuspendUser(id: number | string): Promise<SuperAdminUserDetail> {
    const response = await apiRequest<Partial<SuperAdminUserDetail>>(`/super-admin/users/${id}/unsuspend`, {
      method: "POST",
    });

    return normalizeUserDetail(response.data);
  },

  async getUserDeletePreview(id: number | string): Promise<SuperAdminUserDeletePreview> {
    const response = await apiRequest<Partial<SuperAdminUserDeletePreview>>(`/super-admin/users/${id}/delete-preview`);
    return normalizeUserDeletePreview(response.data);
  },

  async deleteUser(
    id: number | string,
    payload: SuperAdminUserDeletePayload,
  ): Promise<SuperAdminUserDeleteResponse> {
    const response = await apiRequest<Partial<SuperAdminUserDeleteResponse>>(`/super-admin/users/${id}`, {
      method: "DELETE",
      body: {
        admin_password: payload.admin_password,
        confirmation_text: payload.confirmation_text,
        notes: payload.notes?.trim() || null,
      },
    });

    return {
      success: Boolean(response.data?.success ?? response.success),
      message: response.data?.message ?? response.message ?? "تم حذف الحساب نهائيًا بنجاح.",
      deleted_counts: normalizeResetCounts(response.data?.deleted_counts),
    };
  },

  async getCustomers(params: SuperAdminCustomersParams = {}): Promise<SuperAdminCustomerListResponse> {
    const query = buildQuery(params);
    const response = await apiRequest<SuperAdminCustomer[]>(`/super-admin/customers${query}`);

    return {
      customers: Array.isArray(response.data) ? response.data.map(normalizeCustomer) : [],
      meta: normalizePaginationMeta(response.meta),
    };
  },

  async getCustomer(id: number | string): Promise<SuperAdminCustomerDetail> {
    const response = await apiRequest<Partial<SuperAdminCustomerDetail>>(`/super-admin/customers/${id}`);
    return normalizeCustomerDetail(response.data);
  },

  async getTransactions(params: SuperAdminTransactionsParams = {}): Promise<SuperAdminTransactionListResponse> {
    const query = buildQuery(params);
    const response = await apiRequest<SuperAdminTransaction[]>(`/super-admin/transactions${query}`);

    return {
      transactions: Array.isArray(response.data) ? response.data.map(normalizeTransaction) : [],
      meta: normalizePaginationMeta(response.meta),
    };
  },

  async getTransaction(id: number | string): Promise<SuperAdminTransactionDetail> {
    const response = await apiRequest<Partial<SuperAdminTransactionDetail>>(`/super-admin/transactions/${id}`);
    return normalizeTransactionDetail(response.data);
  },

  async getAiCommands(params: SuperAdminAiCommandsParams = {}): Promise<SuperAdminAiCommandListResponse> {
    const query = buildQuery(params);
    const response = await apiRequest<SuperAdminAiCommand[]>(`/super-admin/ai-commands${query}`);

    return {
      ai_commands: Array.isArray(response.data) ? response.data.map(normalizeAiCommand) : [],
      meta: normalizePaginationMeta(response.meta),
    };
  },

  async getAiCommand(id: number | string): Promise<SuperAdminAiCommandDetail> {
    const response = await apiRequest<Partial<SuperAdminAiCommandDetail>>(`/super-admin/ai-commands/${id}`);
    return normalizeAiCommandDetail(response.data);
  },

  async getDailyJournalOverview(params: { range?: DailyJournalRange; shopId?: number | string } = {}): Promise<SuperAdminDailyJournalOverview> {
    const query = buildQuery({ range: params.range ?? "30d", shop_id: params.shopId });
    const response = await apiRequest<Partial<SuperAdminDailyJournalOverview>>(`/super-admin/daily-journal/overview${query}`);
    return normalizeDailyJournalOverview(response.data);
  },

  async getDailyJournalEntries(params: SuperAdminDailyJournalEntriesParams = {}): Promise<SuperAdminDailyJournalEntryListResponse> {
    const query = buildQuery(params);
    const response = await apiRequest<SuperAdminDailyJournalEntry[]>(`/super-admin/daily-journal/entries${query}`);

    return {
      entries: Array.isArray(response.data) ? response.data.map(normalizeDailyJournalEntry) : [],
      meta: normalizePaginationMeta(response.meta),
    };
  },

  async getDailyJournalEntryDetails(id: number | string): Promise<SuperAdminDailyJournalEntryDetail> {
    const response = await apiRequest<Partial<SuperAdminDailyJournalEntryDetail>>(`/super-admin/daily-journal/entries/${id}`);
    return normalizeDailyJournalEntryDetail(response.data);
  },

  async getDailyJournalReports(params: SuperAdminDailyJournalReportsParams = {}): Promise<SuperAdminDailyJournalReport> {
    const query = buildQuery(params);
    const response = await apiRequest<Partial<SuperAdminDailyJournalReport>>(`/super-admin/daily-journal/reports${query}`);
    return normalizeDailyJournalReport(response.data);
  },

  async getDailyJournalAiDrafts(params: SuperAdminDailyJournalAiDraftsParams = {}): Promise<SuperAdminDailyJournalAiDraftListResponse> {
    const query = buildQuery(params);
    const response = await apiRequest<SuperAdminDailyJournalAiDraft[]>(`/super-admin/daily-journal/ai-drafts${query}`);

    return {
      ai_drafts: Array.isArray(response.data) ? response.data.map(normalizeDailyJournalAiDraft) : [],
      meta: normalizePaginationMeta(response.meta),
    };
  },

  async getDailyJournalAiDraftDetails(id: number | string): Promise<SuperAdminDailyJournalAiDraftDetail> {
    const response = await apiRequest<Partial<SuperAdminDailyJournalAiDraftDetail>>(`/super-admin/daily-journal/ai-drafts/${id}`);
    return normalizeDailyJournalAiDraftDetail(response.data);
  },

  async getAuditEvents(params: SuperAdminAuditEventsParams = {}): Promise<SuperAdminAuditEventListResponse> {
    const query = buildQuery(params);
    const response = await apiRequest<SuperAdminAuditEvent[]>(`/super-admin/audit${query}`);

    return {
      audit_events: Array.isArray(response.data) ? response.data.map(normalizeAuditEvent) : [],
      meta: normalizePaginationMeta(response.meta),
    };
  },

  async getAuditEvent(id: number | string): Promise<SuperAdminAuditEventDetail> {
    const response = await apiRequest<Partial<SuperAdminAuditEventDetail>>(`/super-admin/audit/${id}`);
    return normalizeAuditEventDetail(response.data);
  },

  async getSystemHealth(): Promise<SuperAdminSystemHealth> {
    const response = await apiRequest<Partial<SuperAdminSystemHealth>>("/super-admin/system-health");
    return normalizeSystemHealth(response.data);
  },

  async getFeatureFlags(): Promise<SuperAdminFeatureFlag[]> {
    const response = await apiRequest<RawFeatureFlag[]>("/super-admin/feature-flags");
    return Array.isArray(response.data)
      ? response.data.filter(isKnownFeatureFlagPayload).map(normalizeFeatureFlag)
      : [];
  },

  async updateFeatureFlag(key: SuperAdminFeatureFlagKey, value: boolean): Promise<SuperAdminFeatureFlag> {
    const response = await apiRequest<RawFeatureFlag>(`/super-admin/feature-flags/${key}`, {
      method: "PUT",
      body: { value },
    });

    return normalizeFeatureFlag(response.data);
  },

  async getPlatformSettings(): Promise<SuperAdminPlatformSettingsResponse> {
    const response = await apiRequest<RawPlatformSettingsResponse>("/super-admin/platform-settings");
    return normalizePlatformSettingsResponse(response.data);
  },

  async updatePlatformSettings(input: UpdatePlatformSettingsInput): Promise<SuperAdminPlatformSettingsResponse> {
    const response = await apiRequest<RawPlatformSettingsResponse>("/super-admin/platform-settings", {
      method: "PUT",
      body: input,
    });

    return normalizePlatformSettingsResponse(response.data);
  },

  async getSmsOverview(): Promise<SuperAdminSmsOverview> {
    const response = await apiRequest<RawSuperAdminSmsOverview>("/super-admin/sms/overview");
    return normalizeSmsOverview(response.data);
  },

  async getSmsWallets(params: SuperAdminSmsWalletsParams = {}): Promise<SuperAdminSmsWalletListResponse> {
    const query = buildQuery(params);
    const response = await apiRequest<RawSuperAdminSmsWallet[]>(`/super-admin/sms/wallets${query}`);

    return {
      wallets: Array.isArray(response.data) ? response.data.map(normalizeSmsWallet) : [],
      meta: normalizePaginationMeta(response.meta),
    };
  },

  async getSmsWallet(id: number | string): Promise<SuperAdminSmsWalletDetail> {
    const response = await apiRequest<RawSuperAdminSmsWalletDetail>(`/super-admin/sms/wallets/${id}`);
    return normalizeSmsWalletDetail(response.data);
  },

  async updateSmsWallet(
    id: number | string,
    input: { monthly_quota?: number; sms_enabled?: boolean; notes?: string | null },
  ): Promise<SuperAdminSmsWallet> {
    const response = await apiRequest<RawSuperAdminSmsWallet>(`/super-admin/sms/wallets/${id}`, {
      method: "PATCH",
      body: {
        monthly_quota: input.monthly_quota,
        sms_enabled: input.sms_enabled,
        notes: input.notes?.trim() || null,
      },
    });

    return normalizeSmsWallet(response.data);
  },

  async topupSmsWallet(id: number | string, input: { quantity: number; notes?: string | null }): Promise<SuperAdminSmsWallet> {
    const response = await apiRequest<RawSuperAdminSmsWallet>(`/super-admin/sms/wallets/${id}/topup`, {
      method: "POST",
      body: {
        quantity: input.quantity,
        notes: input.notes?.trim() || null,
      },
    });

    return normalizeSmsWallet(response.data);
  },

  async bulkTopupSmsWallets(input: { scope: "all" | "selected"; wallet_ids?: number[]; quantity: number; notes?: string | null }): Promise<{ affected_count: number }> {
    const response = await apiRequest<{ affected_count?: number }>("/super-admin/sms/wallets/bulk-topup", {
      method: "POST",
      body: {
        scope: input.scope,
        wallet_ids: input.wallet_ids ?? [],
        quantity: input.quantity,
        notes: input.notes?.trim() || null,
      },
    });

    return { affected_count: toNumber(response.data?.affected_count) };
  },

  async bulkUpdateSmsQuota(input: { scope: "all" | "selected"; wallet_ids?: number[]; monthly_quota: number; notes?: string | null }): Promise<{ affected_count: number }> {
    const response = await apiRequest<{ affected_count?: number }>("/super-admin/sms/wallets/bulk-update-quota", {
      method: "POST",
      body: {
        scope: input.scope,
        wallet_ids: input.wallet_ids ?? [],
        monthly_quota: input.monthly_quota,
        notes: input.notes?.trim() || null,
      },
    });

    return { affected_count: toNumber(response.data?.affected_count) };
  },

  async bulkToggleSmsWallets(input: { scope: "all" | "selected"; wallet_ids?: number[]; sms_enabled: boolean; notes?: string | null }): Promise<{ affected_count: number }> {
    const response = await apiRequest<{ affected_count?: number }>("/super-admin/sms/wallets/bulk-toggle", {
      method: "POST",
      body: {
        scope: input.scope,
        wallet_ids: input.wallet_ids ?? [],
        sms_enabled: input.sms_enabled,
        notes: input.notes?.trim() || null,
      },
    });

    return { affected_count: toNumber(response.data?.affected_count) };
  },

  async getSmsRechargeRequests(params: SmsRechargeRequestsParams = {}): Promise<SmsRechargeRequestListResponse> {
    const query = buildQuery(params);
    const response = await apiRequest<RawSmsRechargeRequest[]>(`/super-admin/sms/recharge-requests${query}`);

    return {
      requests: Array.isArray(response.data) ? response.data.map(normalizeSmsRechargeRequest) : [],
      meta: normalizePaginationMeta(response.meta),
    };
  },

  async approveSmsRechargeRequest(id: number | string, input: { approved_quantity: number; admin_notes?: string | null }): Promise<SmsRechargeRequest> {
    const response = await apiRequest<RawSmsRechargeRequest>(`/super-admin/sms/recharge-requests/${id}/approve`, {
      method: "POST",
      body: {
        approved_quantity: input.approved_quantity,
        admin_notes: input.admin_notes?.trim() || null,
      },
    });

    return normalizeSmsRechargeRequest(response.data);
  },

  async rejectSmsRechargeRequest(id: number | string, input: { admin_notes?: string | null }): Promise<SmsRechargeRequest> {
    const response = await apiRequest<RawSmsRechargeRequest>(`/super-admin/sms/recharge-requests/${id}/reject`, {
      method: "POST",
      body: {
        admin_notes: input.admin_notes?.trim() || null,
      },
    });

    return normalizeSmsRechargeRequest(response.data);
  },

  async getSmsWalletTransactions(params: SmsWalletTransactionsParams = {}): Promise<SmsWalletTransactionListResponse> {
    const query = buildQuery(params);
    const response = await apiRequest<RawSmsWalletTransaction[]>(`/super-admin/sms/wallet-transactions${query}`);

    return {
      transactions: Array.isArray(response.data) ? response.data.map(normalizeSmsWalletTransaction) : [],
      meta: normalizePaginationMeta(response.meta),
    };
  },

  async getSmsProviderSettings(): Promise<SuperAdminSmsProviderSettings> {
    const response = await apiRequest<RawSmsProviderSettings>("/super-admin/sms/provider-settings");
    return normalizeSmsProviderSettings(response.data);
  },

  async updateSmsProviderSettings(input: UpdateSmsProviderSettingsInput): Promise<SuperAdminSmsProviderSettings> {
    const response = await apiRequest<RawSmsProviderSettings>("/super-admin/sms/provider-settings", {
      method: "PUT",
      body: {
        enabled: input.enabled,
        auth_mode: input.auth_mode,
        api_token: input.api_token?.trim() || null,
        user_name: input.user_name?.trim() || null,
        user_pass: input.user_pass?.trim() || null,
        sender: input.sender?.trim() || null,
        send_url: input.send_url.trim(),
        balance_url: input.balance_url.trim(),
        default_message_type: input.default_message_type,
        request_method: input.request_method,
        msg_id: input.msg_id,
        timeout_seconds: input.timeout_seconds,
      },
    });

    return normalizeSmsProviderSettings(response.data);
  },

  async checkSmsProviderBalance(): Promise<SmsProviderBalanceResult> {
    const response = await apiRequest<RawSmsProviderBalanceResult>("/super-admin/sms/provider-balance", {
      method: "POST",
    });

    return normalizeSmsProviderBalanceResult(response.data);
  },

  async sendSmsProviderTest(input: SmsProviderTestSendInput): Promise<SmsProviderTestSendResult> {
    const response = await apiRequest<RawSmsProviderTestSendResult>("/super-admin/sms/test-send", {
      method: "POST",
      body: {
        mobile: input.mobile.trim(),
        text: input.text.trim(),
        type: input.type ?? "auto",
      },
    });

    return normalizeSmsProviderTestSendResult(response.data);
  },

  async getSmsProviderMessageLogs(params: SmsProviderMessageLogsParams = {}): Promise<SmsProviderMessageLogListResponse> {
    const query = buildQuery(params);
    const response = await apiRequest<RawSmsProviderMessageLog[]>(`/super-admin/sms/message-logs${query}`);

    return {
      logs: Array.isArray(response.data) ? response.data.map(normalizeSmsProviderMessageLog) : [],
      meta: normalizePaginationMeta(response.meta),
    };
  },
};

function normalizeUser(rawUser?: Partial<SuperAdminUser>): SuperAdminUser {
  return {
    id: toNumber(rawUser?.id),
    name: String(rawUser?.name ?? "مشرف سَنَد"),
    phone: normalizePhoneValue(rawUser?.phone),
    email: rawUser?.email ?? null,
    status: rawUser?.status ?? null,
    is_active: rawUser?.is_active ?? rawUser?.status === "active",
    is_suspended: Boolean(rawUser?.is_suspended),
    suspended_at: rawUser?.suspended_at ?? null,
    suspended_reason: rawUser?.suspended_reason ?? null,
    suspension_message: rawUser?.suspension_message ?? null,
    role: rawUser?.role ?? null,
    role_label: rawUser?.role_label ?? null,
    is_super_admin: Boolean(rawUser?.is_super_admin),
    phone_verified_at: rawUser?.phone_verified_at ?? null,
    email_verified_at: rawUser?.email_verified_at ?? null,
    current_shop: rawUser?.current_shop ?? null,
    shops_count: toNumber(rawUser?.shops_count),
    ledger_entries_count: toNumber(rawUser?.ledger_entries_count),
    ai_commands_count: toNumber(rawUser?.ai_commands_count),
    last_activity_at: rawUser?.last_activity_at ?? null,
    sms_wallet: rawUser?.sms_wallet ? normalizeSmsWalletSummary(rawUser.sms_wallet) : null,
    created_at: rawUser?.created_at ?? null,
    updated_at: rawUser?.updated_at ?? null,
  };
}

function normalizeFeatureFlag(raw?: RawFeatureFlag): SuperAdminFeatureFlag {
  return {
    key: raw?.key === "public_registration_enabled" ? raw.key : "public_registration_enabled",
    value: Boolean(raw?.value),
    description: raw?.description ?? null,
    updated_at: raw?.updated_at ?? null,
  };
}

function normalizePlatformSettingsResponse(raw?: RawPlatformSettingsResponse): SuperAdminPlatformSettingsResponse {
  return {
    settings: Array.isArray(raw?.settings)
      ? raw.settings.filter(isKnownPlatformSettingPayload).map(normalizePlatformSetting)
      : [],
    status: normalizeAppStatus(raw?.status),
  };
}

function normalizePlatformSetting(raw?: RawPlatformSetting): SuperAdminPlatformSetting {
  const key = isKnownPlatformSettingKey(raw?.key) ? raw.key : "maintenance_enabled";

  return {
    key,
    value: key === "maintenance_enabled" ? toBoolean(raw?.value) : String(raw?.value ?? ""),
    description: raw?.description ?? null,
    updated_at: raw?.updated_at ?? null,
  };
}

function normalizeAppStatus(raw?: Partial<SuperAdminAppStatus>): SuperAdminAppStatus {
  const server: Partial<SuperAdminAppStatus["server"]> = raw?.server ?? {};
  const support: Partial<SuperAdminAppStatus["support"]> = raw?.support ?? {};

  return {
    server: {
      healthy: server.healthy !== false,
      maintenance_enabled: toBoolean(server.maintenance_enabled),
      maintenance_title_ar: String(server.maintenance_title_ar ?? "الخدمة قيد الصيانة"),
      maintenance_message_ar: String(server.maintenance_message_ar ?? "نعمل على تحسين الخدمة. سنعود قريبًا."),
      maintenance_support_url: String(server.maintenance_support_url ?? ""),
    },
    support: {
      account_suspension_title_ar: String(support.account_suspension_title_ar ?? "حسابك غير متاح حاليًا"),
      account_suspension_message_ar: String(support.account_suspension_message_ar ?? "يرجى التواصل مع الإدارة لمراجعة حالة الحساب."),
      account_suspension_url: String(support.account_suspension_url ?? ""),
    },
  };
}

function normalizeSmsEntity(raw?: RawSmsEntity | null): SmsEntity | null {
  if (!raw) return null;

  return {
    id: raw.id === null || raw.id === undefined ? null : toNumber(raw.id),
    name: raw.name ?? null,
    phone: normalizePhoneValue(raw.phone),
    email: raw.email ?? null,
    status: raw.status ?? null,
  };
}

function normalizeSmsWalletSummary(raw?: RawSmsWalletSummary | null): SmsWalletSummary {
  return {
    id: raw?.id === null || raw?.id === undefined ? null : toNumber(raw.id),
    shop_id: raw?.shop_id === null || raw?.shop_id === undefined ? null : toNumber(raw.shop_id),
    user_id: raw?.user_id === null || raw?.user_id === undefined ? null : toNumber(raw.user_id),
    monthly_quota: toNumber(raw?.monthly_quota),
    monthly_used: toNumber(raw?.monthly_used),
    monthly_remaining: toNumber(raw?.monthly_remaining),
    topup_balance: toNumber(raw?.topup_balance),
    reserved_balance: toNumber(raw?.reserved_balance),
    available_balance: toNumber(raw?.available_balance),
    monthly_period: raw?.monthly_period ?? null,
    sms_enabled: toBoolean(raw?.sms_enabled),
    global_sms_enabled: raw?.global_sms_enabled === undefined ? undefined : toBoolean(raw.global_sms_enabled),
    effective_sms_enabled: raw?.effective_sms_enabled === undefined ? undefined : toBoolean(raw.effective_sms_enabled),
    disabled_message: raw?.disabled_message ?? null,
  };
}

function normalizeSmsOverview(raw?: RawSuperAdminSmsOverview): SuperAdminSmsOverview {
  return {
    total_wallets: toNumber(raw?.total_wallets),
    enabled_wallets: toNumber(raw?.enabled_wallets),
    disabled_wallets: toNumber(raw?.disabled_wallets),
    total_monthly_quota: toNumber(raw?.total_monthly_quota),
    total_monthly_used: toNumber(raw?.total_monthly_used),
    total_topup_balance: toNumber(raw?.total_topup_balance),
    total_available_balance: toNumber(raw?.total_available_balance),
    pending_recharge_requests: toNumber(raw?.pending_recharge_requests),
    sms_sent_this_month: toNumber(raw?.sms_sent_this_month),
    monthly_period: raw?.monthly_period ?? null,
    global_sms_enabled: raw?.global_sms_enabled === undefined ? true : toBoolean(raw.global_sms_enabled),
    default_monthly_quota: toNumber(raw?.default_monthly_quota),
  };
}

function normalizeSmsWallet(raw?: RawSuperAdminSmsWallet): SuperAdminSmsWallet {
  const summary = normalizeSmsWalletSummary(raw);

  return {
    ...summary,
    id: toNumber(raw?.id ?? summary.id),
    shop: normalizeSmsEntity(raw?.shop),
    user: normalizeSmsEntity(raw?.user),
    last_sent_at: raw?.last_sent_at ?? null,
    created_at: raw?.created_at ?? null,
    updated_at: raw?.updated_at ?? null,
  };
}

function normalizeSmsWalletTransaction(raw?: RawSmsWalletTransaction): SmsWalletTransaction {
  return {
    id: toNumber(raw?.id),
    wallet_id: toNumber(raw?.wallet_id),
    shop: normalizeSmsEntity(raw?.shop),
    user: normalizeSmsEntity(raw?.user),
    type: String(raw?.type ?? ""),
    quantity: toNumber(raw?.quantity),
    balance_before: raw?.balance_before === null || raw?.balance_before === undefined ? null : toNumber(raw.balance_before),
    balance_after: raw?.balance_after === null || raw?.balance_after === undefined ? null : toNumber(raw.balance_after),
    monthly_quota_before: raw?.monthly_quota_before === null || raw?.monthly_quota_before === undefined ? null : toNumber(raw.monthly_quota_before),
    monthly_quota_after: raw?.monthly_quota_after === null || raw?.monthly_quota_after === undefined ? null : toNumber(raw.monthly_quota_after),
    performed_by_user: normalizeSmsEntity(raw?.performed_by_user),
    performed_by_admin: normalizeSmsEntity(raw?.performed_by_admin),
    related_request_id: raw?.related_request_id === null || raw?.related_request_id === undefined ? null : toNumber(raw.related_request_id),
    related_message_log_id: raw?.related_message_log_id === null || raw?.related_message_log_id === undefined ? null : toNumber(raw.related_message_log_id),
    notes: raw?.notes ?? null,
    metadata: raw?.metadata ?? null,
    created_at: raw?.created_at ?? null,
    updated_at: raw?.updated_at ?? null,
  };
}

function normalizeSmsRechargeRequest(raw?: RawSmsRechargeRequest): SmsRechargeRequest {
  return {
    id: toNumber(raw?.id),
    shop: normalizeSmsEntity(raw?.shop),
    user: normalizeSmsEntity(raw?.user),
    requested_quantity: toNumber(raw?.requested_quantity),
    notes: raw?.notes ?? null,
    status: String(raw?.status ?? "pending"),
    approved_quantity: raw?.approved_quantity === null || raw?.approved_quantity === undefined ? null : toNumber(raw.approved_quantity),
    admin_notes: raw?.admin_notes ?? null,
    reviewed_by_admin: normalizeSmsEntity(raw?.reviewed_by_admin),
    reviewed_at: raw?.reviewed_at ?? null,
    created_at: raw?.created_at ?? null,
    updated_at: raw?.updated_at ?? null,
  };
}

function normalizeSmsWalletDetail(raw?: RawSuperAdminSmsWalletDetail): SuperAdminSmsWalletDetail {
  return {
    wallet: normalizeSmsWallet(raw?.wallet),
    transactions: Array.isArray(raw?.transactions) ? raw.transactions.map(normalizeSmsWalletTransaction) : [],
    message_logs: Array.isArray(raw?.message_logs) ? raw.message_logs.map(normalizeSmsProviderMessageLog) : [],
    recharge_requests: Array.isArray(raw?.recharge_requests) ? raw.recharge_requests.map(normalizeSmsRechargeRequest) : [],
  };
}

function normalizeUserSmsProfile(raw?: Partial<SuperAdminUserSmsProfile> | null): SuperAdminUserSmsProfile {
  return {
    summary: raw?.summary ? normalizeSmsWalletSummary(raw.summary) : null,
    wallets: Array.isArray(raw?.wallets)
      ? raw.wallets.map((wallet) => ({
          id: toNumber(wallet.id),
          shop: normalizeSmsEntity(wallet.shop),
          user: normalizeSmsEntity(wallet.user),
          summary: normalizeSmsWalletSummary(wallet.summary),
        }))
      : [],
    message_logs: Array.isArray(raw?.message_logs) ? raw.message_logs.map(normalizeSmsProviderMessageLog) : [],
    transactions: Array.isArray(raw?.transactions) ? raw.transactions.map(normalizeSmsWalletTransaction) : [],
    recharge_requests: Array.isArray(raw?.recharge_requests) ? raw.recharge_requests.map(normalizeSmsRechargeRequest) : [],
  };
}

function normalizeSmsProviderSettings(raw?: RawSmsProviderSettings): SuperAdminSmsProviderSettings {
  const authMode = raw?.auth_mode === "user_password" ? "user_password" : "api_token";
  const messageType = isSmsProviderMessageType(raw?.default_message_type) ? raw.default_message_type : "auto";
  const requestMethod = raw?.request_method === "GET" ? "GET" : "POST";

  return {
    enabled: toBoolean(raw?.enabled),
    provider: String(raw?.provider ?? "hotsms"),
    auth_mode: authMode,
    user_name: raw?.user_name ?? null,
    user_pass_masked: raw?.user_pass_masked ?? null,
    api_token_masked: raw?.api_token_masked ?? null,
    sender: raw?.sender ?? null,
    send_url: String(raw?.send_url ?? "http://hotsms.ps/sendbulksms.php"),
    balance_url: String(raw?.balance_url ?? "http://hotsms.ps/getbalance.php"),
    default_message_type: messageType,
    request_method: requestMethod,
    msg_id: raw?.msg_id === undefined ? true : toBoolean(raw.msg_id),
    timeout_seconds: toNumber(raw?.timeout_seconds) || 15,
    last_balance: toNullableString(raw?.last_balance),
    last_balance_checked_at: raw?.last_balance_checked_at ?? null,
    created_at: raw?.created_at ?? null,
    updated_at: raw?.updated_at ?? null,
  };
}

function normalizeSmsProviderBalanceResult(raw?: RawSmsProviderBalanceResult): SmsProviderBalanceResult {
  return {
    success: toBoolean(raw?.success),
    balance: toNullableString(raw?.balance),
    code: toNullableString(raw?.code),
    message: String(raw?.message ?? "تعذر فحص رصيد مزود الرسائل."),
    raw_response: toNullableString(raw?.raw_response),
  };
}

function normalizeSmsProviderTestSendResult(raw?: RawSmsProviderTestSendResult): SmsProviderTestSendResult {
  return {
    success: toBoolean(raw?.success),
    code: toNullableString(raw?.code),
    message: String(raw?.message ?? "تعذر إرسال الرسالة التجريبية."),
    provider_message_id: toNullableString(raw?.provider_message_id),
    balance_after: toNullableString(raw?.balance_after),
    raw_response: toNullableString(raw?.raw_response),
    warning: toNullableString(raw?.warning),
  };
}

function normalizeSmsProviderMessageLog(raw?: RawSmsProviderMessageLog): SmsProviderMessageLog {
  return {
    id: toNumber(raw?.id),
    provider: String(raw?.provider ?? "hotsms"),
    sent_by_super_admin_id: raw?.sent_by_super_admin_id === undefined || raw.sent_by_super_admin_id === null
      ? null
      : toNumber(raw.sent_by_super_admin_id),
    sent_by_name: raw?.sent_by_name ?? null,
    shop: normalizeSmsEntity(raw?.shop),
    user: normalizeSmsEntity(raw?.user),
    wallet_id: raw?.wallet_id === undefined || raw?.wallet_id === null ? null : toNumber(raw.wallet_id),
    wallet_transaction_id: raw?.wallet_transaction_id === undefined || raw?.wallet_transaction_id === null ? null : toNumber(raw.wallet_transaction_id),
    sms_source: toNullableString(raw?.sms_source),
    segments_count: toNumber(raw?.segments_count) || 1,
    balance_before: raw?.balance_before === undefined || raw?.balance_before === null ? null : toNumber(raw.balance_before),
    mobile: normalizePhoneValue(raw?.mobile) ?? "",
    mobile_normalized: normalizePhoneValue(raw?.mobile_normalized),
    sender: raw?.sender ?? null,
    message_text: String(raw?.message_text ?? ""),
    message_type: toNullableString(raw?.message_type),
    provider_code: toNullableString(raw?.provider_code),
    provider_message_id: toNullableString(raw?.provider_message_id),
    provider_raw_response: toNullableString(raw?.provider_raw_response),
    success: toBoolean(raw?.success),
    error_message: toNullableString(raw?.error_message),
    balance_after: raw?.balance_after ?? null,
    sent_at: raw?.sent_at ?? null,
    created_at: raw?.created_at ?? null,
    updated_at: raw?.updated_at ?? null,
  };
}

function isKnownPlatformSettingPayload(setting: RawPlatformSetting): boolean {
  return isKnownPlatformSettingKey(setting.key);
}

function isKnownPlatformSettingKey(key?: string | null): key is SuperAdminPlatformSettingKey {
  return [
    "account_suspension_title_ar",
    "account_suspension_message_ar",
    "account_suspension_support_url",
    "maintenance_enabled",
    "maintenance_title_ar",
    "maintenance_message_ar",
    "maintenance_support_url",
  ].includes(String(key));
}

function isKnownFeatureFlagPayload(flag: RawFeatureFlag): boolean {
  return flag.key === "public_registration_enabled";
}

function isSmsProviderMessageType(value: unknown): value is SmsProviderMessageType {
  return value === "auto" || value === "0" || value === "1" || value === "2";
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

function normalizeOverviewKpis(raw?: Partial<SuperAdminOverviewKpis>): SuperAdminOverviewKpis {
  return {
    shops_count: toNumber(raw?.shops_count),
    users_count: toNumber(raw?.users_count),
    customers_count: toNumber(raw?.customers_count),
    ledger_entries_count: toNumber(raw?.ledger_entries_count),
    ai_commands_count: toNumber(raw?.ai_commands_count),
  };
}

function normalizeDebtTrendPoint(raw: Partial<SuperAdminDebtTrendPoint>): SuperAdminDebtTrendPoint {
  return {
    date: String(raw.date ?? ""),
    debt_minor: toNumber(raw.debt_minor),
    payment_minor: toNumber(raw.payment_minor),
    debt_text: raw.debt_text ?? null,
    payment_text: raw.payment_text ?? null,
  };
}

function normalizeAiDistributionItem(raw: Partial<SuperAdminAiDistributionItem>): SuperAdminAiDistributionItem {
  return {
    status: String(raw.status ?? "unknown"),
    label: String(raw.label ?? raw.status ?? "غير محدد"),
    count: toNumber(raw.count),
    percentage: toNumber(raw.percentage),
  };
}

function normalizeRecentActivityItem(raw: Partial<SuperAdminRecentActivityItem>): SuperAdminRecentActivityItem {
  return {
    type: String(raw.type ?? "activity"),
    label: String(raw.label ?? "نشاط"),
    shop_name: raw.shop_name ?? null,
    customer_name: raw.customer_name ?? null,
    amount_minor: raw.amount_minor === null || raw.amount_minor === undefined ? null : toNumber(raw.amount_minor),
    amount_text: raw.amount_text ?? null,
    source: raw.source ?? null,
    source_label: raw.source_label ?? null,
    status: raw.status ?? null,
    status_label: raw.status_label ?? null,
    description: raw.description ?? null,
    created_at: raw.created_at ?? null,
    url: raw.url ?? null,
  };
}

function normalizePlatformMonitoringItem(raw: Partial<SuperAdminPlatformMonitoringItem>): SuperAdminPlatformMonitoringItem {
  return {
    type: String(raw.type ?? "monitoring"),
    label: String(raw.label ?? "تنبيه"),
    description: raw.description ?? null,
    severity: String(raw.severity ?? "info"),
    created_at: raw.created_at ?? null,
    url: raw.url ?? null,
  };
}

function normalizeSearchResult(raw: Partial<SuperAdminSearchResult>): SuperAdminSearchResult {
  return {
    type: String(raw.type ?? "result"),
    label: String(raw.label ?? ""),
    subtitle: normalizePhoneText(raw.subtitle),
    url: String(raw.url ?? "/dashboard"),
  };
}

function buildQuery(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function toBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") return ["1", "true", "yes", "on"].includes(value.toLowerCase());
  return false;
}

function toNullableString(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  return String(value);
}

function normalizePhoneValue(value: unknown): string | null {
  const text = toNullableString(value);
  if (!text) return null;

  return normalizeLocalPhoneDisplay(text) ?? text;
}

function normalizePhoneText(value: unknown): string | null {
  const text = toNullableString(value);
  if (!text) return null;

  return text.replace(/\+?(?:970|972)\d{9}|0\d{9}/g, (match) => normalizeLocalPhoneDisplay(match) ?? match);
}

type PhoneLikeEntity = { phone?: string | null };
type NestedPhoneLikeEntity = PhoneLikeEntity & { owner?: PhoneLikeEntity | null };

function normalizePhoneEntity<T extends object>(entity: T): T;
function normalizePhoneEntity<T extends object>(entity?: T | null): T | null;
function normalizePhoneEntity<T extends object>(entity?: T | null): T | null {
  if (!entity) return null;

  const normalized = {
    ...entity,
  } as T & PhoneLikeEntity;

  if ("phone" in normalized) {
    normalized.phone = normalizePhoneValue(normalized.phone);
  }

  return normalized as T;
}

function normalizeNestedPhoneEntity<T extends object>(entity: T): T;
function normalizeNestedPhoneEntity<T extends object>(entity?: T | null): T | null;
function normalizeNestedPhoneEntity<T extends object>(entity?: T | null): T | null {
  if (!entity) return null;

  const normalized = normalizePhoneEntity(entity) as T & NestedPhoneLikeEntity;

  if ("owner" in normalized) {
    normalized.owner = normalizePhoneEntity(normalized.owner);
  }

  return normalized as T;
}

function normalizeUserDetail(raw?: Partial<SuperAdminUserDetail>): SuperAdminUserDetail {
  const summary: Partial<SuperAdminUserDetail["summary"]> = raw?.summary ?? {};
  const rawUser = normalizeUser(raw?.user);

  return {
    user: {
      ...rawUser,
      current_shop_id: raw?.user?.current_shop_id ?? null,
      updated_at: raw?.user?.updated_at ?? null,
      suspended_by: raw?.user?.suspended_by ?? null,
    },
    summary: {
      shops_count: toNumber(summary.shops_count),
      customers_count: toNumber(summary.customers_count),
      ledger_entries_count: toNumber(summary.ledger_entries_count),
      ai_commands_count: toNumber(summary.ai_commands_count),
      last_activity_at: summary.last_activity_at ?? null,
      tokens_count: toNumber(summary.tokens_count),
      audit_events_count: toNumber(summary.audit_events_count),
    },
    shops: Array.isArray(raw?.shops) ? raw.shops.map(normalizeUserShop) : [],
    recent_transactions: Array.isArray(raw?.recent_transactions) ? raw.recent_transactions.map(normalizeUserTransaction) : [],
    recent_ai_commands: Array.isArray(raw?.recent_ai_commands) ? raw.recent_ai_commands.map(normalizeUserAiCommand) : [],
    sms: normalizeUserSmsProfile(raw?.sms),
    audit_events: Array.isArray(raw?.audit_events) ? raw.audit_events.map(normalizeUserAuditEvent) : [],
  };
}

function normalizeUserResetPreview(raw?: Partial<SuperAdminUserResetPreview>): SuperAdminUserResetPreview {
  return {
    user: normalizeUser(raw?.user),
    shops: Array.isArray(raw?.shops) ? raw.shops.map((shop) => ({
      id: toNumber(shop.id),
      name: shop.name ?? null,
      status: shop.status ?? null,
      owner_user_id: shop.owner_user_id === null || shop.owner_user_id === undefined ? null : toNumber(shop.owner_user_id),
    })) : [],
    counts: normalizeResetCounts(raw?.counts),
    warnings: Array.isArray(raw?.warnings) ? raw.warnings.map(String) : [],
    safe_to_reset: Boolean(raw?.safe_to_reset),
    block_message: raw?.block_message ?? null,
    block_status: raw?.block_status === null || raw?.block_status === undefined ? null : toNumber(raw.block_status),
  };
}

function normalizeUserDeletePreview(raw?: Partial<SuperAdminUserDeletePreview>): SuperAdminUserDeletePreview {
  return {
    user: normalizeUser(raw?.user),
    shops: Array.isArray(raw?.shops) ? raw.shops.map((shop) => ({
      id: toNumber(shop.id),
      name: shop.name ?? null,
      status: shop.status ?? null,
      owner_user_id: shop.owner_user_id === null || shop.owner_user_id === undefined ? null : toNumber(shop.owner_user_id),
    })) : [],
    counts: normalizeResetCounts(raw?.counts),
    warnings: Array.isArray(raw?.warnings) ? raw.warnings.map(String) : [],
    safe_to_delete: Boolean(raw?.safe_to_delete),
    block_message: raw?.block_message ?? null,
    block_status: raw?.block_status === null || raw?.block_status === undefined ? null : toNumber(raw.block_status),
  };
}

function normalizeResetCounts(raw?: Record<string, unknown>): Record<string, number> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};

  return Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, toNumber(value)]),
  );
}

function normalizeUserShop(raw: Partial<SuperAdminUserShop>): SuperAdminUserShop {
  return {
    id: toNumber(raw.id),
    name: raw.name ?? null,
    status: raw.status ?? null,
    city: raw.city ?? null,
    business_type: raw.business_type ?? null,
    current_debt_minor: toNumber(raw.current_debt_minor),
    current_debt_text: raw.current_debt_text ?? null,
    customers_count: toNumber(raw.customers_count),
  };
}

function normalizeUserTransaction(raw: Partial<SuperAdminUserRecentTransaction>): SuperAdminUserRecentTransaction {
  return {
    id: toNumber(raw.id),
    shop: normalizeNestedPhoneEntity(raw.shop),
    customer: normalizePhoneEntity(raw.customer),
    entry_type: raw.entry_type ?? null,
    amount_minor: raw.amount_minor ?? null,
    signed_amount_minor: raw.signed_amount_minor ?? null,
    amount_text: raw.amount_text ?? null,
    signed_amount_text: raw.signed_amount_text ?? null,
    source: raw.source ?? null,
    status: raw.status ?? null,
    items_count: toNumber(raw.items_count),
    posted_at: raw.posted_at ?? null,
    created_at: raw.created_at ?? null,
  };
}

function normalizeUserAiCommand(raw: Partial<SuperAdminUserRecentAiCommand>): SuperAdminUserRecentAiCommand {
  return {
    id: toNumber(raw.id),
    shop: raw.shop ?? null,
    raw_text: raw.raw_text ?? null,
    intent: raw.intent ?? null,
    status: raw.status ?? null,
    customer_name: raw.customer_name ?? null,
    amount_minor: raw.amount_minor ?? null,
    amount_text: raw.amount_text ?? null,
    items_count: toNumber(raw.items_count),
    created_at: raw.created_at ?? null,
  };
}

function normalizeUserAuditEvent(raw: Partial<SuperAdminUserAuditEvent>): SuperAdminUserAuditEvent {
  return {
    id: raw.id ?? null,
    event_type: raw.event_type ?? null,
    severity: raw.severity ?? null,
    shop: raw.shop ?? null,
    metadata_summary: raw.metadata_summary ?? null,
    created_at: raw.created_at ?? null,
  };
}

function normalizePaginationMeta(meta?: Record<string, unknown>): SuperAdminPaginationMeta {
  return {
    current_page: toNumber(meta?.current_page) || 1,
    per_page: toNumber(meta?.per_page) || 20,
    total: toNumber(meta?.total),
    last_page: toNumber(meta?.last_page) || 1,
  };
}

function normalizeWallet(raw: Partial<SuperAdminWallet> = {}): SuperAdminWallet {
  return {
    id: toNumber(raw.id),
    name_ar: raw.name_ar ?? "",
    is_active: toBoolean(raw.is_active),
    sort_order: toNumber(raw.sort_order),
    entries_count: toNumber(raw.entries_count),
    created_at: raw.created_at ?? null,
    updated_at: raw.updated_at ?? null,
  };
}

function normalizeShopWallet(raw: Partial<SuperAdminShopWallet> = {}): SuperAdminShopWallet {
  return {
    id: toNumber(raw.id),
    name_ar: raw.name_ar ?? "",
    is_active: toBoolean(raw.is_active),
    is_frozen_for_shop: toBoolean(raw.is_frozen_for_shop),
  };
}

function normalizeShop(raw: Partial<SuperAdminShop>): SuperAdminShop {
  return {
    id: toNumber(raw.id),
    uuid: raw.uuid ?? null,
    name: raw.name ?? null,
    owner: normalizePhoneEntity(raw.owner),
    city: raw.city ?? null,
    business_type: raw.business_type ?? null,
    currency: raw.currency ?? null,
    status: raw.status ?? null,
    customers_count: toNumber(raw.customers_count),
    ledger_entries_count: toNumber(raw.ledger_entries_count),
    ai_commands_count: toNumber(raw.ai_commands_count),
    current_debt_minor: toNumber(raw.current_debt_minor),
    current_debt_text: raw.current_debt_text ?? null,
    last_activity_at: raw.last_activity_at ?? null,
    created_at: raw.created_at ?? null,
  };
}

function normalizeShopDetail(raw?: Partial<SuperAdminShopDetail>): SuperAdminShopDetail {
  const shop: Partial<SuperAdminShopDetail["shop"]> = raw?.shop ?? {};
  const summary: Partial<SuperAdminShopDetail["summary"]> = raw?.summary ?? {};

  return {
    shop: {
      id: toNumber(shop.id),
      uuid: shop.uuid ?? null,
      name: shop.name ?? null,
      city: shop.city ?? null,
      business_type: shop.business_type ?? null,
      currency: shop.currency ?? null,
      status: shop.status ?? null,
      created_at: shop.created_at ?? null,
      updated_at: shop.updated_at ?? null,
    },
    owner: normalizePhoneEntity(raw?.owner),
    summary: {
      customers_count: toNumber(summary.customers_count),
      ledger_entries_count: toNumber(summary.ledger_entries_count),
      debt_entries_count: toNumber(summary.debt_entries_count),
      payment_entries_count: toNumber(summary.payment_entries_count),
      ai_commands_count: toNumber(summary.ai_commands_count),
      current_debt_minor: toNumber(summary.current_debt_minor),
      current_debt_text: summary.current_debt_text ?? null,
      last_activity_at: summary.last_activity_at ?? null,
    },
    recent_transactions: Array.isArray(raw?.recent_transactions) ? raw.recent_transactions : [],
    recent_ai_commands: Array.isArray(raw?.recent_ai_commands) ? raw.recent_ai_commands : [],
    top_debt_customers: Array.isArray(raw?.top_debt_customers)
      ? raw.top_debt_customers.map((customer) => normalizePhoneEntity(customer as SuperAdminTopDebtCustomer))
      : [],
  };
}

function normalizeCustomer(raw: Partial<SuperAdminCustomer>): SuperAdminCustomer {
  return {
    id: toNumber(raw.id),
    uuid: raw.uuid ?? null,
    name: raw.name ?? null,
    phone: normalizePhoneValue(raw.phone),
    status: raw.status ?? null,
    shop: normalizeNestedPhoneEntity(raw.shop),
    balance_minor: toNumber(raw.balance_minor),
    balance_text: raw.balance_text ?? null,
    balance_status: raw.balance_status ?? null,
    balance_status_label: raw.balance_status_label ?? null,
    ledger_entries_count: toNumber(raw.ledger_entries_count),
    debt_entries_count: toNumber(raw.debt_entries_count),
    payment_entries_count: toNumber(raw.payment_entries_count),
    items_count: toNumber(raw.items_count),
    last_entry_at: raw.last_entry_at ?? null,
    last_entry_text: raw.last_entry_text ?? null,
    created_at: raw.created_at ?? null,
  };
}

function normalizeCustomerDetail(raw?: Partial<SuperAdminCustomerDetail>): SuperAdminCustomerDetail {
  const customer: Partial<SuperAdminCustomerDetail["customer"]> = raw?.customer ?? {};
  const balance: Partial<SuperAdminCustomerDetail["balance"]> = raw?.balance ?? {};
  const summary: Partial<SuperAdminCustomerDetail["summary"]> = raw?.summary ?? {};

  return {
    customer: {
      id: toNumber(customer.id),
      uuid: customer.uuid ?? null,
      name: customer.name ?? null,
      phone: normalizePhoneValue(customer.phone),
      notes: customer.notes ?? null,
      status: customer.status ?? null,
      aliases: Array.isArray(customer.aliases) ? customer.aliases : [],
      created_at: customer.created_at ?? null,
      updated_at: customer.updated_at ?? null,
    },
    shop: normalizeNestedPhoneEntity(raw?.shop),
    balance: {
      currency: balance.currency ?? null,
      balance_minor: toNumber(balance.balance_minor),
      balance_text: balance.balance_text ?? null,
      balance_status: balance.balance_status ?? null,
      balance_status_label: balance.balance_status_label ?? null,
      total_debt_minor: toNumber(balance.total_debt_minor),
      total_debt_text: balance.total_debt_text ?? null,
      total_payment_minor: toNumber(balance.total_payment_minor),
      total_payment_text: balance.total_payment_text ?? null,
    },
    summary: {
      ledger_entries_count: toNumber(summary.ledger_entries_count),
      debt_entries_count: toNumber(summary.debt_entries_count),
      payment_entries_count: toNumber(summary.payment_entries_count),
      ai_commands_count: toNumber(summary.ai_commands_count),
      items_count: toNumber(summary.items_count),
      last_entry_at: summary.last_entry_at ?? null,
      last_activity_at: summary.last_activity_at ?? null,
      balance_minor: toNumber(summary.balance_minor),
      balance_text: summary.balance_text ?? null,
      balance_status: summary.balance_status ?? null,
      balance_status_label: summary.balance_status_label ?? null,
    },
    ledger_entries: Array.isArray(raw?.ledger_entries) ? raw.ledger_entries.map(normalizeCustomerLedgerEntry) : [],
    ai_commands: Array.isArray(raw?.ai_commands) ? raw.ai_commands.map(normalizeCustomerAiCommand) : [],
  };
}

function normalizeCustomerLedgerEntry(raw: Partial<SuperAdminCustomerLedgerEntry>): SuperAdminCustomerLedgerEntry {
  return {
    id: toNumber(raw.id),
    uuid: raw.uuid ?? null,
    entry_type: raw.entry_type ?? null,
    amount_minor: raw.amount_minor ?? null,
    signed_amount_minor: raw.signed_amount_minor ?? null,
    amount_text: raw.amount_text ?? null,
    signed_amount_text: raw.signed_amount_text ?? null,
    source: raw.source ?? null,
    status: raw.status ?? null,
    raw_text: raw.raw_text ?? null,
    note: raw.note ?? null,
    items_count: toNumber(raw.items_count),
    items: Array.isArray(raw.items) ? raw.items : [],
    posted_at: raw.posted_at ?? null,
    created_at: raw.created_at ?? null,
  };
}

function normalizeCustomerAiCommand(raw: Partial<SuperAdminCustomerAiCommand>): SuperAdminCustomerAiCommand {
  return {
    id: toNumber(raw.id),
    raw_text: raw.raw_text ?? null,
    intent: raw.intent ?? null,
    status: raw.status ?? null,
    customer_name: raw.customer_name ?? null,
    amount_minor: raw.amount_minor ?? null,
    amount_text: raw.amount_text ?? null,
    items_count: toNumber(raw.items_count),
    created_at: raw.created_at ?? null,
  };
}

function normalizeTransaction(raw: Partial<SuperAdminTransaction>): SuperAdminTransaction {
  return {
    id: toNumber(raw.id),
    uuid: raw.uuid ?? null,
    shop: normalizeNestedPhoneEntity(raw.shop),
    customer: normalizePhoneEntity(raw.customer),
    created_by: normalizePhoneEntity(raw.created_by),
    entry_type: raw.entry_type ?? null,
    entry_type_label: raw.entry_type_label ?? null,
    direction: raw.direction ?? null,
    amount_minor: raw.amount_minor ?? null,
    amount_text: raw.amount_text ?? null,
    signed_amount_minor: raw.signed_amount_minor ?? null,
    signed_amount_text: raw.signed_amount_text ?? null,
    currency: raw.currency ?? null,
    source: raw.source ?? null,
    source_label: raw.source_label ?? null,
    status: raw.status ?? null,
    status_label: raw.status_label ?? null,
    raw_text: raw.raw_text ?? null,
    note: raw.note ?? null,
    items_count: toNumber(raw.items_count),
    items: Array.isArray(raw.items) ? raw.items : [],
    created_at: raw.created_at ?? null,
    posted_at: raw.posted_at ?? null,
    voided_at: raw.voided_at ?? null,
  };
}

function normalizeTransactionDetail(raw?: Partial<SuperAdminTransactionDetail>): SuperAdminTransactionDetail {
  const transaction = normalizeTransaction(raw?.transaction ?? {});

  return {
    transaction: {
      ...transaction,
      updated_at: raw?.transaction?.updated_at ?? null,
      posted_at: raw?.transaction?.posted_at ?? transaction.posted_at ?? null,
      void_reason: raw?.transaction?.void_reason ?? null,
      voided_by: normalizePhoneEntity(raw?.transaction?.voided_by),
    },
    shop: normalizeNestedPhoneEntity(raw?.shop),
    customer: normalizePhoneEntity(raw?.customer),
    created_by: normalizePhoneEntity(raw?.created_by),
    items_count: toNumber(raw?.items_count),
    items: Array.isArray(raw?.items) ? raw.items : [],
    linked_ai_command: raw?.linked_ai_command ? normalizeLinkedAiCommand(raw.linked_ai_command) : null,
    audit_events: Array.isArray(raw?.audit_events) ? raw.audit_events.map(normalizeTransactionAuditEvent) : [],
  };
}

function normalizeLinkedAiCommand(raw: Partial<SuperAdminLinkedAiCommand>): SuperAdminLinkedAiCommand {
  return {
    id: toNumber(raw.id),
    raw_text: raw.raw_text ?? null,
    normalized_text: raw.normalized_text ?? null,
    intent: raw.intent ?? null,
    status: raw.status ?? null,
    customer_name: raw.customer_name ?? null,
    amount_minor: raw.amount_minor ?? null,
    amount_text: raw.amount_text ?? null,
    items_count: toNumber(raw.items_count),
    created_at: raw.created_at ?? null,
    parsed_json_summary: raw.parsed_json_summary ?? {},
  };
}

function normalizeTransactionAuditEvent(raw: Partial<SuperAdminTransactionAuditEvent>): SuperAdminTransactionAuditEvent {
  return {
    id: raw.id ?? null,
    event_type: raw.event_type ?? null,
    user: normalizePhoneEntity(raw.user),
    metadata_summary: raw.metadata_summary ?? null,
    created_at: raw.created_at ?? null,
  };
}

function normalizeAiCommand(raw: Partial<SuperAdminAiCommand>): SuperAdminAiCommand {
  return {
    id: toNumber(raw.id),
    uuid: raw.uuid ?? null,
    shop: normalizeNestedPhoneEntity(raw.shop),
    user: normalizePhoneEntity(raw.user),
    customer: normalizePhoneEntity(raw.customer),
    raw_text: raw.raw_text ?? null,
    normalized_text: raw.normalized_text ?? null,
    source: raw.source ?? null,
    source_label: raw.source_label ?? null,
    intent: raw.intent ?? null,
    intent_label: raw.intent_label ?? null,
    status: raw.status ?? null,
    status_label: raw.status_label ?? null,
    customer_name: raw.customer_name ?? null,
    amount_minor: raw.amount_minor ?? null,
    amount_text: raw.amount_text ?? null,
    currency: raw.currency ?? null,
    items_count: toNumber(raw.items_count),
    linked_ledger_entry: raw.linked_ledger_entry ? normalizeAiLinkedLedgerEntry(raw.linked_ledger_entry) : null,
    model: raw.model ?? null,
    latency_ms: raw.latency_ms ?? null,
    attempts_count: toNumber(raw.attempts_count),
    created_at: raw.created_at ?? null,
  };
}

function normalizeAiCommandDetail(raw?: Partial<SuperAdminAiCommandDetail>): SuperAdminAiCommandDetail {
  const command = normalizeAiCommand(raw?.command ?? {});

  return {
    command: {
      ...command,
      confidence: raw?.command?.confidence ?? null,
      updated_at: raw?.command?.updated_at ?? null,
      confirmed_at: raw?.command?.confirmed_at ?? null,
      cancelled_at: raw?.command?.cancelled_at ?? null,
      cancellation_reason: raw?.command?.cancellation_reason ?? null,
    },
    shop: normalizeNestedPhoneEntity(raw?.shop),
    user: normalizePhoneEntity(raw?.user),
    customer: normalizePhoneEntity(raw?.customer),
    items_count: toNumber(raw?.items_count),
    items: Array.isArray(raw?.items) ? raw.items.map(normalizeAiCommandItem) : [],
    parsed_json: raw?.parsed_json ?? null,
    customer_matches: Array.isArray(raw?.customer_matches) ? raw.customer_matches.map(normalizeAiCustomerMatch) : [],
    attempts: Array.isArray(raw?.attempts) ? raw.attempts.map(normalizeAiAttempt) : [],
    linked_ledger_entry: raw?.linked_ledger_entry ? normalizeAiLinkedLedgerEntry(raw.linked_ledger_entry) : null,
    audit_events: Array.isArray(raw?.audit_events) ? raw.audit_events.map(normalizeAiAuditEvent) : [],
  };
}

function normalizeAiLinkedLedgerEntry(raw: Partial<SuperAdminAiLinkedLedgerEntry>): SuperAdminAiLinkedLedgerEntry {
  return {
    id: toNumber(raw.id),
    uuid: raw.uuid ?? null,
    entry_type: raw.entry_type ?? null,
    entry_type_label: raw.entry_type_label ?? null,
    amount_minor: raw.amount_minor ?? null,
    amount_text: raw.amount_text ?? null,
    signed_amount_minor: raw.signed_amount_minor ?? null,
    signed_amount_text: raw.signed_amount_text ?? null,
    currency: raw.currency ?? null,
    status: raw.status ?? null,
    source: raw.source ?? null,
    items_count: toNumber(raw.items_count),
    created_at: raw.created_at ?? null,
  };
}

function normalizeAiCommandItem(raw: Partial<SuperAdminAiCommandItem>): SuperAdminAiCommandItem {
  return {
    name: raw.name ?? null,
    quantity_text: raw.quantity_text ?? null,
    unit_text: raw.unit_text ?? null,
    amount_minor: raw.amount_minor ?? null,
    amount_text: raw.amount_text ?? null,
    currency: raw.currency ?? null,
    raw_text: raw.raw_text ?? null,
  };
}

function normalizeAiAttempt(raw: Partial<SuperAdminAiCommandAttempt>): SuperAdminAiCommandAttempt {
  return {
    id: toNumber(raw.id),
    uuid: raw.uuid ?? null,
    provider: raw.provider ?? null,
    model: raw.model ?? null,
    prompt_version: raw.prompt_version ?? null,
    status: raw.status ?? null,
    latency_ms: raw.latency_ms ?? null,
    input_tokens: raw.input_tokens ?? null,
    output_tokens: raw.output_tokens ?? null,
    total_tokens: raw.total_tokens ?? null,
    error_message: raw.error_message ?? null,
    request_summary: raw.request_summary ?? null,
    response_summary: raw.response_summary ?? null,
    parsed_json: raw.parsed_json ?? null,
    created_at: raw.created_at ?? null,
  };
}

function normalizeAiCustomerMatch(raw: Partial<SuperAdminAiCommandCustomerMatch>): SuperAdminAiCommandCustomerMatch {
  return {
    id: raw.id ?? null,
    name: raw.name ?? null,
    phone: normalizePhoneValue(raw.phone),
    score: raw.score ?? null,
    match_type: raw.match_type ?? null,
    balance_text: raw.balance_text ?? null,
  };
}

function normalizeAiAuditEvent(raw: Partial<SuperAdminAiCommandAuditEvent>): SuperAdminAiCommandAuditEvent {
  return {
    id: raw.id ?? null,
    event_type: raw.event_type ?? null,
    user: normalizePhoneEntity(raw.user),
    metadata_summary: raw.metadata_summary ?? null,
    created_at: raw.created_at ?? null,
  };
}

function normalizeDailyJournalOverview(raw?: Partial<SuperAdminDailyJournalOverview>): SuperAdminDailyJournalOverview {
  const kpis = (raw?.kpis ?? {}) as Partial<SuperAdminDailyJournalOverview["kpis"]>;

  return {
    kpis: {
      entries_count: toNumber(kpis.entries_count),
      active_shops_count: toNumber(kpis.active_shops_count),
      ai_drafts_count: toNumber(kpis.ai_drafts_count),
      posted_entries_count: toNumber(kpis.posted_entries_count),
      voided_entries_count: toNumber(kpis.voided_entries_count),
    },
    totals: normalizeDailyJournalTotals(raw?.totals),
    trend: Array.isArray(raw?.trend) ? raw.trend.map((point) => ({
      ...normalizeDailyJournalTotals(point),
      date: String(point.date ?? ""),
    })) : [],
    entry_type_distribution: Array.isArray(raw?.entry_type_distribution) ? raw.entry_type_distribution.map(normalizeDailyJournalDistribution) : [],
    source_distribution: Array.isArray(raw?.source_distribution) ? raw.source_distribution.map(normalizeDailyJournalDistribution) : [],
    recent_entries: Array.isArray(raw?.recent_entries) ? raw.recent_entries.map(normalizeDailyJournalEntry) : [],
    recent_ai_drafts: Array.isArray(raw?.recent_ai_drafts) ? raw.recent_ai_drafts.map(normalizeDailyJournalAiDraft) : [],
    monitoring: Array.isArray(raw?.monitoring) ? raw.monitoring.map((item) => ({
      type: String(item.type ?? "monitoring"),
      label: String(item.label ?? "تنبيه"),
      description: item.description ?? null,
      severity: String(item.severity ?? "info"),
    })) : [],
  };
}

function normalizeDailyJournalDistribution(raw: Partial<SuperAdminDailyJournalDistributionItem>): SuperAdminDailyJournalDistributionItem {
  return {
    value: String(raw.value ?? ""),
    label: String(raw.label ?? raw.value ?? "غير محدد"),
    count: toNumber(raw.count),
    percentage: toNumber(raw.percentage),
  };
}

function normalizeDailyJournalEntry(raw: Partial<SuperAdminDailyJournalEntry>): SuperAdminDailyJournalEntry {
  return {
    id: toNumber(raw.id),
    uuid: raw.uuid ?? null,
    shop: normalizeNestedPhoneEntity(raw.shop),
    user: normalizePhoneEntity(raw.user),
    entry_type: raw.entry_type ?? null,
    entry_type_label: raw.entry_type_label ?? null,
    entry_date: raw.entry_date ?? null,
    amount_minor: toNumber(raw.amount_minor),
    amount_text: raw.amount_text ?? null,
    currency: raw.currency ?? null,
    source: raw.source ?? null,
    source_label: raw.source_label ?? null,
    status: raw.status ?? null,
    status_label: raw.status_label ?? null,
    raw_text: raw.raw_text ?? null,
    note: raw.note ?? null,
    created_at: raw.created_at ?? null,
    updated_at: raw.updated_at ?? null,
    voided_at: raw.voided_at ?? null,
  };
}

function normalizeDailyJournalEntryDetail(raw?: Partial<SuperAdminDailyJournalEntryDetail>): SuperAdminDailyJournalEntryDetail {
  const entry = normalizeDailyJournalEntry(raw?.entry ?? {});

  return {
    entry: {
      ...entry,
      client_request_id: raw?.entry?.client_request_id ?? null,
      void_reason: raw?.entry?.void_reason ?? null,
    },
    shop: normalizeNestedPhoneEntity(raw?.shop),
    user: normalizePhoneEntity(raw?.user),
    related_ai_draft: raw?.related_ai_draft ?? null,
  };
}

function normalizeDailyJournalAiDraft(raw: Partial<SuperAdminDailyJournalAiDraft>): SuperAdminDailyJournalAiDraft {
  return {
    id: toNumber(raw.id),
    uuid: raw.uuid ?? null,
    shop: normalizeNestedPhoneEntity(raw.shop),
    user: normalizePhoneEntity(raw.user),
    raw_text: raw.raw_text ?? null,
    source: raw.source ?? null,
    intent: raw.intent ?? null,
    intent_label: raw.intent_label ?? null,
    status: raw.status ?? null,
    status_label: raw.status_label ?? null,
    entry_type: raw.entry_type ?? null,
    entry_type_label: raw.entry_type_label ?? null,
    amount_minor: raw.amount_minor === null || raw.amount_minor === undefined ? null : toNumber(raw.amount_minor),
    amount_text: raw.amount_text ?? null,
    currency: raw.currency ?? null,
    entry_date: raw.entry_date ?? null,
    confirmed_entry: raw.confirmed_entry ?? null,
    created_at: raw.created_at ?? null,
    confirmed_at: raw.confirmed_at ?? null,
    cancelled_at: raw.cancelled_at ?? null,
  };
}

function normalizeDailyJournalReport(raw?: Partial<SuperAdminDailyJournalReport>): SuperAdminDailyJournalReport {
  return {
    period: String(raw?.period ?? "today"),
    date_from: raw?.date_from ?? null,
    date_to: raw?.date_to ?? null,
    totals: normalizeDailyJournalTotals(raw?.totals),
    recorded_days_count: toNumber(raw?.recorded_days_count),
    missing_days_count: toNumber(raw?.missing_days_count),
    shops_count: toNumber(raw?.shops_count),
    formula_note: raw?.formula_note ?? null,
    daily_breakdown: Array.isArray(raw?.daily_breakdown) ? raw.daily_breakdown.map((day) => ({
      ...normalizeDailyJournalTotals(day),
      date: String(day.date ?? ""),
      entries_count: toNumber(day.entries_count),
      has: day.has,
      is_complete_for_profit: Boolean(day.is_complete_for_profit),
    })) : [],
    per_shop_summary: Array.isArray(raw?.per_shop_summary) ? raw.per_shop_summary.map((row) => ({
      shop: normalizeNestedPhoneEntity(row.shop),
      entries_count: toNumber(row.entries_count),
      recorded_days_count: toNumber(row.recorded_days_count),
      missing_days_count: toNumber(row.missing_days_count),
      totals: normalizeDailyJournalTotals(row.totals),
    })) : [],
  };
}

function normalizeDailyJournalAiDraftDetail(raw?: Partial<SuperAdminDailyJournalAiDraftDetail>): SuperAdminDailyJournalAiDraftDetail {
  const draft = normalizeDailyJournalAiDraft(raw?.draft ?? {});

  return {
    draft: {
      ...draft,
      period_type: raw?.draft?.period_type ?? null,
      period_type_label: raw?.draft?.period_type_label ?? null,
      period_start: raw?.draft?.period_start ?? null,
      period_end: raw?.draft?.period_end ?? null,
      answer_type: raw?.draft?.answer_type ?? null,
      assistant_reply: raw?.draft?.assistant_reply ?? null,
      updated_at: raw?.draft?.updated_at ?? null,
    },
    shop: normalizeNestedPhoneEntity(raw?.shop),
    user: normalizePhoneEntity(raw?.user),
    confirmed_entry: raw?.confirmed_entry ? normalizeDailyJournalEntry(raw.confirmed_entry) : null,
    parsed_json: raw?.parsed_json ?? null,
    answer_json: raw?.answer_json ?? null,
  };
}

function normalizeDailyJournalTotals(raw?: Partial<SuperAdminDailyJournalMoneyTotals>): SuperAdminDailyJournalMoneyTotals {
  return {
    sales_minor: toNumber(raw?.sales_minor),
    sales_text: raw?.sales_text ?? null,
    purchases_minor: toNumber(raw?.purchases_minor),
    purchases_text: raw?.purchases_text ?? null,
    expenses_minor: toNumber(raw?.expenses_minor),
    expenses_text: raw?.expenses_text ?? null,
    remaining_debts_minor: toNumber(raw?.remaining_debts_minor),
    remaining_debts_text: raw?.remaining_debts_text ?? null,
    profit_minor: toNumber(raw?.profit_minor),
    profit_text: raw?.profit_text ?? null,
  };
}

function normalizeAuditEvent(raw: Partial<SuperAdminAuditEvent>): SuperAdminAuditEvent {
  return {
    id: toNumber(raw.id),
    event_type: raw.event_type ?? null,
    event_label: raw.event_label ?? null,
    severity: raw.severity ?? null,
    severity_label: raw.severity_label ?? null,
    user: normalizePhoneEntity(raw.user),
    shop: normalizeNestedPhoneEntity(raw.shop),
    subject_type: raw.subject_type ?? null,
    subject_id: raw.subject_id ?? null,
    ip_address: raw.ip_address ?? null,
    user_agent: raw.user_agent ?? null,
    metadata_summary: raw.metadata_summary ?? null,
    created_at: raw.created_at ?? null,
  };
}

function normalizeAuditEventDetail(raw?: Partial<SuperAdminAuditEventDetail>): SuperAdminAuditEventDetail {
  return {
    ...normalizeAuditEvent(raw ?? {}),
    metadata: raw?.metadata ?? null,
  };
}

function normalizeSystemHealth(raw?: Partial<SuperAdminSystemHealth>): SuperAdminSystemHealth {
  const app: Partial<SuperAdminSystemHealth["app"]> = raw?.app ?? {};
  const database: Partial<SuperAdminSystemHealth["database"]> = raw?.database ?? {};
  const cache: Partial<SuperAdminSystemHealth["cache"]> = raw?.cache ?? {};
  const queue: Partial<SuperAdminSystemHealth["queue"]> = raw?.queue ?? {};
  const gemini: Partial<SuperAdminSystemHealth["gemini"]> = raw?.gemini ?? {};
  const storage: Partial<SuperAdminSystemHealth["storage"]> = raw?.storage ?? {};
  const counts: Partial<SuperAdminSystemHealth["counts"]> = raw?.counts ?? {};

  return {
    app: {
      name: app.name ?? null,
      environment: app.environment ?? null,
      debug: Boolean(app.debug),
      laravel_version: app.laravel_version ?? null,
      php_version: app.php_version ?? null,
      timezone: app.timezone ?? null,
      url: app.url ?? null,
    },
    database: {
      status: database.status ?? null,
      driver: database.driver ?? null,
      database: database.database ?? null,
      latency_ms: database.latency_ms ?? null,
    },
    cache: {
      default_store: cache.default_store ?? null,
      status: cache.status ?? null,
    },
    queue: {
      connection: queue.connection ?? null,
      status: queue.status ?? null,
    },
    gemini: {
      configured: Boolean(gemini.configured),
      model: gemini.model ?? null,
      base_url: gemini.base_url ?? null,
      timeout: gemini.timeout ?? null,
    },
    storage: {
      logs_size_bytes: toNumber(storage.logs_size_bytes),
      storage_writable: Boolean(storage.storage_writable),
      cache_writable: Boolean(storage.cache_writable),
    },
    counts: {
      shops: toNumber(counts.shops),
      users: toNumber(counts.users),
      customers: toNumber(counts.customers),
      ledger_entries: toNumber(counts.ledger_entries),
      ai_commands: toNumber(counts.ai_commands),
      audit_events: toNumber(counts.audit_events),
    },
    recent_errors: Array.isArray(raw?.recent_errors) ? raw.recent_errors.map(String) : [],
  };
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}
