<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserSocialAccount;
use App\Models\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\PngEncoder;
use Intervention\Image\ImageManager;
use Intervention\Image\Format;

class UserService{
    public static function createAccount($social_user): User
    {
        $user = User::create([
            'name' => $social_user->name,
            'email' => $social_user->email,
            'email_verified_at' => now(),
            'password' => bcrypt(Str::random(16)), // 必要ならダミーパスワード
        ]);

        //新規ユーザーに通知
        Notification::create([
            'user_id' => $user->id,
            'notification_type' => Notification::NOTIFICATION_TYPE_WELCOME,
        ]);
        return $user;
    }

    /**
     * SNSのアバター画像をダウンロードして保存するメソッド
     * UserController::profileUpdate を参考に実装
     */
    public static function saveSocialAvatar(User $user, string $avatar_url): void
    {
        try {
            // 画像データをダウンロード
            $file_contents = file_get_contents($avatar_url);
            if (!$file_contents) return;

            // ファイル名生成
            $file_name = 'avatar-' . Str::random(12) . '.png';

            // 1. v4のインスタンス生成
            $manager = ImageManager::usingDriver(Driver::class);

            // 2. バイナリデータを直接デコード
            $image = $manager->decodeBinary($file_contents);

            // 3. アバターのリサイズ（比率維持で切り抜き）
            $image->cover(240, 240);

            // 4. v4のFormat enumを使ってエンコードし、Storageに保存
            Storage::disk('public')->put(
                'users/' . $user->id . '/' . $file_name,
                (string) $image->encodeUsingFormat(Format::PNG),
                'public'
            );

            // DB更新
            $user->avatar = $file_name;
            $user->save();

        } catch (\Exception $e) {
            Log::error('SNSアバター保存失敗: ' . $e->getMessage());
        }
    }
}
