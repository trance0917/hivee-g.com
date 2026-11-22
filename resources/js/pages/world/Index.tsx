import { useEffect, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import CharacterCreationModal from '@/pages/world/components/panels/CharacterCreationModal';
import { useUser } from '@/stores/useInitialDataStore';
import VillageSelectionPanel from './components/panels/VillageSelectionPanel';
import WorldMap from '@/pages/world/components/WorldMap';

import TopPanel from '@/pages/world/components/panels/TopPanel';


import TopPanel2 from './components/panels/TopPanel2';
import BottomPanel from '@/pages/world/components/panels/BottomPanel';
import HexInfoPanel from '@/pages/world/components/panels/HexInfoPanel';
import { WorldMapProvider } from '@/pages/world/context/WorldMapContext';
import {MAP_STYLE_URL} from "@/pages/world/map/config";

/** 画面構成のみ。マップとUIの実装詳細をここに増やさない。 */
export default function Index() {
    const navigate = useNavigate();
    const user = useUser();
    const needsVillage = user != null && user.village_id == null;
    // 入村候補はこの画面だけの一時状態。正式な所属はAPIの成功時に反映する。
    const [candidateHex, setCandidateHex] = useState<string | null>(null);

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
                <WorldMap onVillagePick={needsVillage ? setCandidateHex : undefined} />
                {/* /worldに入ったときだけ、未作成ユーザーに最初の妖精を選んでもらう。 */}
                {needsVillage ? (
                    <VillageSelectionPanel hex={candidateHex} onCancel={() => setCandidateHex(null)} />
                ) : (
                    <CharacterCreationModal />
                )}
                <div className="pointer-events-none absolute top-[15px] inset-0 z-10">
                    <div className={`flex justify-center z-[10] transition-all duration-1000 ease-in-out
                    ${
                        isLeaveToWorld
                            ? "-translate-y-[150px] opacity-0"
                            : isEnterToWorld
                                ? "translate-y-0 delay-500 opacity-100"
                                : "-translate-y-[150px] opacity-0"
                    }
    `}>
                        <div className="pointer-events-auto relative rounded-[10px] p-[10px_15px] text-slate-800 shadow-lg backdrop-blur-[4px]
                            border border-amber-200/80 bg-gradient-to-b from-[rgba(255,254,250,0.9)] to-[rgba(251,248,234,0.8)]
                            before:pointer-events-none before:absolute before:inset-[2px] before:rounded-[7px] before:border before:border-[rgba(194,159,102,0.3)] before:content-['']">
                            <TopPanel onLeaveClick={onLeaveClick('/')} />

                            <img className="absolute left-[-5px] top-1/2 -translate-y-1/2 w-[12px] pointer-events-none" src="/assets/images/decoration-side-1.png" alt=""/>
                            <img className="absolute right-[-5px] top-1/2 -translate-y-1/2 w-[12px] pointer-events-none" src="/assets/images/decoration-side-1.png" alt=""/>

                            <img className="absolute top-[-13px] w-[70px] left-1/2 -translate-x-1/2 pointer-events-none" src="/assets/images/decoration-a-top.png" alt=""/>
                        </div>
                    </div>

                    {/* 入村中は地図を広く使い、通常のマス情報は入村後に表示する。 */}
                    {!needsVillage && <>
                        <BottomPanel />
                        <HexInfoPanel />
                    </>}
                </div>
            </div>
        </WorldMapProvider>
    );
}
