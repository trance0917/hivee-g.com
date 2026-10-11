import { useState } from "react";

export default function Index() {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <>
            <style>{`
            :root {
              --ink: #56483b;
            }
            html, body, #root {
              height: 100%;
            }
            body {
              font-family: "Noto Serif JP", "Yu Mincho", serif;
              color: var(--ink);
              background-color: #142722;
              overflow: hidden;
            }
          `}</style>

            <div className="relative min-h-screen isolate overflow-hidden">
                <div className="bg-[url(/assets/index/background.png)] absolute inset-0 bg-cover bg-[center_50%] saturate-[1.0]"
                     style={{
                         backgroundImage: "url('/assets/index/background.png')",
                     }}
                />
                {/* 外枠のビネット */}
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_90px_rgba(11,25,25,0.24)]" />

                <header className="absolute top-[14px] inset-x-[2.8%] h-[76px] z-[5]
                    grid grid-cols-[1fr_320px_1fr] items-center px-[18px]
                    rounded-[18px] border border-[rgba(255,246,212,0.8)]
                    bg-gradient-to-b from-[rgba(255,253,246,0.9)] to-[rgba(244,240,224,0.72)]
                    backdrop-blur-[8px]
                    shadow-[0_10px_40px_rgba(26,29,22,0.16),inset_0_0_0_1px_rgba(255,255,255,0.55)]

                    before:content-[''] before:absolute before:top-1/2 before:-left-[7px]
                    before:size-[13px] before:-translate-y-1/2 before:rotate-45
                    before:border before:border-[#e7cb91] before:bg-[#fff9e9]
                    before:shadow-[0_0_10px_rgba(255,240,184,0.6)]

                    after:content-[''] after:absolute after:top-1/2 after:-right-[7px]
                    after:size-[13px] after:-translate-y-1/2 after:rotate-45
                    after:border after:border-[#e7cb91] after:bg-[#fff9e9]
                    after:shadow-[0_0_10px_rgba(255,240,184,0.6)]">
                    <nav className="nav flex items-center gap-[28px]
                        [&>a]:relative
                        [&>a]:whitespace-nowrap
                        [&>a]:text-[14px]
                        [&>a]:tracking-[0.08em]
                        [&>a]:text-[#6f5a45]
                        [&>a]:transition-colors

                        [&>a]:before:mr-[10px]
                        [&>a]:before:align-[1px]
                        [&>a]:before:text-[10px]
                        [&>a]:before:text-[#c59e5a]
                        [&>a]:before:content-['✦']
                        [&>a]:hover:text-[#3f372e]
                    ">
                        <a href="#">ホーム</a>
                        <a href="#">ゲーム紹介</a>
                        <a href="#">ニュース</a>
                    </nav>

                    <div className="relative z-[6] flex h-[70px] items-center justify-center">
                        <div className="pointer-events-none absolute top-[26px] -inset-x-[14px] bottom-[10px] -z-10 blur-[6px] bg-[radial-gradient(ellipse,rgba(255,250,221,0.75),transparent_67%)]"
                            aria-hidden="true" />
                        <img className="h-auto w-[240px] max-w-full" src="/assets/index/logo.png?1" alt="HIVEX" />
                    </div>

                    <div className="nav flex items-center justify-end gap-[28px]
                        [&>a]:relative
                        [&>a]:whitespace-nowrap
                        [&>a]:text-[14px]
                        [&>a]:tracking-[0.08em]
                        [&>a]:text-[#6f5a45]
                        [&>a]:transition-colors

                        [&>a]:before:mr-[10px]
                        [&>a]:before:align-[1px]
                        [&>a]:before:text-[10px]
                        [&>a]:before:text-[#c59e5a]
                        [&>a]:before:content-['✦']
                        [&>a]:hover:text-[#3f372e]
                    ">
                        <a href="#">コミュニティ</a>
                        <a href="#">サポート</a>
                        <div className="flex items-center gap-[14px] ml-[20px]">
                            <span className="flex h-[34px] items-center gap-2 rounded-full border border-[rgba(173,139,79,0.48)] bg-white/43 px-[14px] text-xs tracking-[0.07em] text-[#665341]">
                              <span className="size-[7px] shrink-0 rounded-full bg-[#bd9f69] shadow-[0_0_9px_#e4c47d]" /> JP
                            </span>
                            {/* ヘッダーのログインボタンからも開けるように変更 */}
                            <button
                                onClick={() => setIsOpen(true)}
                                className="flex h-[34px] items-center gap-2 rounded-full border border-[rgba(173,139,79,0.48)] bg-white/43 px-[14px] text-xs tracking-[0.07em] text-[#665341] transition-transform hover:scale-103 active:scale-97"
                            >
                                ◉ ログイン
                            </button>
                        </div>
                    </div>
                </header>

                <main className="absolute inset-0 z-[2] flex items-end justify-center pb-[5.4vh]">
                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        aria-label="今すぐプレイ"
                        className="cursor-pointer border-none bg-transparent outline-none"
                    >
                        <img className="animate-glow w-[min(380px,31vw)] transition-all duration-[250ms] ease
                            hover:-translate-y-1 hover:scale-[1.02]
                            active:scale-97"
                             src="/assets/index/play.png?"
                             alt="今すぐプレイ"
                        />
                    </button>
                </main>

                <section className="pointer-events-none absolute inset-x-[3.2%] bottom-[4vh] z-[4] grid grid-cols-[minmax(330px,390px)_1fr_minmax(330px,390px)] items-end gap-7 [&>*]:pointer-events-auto">
                    <article className="relative rounded-[18px] border border-[rgba(255,247,217,0.9)] bg-gradient-to-b from-[rgba(250,251,244,0.78)] to-[rgba(239,238,220,0.62)] backdrop-blur-[7px] shadow-[0_12px_34px_rgba(24,27,24,0.16),inset_0_0_0_1px_rgba(255,255,255,0.38)] before:pointer-events-none before:absolute before:inset-[7px] before:rounded-[12px] before:border before:border-[rgba(194,159,102,0.25)] before:content-['']">
                        <div className="flex items-center justify-between px-5 pb-2.5 pt-[18px] text-[14px] tracking-[0.08em]">
                            <strong>最新情報</strong>
                            <span className="text-[11px] text-[#8d795f]">もっと見る →</span>
                        </div>

                        {/* ニュースコンテンツ */}
                        <div className="grid grid-cols-[104px_1fr] items-center gap-[14px] px-5 pb-4.5 pt-1">
                            <img
                                className="h-[70px] w-[104px] rounded-[10px] border border-[rgba(201,173,121,0.55)] object-cover"
                                src="/assets/index/background.png"
                                alt="ニュースサムネイル"
                            />
                            <div>
                                <div className="mb-[5px] text-[10px] tracking-[0.12em] text-[#9f8260]">NEW STORY</div>
                                <div className="text-[13px] leading-[1.55]">月の涙ハーブを巡る、新しい物語。</div>
                                <div className="mt-1.5 text-[10px] text-[#8e8273]">2026 / 09 / 14 13:16</div>
                            </div>
                        </div>

                        {/* フッターリンク */}
                        <div className="flex justify-end border-t border-[rgba(178,157,117,0.28)] px-[18px] py-[11px] text-[11px] text-[#695746]">
                            すべてのニュースを見る →
                        </div>

                        {/* 下部のひし形飾り */}
                        <span className="absolute -bottom-[9px] left-1/2 size-[18px] -translate-x-1/2 rotate-45 border border-[#d5b275] bg-[#fffaf0] shadow-[0_0_0_3px_rgba(255,255,255,0.22)]" />
                    </article>

                    {/* 中央の余白（ヒーローの再生ボタン用） */}
                    <div />

                    {/* ===== 右：公式コミュニティカード ===== */}
                    <article className="relative rounded-[18px] border border-[rgba(255,247,217,0.9)] bg-gradient-to-b from-[rgba(250,251,244,0.78)] to-[rgba(239,238,220,0.62)] backdrop-blur-[7px] shadow-[0_12px_34px_rgba(24,27,24,0.16),inset_0_0_0_1px_rgba(255,255,255,0.38)] before:pointer-events-none before:absolute before:inset-[7px] before:rounded-[12px] before:border before:border-[rgba(194,159,102,0.25)] before:content-['']">
                        {/* ヘッダー */}
                        <div className="flex items-center justify-between px-5 pb-2.5 pt-[18px] text-[14px] tracking-[0.08em]">
                            <strong className="font-semibold">公式コミュニティ</strong>
                            <span className="text-[11px] text-[#8d795f]">もっと見る →</span>
                        </div>

                        {/* コミュニティコンテンツ */}
                        <div className="px-5 pb-4.5 pt-1 text-center">
                            <div className="my-2.5 flex items-center justify-center gap-3 font-sans text-[21px] font-bold text-[#5b61db]">
                                {/* CSS自作Discordマーク */}
                                <span className="relative h-[23px] w-[32px] rounded-[13px] bg-[#5b61db] before:absolute before:left-2 before:top-2 before:size-[5px] before:rounded-full before:bg-white before:content-[''] after:absolute after:right-2 after:top-2 after:size-[5px] after:rounded-full after:bg-white after:content-['']" />
                                <span>Discord</span>
                            </div>
                            <p className="m-0 text-[11px] text-[#796b5e]">仲間とつながり、最新情報をチェック。</p>
                        </div>

                        {/* フッターリンク */}
                        <div className="border-t border-[rgba(178,157,117,0.28)] px-[18px] py-[11px] text-center text-[11px] text-[#695746]">
                            ゲームワールドカレンダーを表示 →
                        </div>

                        {/* 下部のひし形飾り */}
                        <span className="absolute -bottom-[9px] left-1/2 size-[18px] -translate-x-1/2 rotate-45 border border-[#d5b275] bg-[#fffaf0] shadow-[0_0_0_3px_rgba(255,255,255,0.22)]" />
                    </article>
                </section>


                {/* ===== ログインモーダル ===== */}
                {isOpen && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-white/25 backdrop-blur-[4px] animate-in fade-in duration-400"
                        onClick={() => setIsOpen(false)}
                    >
                        <div
                            className="relative w-full max-w-[540px] rounded-[28px] border-2 border-[#e3d1ac] bg-gradient-to-b from-[rgba(253,247,245,0.85)] to-[rgba(244,236,208,0.75)] p-[25px] pt-[40px] pb-[20px] shadow-[0_20px_50px_rgba(15,23,20,0.35),inset_0_0_0_1px_rgba(255,255,255,0.7)] backdrop-blur-[12px]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* 閉じるボタン */}
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="absolute right-[20px] top-[20px] flex size-6 items-center justify-center text-xl text-[#8e7a63] transition hover:scale-110 hover:text-[#524434]"
                                aria-label="閉じる"
                            >
                                ✕
                            </button>

                            {/* モーダルヘッダー */}
                            <div className="mb-[24px]">
                                <h2 className="flex justify-center">
                                    <img className="h-auto w-[380px] max-w-full"
                                         src="/assets/login-title.png"
                                         alt=""
                                    />
                                </h2>
                                <div
                                    className="mt-[8px] flex items-center justify-center gap-[6px] text-[12px] tracking-[0.08em] text-[#8e7960]">
                                    <span><img className="w-[60px] -scale-x-100" src="/assets/needle-1.png" alt=""/></span>
                                    <span>ログインして、精霊樹の成長をはじめよう</span>
                                    <span><img className="w-[60px]" src="/assets/needle-1.png" alt=""/></span>
                                </div>
                            </div>

                            <div className="buttons flex flex-col items-center gap-[12px] text-[14px]">
                                <button type="button" className="buttonFrame color-google ">
                                    <img className="decoration left" src="/assets/decoration-side-2.png" alt=""/>
                                    Googleでログイン
                                    <img className="decoration right" src="/assets/decoration-side-2.png" alt=""/>
                                </button>
                                <button type="button" className="buttonFrame color-x">
                                    <img className="decoration left" src="/assets/decoration-side-2.png" alt=""/>
                                    Xでログイン
                                    <img className="decoration right" src="/assets/decoration-side-2.png" alt=""/>
                                </button>
                                <button type="button" className="buttonFrame color-line">
                                    <img className="decoration left" src="/assets/decoration-side-2.png" alt=""/>
                                    LINEでログイン
                                    <img className="decoration right" src="/assets/decoration-side-2.png" alt=""/>
                                </button>
                            </div>

                            {/* フッター規約案内 */}
                            <div className="mt-6 border-t border-[rgba(196,173,135,0.35)] pt-4 text-center">
                                <p className="text-[11px] leading-[1.6] text-[#867563]">
                                    ログインすることで
                                    <a href="#" className="underline hover:text-[#4d3d2e] mx-0.5">利用規約</a>・
                                    <a href="#"
                                       className="underline hover:text-[#4d3d2e] mx-0.5">プライバシーポリシー</a>
                                    に同意したものとみなされます。
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
