<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Village;
use App\Models\VillageNeighbor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class VillageController extends Controller
{
    /**
     * 共通の取得ロジック
     */
    private function getRegisteredVillagesResponse()
    {
        return Village::query()
            ->with(['terrain:code,name,color']) // 地形名を取得
            ->select(['id', 'hex_id', 'terrain_code', 'name'])
//            ->where('prefecture_id', 28)
            ->get()
            ->map(function ($village) {
                return [
                    'hex_id' => $village->hex_id,
                    'terrain_code' => $village->terrain_code,
                    'terrain_name' => $village->terrain?->name,
                    'terrain_color' => $village->terrain?->color,
                    'name' => $village->name ?? '',
                ];
            });
    }

    /**
     * Handle the incoming request.
     */
    public function getRegistedVillages(Request $request)
    {
        return response()->json($this->getRegisteredVillagesResponse());
    }

    public function saveVillages(Request $request)
    {
        $validated = $request->validate([
            'mode' => ['required', 'string', Rule::in(['save', 'delete'])],
            'prefecture_id' => ['required', 'integer', 'exists:prefectures,id'],
            'terrain_code' => ['required', 'string', 'exists:terrains,code'],
            'villages' => ['required', 'array', 'min:1'],
            'villages.*.hex_id' => ['required', 'string', 'max:32'],
            'villages.*.latitude' => ['required', 'numeric'],
            'villages.*.longitude' => ['required', 'numeric'],
            'neighbors' => ['nullable', 'array'],
            'neighbors.*' => ['array', 'size:2'],
        ]);

        $mode = $validated['mode'];
        $hexIds = collect($validated['villages'])->pluck('hex_id');
        // ★ 渡ってきた引数ごとに処理を分ける
        if ($mode === 'delete') {
            DB::transaction(function () use ($hexIds) {
                // VillageNeighbor モデルを使って関連する隣接レコードを削除
                VillageNeighbor::whereIn('hex_id', $hexIds)
                    ->orWhereIn('neighbor_hex_id', $hexIds)
                    ->delete();

                // マス本体の削除
                Village::whereIn('hex_id', $hexIds)->delete();
            });

            return response()->json($this->getRegisteredVillagesResponse());
        }

        $prefId = $validated['prefecture_id'];
        $terrainCode = $validated['terrain_code'];

        // 一括登録用の配列を整形
        $insertData = collect($validated['villages'])->map(function ($village) use ($prefId, $terrainCode) {
            return [
                'prefecture_id' => $prefId,
                'terrain_code' => $terrainCode,
                'hex_id' => $village['hex_id'],
                'latitude' => $village['latitude'],
                'longitude' => $village['longitude'],
            ];
        })->toArray();

        // 重複した hex_id が送られてきてもエラーで落ちないように upsert か insertOrIgnore を使う
        Village::upsert(
            $insertData,
            ['hex_id'], // 重複判定キー（ユニークインデックスが必要）
        );

        DB::transaction(function () use ($insertData, $validated) {
            // マス本体の upsert
            Village::upsert($insertData, ['hex_id']);

            // 隣接関係の登録
            $neighbors = $validated['neighbors'] ?? [];
            if (! empty($neighbors)) {
                // 候補相手（第2要素）を集める
                $candidateOppositeIds = collect($neighbors)->pluck(1)->unique();

                // 相手マスが実際にDBに存在するかチェック
                $existingHexIds = Village::whereIn('hex_id', $candidateOppositeIds)
                    ->pluck('hex_id')
                    ->flip();

                // 実在するペアのみ抽出
                $neighborInserts = [];
                foreach ($neighbors as [$fromHex, $toHex]) {
                    if (isset($existingHexIds[$toHex])) {
                        $neighborInserts[] = [
                            'hex_id' => $fromHex,
                            'neighbor_hex_id' => $toHex,
                        ];
                        $neighborInserts[] = [
                            'hex_id' => $toHex,
                            'neighbor_hex_id' => $fromHex,
                        ];
                    }
                }

                if (! empty($neighborInserts)) {
                    // ★ VillageNeighbor モデル経由で insertOrIgnore
                    VillageNeighbor::insertOrIgnore($neighborInserts);
                }
            }
        });

        return response()->json($this->getRegisteredVillagesResponse());
    }
}
