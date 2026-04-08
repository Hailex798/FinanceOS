"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export type AccountTab = {
  id: string;
  name: string;
  bankName: string;
};

type AccountTabsProps = {
  accounts: AccountTab[];
  activeAccountId?: string | null;
  onSelectAccount?: (accountId: string) => void;
  onAddAccount?: () => void;
};

export function AccountTabs({
  accounts,
  activeAccountId,
  onSelectAccount,
  onAddAccount
}: AccountTabsProps) {
  if (accounts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1 border-b border-white/5"
      >
        <button
          type="button"
          onClick={onAddAccount}
          className="flex items-center gap-1 px-6 py-3 text-sm font-semibold text-[#C0C1FF]/60 transition-all hover:text-[#C0C1FF]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add your first bank account
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex items-center gap-1 border-b border-white/5 overflow-x-auto scrollbar-none"
    >
      {accounts.map((account) => {
        const isActive = account.id === activeAccountId;

        return (
          <button
            key={account.id}
            type="button"
            onClick={() => onSelectAccount?.(account.id)}
            className={[
              "shrink-0 px-6 py-3 text-sm font-semibold transition-all whitespace-nowrap",
              isActive
                ? "border-b-2 border-[#C0C1FF] text-[#C0C1FF] font-bold"
                : "text-[#C7C4D7] hover:text-white hover:bg-white/5"
            ].join(" ")}
          >
            {account.name}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onAddAccount}
        className="flex shrink-0 items-center gap-1 px-4 py-3 text-sm font-semibold text-[#C0C1FF]/60 transition-all hover:text-[#C0C1FF]"
      >
        <Plus className="h-3.5 w-3.5" />
        Add
      </button>
    </motion.div>
  );
}
