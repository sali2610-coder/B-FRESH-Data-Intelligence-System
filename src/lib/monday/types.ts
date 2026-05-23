export type MondayColumnValue = {
  id: string;
  type: string;
  text: string | null;
  value: string | null;
};

export type MondayItem = {
  id: string;
  name: string;
  state: string;
  created_at: string;
  updated_at: string;
  group: { id: string; title: string } | null;
  column_values: MondayColumnValue[];
};

export type MondayBoardSummary = {
  id: string;
  name: string;
  board_kind: string;
  state: string;
  items_count: number;
  workspace: { id: string; name: string } | null;
};

export type MondayBoardMeta = {
  id: string;
  name: string;
  description: string | null;
  state: string;
  items_count: number;
  groups: { id: string; title: string; color: string }[];
  columns: { id: string; title: string; type: string; settings_str: string }[];
};

export type MondayItemsPage = {
  cursor: string | null;
  items: MondayItem[];
};

export type NormalizedTicket = {
  /** Monday item id as string. */
  id: string;
  boardId: string;
  boardName: string;
  itemName: string;
  group: string | null;
  status: string | null;
  priority: string | null;
  branch: string | null;
  region: string | null;
  owner: string | null;
  createdAt: string;
  updatedAt: string;
  dueDate: string | null;
  slaStatus: string | null;
  category: string | null;
  subCategory: string | null;
  source: string | null;
  rawColumnValues: Record<string, MondayColumnValue>;
};
