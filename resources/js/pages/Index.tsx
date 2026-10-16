import {useEffect, useRef, useState} from 'react';
import Header from "@/components/Header";
import { useLoginModal } from "@/contexts/LoginModalContext";

export default function Index() {
    const { openLoginModal } = useLoginModal();
    const [isOpen, setIsOpen] = useState(false);

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

                <Header />

                <main className="absolute inset-0 z-[2] flex items-end justify-center pb-[5.4vh]">
                    <button
                        type="button"
                        onClick={openLoginModal}
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

            </div>
        </>
    );
}
