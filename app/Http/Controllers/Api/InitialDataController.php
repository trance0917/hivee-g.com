<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Terrain;
use App\Models\User;
use Illuminate\Http\Request;

class InitialDataController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        $user = User::select(['id', 'name', 'avatar'])
            ->selectAccessor(['avatar_url'])
            ->find($request->user()?->id)
            ->makeHidden(['avatar']);

        return response()->json([
            'user' => $user,
        ]);
    }
}
