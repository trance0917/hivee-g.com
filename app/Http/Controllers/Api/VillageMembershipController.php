<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Village;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VillageMembershipController extends Controller
{
    public function show(Village $village): JsonResponse
    {
        // 名前のない村だけ、地形マスタから表示名を取得する。
        return response()->json(['name' => $village->name ?? $village->terrain?->name]);
    }

    public function join(Request $request, Village $village, InitialDataController $initialData): JsonResponse
    {
        DB::transaction(function () use ($request, $village): void {
            // 初回入村専用。二つのタブから別々の村を選んでも、先に確定した所属を守る。
            $user = User::query()->lockForUpdate()->findOrFail($request->user()->id);
            if ($user->village_id === $village->id) {
                return; // 同じ村への再送は成功として扱う。
            }
            abort_if($user->village_id !== null, 409, 'すでに別の村に所属しています。');

            $user->village()->associate($village);
            $user->save();
        });

        // 最新の所属と所有妖精をまとめて返し、画面側で次の手順を判定する。
        return $initialData($request);
    }
}
