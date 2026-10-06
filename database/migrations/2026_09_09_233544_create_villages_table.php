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
        Schema::create('villages', function (Blueprint $table) {
            $table->id();
            $table->string('hex_id', 32)->unique();                 // H3インデックス
            $table->string('name', 32);                             // 村・拠点名

            // terrains.code を参照する外部キー
            $table->string('terrain_code', 32);
            $table->foreign('terrain_code')
                ->references('code')
                ->on('terrains')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->unsignedInteger('level')->default(1);
            $table->unsignedBigInteger('points')->default(0);

            $table->boolean('can_pass')->nullable();
            $table->boolean('is_developable')->nullable();

            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->timestamps();

            $table->index('hex_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('villages');
    }
};
