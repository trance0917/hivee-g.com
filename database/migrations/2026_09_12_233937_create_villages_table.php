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
        Schema::table('villages', function (Blueprint $table) {
            // change() をつけることで既存カラムの定義を更新できる
            $table->string('name', 32)->nullable()->change();

            // terrain_code のデフォルト値を 'plain' に設定
            $table->string('terrain_code', 32)->default('plain')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('villages', function (Blueprint $table) {
            // ロールバック時は元の NOT NULL に戻す
            $table->string('name', 32)->nullable(false)->change();
            $table->string('terrain_code', 32)->default(null)->change();
        });
    }
};
