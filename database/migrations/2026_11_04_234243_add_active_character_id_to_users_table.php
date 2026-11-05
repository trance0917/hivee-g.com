<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('active_character_id')
                ->nullable()
                ->comment('現在ゲームで使用中のキャラクター内部ID（characters.id）。未選択ならNULL')
                ->after('id')
                ->constrained('characters')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            Schema::table('users', function (Blueprint $table) {
                $table->dropConstrainedForeignId('active_character_id');
            });
        });
    }
};
