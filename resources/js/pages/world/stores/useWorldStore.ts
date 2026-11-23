import { create } from 'zustand';

type WorldState = {
    selectedHexes: Set<string>;
    activeHex: string | null;
    toggleHex: (hex: string) => void;
    setActiveHex: (hex: string | null) => void;
    clearSelection: () => void;
};

export const useWorldStore = create<WorldState>((set) => ({
    // 初回表示は未選択。プレイヤーが選んだセルにだけ選択色を重ねる。
    selectedHexes: new Set<string>(),
    activeHex: null,

    toggleHex: (hex) => set((state) => {
        // Setを直接書き換えると変更検知されないため、必ず複製する。
        const selectedHexes = new Set(state.selectedHexes);
        if (selectedHexes.has(hex)) selectedHexes.delete(hex);
        else selectedHexes.add(hex);
        return { selectedHexes, activeHex: hex };
    }),

    setActiveHex: (activeHex) => set({ activeHex }),
    clearSelection: () => set({ selectedHexes: new Set<string>() }),
}));
