import { useEffect, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import WorldMap from './components/WorldMap';

import TopPanel from './components/panels/TopPanel';


import TopPanel2 from './components/panels/TopPanel2';
import BottomPanel from './components/panels/BottomPanel';
import HexInfoPanel from './components/panels/HexInfoPanel';
import { WorldMapProvider } from './context/WorldMapContext';
import {MAP_STYLE_URL} from "@/pages/world/map/config";

/** 画面構成のみ。マップとUIの実装詳細をここに増やさない。 */
export default function Index() {
    const navigate = useNavigate();

    const [isLeaveToWorld, setIsLeaveToWorld] = useState(false);
    const [isEnterToWorld, setIsEnterToWorld] = useState(false);
    useEffect(() => {
        setIsEnterToWorld(true);
    });
    const onLeaveClick = (path: string) => (e: MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();

        if (isLeaveToWorld) return;

        setIsLeaveToWorld(true);

        setTimeout(() => {
            navigate(path);
        }, 700);
    };

    return (
        <WorldMapProvider>
            <div className="relative h-screen w-screen overflow-hidden">
                <WorldMap />
                <div className="pointer-events-none absolute inset-0 z-10 px-[10px] mt-[15px]">
                    <div className={`flex justify-center z-[10] transition-all duration-1000 ease-in-out
                    ${
                        isLeaveToWorld
                            ? "-translate-y-[150px] opacity-0"
                            : isEnterToWorld
                                ? "translate-y-0 delay-500 opacity-100"
                                : "-translate-y-[150px] opacity-0"
                    }
    `}>
                        <div className="pointer-events-auto relative rounded-[10px] p-[15px_20px] text-slate-800 shadow-lg backdrop-blur-[4px]
                            border border-amber-200/80 bg-gradient-to-b from-[rgba(255,254,250,0.9)] to-[rgba(251,248,234,0.8)]
                            before:pointer-events-none before:absolute before:inset-[2px] before:rounded-[7px] before:border before:border-[rgba(194,159,102,0.3)] before:content-['']">
                            <TopPanel onLeaveClick={onLeaveClick('/')} />

                            <img className="absolute left-[-8px] top-1/2 -translate-y-1/2 w-[14px] pointer-events-none" src="/assets/images/decoration-side-1.png" alt=""/>
                            <img className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-[14px] pointer-events-none" src="/assets/images/decoration-side-1.png" alt=""/>

                            <img className="absolute top-[-15px] w-[80px] left-1/2 -translate-x-1/2 pointer-events-none" src="/assets/images/decoration-a-top.png" alt=""/>

                        </div>
                    </div>

                    <TopPanel2 />
                    <BottomPanel />
                    <HexInfoPanel />
                </div>
            </div>
        </WorldMapProvider>
    );
}
