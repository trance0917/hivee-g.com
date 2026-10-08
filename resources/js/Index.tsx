import styles from './Index.module.css';

export default function Index() {
    return (
        <div className={styles.page}>
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
                    <img className="h-auto w-[300px] max-w-full drop-shadow-[0_6px_8px_rgba(74,57,33,0.18)]" src="/assets/index/logo.png" alt="HIVEX" />
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
                        <span className="flex h-[34px] items-center gap-2 rounded-full border border-[rgba(173,139,79,0.48)] bg-white/43 px-[14px] text-xs tracking-[0.07em] text-[#665341]">◉ ログイン</span>
                    </div>
                </div>
            </header>

            <main className="absolute inset-0 z-[2] flex items-end justify-center pb-[5.4vh]">
                <a href="#" aria-label="今すぐプレイ">
                    <img className="w-[min(380px,31vw)] drop-shadow-[0_12px_20px_rgba(34,32,23,0.3)] transition-all duration-[250ms] ease
                        hover:-translate-y-1 hover:scale-[1.025]
                        hover:drop-shadow-[0_16px_26px_rgba(33,28,20,0.36)]
                    " src="/assets/index/play.png" alt="今すぐプレイ" />
                </a>
            </main>

            <section className="pointer-events-none absolute inset-x-[3.2%] bottom-[4vh] z-[4] grid grid-cols-[minmax(330px,390px)_1fr_minmax(330px,390px)] items-end gap-7 [&>*]:pointer-events-auto">
                <article className={`${styles.card} ${styles.news}`}>
                    <div className={styles['card-head']}>
                        <strong>最新情報</strong>
                        <span className={styles.more}>もっと見る →</span>
                    </div>

                    <div className={styles['news-row']}>
                        <img
                            className={styles.thumb}
                            src="/assets/index/background.png"
                            alt="ニュースサムネイル"
                        />
                        <div>
                            <div className={styles.tag}>NEW STORY</div>
                            <div className={styles['news-title']}>月の涙ハーブを巡る、新しい物語。</div>
                            <div className={styles.date}>2026 / 09 / 14　13:16</div>
                        </div>
                    </div>

                    <div className="flex justify-end border-t border-[rgba(178,157,117,0.28)] px-[18px] py-[11px] text-[11px] text-[#695746]">すべてのニュースを見る →</div>
                    <span className="absolute -bottom-[9px] left-1/2 size-[18px] -translate-x-1/2 rotate-45 border border-[#d5b275] bg-[#fffaf0] shadow-[0_0_0_3px_rgba(255,255,255,0.22)]" />
                </article>

                <div />

                <article className={`${styles.card} ${styles.community}`}>
                    <div className={styles['card-head']}>
                        <strong>公式コミュニティ</strong>
                        <span className={styles.more}>もっと見る →</span>
                    </div>

                    <div className={styles.community}>
                        <div className={styles.discord}>
                            <span className={styles['discord-mark']} />
                            <span>Discord</span>
                        </div>
                        <p>仲間とつながり、最新情報をチェック。</p>
                    </div>

                    <div className="relative mt-4 border-t border-[rgba(178,157,117,0.28)] pt-3 text-[11px] text-[#695746]">
                        ゲームワールドカレンダーを表示　→
                    </div>
                    <span className="absolute -bottom-[9px] left-1/2 size-[18px] -translate-x-1/2 rotate-45 border border-[#d5b275] bg-[#fffaf0] shadow-[0_0_0_3px_rgba(255,255,255,0.22)]" />
                </article>
            </section>
        </div>
    );
}
