<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Character;
use App\Models\User;
use Illuminate\Http\Request;

class InitialDataController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $user = User::select(['id', 'active_character_id', 'name', 'avatar'])
            ->selectAccessor(['avatar_url'])
            ->find($request->user()?->id)
            ?->makeHidden(['avatar']);

        $character = $user?->active_character_id
            ? Character::select(['id', 'text_id', 'village_id', 'name', 'specialty', 'name'])->find($user->active_character_id)
            : null;

        return response()->json([
            'user' => $user,
            'character' => $character,
        ]);
    }
}
