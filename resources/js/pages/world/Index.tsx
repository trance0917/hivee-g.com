import {useEffect} from 'react';
import WorldMap from './components/WorldMap';
import TopPanel from './components/panels/TopPanel';
import BottomPanel from './components/panels/BottomPanel';
import HexInfoPanel from './components/panels/HexInfoPanel';
import { WorldMapProvider } from './context/WorldMapContext';
import {MAP_STYLE_URL} from "@/pages/world/map/config";

/** 画面構成のみ。マップとUIの実装詳細をここに増やさない。 */
export default function Index() {

    return (
        <WorldMapProvider>
            <div className="relative h-screen w-screen overflow-hidden">
                <WorldMap />
                <div className="pointer-events-none absolute inset-0 z-10">
                    <TopPanel />
                    <BottomPanel />
                    <HexInfoPanel />
                </div>
            </div>
        </WorldMapProvider>
    );
}
