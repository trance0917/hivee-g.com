<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_social_accounts', function (Blueprint $table) {
            $table->id();
            // user_idの外部キー制約 + カスケード削除 + 自動インデックス
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('provider')->comment('ソーシャルログインプロバイダ名');
            $table->string('provider_id')->comment('プロバイダ側のユーザーID');
            $table->timestamps();

            // ★超重要：同じプロバイダでの重複登録防止 & 検索高速化
            $table->unique(['provider', 'provider_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_social_accounts');
    }
};
