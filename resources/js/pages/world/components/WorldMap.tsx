import { useRef } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useWorldMap } from '@/pages/world/hooks/useWorldMap';

/** マップ表示専用。ボタンやパネルはここへ入れない。 */
export default function WorldMap({ onVillagePick }: { onVillagePick?: (hex: string) => void }) {
    const containerRef = useRef<HTMLDivElement>(null);
    // 入村中だけクリック先を村の確認画面へ渡す。
    useWorldMap(containerRef, onVillagePick);

    return <div ref={containerRef} className="h-full w-full" aria-label="ワールドマップ" />;
}
