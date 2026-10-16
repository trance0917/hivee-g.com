<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Terrain;
use Illuminate\Http\Request;

class InitialDataController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        return response()->json([
            'user' => $request->user()?->makeHidden('email'),
        ]);
    }
}
