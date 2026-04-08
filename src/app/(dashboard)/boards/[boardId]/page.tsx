import Link from "next/link";
import { BoardsWorkspace } from "@/components/boards/boards-workspace";

type BoardDetailPageProps = {
  params: {
    boardId: string;
  };
};

export default function BoardDetailPage({ params }: BoardDetailPageProps) {
  return (
    <div className="min-h-screen bg-surface-lowest">
      <div className="mx-auto w-full max-w-7xl px-4 pt-6 md:px-8">
        <Link href="/boards" className="text-xs font-semibold uppercase tracking-[0.1em] text-primary">
          Back to Boards
        </Link>
      </div>
      <BoardsWorkspace initialBoardId={params.boardId} />
    </div>
  );
}
