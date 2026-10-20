import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
    title: string;
    onClose?: () => void;
}>;

/** 各パネルでスタイルを統一するための共通枠。配置位置は親コンポーネントで決定。 */
export default function PanelFrame({ title, onClose, children }: Props) {
    return (
        <section className="pointer-events-auto w-full rounded-[10px] border border-amber-200/80 bg-gradient-to-b from-[rgba(255,254,250,0.9)] to-[rgba(251,248,234,0.8)] p-[10px] text-slate-800 shadow-lg backdrop-blur-[4px]
            before:pointer-events-none before:absolute before:inset-[2px] before:rounded-[7px] before:border before:border-[rgba(194,159,102,0.3)] before:content-['']
        ">
            <img className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-[14px] pointer-events-none" src="/assets/images/decoration-side-1.png" alt=""/>
            <img className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-[14px] pointer-events-none" src="/assets/images/decoration-side-1.png" alt=""/>

            <img className="absolute bottom-[-10px] w-[100px] left-1/2 -translate-x-1/2 pointer-events-none" src="/assets/images/decoration-b-bottom.png" alt=""/>
            <img className="absolute top-[-7px] left-[-9px] w-[60px] pointer-events-none" src="/assets/images/decoration-b-corner-tl.png?" alt=""/>
            <img className="absolute right-[-7px] bottom-[-6px] w-[60px] pointer-events-none" src="/assets/images/decoration-b-corner-br.png" alt=""/>

            <header className="mb-3 flex items-center justify-between gap-3 border-b border-amber-200/70 pb-2">
                <h2 className="text-sm font-semibold">{title}</h2>
                {onClose && (
                    <button type="button" onClick={onClose} aria-label={`${title}を閉じる`}
                        className="rounded px-2 py-0.5 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                        ×
                    </button>
                )}
            </header>
            {children}
        </section>
    );
}
