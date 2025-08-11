import {create} from 'zustand';

type EditState = {
  edit: boolean;
  toggle: () => void;
  set: (v: boolean) => void;
};

export const useEditMode = create<EditState>((set) => ({
  edit: false,
  toggle: () => set((s) => ({edit: !s.edit})),
  set: (v: boolean) => set({edit: v}),
}));
