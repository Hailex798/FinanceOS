"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Filter, X } from "lucide-react";
import { useMemo, useState } from "react";

export type BoardTaxTypeFilter = "ALL" | "NONE" | "GST" | "TDS" | "CUSTOM";

export type BoardFilterValue = {
  categoryIds: string[];
  taxType: BoardTaxTypeFilter;
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
};

export type BoardFilterCategory = {
  id: string;
  name: string;
};

export type BoardAnalytics = {
  totalSpend: number;
  totalTax: number;
  byStatus: Array<{
    label: string;
    count: number;
    amount: number;
  }>;
  byCategory: Array<{
    label: string;
    amount: number;
  }>;
};

type BoardFiltersProps = {
  categories: BoardFilterCategory[];
  value: BoardFilterValue;
  onChange: (next: BoardFilterValue) => void;
  onClear: () => void;
  analytics: BoardAnalytics;
};

function formatCurrency(amountInPaise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(amountInPaise / 100);
}

function getActiveFilterCount(value: BoardFilterValue): number {
  let count = 0;
  if (value.categoryIds.length > 0) count += 1;
  if (value.taxType !== "ALL") count += 1;
  if (value.dateFrom || value.dateTo) count += 1;
  if (value.minAmount || value.maxAmount) count += 1;
  return count;
}

const inputClassName =
  "w-full border-b border-[#464554] bg-[#1A1B20] px-1 py-2 text-sm text-[#E3E2E8] tabular-nums placeholder:text-[#908FA0] transition-all duration-300 focus:border-[#6366F1] focus:bg-[#292A2E] focus:outline-none";

const selectClassName =
  "w-full border-b border-[#464554] bg-[#1A1B20] px-1 py-2 text-sm text-[#E3E2E8] transition-all duration-300 focus:border-[#6366F1] focus:bg-[#292A2E] focus:outline-none appearance-none cursor-pointer";

const labelClassName =
  "text-[10px] font-bold uppercase tracking-[0.1em] text-[#C7C4D7]";

export function BoardFilters({ categories, value, onChange, onClear, analytics }: BoardFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const activeFilterCount = getActiveFilterCount(value);
  const categoryTotals = useMemo(() => analytics.byCategory.slice(0, 5), [analytics.byCategory]);

  const toggleCategory = (categoryId: string) => {
    const nextIds = value.categoryIds.includes(categoryId)
      ? value.categoryIds.filter((id) => id !== categoryId)
      : [...value.categoryIds, categoryId];
    onChange({ ...value, categoryIds: nextIds });
  };

  return (
    <section className="space-y-0">
      {/* Collapsed trigger bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="flex items-center gap-2 px-1 py-2 text-sm font-semibold text-[#C7C4D7] hover:text-white transition-colors"
        >
          <Filter className="h-3.5 w-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 ? (
            <span className="rounded bg-[#C0C1FF]/20 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[#C0C1FF]">
              {activeFilterCount}
            </span>
          ) : null}
          <ChevronDown
            className={[
              "h-3.5 w-3.5 transition-transform duration-200",
              expanded ? "rotate-180" : ""
            ].join(" ")}
          />
        </button>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1 text-xs font-semibold text-[#908FA0] hover:text-white transition-colors"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setShowAnalytics((p) => !p)}
            className="text-xs font-semibold text-[#C0C1FF]/70 hover:text-[#C0C1FF] transition-colors"
          >
            {showAnalytics ? "Hide Analytics" : "Analytics"}
          </button>
        </div>
      </div>

      {/* Expanded filter panel */}
      <AnimatePresence>
        {expanded ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="glass-card rounded-xl p-4 space-y-4 mt-2">
              {/* Category chips */}
              <div className="space-y-2">
                <p className={labelClassName}>Category</p>
                <div className="flex flex-wrap gap-2">
                  {categories.length > 0 ? (
                    categories.map((cat) => {
                      const isActive = value.categoryIds.includes(cat.id);
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => toggleCategory(cat.id)}
                          className={[
                            "px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-[0.05em] border transition-all",
                            isActive
                              ? "border-[#4EDEA3]/30 bg-[#4EDEA3]/10 text-[#4EDEA3]"
                              : "border-white/10 bg-white/5 text-[#C7C4D7] hover:text-white hover:border-white/20"
                          ].join(" ")}
                        >
                          {cat.name}
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-xs text-[#908FA0]">No categories yet.</p>
                  )}
                </div>
              </div>

              {/* Date + Tax + Amount */}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-1">
                  <label htmlFor="filter-dateFrom" className={labelClassName}>Start Date</label>
                  <input
                    id="filter-dateFrom"
                    type="date"
                    value={value.dateFrom}
                    onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="filter-dateTo" className={labelClassName}>End Date</label>
                  <input
                    id="filter-dateTo"
                    type="date"
                    value={value.dateTo}
                    onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="filter-taxType" className={labelClassName}>Tax Type</label>
                  <select
                    id="filter-taxType"
                    value={value.taxType}
                    onChange={(e) => onChange({ ...value, taxType: e.target.value as BoardTaxTypeFilter })}
                    className={selectClassName}
                  >
                    <option value="ALL">All</option>
                    <option value="NONE">None</option>
                    <option value="GST">GST</option>
                    <option value="TDS">TDS</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label htmlFor="filter-minAmt" className={labelClassName}>Min ₹</label>
                    <input
                      id="filter-minAmt"
                      type="number"
                      min="0"
                      value={value.minAmount}
                      onChange={(e) => onChange({ ...value, minAmount: e.target.value })}
                      className={inputClassName}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="filter-maxAmt" className={labelClassName}>Max ₹</label>
                    <input
                      id="filter-maxAmt"
                      type="number"
                      min="0"
                      value={value.maxAmount}
                      onChange={(e) => onChange({ ...value, maxAmount: e.target.value })}
                      className={inputClassName}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Analytics panel */}
      <AnimatePresence>
        {showAnalytics ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 md:grid-cols-3 mt-3">
              <article className="glass-card rounded-lg p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#C7C4D7]">
                  Filtered Spend
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums text-[#E3E2E8]">
                  {formatCurrency(analytics.totalSpend)}
                </p>
              </article>
              <article className="glass-card rounded-lg p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#C7C4D7]">
                  Total Tax
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums text-[#FFB3AD]">
                  {formatCurrency(analytics.totalTax)}
                </p>
              </article>
              <article className="glass-card rounded-lg p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#C7C4D7]">
                  Top Categories
                </p>
                <div className="mt-2 space-y-1.5">
                  {categoryTotals.length > 0 ? (
                    categoryTotals.map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-xs">
                        <span className="text-[#908FA0] uppercase text-[10px] tracking-wide">{item.label}</span>
                        <span className="font-bold tabular-nums text-[#E3E2E8]">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-[#908FA0]">No data.</p>
                  )}
                </div>
              </article>

              {/* Column totals row */}
              <article className="glass-card rounded-lg p-3 md:col-span-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#C7C4D7]">
                  Column Totals
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {analytics.byStatus.map((item) => (
                    <div key={item.label} className="rounded-lg bg-[#1A1B20]/60 px-3 py-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#C7C4D7]">
                        {item.label}
                      </p>
                      <p className="mt-1 text-sm font-bold tabular-nums text-[#E3E2E8]">
                        {formatCurrency(item.amount)}
                      </p>
                      <p className="text-[10px] tabular-nums text-[#908FA0]">{item.count} cards</p>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
