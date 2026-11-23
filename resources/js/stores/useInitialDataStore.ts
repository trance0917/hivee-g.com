import { create } from 'zustand';
import axios from 'axios';

type InitialDataState = {
    initData: any | null;
    user: any | null;
    characters: any[];
    isLoading: boolean;
    isInitialized: boolean;
    // 初期データAPIと同じ形式のレスポンスを、全ページ共通の状態へ反映する。
    setInitialData: (data: any) => void;
    fetchInitialData: () => Promise<void>;
};

// 同時に呼び出されても、全呼び出し元が同じ通信完了を待てるようにする。
let initialDataRequest: Promise<void> | null = null;

export const useInitialDataStore = create<InitialDataState>((set, get) => ({
    initData: null,
    user: null,
    characters: [],
    isLoading: false,
    isInitialized: false,

    // 初回GETとキャラクター作成POSTは、どちらも { user, characters, ... } を返す。
    // 受信データを保存する処理を共通化し、取得経路による更新漏れを防ぐ。
    // この関数自体は通信しない。作成POSTの結果を渡せば追加のGETは不要。
    setInitialData: (data) => set({
        // レスポンス全体と、各画面で参照しやすい個別の値を一度に更新する。
        initData: data,
        user: data.user ?? null,
        characters: Array.isArray(data.characters) ? data.characters : [],
        // データ取得済みとして扱い、通常の画面遷移での再取得を防ぐ。
        isInitialized: true,
    }),

    fetchInitialData: () => {
        // 画面内のルート遷移では取得し直さない。
        if (get().isInitialized) return Promise.resolve();

        // 取得中なら早期終了ではなく、進行中の通信を待つ。
        if (initialDataRequest) return initialDataRequest;

        initialDataRequest = (async () => {
            set({ isLoading: true });

            try {
                const res = await axios.get('/api/initial-data', {
                    // 初回取得と再試行の間はHiveeのロゴを表示する。
                    loadingScope: false,
                    // 500 などの通信失敗を正常終了として扱わない。
                    validateStatus: (status) => status === 401 || (status >= 200 && status < 300),
                    responseType: 'json',
                    transitional: { silentJSONParsing: false },
                });

                // 未ログインを 401 で返すAPIにも対応（ログイン画面を表示できるようにする）。
                if (res.status === 401) {
                    set({ initData: null, user: null, characters: [], isInitialized: true });
                    return;
                }

                // get()で現在のストアから共通の保存関数を取り出す。
                // 作成モーダルもこの関数を呼ぶため、初回取得と同じ状態に揃う。
                get().setInitialData(res.data);
            } catch (error) {
                // エラー時は App に通知し、ローディングを勝手に解除しない。
                set({ initData: null, user: null, characters: [], isInitialized: false });
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
export const useCharacters = () => useInitialDataStore((state) => state.characters);

