<?php
use App\Events\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\InitialDataController;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
});


Route::get('/initial-data', InitialDataController::class);


Route::post('/chat/send', function (Request $request) {
    $request->validate(['message' => 'required|string']);

    // イベントを発火してReverb（WebSocket）へメッセージを飛ばす
    broadcast(new ChatMessage($request->message));

    return response()->json(['status' => 'Message sent!']);
});
