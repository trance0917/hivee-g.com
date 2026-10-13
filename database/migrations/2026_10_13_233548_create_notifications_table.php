<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id()->comment('通知のユニークID');
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->integer('notification_type')->index()->comment('通知タイプ');

            // related_type, related_id とその複合インデックスを一発で生成
            $table->nullableMorphs('related');

            $table->string('value')->nullable()->comment('何かしらのデータ');
            $table->timestamp('read_at')->nullable()->comment('既読日時（nullなら未読）');
            $table->timestamp('notified_at')->useCurrent()->comment('通知日時');
            $table->timestamps();

            // ★追加推奨：未読通知一覧の取得を爆速にする複合インデックス
            $table->index(['user_id', 'read_at', 'notified_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
