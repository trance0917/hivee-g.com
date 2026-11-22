<?php
use App\Events\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\InitialDataController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\VillageController;
use App\Http\Controllers\Api\VillageMembershipController;

Route::get('/initial-data', InitialDataController::class);
Route::get('/chat/messages', [ChatController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    // 地図上のH3セルを村に解決し、確認後のPOSTだけで所属を登録する。
    Route::get('/villages/{village:hex_id}', [VillageMembershipController::class, 'show']);
    Route::post('/villages/{village:hex_id}/join', [VillageMembershipController::class, 'join'])->middleware('throttle:15,1');
    Route::post('/characters', \App\Http\Controllers\Api\CreateCharacterController::class)->middleware('throttle:15,1');
//    Route::get('/user', function (Request $request) {
//        return $request->user();
//    });
    Route::post('/chat/send', [ChatController::class, 'store'])->middleware('throttle:15,1');
});

Route::get('/get-registed-villages', [VillageController::class, 'getRegistedVillages']);

//
//Route::post('/chat/send', function (Request $request) {
//    $request->validate(['message' => 'required|string']);
//
//    // イベントを発火してReverb（WebSocket）へメッセージを飛ばす
//    broadcast(new ChatMessage($request->message));
//
//    return response()->json(['status' => 'Message sent!']);
//});



