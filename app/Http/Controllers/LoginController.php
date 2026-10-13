<?php

namespace App\Http\Controllers;

use App\Models\Answer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Intervention\Image\ImageManager;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\UserSocialAccount;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\Notification;
use App\Services\UserService;
use Illuminate\Support\Facades\Password;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\PngEncoder;


final class LoginController extends Controller
{
    public function loginCallback(Request $request)
    {
        $driver = request()->route('sns_auth_type');

        // ★修正: stateパラメータが 'mobile_app_' で始まっているかチェック
        $state = $request->input('state', '');
        $is_ios_app = str_starts_with($state, 'mobile_app_');

        if ($driver === 'tiktok' && $request->has('code') && $is_ios_app) {
            $code = $request->input('code');
            // アプリからのアクセスの場合のみ、アプリへ戻す
            return redirect("koibana://auth_callback?code={$code}");
        }

        $user = null;
        $is_first_time = false;
        try {
            $driver = request()->route('sns_auth_type');
            $social_user = Socialite::driver($driver)->user();
            // メールアドレスが空の場合リダイレクト
//            if (empty($social_user->email)) {
//                return redirect()->route('x_mail_not_found');
//            }
        } catch (\Exception $e) {
            return redirect()->route('index')->withErrors('ログインに失敗しました。');
        }
        DB::beginTransaction();
        try {
            // アカウントテーブルから既に登録されているか検索
            $user_social_account = UserSocialAccount::where('provider', $driver)
                ->whereHas('user')
                ->where('provider_id', $social_user->id)->first();

            // 既にアカウントがある場合
            if ($user_social_account) {
                $user = $user_social_account->user;
            } else {
                // --- 新規登録 ---
                $is_first_time = true;

                // メールアドレスで既存ユーザーを探す
                if ($social_user->email) {
                    $user = User::where('email', $social_user->email)->first();
                }

                // ユーザーが存在しなければ新規作成
                if (!$user) { // ここで $user が未定義の場合の考慮修正
                    $user = UserService::createAccount($social_user);

                    // メールアドレスがない場合（LINE等で未取得時）の処理
                    if (!$social_user->email) {
                        $user->email = null;
                        $user->email_verified_at = null;
                        $user->save();
                    } else {
                        // メール送信
                        try {
                            Mail::to($user->email, $user->name)->queue(new \App\Mails\LoginRegisterMail());
                        } catch (\Exception $e) {
                            Log::error($e);
                            report($e);
                        }
                    }

                    // サムネイル画像の自動登録処理
                    if ($social_user->avatar) {
                        UserService::saveSocialAvatar($user, $social_user->avatar);
                    }

                    // 新規登録の時のみゲスト回答を紐付ける
                    $this->linkGuestData($user);
                }

                // ソーシャルアカウント紐づけ作成
                $user->user_social_accounts()->create([
                    'provider' => $driver,
                    'provider_id' => $social_user->id,
                ]);
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            report($e);
            return redirect()->route('index')->withErrors('ユーザー情報の保存に失敗しました。');
        }
        Auth::login($user, true);
        $user->api_token = Str::random(60);
        $user->save();

        return redirect()->intended('/')->with('is_first_time', $is_first_time);
    }

    /**
     * クッキーに残っているゲスト回答をログインユーザーに紐付ける
     */
    private function linkGuestData(User $user)
    {
        // クッキーからゲスト回答情報を取得
        $guest_answers = json_decode(request()->cookie('guest_answers', '{}'), true);

        if (!empty($guest_answers) && is_array($guest_answers)) {
            // 値（answer_id）のリストを取得
            $answer_ids = array_values($guest_answers);

            // 該当する回答で、かつ user_id が NULL (未紐付け) のものを取得
            $answers = Answer::whereIn('id', $answer_ids)
                ->whereNull('user_id')
                ->with('comment') // N+1対策
                ->get();

            if ($answers->isNotEmpty()) {
                foreach ($answers as $answer) {
                    // Answerの更新
                    $answer->user_id = $user->id;
                    $answer->save();

                    // 紐づく Comment の更新
                    if ($answer->comment) {
                        $answer->comment->user_id = $user->id;
                        $answer->comment->save();
                    }

                    // ユーザーの回答数を加算
                    $user->increment('answers_count');
                }
            }

            // 紐付けが終わったのでクッキーを削除する
            Cookie::queue(Cookie::forget('guest_answers'));
        }
    }
}
