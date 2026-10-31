import {Link} from 'react-router-dom';
import { useLoginModalStore } from "@/stores/useLoginModalStore";
import { useUser } from "@/stores/useInitialDataStore";
import ChatTest from '@/ChatTest';

export default function Header() {
    const openLoginModal = useLoginModalStore((state) => state.openLoginModal);
    const user = useUser();

    return (
        <header className="absolute top-[14px] inset-x-[2.8%] h-[76px] z-[5]
                    grid grid-cols-[1fr_320px_1fr] items-center pl-[25px] pr-[20px]
                    rounded-[18px] border border-[rgba(255,246,212,0.8)]
                    bg-gradient-to-b from-[rgba(255,253,246,0.9)] to-[rgba(244,240,224,0.72)]
                    backdrop-blur-[8px]
                    shadow-[0_10px_40px_rgba(26,29,22,0.16),inset_0_0_0_1px_rgba(255,255,255,0.55)]
                    before:pointer-events-none before:absolute before:inset-[3px] before:rounded-[15px] before:border before:border-[rgba(194,159,102,0.3)] before:content-['']
                    ">
            <img className="absolute left-[-10px] w-[20px] pointer-events-none" src="/assets/images/decoration-side-1.png" alt=""/>
            <img className="absolute right-[-10px] w-[20px] pointer-events-none" src="/assets/images/decoration-side-1.png" alt=""/>
            <nav className="nav flex items-center gap-[25px]
                        [&>a]:relative
                        [&>a]:whitespace-nowrap
                        [&>a]:text-[14px]
                        [&>a]:tracking-[0.08em]
                        [&>a]:text-[#6f5a45]
                        [&>a]:transition-colors

                        [&>a]:before:mr-[5px]
                        [&>a]:before:align-[1px]
                        [&>a]:before:text-[10px]
                        [&>a]:before:text-[#c59e5a]
                        [&>a]:before:content-['✦']
                        [&>a]:hover:text-[#3f372e]
                    ">
                <a href="#">ホーム</a>
                <a href="#">ゲーム紹介</a>
                <a href="#">お知らせ</a>
                <Link to="/test/chat" style={{color: 'blue'}}>
                    チャット
                </Link>
            </nav>

            <div className="relative z-[6] flex h-[70px] items-center justify-center">
                <div className="pointer-events-none absolute top-[26px] -inset-x-[14px] bottom-[10px] -z-10 blur-[6px] bg-[radial-gradient(ellipse,rgba(255,250,221,0.75),transparent_67%)]"
                     aria-hidden="true" />
                <img className="h-auto w-[240px] max-w-full" src="/assets/images/index/logo.png?1" alt="HIVEX" />
            </div>

            <div className="nav flex items-center justify-end gap-[28px]">

                <div className="flex items-center gap-[14px] ml-[20px]">

                    {/* ヘッダーのログインボタンからも開けるように変更 */}
                    {user ? (
                        <a href="/logout"
                            className="flex h-[34px] items-center gap-2 rounded-full border border-[rgba(173,139,79,0.48)] bg-white/43 px-[14px] text-xs tracking-[0.07em] text-[#665341] transition-transform hover:scale-103 active:scale-97"
                        >
                            ◉ ログアウト
                        </a>
                    ) : (
                        <button
                            onClick={openLoginModal}
                            className="flex h-[34px] items-center gap-2 rounded-full border border-[rgba(173,139,79,0.48)] bg-white/43 px-[14px] text-xs tracking-[0.07em] text-[#665341] transition-transform hover:scale-103 active:scale-97"
                        >
                            ◉ ログイン
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}
