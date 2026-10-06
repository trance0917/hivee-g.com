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
            // 一度カラムを削除して smallint unsigned で作り直す
            if (Schema::hasColumn('villages', 'prefecture_id')) {
                $table->dropColumn('prefecture_id');
            }

            // prefectures.id に合わせて unsignedSmallInteger にする
            $table->unsignedSmallInteger('prefecture_id')
                ->nullable()
                ->after('longitude');

            // 外部キー制約
            $table->foreign('prefecture_id')
                ->references('id')
                ->on('prefectures')
                ->cascadeOnUpdate()
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('villages', function (Blueprint $table) {
            $table->dropConstrainedForeignId('prefecture_id');
        });
    }
};
