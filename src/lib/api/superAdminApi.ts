import { apiRequest } from "@/lib/api/apiClient";

export type SuperAdminUser = {
  id: number;
  name: string;
  phone: string | null;
  email?: string | null;
  status?: string | null;
  is_suspended?: boolean;
  suspended_at?: string | null;
  suspended_reason?: string | null;
  suspension_message?: string | null;
  role?: string | null;
  is_super_admin: boolean;
  phone_verified_at?: string | null;
  email_verified_at?: string | null;
  current_shop?: SuperAdminUserCurrentShop | null;
  shops_count?: number;
  ledger_entries_count?: number;
  ai_commands_count?: number;
  last_activity_at?: string | null;
  created_at?: string | null;
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

type RawPlatformSetting = Partial<Omit<SuperAdminPlatformSetting, "key">> & {
  key?: string | null;
};

type RawPlatformSettingsResponse = {
  settings?: RawPlatformSetting[];
  status?: Partial<SuperAdminAppStatus>;
};

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
};

function normalizeUser(rawUser?: Partial<SuperAdminUser>): SuperAdminUser {
  return {
    id: toNumber(rawUser?.id),
    name: String(rawUser?.name ?? "مشرف سَنَد"),
    phone: rawUser?.phone ?? null,
    email: rawUser?.email ?? null,
    status: rawUser?.status ?? null,
    is_suspended: Boolean(rawUser?.is_suspended),
    suspended_at: rawUser?.suspended_at ?? null,
    suspended_reason: rawUser?.suspended_reason ?? null,
    suspension_message: rawUser?.suspension_message ?? null,
    role: rawUser?.role ?? null,
    is_super_admin: Boolean(rawUser?.is_super_admin),
    phone_verified_at: rawUser?.phone_verified_at ?? null,
    email_verified_at: rawUser?.email_verified_at ?? null,
    current_shop: rawUser?.current_shop ?? null,
    shops_count: toNumber(rawUser?.shops_count),
    ledger_entries_count: toNumber(rawUser?.ledger_entries_count),
    ai_commands_count: toNumber(rawUser?.ai_commands_count),
    last_activity_at: rawUser?.last_activity_at ?? null,
    created_at: rawUser?.created_at ?? null,
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
    subtitle: raw.subtitle ?? null,
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
    audit_events: Array.isArray(raw?.audit_events) ? raw.audit_events.map(normalizeUserAuditEvent) : [],
  };
}

function normalizeUserResetPreview(raw?: Partial<SuperAdminUserResetPreview>): SuperAdminUserResetPreview {
  return {
    user: raw?.user ?? {},
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
    shop: raw.shop ?? null,
    customer: raw.customer ?? null,
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

function normalizeShop(raw: Partial<SuperAdminShop>): SuperAdminShop {
  return {
    id: toNumber(raw.id),
    uuid: raw.uuid ?? null,
    name: raw.name ?? null,
    owner: raw.owner ?? null,
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
    owner: raw?.owner ?? null,
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
    top_debt_customers: Array.isArray(raw?.top_debt_customers) ? raw.top_debt_customers : [],
  };
}

function normalizeCustomer(raw: Partial<SuperAdminCustomer>): SuperAdminCustomer {
  return {
    id: toNumber(raw.id),
    uuid: raw.uuid ?? null,
    name: raw.name ?? null,
    phone: raw.phone ?? null,
    status: raw.status ?? null,
    shop: raw.shop ?? null,
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
      phone: customer.phone ?? null,
      notes: customer.notes ?? null,
      status: customer.status ?? null,
      aliases: Array.isArray(customer.aliases) ? customer.aliases : [],
      created_at: customer.created_at ?? null,
      updated_at: customer.updated_at ?? null,
    },
    shop: raw?.shop ?? null,
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
    shop: raw.shop ?? null,
    customer: raw.customer ?? null,
    created_by: raw.created_by ?? null,
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
      voided_by: raw?.transaction?.voided_by ?? null,
    },
    shop: raw?.shop ?? null,
    customer: raw?.customer ?? null,
    created_by: raw?.created_by ?? null,
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
    user: raw.user ?? null,
    metadata_summary: raw.metadata_summary ?? null,
    created_at: raw.created_at ?? null,
  };
}

function normalizeAiCommand(raw: Partial<SuperAdminAiCommand>): SuperAdminAiCommand {
  return {
    id: toNumber(raw.id),
    uuid: raw.uuid ?? null,
    shop: raw.shop ?? null,
    user: raw.user ?? null,
    customer: raw.customer ?? null,
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
    shop: raw?.shop ?? null,
    user: raw?.user ?? null,
    customer: raw?.customer ?? null,
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
    phone: raw.phone ?? null,
    score: raw.score ?? null,
    match_type: raw.match_type ?? null,
    balance_text: raw.balance_text ?? null,
  };
}

function normalizeAiAuditEvent(raw: Partial<SuperAdminAiCommandAuditEvent>): SuperAdminAiCommandAuditEvent {
  return {
    id: raw.id ?? null,
    event_type: raw.event_type ?? null,
    user: raw.user ?? null,
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
    shop: raw.shop ?? null,
    user: raw.user ?? null,
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
    shop: raw?.shop ?? null,
    user: raw?.user ?? null,
    related_ai_draft: raw?.related_ai_draft ?? null,
  };
}

function normalizeDailyJournalAiDraft(raw: Partial<SuperAdminDailyJournalAiDraft>): SuperAdminDailyJournalAiDraft {
  return {
    id: toNumber(raw.id),
    uuid: raw.uuid ?? null,
    shop: raw.shop ?? null,
    user: raw.user ?? null,
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
      shop: row.shop ?? null,
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
    shop: raw?.shop ?? null,
    user: raw?.user ?? null,
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
    user: raw.user ?? null,
    shop: raw.shop ?? null,
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
