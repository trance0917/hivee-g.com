import { create } from 'zustand';

type InitialDataState = {
    initData: any | null;
    user: any | null;
    isLoading: boolean;
    isInitialized: boolean;
    fetchInitialData: () => Promise<void>;
};

// 同時に呼び出されても、全呼び出し元が同じ通信完了を待てるようにする。
let initialDataRequest: Promise<void> | null = null;

export const useInitialDataStore = create<InitialDataState>((set, get) => ({
    initData: null,
    user: null,
    isLoading: false,
    isInitialized: false,

    fetchInitialData: () => {
        // 画面内のルート遷移では取得し直さない。
        if (get().isInitialized) return Promise.resolve();

        // 取得中なら早期終了ではなく、進行中の通信を待つ。
        if (initialDataRequest) return initialDataRequest;

        initialDataRequest = (async () => {
            set({ isLoading: true });

            try {
                const res = await fetch('/api/initial-data', {
                    credentials: 'same-origin',
                });

                // 未ログインを 401 で返すAPIにも対応（ログイン画面を表示できるようにする）。
                if (res.status === 401) {
                    set({ initData: null, user: null, isInitialized: true });
                    return;
                }

                // 500 などの通信失敗を正常終了として扱わない。
                if (!res.ok) {
                    throw new Error(`Initial data request failed: HTTP ${res.status}`);
                }

                const json = await res.json();

                set({
                    initData: json,
                    user: json.user ?? null,
                    isInitialized: true,
                });
            } catch (error) {
                // エラー時は App に通知し、ローディングを勝手に解除しない。
                set({ initData: null, user: null, isInitialized: false });
                console.error('Initial data fetch failed:', error);
                throw error;
            } finally {
                set({ isLoading: false });
            }
        })().finally(() => {
            initialDataRequest = null;
        });

        return initialDataRequest;
    },
}));

export const useUser = () => useInitialDataStore((state) => state.user);
