import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { Map } from 'maplibre-gl';
import { MAP_BEARING, MAP_CENTER, MAP_PITCH, MAP_ZOOM } from '../map/config';

/** 複数パネルから操作するための共通インターフェース。マップ本体はZustandには入れない。 */
type MapController = {
    ready: boolean;
    registerMap: (map: Map | null) => void;
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
};

const Context = createContext<MapController | null>(null);

export function WorldMapProvider({ children }: PropsWithChildren) {
    const mapRef = useRef<Map | null>(null);
    const [ready, setReady] = useState(false);

    const registerMap = useCallback((map: Map | null) => {
        mapRef.current = map;
        setReady(map !== null);
    }, []);
    const zoomIn = useCallback(() => mapRef.current?.zoomIn({ duration: 300 }), []);
    const zoomOut = useCallback(() => mapRef.current?.zoomOut({ duration: 300 }), []);
    const resetView = useCallback(() => {
        mapRef.current?.flyTo({
            center: [MAP_CENTER.lng, MAP_CENTER.lat],
            zoom: MAP_ZOOM,
            pitch: MAP_PITCH,
            bearing: MAP_BEARING,
            duration: 800,
        });
    }, []);

    const value = useMemo(
        () => ({ ready, registerMap, zoomIn, zoomOut, resetView }),
        [ready, registerMap, zoomIn, zoomOut, resetView],
    );

    return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useWorldMapController(): MapController {
    const context = useContext(Context);
    if (!context) throw new Error('WorldMapProvider の中で呼び出してね');
    return context;
}
