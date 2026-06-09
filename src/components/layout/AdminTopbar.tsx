"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { SearchInput } from "@/components/filters/SearchInput";
import { superAdminApi, type SuperAdminSearchResult, type SuperAdminUser } from "@/lib/api/superAdminApi";
import { formatAdminDate } from "@/lib/formatters/date";

type AdminTopbarProps = {
  title: string;
  user: SuperAdminUser | null;
  onLogout: () => void;
};

export function AdminTopbar({ title, user, onLogout }: AdminTopbarProps) {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SuperAdminSearchResult[]>([]);
  const [searchStatus, setSearchStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [open, setOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const today = formatAdminDate(new Date());

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!searchRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    function closeProfileMenu(event: MouseEvent) {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeProfileMenu);
    return () => document.removeEventListener("mousedown", closeProfileMenu);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      return;
    }

    let active = true;

    const timer = window.setTimeout(async () => {
      try {
        setSearchStatus("loading");
        const response = await superAdminApi.search(trimmed);
        if (!active) return;
        setResults(response.results);
        setSearchStatus("ready");
        setOpen(true);
      } catch {
        if (!active) return;
        setResults([]);
        setSearchStatus("error");
        setOpen(true);
      }
    }, 320);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [query]);

  function handleSelect(result: SuperAdminSearchResult) {
    setOpen(false);
    setQuery("");
    router.push(result.url);
  }

  return (
    <header className="sanad-topbar">
      <div className="sanad-topbar-inner">
        <span className="sr-only">{title}</span>
        <div ref={searchRef} className="sanad-topbar-search relative">
          <SearchInput
            placeholder="ابحث عن محل، زبون..."
            value={query}
            onChange={(value) => {
              const trimmedValue = value.trim();
              setQuery(value);
              setOpen(trimmedValue.length >= 2);

              if (trimmedValue.length < 2) {
                setResults([]);
                setSearchStatus("idle");
              }
            }}
            onFocus={() => setOpen(query.trim().length >= 2)}
          />
          {open ? (
            <div className="sanad-search-menu">
              {searchStatus === "loading" ? (
                <div className="sanad-search-state">جاري البحث...</div>
              ) : searchStatus === "error" ? (
                <div className="sanad-search-state text-[var(--danger-700)]">تعذر تنفيذ البحث الآن.</div>
              ) : results.length === 0 ? (
                <div className="sanad-search-state">لا توجد نتائج مطابقة.</div>
              ) : (
                results.map((result) => (
                  <button
                    key={`${result.type}-${result.url}`}
                    type="button"
                    className="sanad-search-result"
                    onClick={() => handleSelect(result)}
                  >
                    <span className="sanad-search-result-type">{resultTypeLabel(result.type)}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-semibold text-[var(--ink)]">{result.label}</span>
                      {result.subtitle ? (
                        <span className="mt-0.5 block truncate text-[12px] text-[var(--muted)]">{result.subtitle}</span>
                      ) : null}
                    </span>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </div>

        <div className="hidden text-[14px] font-semibold text-[var(--muted)] xl:block">
          {today}
        </div>

        <div className="sanad-top-actions ms-auto">
          <div ref={profileMenuRef} className="relative">
            <button
              type="button"
              className="sanad-user-pill transition hover:border-[var(--teal-700)]"
              aria-haspopup="menu"
              aria-expanded={profileMenuOpen}
              onClick={() => setProfileMenuOpen((value) => !value)}
            >
              <div className="sanad-user-avatar">{user?.name?.slice(0, 2) || "س"}</div>
              <div>
                <p className="sanad-user-name">{user?.name || "مشرف سَنَد"}</p>
                <p className="sanad-user-role">مشرف عام</p>
              </div>
              <ChevronDown size={15} className="text-[var(--muted)]" />
            </button>

            {profileMenuOpen ? (
              <div
                className="absolute left-0 top-[calc(100%+8px)] z-50 w-44 overflow-hidden rounded-[var(--r-md)] border border-[var(--hairline-2)] bg-[var(--paper)] shadow-[0_18px_45px_rgba(15,49,46,0.14)]"
                role="menu"
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3.5 py-3 text-right text-[13.5px] font-semibold text-[var(--text)] transition hover:bg-[var(--cream-2)]"
                  role="menuitem"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    router.push("/profile");
                  }}
                >
                  <UserRound size={16} />
                  بياناتي
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 border-t border-[var(--hairline-2)] px-3.5 py-3 text-right text-[13.5px] font-semibold text-[var(--danger-700)] transition hover:bg-[var(--danger-soft)]"
                  role="menuitem"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut size={16} />
                  خروج
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}

function resultTypeLabel(type: string): string {
  return {
    shop: "محل",
    user: "مستخدم",
    customer: "زبون",
    transaction: "حركة",
    daily_journal_entry: "يومية",
    daily_journal_ai_draft: "يومية AI",
    ai_command: "AI",
  }[type] ?? "نتيجة";
}
