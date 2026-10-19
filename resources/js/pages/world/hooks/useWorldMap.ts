import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import * as maplibregl from 'maplibre-gl';
import { latLngToCell } from 'h3-js';
import { useWorldMapController } from '../context/WorldMapContext';
import { useWorldStore } from '../stores/useWorldStore';
import { useWorldUIStore } from '../stores/useWorldUIStore';
import {
    H3_RESOLUTION, MAP_BEARING, MAP_CENTER, MAP_MAX_ZOOM,
    MAP_MIN_ZOOM, MAP_PITCH, MAP_STYLE_URL, MAP_ZOOM,
} from '../map/config';
import { addH3Layers, updateSelectedGrid, updateVisibleGrid } from '../map/h3Grid';

/** MapLibre初期化・H3描画・クリック操作・後片付けをひとまとめに。 */
export function useWorldMap(container: RefObject<HTMLDivElement | null>): void {
    const mapRef = useRef<maplibregl.Map | null>(null);
    const { registerMap } = useWorldMapController();
    const selectedHexes = useWorldStore((state) => state.selectedHexes);

    useEffect(() => {
        if (!container.current || mapRef.current) return;

        const map = new maplibregl.Map({
            container: container.current,
            style: MAP_STYLE_URL,
            center: [MAP_CENTER.lng, MAP_CENTER.lat],
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

        const onMoveEnd = () => updateVisibleGrid(map);
        const onMapClick = (e: maplibregl.MapMouseEvent) => {
            const hex = latLngToCell(e.lngLat.lat, e.lngLat.lng, H3_RESOLUTION);
            // イベント内ではgetState()を使い、古いReactクロージャを参照しない。
            useWorldStore.getState().toggleHex(hex);
            useWorldUIStore.getState().openWindow('hexInfo');
        };
        const onLoad = () => {
            addH3Layers(map);
            updateVisibleGrid(map);
            updateSelectedGrid(map, useWorldStore.getState().selectedHexes);
            map.on('moveend', onMoveEnd);
            map.on('click', onMapClick);
            registerMap(map);
        };

        map.on('load', onLoad);
        return () => {
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
