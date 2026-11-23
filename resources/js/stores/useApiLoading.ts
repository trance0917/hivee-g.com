import type { AxiosAdapter } from 'axios';
import { createContext } from 'react';
import { create } from 'zustand';

// パネル内の通信はそのフレームのIDを渡す。指定のない通信は全画面で表示する。
declare module 'axios' {
    interface AxiosRequestConfig<D = any, P = any> {
        // false は、起動画面など独自の表示がある通信でスピナーを省く指定。
        loadingScope?: string | false;
    }
}

export const screenScope = 'screen';
export const PanelLoadingScope = createContext(screenScope);
const usePendingRequests = create(() => ({ counts: new Map<string, number>() }));

export function useApiLoading(scope: string): boolean {
    return usePendingRequests((state) => state.counts.has(scope));
}

function changePending(scope: string, delta: number) {
    usePendingRequests.setState(({ counts }) => {
        const next = new Map(counts);
        const count = (next.get(scope) ?? 0) + delta;
        if (count > 0) next.set(scope, count);
        else next.delete(scope);
        return { counts: next };
    });
}

/** 実際のHTTP通信を囲み、同時送信・エラー・キャンセルでも件数を必ず元に戻す。 */
export function withApiLoading(send: AxiosAdapter): AxiosAdapter {
    return async (config) => {
        if (config.loadingScope === false) return send(config);
        const scope = config.loadingScope ?? screenScope;
        changePending(scope, 1);
        try {
            return await send(config);
        } finally {
            changePending(scope, -1);
        }
    };
}
