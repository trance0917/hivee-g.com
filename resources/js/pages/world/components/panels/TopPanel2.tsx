import { Link } from 'react-router-dom';
import { useWorldMapController } from '../../context/WorldMapContext';
import { useWorldUIStore } from '../../stores/useWorldUIStore';
import PanelFrame from './PanelFrame';

/** 左上：マップ操作＋各ウィンドウの表示切替。 */
export default function TopPanel2() {
    const { ready, zoomIn, zoomOut, resetView } = useWorldMapController();
    const selectionOpen = useWorldUIStore((state) => state.windows.selection);
    const hexInfoOpen = useWorldUIStore((state) => state.windows.hexInfo);
    const toggleWindow = useWorldUIStore((state) => state.toggleWindow);

    return (
        <div className="pointer-events-auto absolute left-4 top-4 z-20 w-64 max-w-[calc(100vw-2rem)]">

            <PanelFrame title="マップ操作">
                <div className="flex gap-2">
                    <button type="button" onClick={zoomIn} disabled={!ready} className="flex-1 rounded bg-slate-800 px-3 py-2 text-white disabled:opacity-50" aria-label="拡大">＋</button>
                    <button type="button" onClick={zoomOut} disabled={!ready} className="flex-1 rounded bg-slate-800 px-3 py-2 text-white disabled:opacity-50" aria-label="縮小">－</button>
                    <button type="button" onClick={resetView} disabled={!ready} className="flex-1 rounded bg-slate-800 px-3 py-2 text-xs text-white disabled:opacity-50">中心へ</button>
                </div>
                <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => toggleWindow('selection')}
                        aria-pressed={selectionOpen} className="flex-1 rounded border border-amber-300 px-2 py-1.5 text-xs hover:bg-amber-50">
                        選択パネル {selectionOpen ? '非表示' : '表示'}
                    </button>
                    <button type="button" onClick={() => toggleWindow('hexInfo')}
                        aria-pressed={hexInfoOpen} className="flex-1 rounded border border-amber-300 px-2 py-1.5 text-xs hover:bg-amber-50">
                        マス詳細 {hexInfoOpen ? '非表示' : '表示'}
                    </button>
                </div>
            </PanelFrame>
        </div>
    );
}
