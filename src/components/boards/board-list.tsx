"use client";

import { motion } from "framer-motion";

export type BoardListItem = {
  id: string;
  name: string;
  accountName: string;
  month: number;
  year: number;
  expenseCount: number;
  totalSpend: number;
};

type BoardListProps = {
  boards: BoardListItem[];
  activeBoardId?: string | null;
  onSelectBoard?: (boardId: string) => void;
};

function formatCurrency(amountInPaise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(amountInPaise / 100);
}

function formatBoardMonth(month: number, year: number): string {
  const label = new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(year, month - 1, 1)));

  return label;
}

export function BoardList({ boards, activeBoardId, onSelectBoard }: BoardListProps) {
  if (boards.length === 0) {
    return (
      <section className="rounded-lg border border-white/10 bg-surface-low/60 p-8 backdrop-blur-glass">
        <h2 className="text-lg font-semibold text-foreground">Boards</h2>
        <p className="mt-2 text-sm text-muted-foreground">Create your first expense board to start tracking spending flows.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Boards</h2>
        <span className="rounded-sm border border-white/10 bg-surface-high px-2 py-1 text-xs font-semibold text-muted-foreground">
          {boards.length} total
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {boards.map((board, index) => {
          const isActive = board.id === activeBoardId;

          return (
            <motion.button
              key={board.id}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.04 }}
              onClick={() => onSelectBoard?.(board.id)}
              className={[
                "rounded-lg border p-4 text-left backdrop-blur-glass transition-all",
                "bg-surface-low/60 hover:bg-surface-high/60",
                isActive ? "border-primary/60 shadow-glow" : "border-white/10"
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    {formatBoardMonth(board.month, board.year)}
                  </p>
                  <h3 className="mt-1 line-clamp-2 text-base font-semibold text-foreground">{board.name}</h3>
                </div>
                <span
                  className={[
                    "rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em]",
                    isActive ? "bg-primary/20 text-primary" : "bg-surface-high text-muted-foreground"
                  ].join(" ")}
                >
                  {isActive ? "Active" : "Board"}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{board.accountName}</span>
                <span>{board.expenseCount} cards</span>
              </div>

              <div className="mt-3 border-t border-white/10 pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Total Spend</p>
                <p className="mt-1 text-sm font-semibold text-foreground">{formatCurrency(board.totalSpend)}</p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
