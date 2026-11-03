import { cellToBoundary, isValidCell } from 'h3-js';
import type { Map as MapLibreMap, GeoJSONSource } from 'maplibre-gl';
import type { Feature, FeatureCollection, Polygon } from 'geojson';

/** MapSample3 と同じAPIレスポンス。 */
export type RegisteredHex = {
    hex_id: string;
    terrain_code: string;
    terrain_name: string;
    terrain_color: string;
    name?: string | null;
};

const SOURCE_ID = 'registered-hex';
const FILL_ID = 'registered-hex-fill';
const BORDER_ID = 'registered-hex-border';
// テスト用 MapSample3 と同じURL（registed という綴りもそのまま）。
const API_URL = '/api/get-registed-villages';

function isRegisteredHex(item: unknown): item is RegisteredHex {
    if (!item || typeof item !== 'object') return false;
    const data = item as Partial<RegisteredHex>;
    return typeof data.hex_id === 'string'
        && typeof data.terrain_color === 'string'
        && typeof data.terrain_code === 'string'
        && typeof data.terrain_name === 'string';
}

function createPolygon(item: RegisteredHex): Feature<Polygon> {
    // GeoJSONに必要な [経度, 緯度] の順番で取得する。
    const ring = cellToBoundary(item.hex_id, true).map(([lng, lat]) => [lng, lat]);
    if (ring.length > 0) {
        const first = ring[0];
        const last = ring[ring.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) ring.push([...first]);
    }
    return {
        type: 'Feature',
        properties: {
            hex_id: item.hex_id,
            label: item.name || item.terrain_name || item.terrain_code,
            color: item.terrain_color || '#3b82f6',
        },
        geometry: { type: 'Polygon', coordinates: [ring] },
    };
}

/**
 * map の load イベント後、addH3Layers(map) を呼んだ後に実行する。
 * 既存の選択マス (hex-fill) は消さず、登録済みマスをその下に追加する。
 * 返り値の関数でAPI通信を中断できる。
 */
export function attachRegisteredHexLayer(map: MapLibreMap): () => void {
    const controller = new AbortController();
    const empty: FeatureCollection<Polygon> = { type: 'FeatureCollection', features: [] };

    if (!map.getSource(SOURCE_ID)) {
        map.addSource(SOURCE_ID, { type: 'geojson', data: empty });
    }

    // h3Grid.ts の選択レイヤー名は 'hex-fill' 。必ずそれより下に置く。
    const beforeId = map.getLayer('hex-fill') ? 'hex-fill' : undefined;
    if (!map.getLayer(FILL_ID)) {
        map.addLayer({
            id: FILL_ID,
            type: 'fill',
            source: SOURCE_ID,
            paint: {
                'fill-color': ['get', 'color'],
                'fill-opacity': 0.4,
            },
        }, beforeId);
    }
    if (!map.getLayer(BORDER_ID)) {
        map.addLayer({
            id: BORDER_ID,
            type: 'line',
            source: SOURCE_ID,
            paint: {
                'line-color': '#ffffff',
                'line-width': 1,
                'line-opacity': 1,
            },
        }, beforeId);
    }

    void (async () => {
        try {
            const response = await fetch(API_URL, {
                signal: controller.signal,
                headers: { Accept: 'application/json' },
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const raw: unknown = await response.json();
            if (!Array.isArray(raw)) throw new Error('登録済みマスAPIは配列を返す必要があります');

            // 同一H3マスの重複排除。無効なH3は描画しない。
            const unique = new Map<string, RegisteredHex>();
            for (const item of raw) {
                if (isRegisteredHex(item) && isValidCell(item.hex_id)) {
                    unique.set(item.hex_id, item);
                }
            }
            const data: FeatureCollection<Polygon> = {
                type: 'FeatureCollection',
                features: [...unique.values()].map(createPolygon),
            };
            if (controller.signal.aborted) return;
            const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
            if (source) {
                await source.setData(data);
                console.info(`[WorldMap] 登録済みマス ${data.features.length}件を描画`);
            }
        } catch (error) {
            if (!controller.signal.aborted) {
                console.error('[WorldMap] 登録済みマスの取得・描画に失敗', error);
            }
        }
    })();

    return () => controller.abort();
}
