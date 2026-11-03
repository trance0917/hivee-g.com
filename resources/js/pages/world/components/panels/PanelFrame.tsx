import {PropsWithChildren, useEffect} from 'react';

type Props = PropsWithChildren<{
    title?: string;
    onClose?: () => void;
    isCenterDecoration?: boolean;
}>;

/** 各パネルでスタイルを統一するための共通枠。配置位置は親コンポーネントで決定。 */
export default function PanelFrame({ title, onClose, isCenterDecoration = false, children }: Props) {
    return (
        <section className="relative pointer-events-auto w-full rounded-[10px] border border-amber-200/80 bg-gradient-to-b from-[rgba(255,254,250,0.8)] to-[rgba(251,248,234,0.7)] p-[5px_5px] text-slate-800 shadow-lg backdrop-blur-[4px]
            before:pointer-events-none before:absolute before:inset-[2px] before:rounded-[7px] before:border before:border-[rgba(194,159,102,0.3)] before:content-['']
        ">
            <img className="absolute left-[-7px] top-1/2 -translate-y-1/2 w-[14px] pointer-events-none" src="/assets/images/decoration-side-1.png" alt=""/>
            <img className="absolute right-[-7px] top-1/2 -translate-y-1/2 w-[14px] pointer-events-none" src="/assets/images/decoration-side-1.png" alt=""/>

            {isCenterDecoration && (
                <img className="absolute top-[-32px] left-1/2 -translate-x-1/2 w-[90px] pointer-events-none" src="/assets/images/decoration-b-top.png" alt=""/>
            )}

            <img className="absolute bottom-[-10px] w-[100px] left-1/2 -translate-x-1/2 pointer-events-none" src="/assets/images/decoration-b-bottom.png" alt=""/>
            <img className="absolute top-[-7px] left-[-9px] w-[60px] pointer-events-none" src="/assets/images/decoration-b-corner-tl.png?" alt=""/>
            <img className="absolute right-[-7px] bottom-[-6px] w-[60px] pointer-events-none" src="/assets/images/decoration-b-corner-br.png" alt=""/>

            {title && (
                <header className="mb-[10px] flex items-center justify-between gap-[10px] border-b border-amber-200/70 pb-[8px]">
                    <h2 className="text-sm font-semibold">{title}</h2>
                </header>
            )}

            {onClose && (
                <button type="button" onClick={onClose} aria-label={`${title}を閉じる`}
                        className="absolute right-[8px] top-[8px] rounded px-[5px] py-[3px] text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                    ×
                </button>
            )}
            {children}
        </section>
    );
}
