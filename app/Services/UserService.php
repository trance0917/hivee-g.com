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
    public static function getData(int $user_id){
        $user = User::template();

        return $user->find($user_id);
    }
    public static function createAccount($social_user)
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
}
