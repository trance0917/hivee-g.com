import { create } from 'zustand';
import { gridDisk, latLngToCell } from 'h3-js';
import { H3_RESOLUTION, MAP_CENTER } from '../map/config';

type WorldState = {
    selectedHexes: Set<string>;
    activeHex: string | null;
    toggleHex: (hex: string) => void;
    setActiveHex: (hex: string | null) => void;
    clearSelection: () => void;
};

// テスト版と同様、中心セルとその隣接セル（gridDisk(..., 1)）から開始。
const centerHex = latLngToCell(MAP_CENTER.lat, MAP_CENTER.lng, H3_RESOLUTION);
const initialHexes = new Set(gridDisk(centerHex, 1));

export const useWorldStore = create<WorldState>((set) => ({
    selectedHexes: initialHexes,
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
