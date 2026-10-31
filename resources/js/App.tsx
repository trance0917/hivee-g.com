import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import WorldIndex from '@/pages/world/Index';
import LoginModal from '@/components/LoginModal';
import { useInitialDataStore } from '@/stores/useInitialDataStore';
import ChatTest from './ChatTest';

type BootStatus = 'loading' | 'ready' | 'error';

export default function App() {
    const fetchInitialData = useInitialDataStore((state) => state.fetchInitialData);
    const [status, setStatus] = useState<BootStatus>('loading');
    const [showSplash, setShowSplash] = useState(true);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let cancelled = false;

        const initialize = async () => {
            try {
                // 認証情報が確定するまではページを描画しない。
                // 最短 250ms 表示して、ロゴだけが一瞬光る現象も避ける。
                await Promise.all([
                    fetchInitialData(),
                    new Promise<void>((resolve) => setTimeout(resolve, 400)),
                ]);

                if (!cancelled) setStatus('ready');
            } catch (error) {
                console.error('初期データの取得に失敗しました:', error);
                if (!cancelled) setStatus('error');
            }
        };

        void initialize();
        return () => { cancelled = true; };
    }, [fetchInitialData, retryCount]);

    return (
        <BrowserRouter>
            {status === 'ready' && (
                <>
                    <Routes>
                        <Route index element={<Index />} />
                        {/* 別ページもここに追加するだけで共通の初期化処理が適用される */}
                        <Route path="/world" element={<WorldIndex />} />
                        <Route path="/test">
                            <Route path="chat" element={<ChatTest/>}/>
                        </Route>
                    </Routes>
                    <LoginModal />
                </>
            )}

            {showSplash && (
                <div
                    role="status"
                    aria-live="polite"
                    aria-label="hivee 読み込み中"
                    onTransitionEnd={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            event.propertyName === 'opacity' &&
                            status === 'ready'
                        ) {
                            setShowSplash(false);
                        }
                    }}
                    className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center
                        bg-[#fff] transition-opacity duration-1000 ease-in-out pb-[50px]
                        ${status === 'ready' ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
                >
                    <img
                        src="/assets/images/index/logo.png?1"
                        alt="hivee"
                        className="h-auto w-[min(280px,65vw)]"
                        draggable={false}
                    />
                    {status === 'error' && (
                        <div className="mt-[30px] flex flex-col items-center gap-[12px] text-[#fffaf0]">
                            <p>読み込みに失敗しました。</p>
                            <button
                                type="button"
                                className="cursor-pointer rounded-full border border-[#d5b275] px-[20px] py-[8px]"
                                onClick={() => {
                                    setStatus('loading');
                                    setRetryCount((count) => count + 1);
                                }}
                            >
                                再試行
                            </button>
                        </div>
                    )}
                </div>
            )}
        </BrowserRouter>
    );
}
