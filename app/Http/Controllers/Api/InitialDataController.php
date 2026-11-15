<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Character;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InitialDataController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        // 発言・所属村の主体はユーザー。操作中の単一妖精という概念はなくす。
        $user = User::select(['id', 'text_id', 'village_id', 'name', 'avatar'])
            ->selectAccessor(['avatar_url'])
            ->find($request->user()?->id)
            ?->makeHidden(['avatar']);

        $characters = $user
            ? Character::query()
                ->where('user_id', $user->id)
                ->orderBy('slot')
                ->get(['id', 'user_id', 'slot', 'village_id', 'name', 'specialty', 'avatar'])
            : collect();

        return response()->json([
            'user' => $user,
            'characters' => $characters,
        ]);
    }
}
