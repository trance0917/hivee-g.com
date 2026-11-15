<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('chat_messages', function (Blueprint $table): void {
            $table->string('sender_user_text_id')->after('character_id')->nullable()
                ->comment('送信時点のユーザー公開IDの控え');
            $table->string('recipient_user_text_id')->after('recipient_character_id')->nullable()
                ->comment('DM送信時点の宛先ユーザー公開IDの控え');
        });

        // 旧履歴は user_id / recipient_user_id で引き続き閲覧可能。
        // 当時のユーザー公開IDは復元できないため、過去レコードのスナップショットは補完しない。
    }

    public function down(): void
    {
        Schema::table('chat_messages', function (Blueprint $table): void {
            $table->dropColumn(['sender_user_text_id', 'recipient_user_text_id']);
        });
    }
};
