import type { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{
    title: string;
    onClose?: () => void;
}>;

/** 各パネルでスタイルを統一するための共通枠。配置位置は親コンポーネントで決定。 */
export default function PanelFrame({ title, onClose, children }: Props) {
    return (
        <section className="pointer-events-auto w-full rounded-xl border border-amber-200/80 bg-white/90 p-4 text-slate-800 shadow-lg backdrop-blur-md">
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
