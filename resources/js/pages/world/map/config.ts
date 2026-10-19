/** Worldマップの共通設定。テスト版 MapSample.tsx の初期値を継承。 */
export const MAP_CENTER = { lng: 135.456119, lat: 34.52478 } as const;
export const MAP_ZOOM = 13;
export const MAP_PITCH = 45;
export const MAP_BEARING = -15;
export const MAP_MIN_ZOOM = 10;
export const MAP_MAX_ZOOM = 14;
export const H3_RESOLUTION = 8;

// テスト版の minzoom (= H3_RESOLUTION + 3) と同じ値で描画・計算の両方を制御。
export const BG_GRID_MIN_ZOOM = H3_RESOLUTION + 3;

/**
 * .env に VITE_MAPTILER_KEY を設定すると、元コードと同じ base-v4 を表示。
 * 未設定でも開発確認できるよう、MapLibre公式デモ地図へフォールバック。
 * ※公開フロントエンドのキーは利用元ドメイン等で必ず制限する。
 */
const mapTilerKey = import.meta.env.VITE_MAPTILER_KEY;

export const MAP_STYLE_URL = mapTilerKey
    ? `https://api.maptiler.com/maps/base-v4/style.json?key=${encodeURIComponent(mapTilerKey)}`
    : 'https://demotiles.maplibre.org/style.json';
