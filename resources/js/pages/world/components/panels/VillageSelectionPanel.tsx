import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import axios from 'axios';
import PanelFrame from './PanelFrame';
import { useInitialDataStore } from '@/stores/useInitialDataStore';

// dialogはモーダル操作と配置を担当し、余白の内側にPanelFrameの外周装飾まで収める。
// 背後の地図には、ログインモーダルと同じ白25%と4pxのぼかしをかける。
const dialogClass = 'm-auto max-h-[96dvh] w-[min(96vw,27rem)] overflow-auto border-0 bg-transparent px-3 pt-9 pb-4 backdrop:bg-white/25 backdrop:backdrop-blur-[4px]';

type SelectionProps = { hex: string | null; onCancel: () => void };
type VillageCandidate = { name: string | null; can_join: boolean };

/** 地図の操作はWorldMapに任せ、未所属の間だけ村選択の案内と確認を表示する。 */
export default function VillageSelectionPanel({ hex, onCancel }: SelectionProps) {
    const [acknowledged, setAcknowledged] = useState(false);
    const introDialog = useRef<HTMLDialogElement>(null);

    // 初回描画前にモーダルを開き、案内を読んでいる間は背後の地図操作を止める。
    useLayoutEffect(() => {
        const dialog = introDialog.current;
        dialog?.showModal();
        return () => dialog?.close();
    }, []);

    // 確認フレーム右上の「×」で村を選び直したときは、同じ案内を繰り返さない。
    if (acknowledged) {
        return hex ? <VillageConfirmation key={hex} hex={hex} onCancel={onCancel} /> : null;
    }

    return (
        <dialog ref={introDialog} aria-labelledby="village-selection-guide"
            onCancel={(event) => event.preventDefault()}
            className={dialogClass}>
            <PanelFrame isCenterDecoration>
                <div className="px-6 py-5 text-center">
                    <p id="village-selection-guide" className="text-base leading-relaxed">
                        地図の色がついたマスを選んで、所属する村を決めましょう。
                    </p>
                    <button type="button" onClick={() => setAcknowledged(true)}
                        className="world-primary-button mt-5">
                        了解
                    </button>
                </div>
            </PanelFrame>
        </dialog>
    );
}

function VillageConfirmation({ hex, onCancel }: { hex: string; onCancel: () => void }) {
    // 確認画面ごとのIDで、村情報の取得と入村を同じフレームに表示する。
    const loadingScope = useId();
    const dialog = useRef<HTMLDialogElement>(null);
    const submitting = useRef(false);
    const [village, setVillage] = useState<VillageCandidate | null>(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const setInitialData = useInitialDataStore((state) => state.setInitialData);
    const url = '/api/villages/' + encodeURIComponent(hex);

    useEffect(() => {
        dialog.current?.showModal();
        const controller = new AbortController();
        // 確認画面を閉じた後に、古い候補の取得結果が表示されるのを防ぐ。
        axios.get<VillageCandidate>(url, { signal: controller.signal, loadingScope })
            .then(({ data }) => setVillage(data))
            .catch((cause) => {
                if (controller.signal.aborted) return;
                setError(axios.isAxiosError(cause) && cause.response?.status === 404
                    ? 'このマスには村が登録されていません。別のマスを選んでください。'
                    : '村の情報を取得できませんでした。地図に戻って選び直してください。');
            });
        return () => controller.abort();
    }, [url, loadingScope]);

    async function join() {
        // 確定ボタンを押すまでは所属を保存しない。二重クリックは送信前に止める。
        if (submitting.current || !village?.can_join) return;
        submitting.current = true;
        setBusy(true);
        setError('');
        try {
            const { data } = await axios.post(url + '/join', undefined, { loadingScope });
            setInitialData(data);
        } catch (cause) {
            const status = axios.isAxiosError(cause) ? cause.response?.status : undefined;
            if (status === 409) {
                setError('別の画面で所属村が登録されました。ページを再読み込みしてください。');
            } else if (status === 422) {
                // 確認後に地形設定が変わった場合も、候補名を残して選び直せるようにする。
                setVillage({ ...village, can_join: false });
            } else if (status === 404) {
                setVillage(null);
                setError('この村は選択できなくなりました。別のマスを選んでください。');
            } else {
                setError('入村の結果を確認できませんでした。もう一度お試しください。');
            }
        } finally {
            submitting.current = false;
            setBusy(false);
        }
    }

    const title = village?.name ?? '村の選択';

    return (
        <dialog ref={dialog} aria-label={title}
            onCancel={(event) => { event.preventDefault(); if (!submitting.current) onCancel(); }}
            className={dialogClass}>
            {/* 入村を送信している間だけ、フレームの閉じる操作を止める。 */}
            <div className="[&_header]:mx-5 [&_header]:mt-3 [&_header]:px-4 [&_h2]:break-all [&_h2]:text-lg">
                <PanelFrame isCenterDecoration title={title} onClose={busy ? undefined : onCancel} loadingScope={loadingScope}>
                    <div className="px-6 pb-4">
                        {village && <p className="my-4">{village.can_join ? 'この村に入りますか？(移籍可能)' : 'この村は入村できません'}</p>}
                        {!village && !error && <p role="status" className="my-4">村を確認しています…</p>}
                        {error && <p role="alert" className="my-4 text-sm text-red-800">{error}</p>}
                        {village?.can_join && (
                            <div className="mt-5 text-center">
                                <button type="button" disabled={busy} onClick={join}
                                    className="world-primary-button">
                                    {busy ? '入村中…' : '入村する'}
                                </button>
                            </div>
                        )}
                    </div>
                </PanelFrame>
            </div>
        </dialog>
    );
}
