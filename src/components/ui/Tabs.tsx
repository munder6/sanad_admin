"use client";

import { useState } from "react";
import type { ReactNode } from "react";

export type TabDefinition = {
  key: string;
  label: string;
  count?: number;
};

type TabsProps = {
  tabs: TabDefinition[];
  initialKey?: string;
  className?: string;
  children: (activeKey: string) => ReactNode;
};

/**
 * Lightweight segmented tabs control. Keeps the active tab in local state and
 * renders the matching panel via a render prop so each consumer keeps its own
 * markup. Used by the SMS wallet detail modal and the user details SMS section.
 */
export function Tabs({ tabs, initialKey, className = "", children }: TabsProps) {
  const [active, setActive] = useState(initialKey ?? tabs[0]?.key ?? "");
  const activeKey = tabs.some((tab) => tab.key === active) ? active : tabs[0]?.key ?? "";

  return (
    <div className={className}>
      <div
        role="tablist"
        className="flex flex-wrap items-center gap-1 rounded-[var(--r-md)] border border-[var(--hairline-2)] bg-[var(--paper)] p-1"
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeKey;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`flex items-center gap-1.5 rounded-[calc(var(--r-md)-3px)] px-3.5 py-2 text-[13px] font-semibold transition ${
                isActive
                  ? "bg-[var(--white)] text-[var(--teal-700)] shadow-[var(--shadow-1)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
              onClick={() => setActive(tab.key)}
            >
              {tab.label}
              {typeof tab.count === "number" ? (
                <span
                  className={`mono-num rounded-full px-1.5 text-[11px] font-bold ${
                    isActive ? "bg-[var(--teal-50)] text-[var(--teal-700)]" : "bg-[var(--cream)] text-[var(--muted)]"
                  }`}
                >
                  {new Intl.NumberFormat("en-US").format(tab.count)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" className="mt-3">
        {children(activeKey)}
      </div>
    </div>
  );
}
