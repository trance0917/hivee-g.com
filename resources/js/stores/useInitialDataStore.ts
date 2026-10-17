import { create } from 'zustand';

type InitialDataState = {
    initData: any | null;       // 取得したデータ
    user: any | null;       // ユーザー情報
    isLoading: boolean;
    isInitialized: boolean; // すでに取得済みかのフラグ
    fetchInitialData: () => Promise<void>;
};

export const useInitialDataStore = create<InitialDataState>((set, get) => ({
    initData: null,
    user: null,
    isLoading: false,
    isInitialized: false,

    fetchInitialData: async () => {
        // すでに取得済みなら何もしない（画面遷移時の重複フェッチ防止）
        if (get().isInitialized || get().isLoading) return;

        set({ isLoading: true });

        try {
            // 既存の取得処理（APIエンドポイントに合わせてね）
            const res = await fetch('/api/initial-data');
            const json = await res.json();

            set({
                initData: json,
                user: json.user ?? null,
                isInitialized: true,
            });
        } catch (error) {
            console.error('Initial data fetch failed:', error);
        } finally {
            set({ isLoading: false });
        }
    },
}));
export const useUser = () => useInitialDataStore((state) => state.user);
