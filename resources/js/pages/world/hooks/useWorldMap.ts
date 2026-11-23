import { useEffect, useEffectEvent, useRef } from 'react';
import type { RefObject } from 'react';
import * as maplibregl from 'maplibre-gl';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
maplibregl.setWorkerUrl(workerUrl);
import { latLngToCell } from 'h3-js';
import { useWorldMapController } from '@/pages/world/context/WorldMapContext';
import { useWorldStore } from '@/pages/world/stores/useWorldStore';
import { useWorldUIStore } from '@/pages/world/stores/useWorldUIStore';
import {
    H3_RESOLUTION, MAP_BEARING, MAP_MAX_ZOOM,
    MAP_MIN_ZOOM, MAP_PITCH, MAP_STYLE_URL, MAP_ZOOM,
} from '@/pages/world/map/config';
import { addH3Layers, updateSelectedGrid, updateVisibleGrid } from '@/pages/world/map/h3Grid';
import { attachRegisteredHexLayer } from '@/pages/world/map/registeredHexLayer';

/** MapLibre初期化・H3描画・クリック操作・後片付けをひとまとめに。 */
export function useWorldMap(container: RefObject<HTMLDivElement | null>, onVillagePick?: (hex: string) => void): void {
    const mapRef = useRef<maplibregl.Map | null>(null);
    const { registerMap, homeCenter } = useWorldMapController();
    const centerRef = useRef(homeCenter);
    const selectedHexes = useWorldStore((state) => state.selectedHexes);

    // 地図を作り直さず、クリック時点の最新の入村状態に従って振り分ける。
    const handleHexClick = useEffectEvent((hex: string) => {
        if (onVillagePick) {
            onVillagePick(hex);
            return;
        }
        // イベント内ではgetState()を使い、古いReactクロージャを参照しない。
        useWorldStore.getState().toggleHex(hex);
        useWorldUIStore.getState().openWindow('hexInfo');
    });

    // 初回はこの座標で地図を生成し、入村確定時は表示中の地図の中心だけを更新する。
    useEffect(() => {
        centerRef.current = homeCenter;
        mapRef.current?.setCenter(homeCenter);
    }, [homeCenter]);

    useEffect(() => {
        if (!container.current || mapRef.current) return;

        const map = new maplibregl.Map({
            container: container.current,
            style: MAP_STYLE_URL,
            center: centerRef.current,
            zoom: MAP_ZOOM,
            pitch: MAP_PITCH,
            bearing: MAP_BEARING,
            doubleClickZoom: false,
            minZoom: MAP_MIN_ZOOM,
            maxZoom: MAP_MAX_ZOOM,
            dragRotate: true,
            pitchWithRotate: false,
            touchPitch: false, // スマホの2本指で角度変更を禁止する
        });
        mapRef.current = map;
        let cleanupRegisteredHexes: (() => void) | null = null;

        const onMoveEnd = () => updateVisibleGrid(map);
        const onMapClick = (e: maplibregl.MapMouseEvent) => {
            const hex = latLngToCell(e.lngLat.lat, e.lngLat.lng, H3_RESOLUTION);
            handleHexClick(hex);
        };
        const onLoad = () => {
            addH3Layers(map);
            // H3選択マスの下に登録済みマスを描画（DBデータをAPIから一度取得）。
            cleanupRegisteredHexes = attachRegisteredHexLayer(map);
            updateVisibleGrid(map);
            updateSelectedGrid(map, useWorldStore.getState().selectedHexes);
            map.on('moveend', onMoveEnd);
            map.on('click', onMapClick);
            registerMap(map);
        };

        map.on('load', onLoad);
        return () => {
            cleanupRegisteredHexes?.(); // 画面離脱時にAPI取得を中断
            map.off('load', onLoad);
            map.off('moveend', onMoveEnd);
            map.off('click', onMapClick);
            registerMap(null);
            map.remove();  // 再表示時の二重初期化やWebGLリソース漏れを防ぐ。
            mapRef.current = null;
        };
    }, [container, registerMap]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map || !map.getSource('hex-grid')) return;
        updateSelectedGrid(map, selectedHexes);
    }, [selectedHexes]);
}
