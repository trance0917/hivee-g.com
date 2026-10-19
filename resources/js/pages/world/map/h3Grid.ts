import * as maplibregl from 'maplibre-gl';
import { cellToBoundary, polygonToCells } from 'h3-js';
import type { Feature, FeatureCollection, Polygon } from 'geojson';
import { BG_GRID_MIN_ZOOM, H3_RESOLUTION } from './config';

const BG_SOURCE = 'bg-grid';
const SELECTED_SOURCE = 'hex-grid';

function polygonFromCell(hex: string): Feature<Polygon> {
    // true = H3から[経度, 緯度]（GeoJSON順）で取得する。
    const boundary = cellToBoundary(hex, true);
    const ring = boundary.map(([lng, lat]) => [lng, lat]);

    if (ring.length > 0) {
        const first = ring[0];
        const last = ring[ring.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
            ring.push([...first]);
        }
    }

    return {
        type: 'Feature',
        properties: { id: hex },
        geometry: { type: 'Polygon', coordinates: [ring] },
    };
}

function collection(hexes: Iterable<string>): FeatureCollection<Polygon> {
    return {
        type: 'FeatureCollection',
        features: Array.from(hexes, polygonFromCell),
    };
}

/** マップのload後、レイヤーを作る（React側には置かない）。 */
export function addH3Layers(map: maplibregl.Map): void {
    if (!map.getSource(BG_SOURCE)) {
        map.addSource(BG_SOURCE, {
            type: 'geojson',
            data: collection([]),
        });
        map.addLayer({
            id: 'bg-grid-line',
            type: 'line',
            source: BG_SOURCE,
            minzoom: BG_GRID_MIN_ZOOM,
            paint: { 'line-color': '#ef4444', 'line-width': 1, 'line-opacity': 0.6 },
        });
    }

    if (!map.getSource(SELECTED_SOURCE)) {
        map.addSource(SELECTED_SOURCE, {
            type: 'geojson',
            data: collection([]),
        });
        map.addLayer({
            id: 'hex-fill',
            type: 'fill',
            source: SELECTED_SOURCE,
            paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.4 },
        });
    }
}

/** 見えている範囲の背景ハニカムだけを生成。低ズームでは空にして処理を節約。 */
export function updateVisibleGrid(map: maplibregl.Map): void {
    const source = map.getSource(BG_SOURCE) as maplibregl.GeoJSONSource | undefined;
    if (!source) return;

    if (map.getZoom() < BG_GRID_MIN_ZOOM) {
        source.setData(collection([]));
        return;
    }

    const bounds = map.getBounds();
    const ring = [
        [bounds.getWest(), bounds.getNorth()],
        [bounds.getEast(), bounds.getNorth()],
        [bounds.getEast(), bounds.getSouth()],
        [bounds.getWest(), bounds.getSouth()],
        [bounds.getWest(), bounds.getNorth()],
    ];
    const hexes = polygonToCells([ring], H3_RESOLUTION, true);
    source.setData(collection(hexes));
}

/** Zustandで管理されている選択済みマスを描画に反映。 */
export function updateSelectedGrid(map: maplibregl.Map, selected: ReadonlySet<string>): void {
    const source = map.getSource(SELECTED_SOURCE) as maplibregl.GeoJSONSource | undefined;
    if (!source) return;
    source.setData(collection(selected));
}
