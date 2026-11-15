<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 旧DMをユーザー単位で引き継げない行があれば停止する。
        // 旧宛先キャラクターが消える前に、recipient_user_id の補正が必要。
        $unresolvedDmCount = DB::table('chat_messages')
            ->where('type', 4)
            ->whereNull('recipient_user_id')
            ->count();

        if ($unresolvedDmCount > 0) {
            throw new RuntimeException(
                "DMの受信ユーザーが未設定の履歴が {$unresolvedDmCount} 件あります。".
                ' chat_messages.recipient_user_id を補正してから再実行してください。'
            );
        }

        // チャットはユーザー同士。旧キャラクター列・外部キーは不要。
        // 旧チャットのキャラクターIDの履歴値は削除されるため、必要なら事前にバックアップする。
        Schema::table('chat_messages', function (Blueprint $table): void {
            $table->dropForeign('chat_messages_character_id_foreign');
            $table->dropForeign('chat_messages_recipient_character_id_foreign');
            $table->dropColumn([
                'character_id',
                'sender_character_text_id',
                'recipient_character_id',
                'recipient_character_text_id',
            ]);
        });

        // 妖精の選択はユーザーの認証・チャット・所属村に関与しない。
        Schema::table('users', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('active_character_id');
        });

        // 妖精個別の公開チャット宛先を廃止する。妖精の内部IDは引き続き保持。
        Schema::table('characters', function (Blueprint $table): void {
            $table->dropUnique('characters_text_id_unique');
            $table->dropColumn('text_id');
        });
    }

    public function down(): void
    {
        // 取り除いたIDの過去値までは復元できない。戻す前にバックアップを確認する。
        Schema::table('characters', function (Blueprint $table): void {
            $table->string('text_id', 32)->nullable()
                ->comment('旧公開キャラクターID（復旧用。既存の値は復元されない）');
            $table->unique('text_id', 'characters_text_id_unique');
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->foreignId('active_character_id')->nullable()
                ->comment('旧操作中キャラクターID（復旧用。既存の値は復元されない）')
                ->constrained('characters')->nullOnDelete();
        });

        Schema::table('chat_messages', function (Blueprint $table): void {
            $table->foreignId('character_id')->nullable()
                ->comment('旧送信キャラクター（復旧用。既存の値は復元されない）')
                ->constrained('characters')->restrictOnDelete();
            $table->string('sender_character_text_id', 32)->nullable()
                ->comment('旧送信キャラクター公開ID（復旧用）');
            $table->foreignId('recipient_character_id')->nullable()
                ->comment('旧受信キャラクター（復旧用。既存の値は復元されない）')
                ->constrained('characters')->restrictOnDelete();
            $table->string('recipient_character_text_id', 32)->nullable()
                ->comment('旧受信キャラクター公開ID（復旧用）');
        });
    }
};
