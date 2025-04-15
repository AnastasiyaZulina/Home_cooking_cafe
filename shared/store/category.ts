import {create} from "zustand";

interface State{
    activeId: number;
    setActiveId: (activeId: number) => void;
}

export const useCategoryStore = create<State>()((set) => ({
    activeId: 1,
    setActiveId: (activeId: number) => set((state) => {
        if (state.activeId !== activeId) {
            return { activeId };
        }
        return state;
    }),
}));