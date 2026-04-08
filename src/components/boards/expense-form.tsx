"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { ExpenseStatus } from "@/components/boards/kanban-board";

export const expenseFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(100, "Title must be 100 characters or less."),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  categoryId: z.string().min(1, "Category is required."),
  status: z.enum(["PLANNED", "SPENT", "RECURRING"]).default("PLANNED"),
  date: z.string().min(1, "Date is required."),
  taxType: z.enum(["NONE", "GST", "TDS", "CUSTOM"]).default("NONE"),
  taxRate: z.coerce.number().min(0).max(100).default(0),
  notes: z.string().trim().max(500).optional(),
  customTaxLabel: z.string().trim().max(100).optional()
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export type ExpenseFormCategory = {
  id: string;
  name: string;
};

type ExpenseFormProps = {
  open: boolean;
  categories: ExpenseFormCategory[];
  onClose: () => void;
  onSubmit: (values: ExpenseFormValues) => void;
  initialValues?: Partial<ExpenseFormValues>;
  submitLabel?: string;
};

const STATUS_OPTIONS: { value: ExpenseStatus; label: string }[] = [
  { value: "PLANNED", label: "Planned" },
  { value: "SPENT", label: "Spent" },
  { value: "RECURRING", label: "Recurring" }
];

const TAX_OPTIONS = [
  { value: "NONE", label: "None" },
  { value: "GST", label: "GST" },
  { value: "TDS", label: "TDS" },
  { value: "CUSTOM", label: "Custom" }
];

const inputClassName =
  "w-full border-b border-[#464554] bg-[#1A1B20] px-1 py-3 text-sm text-[#E3E2E8] tabular-nums placeholder:text-[#908FA0] transition-all duration-300 focus:border-[#6366F1] focus:bg-[#292A2E] focus:outline-none";

const selectClassName =
  "w-full border-b border-[#464554] bg-[#1A1B20] px-1 py-3 text-sm text-[#E3E2E8] transition-all duration-300 focus:border-[#6366F1] focus:bg-[#292A2E] focus:outline-none appearance-none cursor-pointer";

const labelClassName =
  "ml-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#C7C4D7]";

export function ExpenseForm({
  open,
  categories,
  onClose,
  onSubmit,
  initialValues,
  submitLabel = "Save Expense"
}: ExpenseFormProps) {
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: "",
      amount: 0,
      categoryId: categories[0]?.id ?? "",
      status: "PLANNED",
      date: new Date().toISOString().slice(0, 10),
      taxType: "NONE",
      taxRate: 0,
      notes: "",
      customTaxLabel: "",
      ...initialValues
    }
  });

  const watchedTaxType = form.watch("taxType");
  const watchedTaxRate = form.watch("taxRate");
  const watchedAmount = form.watch("amount");

  const computedTaxAmount = useMemo(() => {
    if (watchedTaxType === "NONE" || !watchedTaxRate || !watchedAmount) return 0;
    return (watchedAmount * watchedTaxRate) / 100;
  }, [watchedTaxType, watchedTaxRate, watchedAmount]);

  const showTaxRateWarning = watchedTaxType !== "NONE" && watchedTaxRate === 0;

  useEffect(() => {
    if (open) {
      form.reset({
        title: "",
        amount: 0,
        categoryId: categories[0]?.id ?? "",
        status: "PLANNED",
        date: new Date().toISOString().slice(0, 10),
        taxType: "NONE",
        taxRate: 0,
        notes: "",
        customTaxLabel: "",
        ...initialValues
      });
    }
  }, [open, categories, initialValues, form]);

  const handleSubmit = form.handleSubmit((values) => {
    onSubmit(values);
    onClose();
  });

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="glass-card w-full max-w-xl rounded-xl p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Expense form"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#E3E2E8]">New Expense</h2>
                <p className="mt-1 text-xs text-[#908FA0]">
                  Add a card to your active board and assign it to a column.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-[#908FA0] hover:text-white transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Title + Amount */}
              <div className="grid gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="expense-title" className={labelClassName}>
                    Title
                  </label>
                  <input
                    id="expense-title"
                    type="text"
                    placeholder="Server Infrastructure"
                    className={inputClassName}
                    {...form.register("title")}
                    aria-invalid={Boolean(form.formState.errors.title)}
                  />
                  {form.formState.errors.title ? (
                    <p className="text-xs text-[#FFB3AD]">{form.formState.errors.title.message}</p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="expense-amount" className={labelClassName}>
                    Amount (₹)
                  </label>
                  <input
                    id="expense-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={inputClassName}
                    {...form.register("amount")}
                    aria-invalid={Boolean(form.formState.errors.amount)}
                  />
                  {form.formState.errors.amount ? (
                    <p className="text-xs text-[#FFB3AD]">{form.formState.errors.amount.message}</p>
                  ) : null}
                </div>
              </div>

              {/* Category + Status */}
              <div className="grid gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="expense-category" className={labelClassName}>
                    Category
                  </label>
                  <select
                    id="expense-category"
                    className={selectClassName}
                    {...form.register("categoryId")}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="expense-status" className={labelClassName}>
                    Column
                  </label>
                  <select
                    id="expense-status"
                    className={selectClassName}
                    {...form.register("status")}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date + Tax Type + Tax Rate */}
              <div className="grid gap-5 md:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="expense-date" className={labelClassName}>
                    Date
                  </label>
                  <input
                    id="expense-date"
                    type="date"
                    className={inputClassName}
                    {...form.register("date")}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="expense-tax-type" className={labelClassName}>
                    Tax Type
                  </label>
                  <select
                    id="expense-tax-type"
                    className={selectClassName}
                    {...form.register("taxType")}
                  >
                    {TAX_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="expense-tax-rate" className={labelClassName}>
                    Tax Rate %
                  </label>
                  <input
                    id="expense-tax-rate"
                    type="number"
                    step="0.1"
                    placeholder="0"
                    className={inputClassName}
                    {...form.register("taxRate")}
                  />
                </div>
              </div>

              {/* Tax warning + computed amount */}
              {showTaxRateWarning ? (
                <div className="flex items-center gap-2 text-xs text-[#FFB3AD]">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  Tax rate is 0%. Did you mean to select no tax?
                </div>
              ) : null}

              {watchedTaxType !== "NONE" && computedTaxAmount > 0 ? (
                <div className="flex items-center justify-between rounded-lg bg-[#292A2E]/60 px-3 py-2">
                  <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#C7C4D7]">
                    Computed Tax
                  </span>
                  <span className="text-sm font-bold tabular-nums text-[#FFB3AD]">
                    ₹{computedTaxAmount.toFixed(2)}
                  </span>
                </div>
              ) : null}

              {/* Custom Tax Label */}
              {watchedTaxType === "CUSTOM" ? (
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="expense-custom-tax" className={labelClassName}>
                    Custom Tax Label
                  </label>
                  <input
                    id="expense-custom-tax"
                    type="text"
                    placeholder="e.g. Service Tax"
                    className={inputClassName}
                    {...form.register("customTaxLabel")}
                  />
                </div>
              ) : null}

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="expense-notes" className={labelClassName}>
                  Notes
                </label>
                <textarea
                  id="expense-notes"
                  rows={2}
                  placeholder="Optional notes..."
                  className={[inputClassName, "resize-none"].join(" ")}
                  {...form.register("notes")}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-semibold text-[#C7C4D7] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-gradient-to-r from-[#6366F1] to-[#4F46E5] px-5 py-2.5 text-sm font-bold text-[#1000A9] shadow-[0_4px_12px_rgba(99,102,241,0.2)] transition-all duration-300 hover:opacity-95 active:scale-[0.98]"
                >
                  {submitLabel}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
