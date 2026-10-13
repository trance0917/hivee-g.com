<?php

use Illuminate\Support\Facades\Route;
use Laravel\Socialite\Facades\Socialite;

// Route::get('/', function () {
//    return view('welcome');
// });

Route::get('login', function () {
    return redirect('/?is_login=1');
})->name('login');

Route::get('login/google', function () {
    session(['url.intended' => url()->previous()]);
    return Socialite::driver('google')->redirect();
})->name('login.google');
Route::get('login/twitter', function () {
    session(['url.intended' => url()->previous()]);
    return Socialite::driver('twitter')->redirect();
})->name('login.twitter');
Route::get('login/line', function () {
    session(['url.intended' => url()->previous()]);
    return Socialite::driver('line')->redirect();
})->name('login.line');
Route::get('login/tiktok', function () {
    session(['url.intended' => url()->previous()]);
    return Socialite::driver('tiktok')->redirect();
})->name('login.tiktok');

Route::get('login/google/callback', [\App\Http\Controllers\LoginController::class, 'loginCallback'])
    ->defaults('sns_auth_type', 'google');
Route::get('login/twitter/callback', [\App\Http\Controllers\LoginController::class, 'loginCallback'])
    ->defaults('sns_auth_type', 'twitter');
Route::get('login/line/callback', [\App\Http\Controllers\LoginController::class, 'loginCallback'])
    ->defaults('sns_auth_type', 'line');

Route::get('logout', function () {
    $user = auth()->user();
//    \Log::info($user->toArray());
    if ($user) {
        // 1. Cookieからトークン文字列を取得
        $token = request()->cookie('app_auth_token');
//        \Log::info($token);
        if ($token) {
            // 2. DBからそのトークンを探して削除（物理削除）
            $access_token = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
//            \Log::info($access_token->toArray());
            if ($access_token) {
                $access_token->delete();
            }
        }

        $user->api_token = Str::random(80);
        $user->save();
        auth()->logout();
    }

    return redirect()->route('index')
        ->withCookie(cookie()->forget('app_auth_token'));
})->name('logout');

Route::get('', function () {
    return view('app');
})->name('index');

Route::get('/{any}', function () {
    return view('app');
})->where('any', '^(?!api).*$');
