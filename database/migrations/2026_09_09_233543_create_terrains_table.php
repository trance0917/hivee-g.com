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
        Schema::create('terrains', function (Blueprint $table) {
            // 文字列コード（'plains', 'forest', 'river' など）を主キーにする
            $table->string('code', 32)->primary();
            $table->string('name', 32);                             // 地形名（平地、森、川など）
            $table->decimal('movement_cost', 4, 2)->default(1.0);   // 移動係数（1.0 = 標準, 1.5 = 遅い）
            $table->boolean('can_pass')->default(true);             // 通行可能フラグ
            $table->boolean('is_developable')->nullable();        // 建築可能フラグ
            $table->json('default_resources')->nullable();          // 採取可能アイテム設定
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('terrains');
    }
};
