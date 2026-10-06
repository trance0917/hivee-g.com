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
        Schema::create('prefectures', function (Blueprint $table) {
            // 元の smallint(4) を尊重して smallIncrements にしてる
            $table->smallIncrements('id');

            $table->string('name', 64);
            $table->string('view_name', 64);
            $table->string('furigana', 64)->nullable();
            $table->string('code', 64)->nullable();
            $table->smallInteger('order_sort')->default(0);

            // timestampsとソフデリ追加
            $table->timestamps();
            $table->softDeletes();

            // もし元のSQL通りMyISAMエンジンにしたい場合は以下をコメントアウト解除してね
            // $table->engine = 'MyISAM';
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prefectures');
    }
};
