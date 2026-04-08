"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

type CreateAccountModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (data: { name: string; bankName: string; accountType: string }) => void;
};

const ACCOUNT_TYPES = [
  { value: "SAVINGS", label: "Savings" },
  { value: "CURRENT", label: "Current" },
  { value: "CREDIT_CARD", label: "Credit Card" },
  { value: "WALLET", label: "Wallet" }
];

const inputClassName =
  "w-full border-b border-[#464554] bg-[#1A1B20] px-1 py-3 text-sm text-[#E3E2E8] placeholder:text-[#908FA0] transition-all duration-300 focus:border-[#6366F1] focus:bg-[#292A2E] focus:outline-none";

const selectClassName =
  "w-full border-b border-[#464554] bg-[#1A1B20] px-1 py-3 text-sm text-[#E3E2E8] transition-all duration-300 focus:border-[#6366F1] focus:bg-[#292A2E] focus:outline-none appearance-none cursor-pointer";

const labelClassName =
  "ml-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#C7C4D7]";

export function CreateAccountModal({ open, onClose, onSave }: CreateAccountModalProps) {
  const [name, setName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountType, setAccountType] = useState("SAVINGS");

  const handleSave = () => {
    if (!name.trim() || !bankName.trim()) return;
    onSave({ name: name.trim(), bankName: bankName.trim(), accountType });
    setName("");
    setBankName("");
    setAccountType("SAVINGS");
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="glass-card w-full max-w-md rounded-xl p-6"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Add bank account"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-[#E3E2E8]">Add Bank Account</h2>
                <p className="mt-1 text-xs text-[#908FA0]">
                  Create a new account tab. Boards will be auto-created monthly.
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

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="account-name" className={labelClassName}>
                  Account Name
                </label>
                <input
                  id="account-name"
                  type="text"
                  placeholder="e.g. Kotak Savings"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClassName}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="bank-name" className={labelClassName}>
                  Bank Name
                </label>
                <input
                  id="bank-name"
                  type="text"
                  placeholder="e.g. Kotak Mahindra Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className={inputClassName}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="account-type" className={labelClassName}>
                  Account Type
                </label>
                <select
                  id="account-type"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className={selectClassName}
                >
                  {ACCOUNT_TYPES.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-semibold text-[#C7C4D7] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!name.trim() || !bankName.trim()}
                  className="rounded-lg bg-gradient-to-r from-[#6366F1] to-[#4F46E5] px-5 py-2.5 text-sm font-bold text-[#1000A9] shadow-[0_4px_12px_rgba(99,102,241,0.2)] transition-all duration-300 hover:opacity-95 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Account
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
