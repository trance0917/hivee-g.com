import { useRef } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useWorldMap } from '../hooks/useWorldMap';

/** マップ表示専用。ボタンやパネルはここへ入れない。 */
export default function WorldMap() {
    const containerRef = useRef<HTMLDivElement>(null);
    useWorldMap(containerRef);

    return <div ref={containerRef} className="h-full w-full" aria-label="ワールドマップ" />;
}
