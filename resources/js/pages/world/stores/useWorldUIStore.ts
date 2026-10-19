import { create } from 'zustand';

/** マップのデータと、表示するウィンドウの状態を分離。 */
export type WorldWindow = 'selection' | 'hexInfo';

type WorldUIState = {
    windows: Record<WorldWindow, boolean>;
    openWindow: (name: WorldWindow) => void;
    closeWindow: (name: WorldWindow) => void;
    toggleWindow: (name: WorldWindow) => void;
};

export const useWorldUIStore = create<WorldUIState>((set) => ({
    windows: { selection: true, hexInfo: false },
    openWindow: (name) => set((state) => ({
        windows: { ...state.windows, [name]: true },
    })),
    closeWindow: (name) => set((state) => ({
        windows: { ...state.windows, [name]: false },
    })),
    toggleWindow: (name) => set((state) => ({
        windows: { ...state.windows, [name]: !state.windows[name] },
    })),
}));
