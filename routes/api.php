<?php
use App\Events\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\InitialDataController;
use App\Http\Controllers\Api\ChatController;


Route::get('/initial-data', InitialDataController::class);
Route::get('/chat/messages', [ChatController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/chat/send', [ChatController::class, 'store'])->middleware('throttle:15,1');
});
//
//Route::post('/chat/send', function (Request $request) {
//    $request->validate(['message' => 'required|string']);
//
//    // イベントを発火してReverb（WebSocket）へメッセージを飛ばす
//    broadcast(new ChatMessage($request->message));
//
//    return response()->json(['status' => 'Message sent!']);
//});



