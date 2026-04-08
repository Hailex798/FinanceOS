import { BoardsWorkspace } from "@/components/boards/boards-workspace";

type BoardDetailPageProps = {
  params: {
    boardId: string;
  };
};

export const metadata = {
  title: "Board — Finance OS",
  description: "Kanban expense board view for Finance OS"
};

export default function BoardDetailPage({ params }: BoardDetailPageProps) {
  return <BoardsWorkspace initialBoardId={params.boardId} />;
}
