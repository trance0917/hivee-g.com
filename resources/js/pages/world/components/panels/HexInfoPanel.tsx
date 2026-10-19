import { cellToLatLng } from 'h3-js';
import { useWorldStore } from '../../stores/useWorldStore';
import { useWorldUIStore } from '../../stores/useWorldUIStore';
import PanelFrame from './PanelFrame';

/** 右上：最後にクリックしたマスの情報。ゲーム用情報の拡張ポイント。 */
export default function HexInfoPanel() {
    const activeHex = useWorldStore((state) => state.activeHex);
    const selected = useWorldStore((state) => state.selectedHexes);
    const toggleHex = useWorldStore((state) => state.toggleHex);
    const isOpen = useWorldUIStore((state) => state.windows.hexInfo);
    const closeWindow = useWorldUIStore((state) => state.closeWindow);

    if (!isOpen) return null;
    const [lat, lng] = activeHex ? cellToLatLng(activeHex) : [null, null];

    return (
        <div className="pointer-events-auto absolute right-4 top-4 z-20 w-72 max-w-[calc(100vw-2rem)]">
            <PanelFrame title="選択マスの情報" onClose={() => closeWindow('hexInfo')}>
                {activeHex ? (
                    <div className="space-y-2 text-sm">
                        <p className="break-all text-xs text-slate-500">H3 ID: {activeHex}</p>
                        <p>緯度: {lat?.toFixed(6)}</p>
                        <p>経度: {lng?.toFixed(6)}</p>
                        <p>状態: {selected.has(activeHex) ? '選択中' : '未選択'}</p>
                        <button type="button" onClick={() => toggleHex(activeHex)}
                            className="w-full rounded bg-amber-100 px-3 py-2 text-amber-950 hover:bg-amber-200">
                            {selected.has(activeHex) ? 'このマスの選択を解除' : 'このマスを選択'}
                        </button>
                    </div>
                ) : (
                    <p className="text-sm text-slate-500">マップ上の六角形をクリックしてね。</p>
                )}
            </PanelFrame>
        </div>
    );
}
