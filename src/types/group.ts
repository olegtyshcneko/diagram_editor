// Group type definitions for shape grouping

export interface Group {
  id: string;
  memberIds: string[];      // Shape IDs in this group
  parentGroupId?: string;   // For nested groups
}

export interface GroupState {
  groups: Record<string, Group>;
  editingGroupId: string | null;
}
