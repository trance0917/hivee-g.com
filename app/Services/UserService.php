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

            // Intervention Image v3 で処理
            $manager = new ImageManager(new Driver());
            $image = $manager->decode($file_contents);

            // リサイズ処理 (UserControllerと同じロジック)
            $width = $image->width();
            $height = $image->height();
            if ($width > 200 || $height > 200) {
                $image->resize(200, 200);
            }

            // Storageに保存 (/users/{id}/filename)
            // ユーザーIDごとのディレクトリがないと困るので ensureDirectoryExists は Storage::put が自動でやるはずですが、パス構成は合わせます
            Storage::disk('public')->put(
                '/users/' . $user->id . '/' . $file_name,
                $image->encode(new PngEncoder()),
                'public'
            );

            // DB更新
            $user->avatar = $file_name;
            $user->save();

        } catch (\Exception $e) {
            // 画像保存に失敗してもログイン自体は止めないようにログだけ吐く
            Log::error('SNSアバター保存失敗: ' . $e->getMessage());
        }
    }
}
