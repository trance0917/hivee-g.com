<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            // アカウントの所属村。妖精の滞在場所（characters.village_id）とは別に管理する。
            $table->foreignId('village_id')
                ->nullable()
                ->after('text_id')
                ->comment('ユーザーの所属村ID（villages.id）。妖精の滞在村とは別')
                ->constrained('villages')
                ->restrictOnDelete();
        });

        // 旧キャラクター所属村からの自動移行は行わない。
        // ユーザーと複数キャラクターの所属先が異なる場合に本人の意思を推測できないため。
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('village_id');
        });
    }
};
