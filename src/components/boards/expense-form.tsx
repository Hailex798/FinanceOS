"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
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

const STATUS_OPTIONS: ExpenseStatus[] = ["PLANNED", "SPENT", "RECURRING"];

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

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-xl rounded-lg border border-white/10 bg-surface-low/90 p-6 backdrop-blur-glass"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Expense form"
          >
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-foreground">Expense</h2>
              <p className="mt-1 text-sm text-muted-foreground">Add a card to your active board and assign it to a column.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="title" className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Title
                  </label>
                  <input
                    id="title"
                    type="text"
                    className="w-full rounded-sm border border-white/10 bg-surface-high px-3 py-2 text-sm text-foreground outline-none ring-0 transition-colors focus:border-primary/60"
                    {...form.register("title")}
                  />
                  {form.formState.errors.title ? <p className="text-xs text-danger">{form.formState.errors.title.message}</p> : null}
                </div>

                <div className="space-y-1">
                  <label htmlFor="amount" className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Amount
                  </label>
                  <input
                    id="amount"
                    type="number"
                    step="0.01"
                    className="w-full rounded-sm border border-white/10 bg-surface-high px-3 py-2 text-sm text-foreground outline-none ring-0 transition-colors focus:border-primary/60"
                    {...form.register("amount")}
                  />
                  {form.formState.errors.amount ? <p className="text-xs text-danger">{form.formState.errors.amount.message}</p> : null}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="categoryId" className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Category
                  </label>
                  <select
                    id="categoryId"
                    className="w-full rounded-sm border border-white/10 bg-surface-high px-3 py-2 text-sm text-foreground outline-none ring-0 transition-colors focus:border-primary/60"
                    {...form.register("categoryId")}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="status" className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Status
                  </label>
                  <select
                    id="status"
                    className="w-full rounded-sm border border-white/10 bg-surface-high px-3 py-2 text-sm text-foreground outline-none ring-0 transition-colors focus:border-primary/60"
                    {...form.register("status")}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1">
                  <label htmlFor="date" className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Date
                  </label>
                  <input
                    id="date"
                    type="date"
                    className="w-full rounded-sm border border-white/10 bg-surface-high px-3 py-2 text-sm text-foreground outline-none ring-0 transition-colors focus:border-primary/60"
                    {...form.register("date")}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="taxType" className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Tax Type
                  </label>
                  <select
                    id="taxType"
                    className="w-full rounded-sm border border-white/10 bg-surface-high px-3 py-2 text-sm text-foreground outline-none ring-0 transition-colors focus:border-primary/60"
                    {...form.register("taxType")}
                  >
                    <option value="NONE">None</option>
                    <option value="GST">GST</option>
                    <option value="TDS">TDS</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="taxRate" className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Tax Rate %
                  </label>
                  <input
                    id="taxRate"
                    type="number"
                    step="0.1"
                    className="w-full rounded-sm border border-white/10 bg-surface-high px-3 py-2 text-sm text-foreground outline-none ring-0 transition-colors focus:border-primary/60"
                    {...form.register("taxRate")}
                  />
                </div>
              </div>

              {watchedTaxType === "CUSTOM" ? (
                <div className="space-y-1">
                  <label
                    htmlFor="customTaxLabel"
                    className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
                  >
                    Custom Tax Label
                  </label>
                  <input
                    id="customTaxLabel"
                    type="text"
                    className="w-full rounded-sm border border-white/10 bg-surface-high px-3 py-2 text-sm text-foreground outline-none ring-0 transition-colors focus:border-primary/60"
                    {...form.register("customTaxLabel")}
                  />
                </div>
              ) : null}

              <div className="space-y-1">
                <label htmlFor="notes" className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  className="w-full rounded-sm border border-white/10 bg-surface-high px-3 py-2 text-sm text-foreground outline-none ring-0 transition-colors focus:border-primary/60"
                  {...form.register("notes")}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-sm border border-white/10 bg-surface-high px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-highest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow transition-opacity hover:opacity-90"
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
