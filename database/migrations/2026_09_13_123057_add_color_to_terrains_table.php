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
        Schema::table('terrains', function (Blueprint $table) {
            // カラーコード（HEX形式: #3b82f6 等）を格納
            // 既存レコードでエラーが出ないようデフォルト値をセット
            $table->string('color', 7)->default('#3b82f6')->after('default_resources');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('terrains', function (Blueprint $table) {
            $table->dropColumn('color');
        });
    }
};
