import { Link } from 'react-router-dom';
import { useWorldMapController } from '../../context/WorldMapContext';
import { useWorldUIStore } from '../../stores/useWorldUIStore';
import type { MouseEvent } from 'react';
import PanelFrame from './PanelFrame';
type TopPanelProps = {
    onLeaveClick: (e: MouseEvent<HTMLAnchorElement>) => void;
};

/** 左上：マップ操作＋各ウィンドウの表示切替。 */
export default function TopPanel({ onLeaveClick }: TopPanelProps) {
    const { ready, zoomIn, zoomOut, resetView } = useWorldMapController();
    const selectionOpen = useWorldUIStore((state) => state.windows.selection);
    const hexInfoOpen = useWorldUIStore((state) => state.windows.hexInfo);
    const toggleWindow = useWorldUIStore((state) => state.toggleWindow);

    return (
        <>
            <ul className="flex justify-center gap-[10px]">
                <li>
                    <Link to="/" className="flex flex-col items-center" onClick={onLeaveClick}>
                        <img className="w-[46px]" src="/assets/images/menu/icon-home.png" />
                        <span className="text-[12px] text-slate-500">ホーム</span>
                    </Link>
                </li>
                <li>
                    <Link to="/" className="flex flex-col items-center" onClick={onLeaveClick}>
                        <img className="w-[46px]" src="/assets/images/menu/icon-user.png" />
                        <span className="text-[12px] text-slate-500">マイページ</span>
                    </Link>
                </li>
            </ul>
        </>
    );
}
