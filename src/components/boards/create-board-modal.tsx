"use client";

import type { AccountRecord } from "@/components/boards/boards-workspace.types";

type CreateBoardModalProps = {
  open: boolean;
  accounts: AccountRecord[];
  boardName: string;
  boardMonth: number;
  boardYear: number;
  boardAccountId: string;
  onClose: () => void;
  onChangeBoardName: (value: string) => void;
  onChangeBoardMonth: (value: number) => void;
  onChangeBoardYear: (value: number) => void;
  onChangeBoardAccountId: (value: string) => void;
  onSave: () => void;
};

export function CreateBoardModal({
  open,
  accounts,
  boardName,
  boardMonth,
  boardYear,
  boardAccountId,
  onClose,
  onChangeBoardName,
  onChangeBoardMonth,
  onChangeBoardYear,
  onChangeBoardAccountId,
  onSave
}: CreateBoardModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-lg border border-white/10 bg-surface-low/90 p-5 backdrop-blur-glass"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-foreground">Create Board</h2>
        <div className="mt-4 space-y-3">
          <label htmlFor="boardName" className="block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Board Name
          </label>
          <input
            id="boardName"
            value={boardName}
            onChange={(event) => onChangeBoardName(event.target.value)}
            className="w-full rounded-sm border border-white/10 bg-surface-high px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60"
          />
          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={boardAccountId}
              onChange={(event) => onChangeBoardAccountId(event.target.value)}
              className="rounded-sm border border-white/10 bg-surface-high px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60"
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              max={12}
              value={boardMonth}
              onChange={(event) => onChangeBoardMonth(Number(event.target.value))}
              className="rounded-sm border border-white/10 bg-surface-high px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60"
            />
            <input
              type="number"
              min={2000}
              max={2100}
              value={boardYear}
              onChange={(event) => onChangeBoardYear(Number(event.target.value))}
              className="rounded-sm border border-white/10 bg-surface-high px-3 py-2 text-sm text-foreground outline-none transition-colors focus:border-primary/60"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-sm border border-white/10 px-3 py-2 text-sm text-muted-foreground">
              Cancel
            </button>
            <button type="button" onClick={onSave} className="rounded-sm bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Save Board
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
