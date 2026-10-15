<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // text_id: ユニーク制約付き、name の後ろに追加
            $table->string('text_id')->nullable()->unique()->comment('公開ID（文字列）')->after('name');

            // avatar: email の前に追加
            $table->string('avatar')->nullable()->comment('アバター画像のパス')->before('email');

            // SNS連携ID: remember_token の前に追加
            $table->string('x_id', 50)->nullable()->comment('X(旧Twitter)のID')->before('remember_token');
            $table->string('instagram_id', 50)->nullable()->comment('InstagramのID')->before('remember_token');

            // api_token: パスワードの後ろに追加（ユニーク制約をつけておくのが実務では一般的）
            $table->string('api_token', 80)->nullable()->unique()->comment('API用トークン')->after('password');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // ロールバック時に追加したカラムを削除する
            $table->dropColumn([
                'text_id',
                'avatar',
                'x_id',
                'instagram_id',
                'api_token'
            ]);
        });
    }
};
