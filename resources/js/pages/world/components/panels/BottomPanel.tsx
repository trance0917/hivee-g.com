import PanelFrame from '@/pages/world/components/panels/PanelFrame';
import ChatPanel from '@/pages/world/components/panels/ChatPanel';

/** ワールド画面下部のUI。チャット75% + キャラクター情報25%。 */
export default function BottomPanel() {
    return (
        <div className="pointer-events-auto absolute bottom-[10px] left-[10px] right-[10px] z-20">
            <PanelFrame>
                <div className="flex h-[clamp(210px,30vh,340px)]">
                    {/* 左側：チャット */}
                    <div className="flex-[3]">
                        <ChatPanel />
                    </div>

                    {/* 右側：キャラクターの状態。現時点では画面の仮置きのみ */}
                    {/*<aside className="flex min-w-0 flex-1 flex-col gap-[8px] border-l border-white/20 p-[10px] text-xs">*/}
                    {/*    <h2 className="text-sm font-semibold">キャラクター</h2>*/}
                    {/*    <div className="space-y-[5px] text-slate-300">*/}
                    {/*        <p>名前：―</p>*/}
                    {/*        <p>職業：―</p>*/}
                    {/*        <p>Lv：―</p>*/}
                    {/*    </div>*/}
                    {/*    <div className="mt-auto space-y-[5px]">*/}
                    {/*        <div className="flex items-center justify-between gap-[8px]"><span>HP</span><span>― / ―</span></div>*/}
                    {/*        <div className="h-[8px] rounded bg-white/15" />*/}
                    {/*        <div className="flex items-center justify-between gap-[8px]"><span>体力</span><span>― / ―</span></div>*/}
                    {/*        <div className="h-[8px] rounded bg-white/15" />*/}
                    {/*    </div>*/}
                    {/*</aside>*/}
                </div>
            </PanelFrame>
        </div>
    );
}
