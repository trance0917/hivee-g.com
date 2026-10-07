import styles from './Index.module.css';

export default function Index() {
    return (
        <div className={styles.page}>
            <div className={styles.hero} />
            <div className={styles.vignette} />

            <header className={styles.header}>
                <nav className={styles.nav}>
                    <a href="#">ホーム</a>
                    <a href="#">ゲーム紹介</a>
                    <a href="#">ニュース</a>
                </nav>

                <div className={styles['logo-wrap']}>
                    <img className={styles.logo} src="/assets/index/logo.png" alt="HIVEX" />
                </div>

                <div className={`${styles.nav} ${styles.right}`}>
                    <a href="#">コミュニティ</a>
                    <a href="#">サポート</a>
                    <div className={styles.controls}>
            <span className={styles.pill}>
              <span className={styles.dot} /> JP
            </span>
                        <span className={styles.pill}>◉ ログイン</span>
                    </div>
                </div>
            </header>

            <main className={styles['hero-content']}>
                <a href="#" aria-label="今すぐプレイ">
                    <img className={styles.play} src="/assets/index/play.png" alt="今すぐプレイ" />
                </a>
            </main>

            <section className={styles['bottom-grid']}>
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

                    <div className={styles['card-foot']}>すべてのニュースを見る　→</div>
                    <span className={styles['small-ornament']} />
                </article>

                <div className={styles['center-spacer']} />

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

                    <div className={styles['community-link']}>
                        ゲームワールドカレンダーを表示　→
                    </div>
                    <span className={styles['small-ornament']} />
                </article>
            </section>
        </div>
    );
}
