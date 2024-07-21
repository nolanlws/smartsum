import { TiptapCollabProvider } from "@hocuspocus/provider";
import type { Doc as YDoc } from "yjs";

export interface TiptapProps {
  ydoc: YDoc;
  hasCollab?: boolean;
  provider?: TiptapCollabProvider | null | undefined;
}

export type EditorUser = {
  clientId: string;
  name: string;
  color: string;
  initials?: string;
};
