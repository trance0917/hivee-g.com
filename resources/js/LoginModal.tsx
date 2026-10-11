// LoginModal.tsx

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/25 backdrop-blur-[4px] animate-in fade-in duration-400"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-[540px] mb-[20px] rounded-[28px] border-2 border-[#e3d1ac] bg-gradient-to-b from-[rgba(253,247,245,0.85)] to-[rgba(244,236,208,0.75)] p-[25px] pt-[50px] pb-[35px] shadow-[0_20px_50px_rgba(15,23,20,0.35),inset_0_0_0_1px_rgba(255,255,255,0.7)] backdrop-blur-[12px]"
                onClick={(e) => e.stopPropagation()}
            >

                <img className="absolute top-[-46px] w-[220px] left-1/2 -translate-x-1/2 pointer-events-none" src="/assets/decoration-a-top.png?" alt=""/>
                <img className="absolute bottom-[-26px] w-[160px] left-1/2 -translate-x-1/2 pointer-events-none" src="/assets/decoration-a-bottom.png" alt=""/>
                <img className="absolute top-[-30px] left-[-20px] w-[70px] pointer-events-none" src="/assets/decoration-a-corner-br.png" alt=""/>
                <img className="absolute right-[-20px] bottom-[-30px] w-[70px] pointer-events-none" src="/assets/decoration-a-corner-tl.png" alt=""/>

                {/* 閉じるボタン */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-[20px] top-[20px] flex size-6 items-center justify-center text-xl text-[#8e7a63] transition hover:scale-110 hover:text-[#524434]"
                    aria-label="閉じる"
                >
                    ✕
                </button>

                {/* モーダルヘッダー */}
                <div className="mb-[40px]">
                    <h2 className="flex justify-center">
                        <img className="h-auto w-[380px] max-w-full"
                             src="/assets/login-title.png"
                             alt=""
                        />
                    </h2>
                    <div
                        className="mt-[12px] flex items-center justify-center gap-[6px] text-[12px] tracking-[0.08em] text-[#8e7960]">
                        <span><img className="w-[60px] -scale-x-100" src="/assets/needle-1.png" alt=""/></span>
                        <span>ログインして、精霊樹の成長をはじめよう</span>
                        <span><img className="w-[60px]" src="/assets/needle-1.png" alt=""/></span>
                    </div>
                </div>

                <div className="buttons flex flex-col items-center gap-[12px] text-[14px]">
                    <button type="button" className="buttonFrame color-google ">
                        <img className="decoration left pointer-events-none" src="/assets/decoration-side-2.png" alt=""/>
                        Googleでログイン
                        <img className="decoration right pointer-events-none" src="/assets/decoration-side-2.png" alt=""/>
                    </button>
                    <button type="button" className="buttonFrame color-x">
                        <img className="decoration left pointer-events-none" src="/assets/decoration-side-2.png" alt=""/>
                        Xでログイン
                        <img className="decoration right pointer-events-none" src="/assets/decoration-side-2.png" alt=""/>
                    </button>
                    <button type="button" className="buttonFrame color-line">
                        <img className="decoration left pointer-events-none" src="/assets/decoration-side-2.png" alt=""/>
                        LINEでログイン
                        <img className="decoration right pointer-events-none" src="/assets/decoration-side-2.png" alt=""/>
                    </button>
                </div>

                {/* フッター規約案内 */}
                <div className="mt-[35px] border-t border-[rgba(196,173,135,0.35)] pt-[20px] text-center">
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
    );
}
