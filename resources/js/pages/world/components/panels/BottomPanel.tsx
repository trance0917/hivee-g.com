import { cellToLatLng } from 'h3-js';
import { useWorldStore } from '../../stores/useWorldStore';
import { useWorldUIStore } from '../../stores/useWorldUIStore';
import PanelFrame from './PanelFrame';

/** 左下：テスト版にあった選択数と座標出力。 */
export default function BottomPanel() {
    const selectedHexes = useWorldStore((state) => state.selectedHexes);
    const clearSelection = useWorldStore((state) => state.clearSelection);
    const isOpen = useWorldUIStore((state) => state.windows.selection);
    const closeWindow = useWorldUIStore((state) => state.closeWindow);
    if (!isOpen) return null;

    const exportCoordinates = () => {
        const data = Array.from(selectedHexes).map((hex) => {
            const [lat, lng] = cellToLatLng(hex);
            return { hex_id: hex, latitude: lat, longitude: lng };
        });
        console.table(data); // 元のテスト版と同じ動作
    };

    return (
        <div className="pointer-events-auto absolute bottom-4 left-4 z-20 w-72 max-w-[calc(100vw-2rem)]">
            <PanelFrame title="村配置エディタ（ハニカム）" onClose={() => closeWindow('selection')}>
                <p className="text-sm text-slate-600">マップをクリックしてマスをトグル</p>
                <p className="mt-2 text-sm font-semibold text-blue-700">選択中: {selectedHexes.size} マス</p>
                <button type="button" onClick={exportCoordinates}
                    className="mt-3 w-full rounded bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">
                    📋 座標をコンソールに出力
                </button>
                <button type="button" onClick={clearSelection}
                    className="mt-2 w-full rounded border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-50">
                    選択をクリア
                </button>
            </PanelFrame>
        </div>
    );
}
