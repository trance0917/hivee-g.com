<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_bans', function (Blueprint $table) {
            $table->id()->comment('茶禁レコードID');
            $table->foreignId('user_id')
                ->comment('発言禁止の対象アカウントID（キャラクター変更後も禁止）')
                ->constrained('users')->cascadeOnDelete();
            $table->foreignId('moderator_user_id')->nullable()
                ->comment('茶禁を登録した管理者ID。自動判定ならNULL')
                ->constrained('users')->nullOnDelete();
            $table->string('reason', 500)->nullable()
                ->comment('茶禁理由（管理用）');
            $table->dateTime('expires_at')->nullable()
                ->comment('茶禁終了日時。NULLは無期限。早期解除は現在日時に更新');
            $table->timestamp('created_at')->nullable()
                ->comment('茶禁登録日時');
            $table->timestamp('updated_at')->nullable()
                ->comment('最終更新日時（解除操作による期限変更時も更新）');

            $table->index(['user_id', 'expires_at'], 'cb_active_user_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_bans');
    }
};
