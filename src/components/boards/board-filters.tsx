"use client";

import { motion } from "framer-motion";
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
  if (value.categoryIds.length > 0) {
    count += 1;
  }
  if (value.taxType !== "ALL") {
    count += 1;
  }
  if (value.dateFrom || value.dateTo) {
    count += 1;
  }
  if (value.minAmount || value.maxAmount) {
    count += 1;
  }

  return count;
}

export function BoardFilters({ categories, value, onChange, onClear, analytics }: BoardFiltersProps) {
  const [showAnalytics, setShowAnalytics] = useState(false);
  const activeFilterCount = getActiveFilterCount(value);

  const categoryTotals = useMemo(() => analytics.byCategory.slice(0, 4), [analytics.byCategory]);

  const toggleCategory = (categoryId: string) => {
    const nextIds = value.categoryIds.includes(categoryId)
      ? value.categoryIds.filter((id) => id !== categoryId)
      : [...value.categoryIds, categoryId];

    onChange({
      ...value,
      categoryIds: nextIds
    });
  };

  return (
    <section className="space-y-4 rounded-lg border border-white/10 bg-surface-low/60 p-4 backdrop-blur-glass">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted-foreground">Board Filters</h2>
          {activeFilterCount > 0 ? (
            <span className="rounded-sm bg-primary/20 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-primary">
              {activeFilterCount} active
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAnalytics((previous) => !previous)}
            className="rounded-sm border border-white/10 bg-surface-high px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-surface-highest"
          >
            {showAnalytics ? "Hide Analytics" : "View Analytics"}
          </button>
          {activeFilterCount > 0 ? (
            <button
              type="button"
              onClick={onClear}
              className="rounded-sm border border-white/10 px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Clear all filters
            </button>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Category</p>
          <div className="flex flex-wrap gap-2">
            {categories.length > 0 ? (
              categories.map((category) => {
                const isActive = value.categoryIds.includes(category.id);
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className={[
                      "rounded-sm border px-2 py-1 text-xs font-semibold transition-colors",
                      isActive
                        ? "border-primary/50 bg-primary/20 text-primary"
                        : "border-white/10 bg-surface-high text-muted-foreground hover:text-foreground"
                    ].join(" ")}
                  >
                    {category.name}
                  </button>
                );
              })
            ) : (
              <p className="text-xs text-muted-foreground">No categories found for this account yet.</p>
            )}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1">
            <label htmlFor="dateFrom" className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Start Date
            </label>
            <input
              id="dateFrom"
              type="date"
              value={value.dateFrom}
              onChange={(event) => onChange({ ...value, dateFrom: event.target.value })}
              className="w-full rounded-sm border border-white/10 bg-surface-high px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="dateTo" className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              End Date
            </label>
            <input
              id="dateTo"
              type="date"
              value={value.dateTo}
              onChange={(event) => onChange({ ...value, dateTo: event.target.value })}
              className="w-full rounded-sm border border-white/10 bg-surface-high px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="taxType" className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Tax Type
            </label>
            <select
              id="taxType"
              value={value.taxType}
              onChange={(event) => onChange({ ...value, taxType: event.target.value as BoardTaxTypeFilter })}
              className="w-full rounded-sm border border-white/10 bg-surface-high px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60"
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
              <label htmlFor="minAmount" className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Min ₹
              </label>
              <input
                id="minAmount"
                type="number"
                min="0"
                value={value.minAmount}
                onChange={(event) => onChange({ ...value, minAmount: event.target.value })}
                className="w-full rounded-sm border border-white/10 bg-surface-high px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="maxAmount" className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Max ₹
              </label>
              <input
                id="maxAmount"
                type="number"
                min="0"
                value={value.maxAmount}
                onChange={(event) => onChange({ ...value, maxAmount: event.target.value })}
                className="w-full rounded-sm border border-white/10 bg-surface-high px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60"
              />
            </div>
          </div>
        </div>
      </div>

      {showAnalytics ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-3 border-t border-white/10 pt-4 md:grid-cols-3"
        >
          <article className="rounded-lg border border-white/10 bg-surface-high/60 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Filtered Spend</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(analytics.totalSpend)}</p>
          </article>
          <article className="rounded-lg border border-white/10 bg-surface-high/60 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Total Tax</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(analytics.totalTax)}</p>
          </article>
          <article className="rounded-lg border border-white/10 bg-surface-high/60 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Top Categories</p>
            <div className="mt-2 space-y-1">
              {categoryTotals.length > 0 ? (
                categoryTotals.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold text-foreground">{formatCurrency(item.amount)}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">No spending data for selected filters.</p>
              )}
            </div>
          </article>

          <article className="rounded-lg border border-white/10 bg-surface-high/60 p-3 md:col-span-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Column Totals</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {analytics.byStatus.map((item) => (
                <div key={item.label} className="rounded-sm border border-white/10 bg-surface-low/70 px-3 py-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{formatCurrency(item.amount)}</p>
                  <p className="text-[11px] text-muted-foreground">{item.count} cards</p>
                </div>
              ))}
            </div>
          </article>
        </motion.div>
      ) : null}
    </section>
  );
}
