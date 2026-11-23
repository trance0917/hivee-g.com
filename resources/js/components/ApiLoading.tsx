import { useLayoutEffect, useRef } from 'react';
import { screenScope, useApiLoading } from '@/stores/useApiLoading';

export function LoadingSpinner() {
    return (
        <span role="status" className="grid size-12 place-items-center rounded-full bg-white/90 shadow-md">
            <span aria-hidden="true" className="size-7 animate-spin rounded-full border-[3px] border-amber-200 border-t-amber-800 motion-reduce:animate-none" />
            <span className="sr-only">読み込み中</span>
        </span>
    );
}

export default function ScreenLoading() {
    const loading = useApiLoading(screenScope);
    const dialog = useRef<HTMLDialogElement>(null);
    useLayoutEffect(() => {
        if (!loading) return;
        // 開いているキャラクター選択ダイアログの手前にも表示し、完了後は元の画面に戻す。
        const element = dialog.current;
        element?.showModal();
        return () => element?.close();
    }, [loading]);

    return (
        <dialog ref={dialog} aria-label="通信中" onCancel={(event) => event.preventDefault()}
            className="m-auto overflow-visible rounded-full border-0 bg-transparent p-0 outline-none backdrop:bg-white/25 backdrop:backdrop-blur-[4px]">
            <LoadingSpinner />
        </dialog>
    );
}
