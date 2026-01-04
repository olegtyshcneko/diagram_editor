import { create } from 'zustand';
import { nanoid } from 'nanoid';
import type { Group } from '@/types/group';

interface GroupStore {
  groups: Record<string, Group>;
  editingGroupId: string | null;

  // Actions
  createGroup: (shapeIds: string[]) => string | null;
  ungroup: (groupId: string) => string[];
  enterGroupEdit: (groupId: string) => void;
  exitGroupEdit: () => void;
  getGroupForShape: (shapeId: string) => Group | null;
  getTopLevelGroupForShape: (shapeId: string) => Group | null;
  isInEditingGroup: (shapeId: string) => boolean;
  getGroupMembers: (groupId: string) => string[];
  setGroups: (groups: Record<string, Group>) => void;
  removeGroup: (groupId: string) => void;
  addGroup: (group: Group) => void;
  reset: () => void;
}

export const useGroupStore = create<GroupStore>((set, get) => ({
  groups: {},
  editingGroupId: null,

  createGroup: (shapeIds) => {
    if (shapeIds.length < 2) return null;

    const id = nanoid();
    const group: Group = {
      id,
      memberIds: shapeIds,
    };

    // Check if any of the selected shapes are in existing groups
    // If so, this becomes a parent group of those groups
    const existingGroupIds = new Set<string>();
    for (const shapeId of shapeIds) {
      const existingGroup = get().getGroupForShape(shapeId);
      if (existingGroup) {
        existingGroupIds.add(existingGroup.id);
      }
    }

    // If we're grouping shapes that include entire existing groups,
    // set this as their parent
    if (existingGroupIds.size > 0) {
      set((state) => {
        const updatedGroups = { ...state.groups };

        // Update parent reference for child groups
        for (const childGroupId of existingGroupIds) {
          if (updatedGroups[childGroupId]) {
            updatedGroups[childGroupId] = {
              ...updatedGroups[childGroupId],
              parentGroupId: id,
            };
          }
        }

        updatedGroups[id] = group;
        return { groups: updatedGroups };
      });
    } else {
      set((state) => ({
        groups: { ...state.groups, [id]: group },
      }));
    }

    return id;
  },

  ungroup: (groupId) => {
    const group = get().groups[groupId];
    if (!group) return [];

    const memberIds = [...group.memberIds];

    set((state) => {
      const { [groupId]: _, ...remainingGroups } = state.groups;

      // Clear parent reference from any child groups
      const updatedGroups: Record<string, Group> = {};
      for (const [id, g] of Object.entries(remainingGroups)) {
        if (g.parentGroupId === groupId) {
          updatedGroups[id] = { ...g, parentGroupId: undefined };
        } else {
          updatedGroups[id] = g;
        }
      }

      return {
        groups: updatedGroups,
        editingGroupId: state.editingGroupId === groupId ? null : state.editingGroupId,
      };
    });

    return memberIds;
  },

  enterGroupEdit: (groupId) => {
    if (get().groups[groupId]) {
      set({ editingGroupId: groupId });
    }
  },

  exitGroupEdit: () => {
    set({ editingGroupId: null });
  },

  getGroupForShape: (shapeId) => {
    const { groups } = get();
    return Object.values(groups).find((g) =>
      g.memberIds.includes(shapeId)
    ) || null;
  },

  getTopLevelGroupForShape: (shapeId) => {
    const { groups } = get();
    const foundGroup = Object.values(groups).find((g) =>
      g.memberIds.includes(shapeId)
    );

    if (!foundGroup) return null;

    let group: Group = foundGroup;

    // Walk up parent chain to find top-level group
    while (group.parentGroupId) {
      const parent: Group | undefined = groups[group.parentGroupId];
      if (parent) {
        group = parent;
      } else {
        break;
      }
    }

    return group;
  },

  isInEditingGroup: (shapeId) => {
    const { editingGroupId, groups } = get();
    if (!editingGroupId) return false;

    const group = groups[editingGroupId];
    return group?.memberIds.includes(shapeId) || false;
  },

  getGroupMembers: (groupId) => {
    const group = get().groups[groupId];
    return group?.memberIds || [];
  },

  setGroups: (groups) => {
    set({ groups });
  },

  removeGroup: (groupId) => {
    set((state) => {
      const { [groupId]: _, ...remainingGroups } = state.groups;
      return { groups: remainingGroups };
    });
  },

  addGroup: (group) => {
    set((state) => ({
      groups: { ...state.groups, [group.id]: group },
    }));
  },

  reset: () => {
    set({ groups: {}, editingGroupId: null });
  },
}));
