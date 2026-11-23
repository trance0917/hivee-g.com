import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { Map } from 'maplibre-gl';

import { MAP_BEARING, MAP_CENTER, MAP_PITCH, MAP_ZOOM } from '@/pages/world/map/config';
import { useUser } from '@/stores/useInitialDataStore';

/** 複数パネルから操作するための共通インターフェース。マップ本体はZustandには入れない。 */
type MapController = {
    homeCenter: [number, number];
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
    const village = useUser()?.village;
    const lng: number = village?.longitude ?? MAP_CENTER.lng;
    const lat: number = village?.latitude ?? MAP_CENTER.lat;
    // MapLibreは経度・緯度の順。初期データを再取得しても同じ座標なら視点を維持する。
    const homeCenter = useMemo<[number, number]>(() => [lng, lat], [lng, lat]);

    const registerMap = useCallback((map: Map | null) => {
        mapRef.current = map;
        setReady(map !== null);
    }, []);
    const zoomIn = useCallback(() => mapRef.current?.zoomIn({ duration: 300 }), []);
    const zoomOut = useCallback(() => mapRef.current?.zoomOut({ duration: 300 }), []);
    const resetView = useCallback(() => {
        mapRef.current?.flyTo({
            center: homeCenter,
            zoom: MAP_ZOOM,
            pitch: MAP_PITCH,
            bearing: MAP_BEARING,
            duration: 800,
        });
    }, [homeCenter]);

    const value = useMemo(
        () => ({ ready, registerMap, zoomIn, zoomOut, resetView, homeCenter }),
        [ready, registerMap, zoomIn, zoomOut, resetView, homeCenter],
    );

    return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useWorldMapController(): MapController {
    const context = useContext(Context);
    if (!context) throw new Error('WorldMapProvider の中で呼び出してね');
    return context;
}
