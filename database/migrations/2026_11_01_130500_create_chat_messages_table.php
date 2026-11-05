<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id()->comment('チャットID。最新50件や過去履歴のカーソル取得に使用');
            $table->foreignId('user_id')
                ->comment('送信アカウントID（users.id）。茶禁・権限チェック用')
                ->constrained('users')->restrictOnDelete();
            $table->foreignId('character_id')->nullable()
                ->comment('発言キャラクターの内部ID（characters.id）。公開IDの当時の値はsender_character_text_idに保存')
                ->constrained('characters')->restrictOnDelete();
            $table->string('sender_character_text_id', 32)->nullable()
                ->comment('送信時点のキャラクター公開IDの控え。改名・公開ID変更後も当時のIDを記録');
            $table->unsignedTinyInteger('type')
                ->comment('1=滞在村、2=所属村、3=全体、4=DM、5=都道府県、6=同盟、7=周囲3マス、8=周囲6マス');
            $table->unsignedBigInteger('target_id')->nullable()
                ->comment('チャット範囲のID（滞在村・所属村・都道府県・同盟）。DM・全体・周辺はNULL');
            $table->foreignId('recipient_user_id')->nullable()
                ->comment('DMの受信アカウントID。宛先キャラクターの所有者（type=4のみ）')
                ->constrained('users')->nullOnDelete();
            $table->foreignId('recipient_character_id')->nullable()
                ->comment('DMの宛先キャラクター内部ID。公開ID変更後も同じ宛先を特定（type=4のみ）')
                ->constrained('characters')->restrictOnDelete();
            $table->string('recipient_character_text_id', 32)->nullable()
                ->comment('DM送信時に指定した宛先キャラクター公開IDの控え。後で変更されても維持');
            $table->char('origin_h3', 15)->nullable()
                ->comment('周辺チャット送信時のH3セルID（固定解像度の16進表記）');
            $table->text('message')
                ->comment('チャット本文。最大文字数は送信APIで検証');
            $table->string('ip_address', 45)->nullable()
                ->comment('送信元IPアドレス（IPv4・IPv6対応、運営確認用）');
            $table->string('user_agent', 512)->nullable()
                ->comment('送信時のUser-Agent（運営確認用。APIレスポンスには原則含めない）');
            $table->timestamp('created_at')->useCurrent()
                ->comment('送信受付日時（履歴表示・並び替えに利用）');
            $table->timestamp('updated_at')->nullable()
                ->comment('メッセージ最終更新日時');
            $table->timestamp('deleted_at')->nullable()
                ->comment('管理削除日時。NULLは通常表示');

            $table->index(['type', 'target_id', 'id'], 'cm_scope_latest_idx');
            $table->index(['type', 'origin_h3', 'id'], 'cm_h3_latest_idx');
            $table->index(['type', 'recipient_user_id', 'id'], 'cm_dm_inbox_idx');
            $table->index(['type', 'user_id', 'id'], 'cm_dm_outbox_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};
