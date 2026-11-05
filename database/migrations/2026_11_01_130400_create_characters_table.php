<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('characters', function (Blueprint $table) {
            $table->id()->comment('キャラクター内部ID（DB内の関連付け用）');
            $table->string('text_id', 32)
                ->unique('characters_text_id_unique')
                ->comment('公開キャラクターID（@宛先指定用、ユーザーが変更可能・一意）');
            $table->foreignId('user_id')
                ->comment('所有ユーザーID（users.id）')
                ->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('slot')
                ->default(1)
                ->comment('キャラクター枠番号（1～3）。枠解放・範囲検証はアプリ側で判定');
            $table->string('name', 50)
                ->comment('表示キャラクター名（変更可能）');
            $table->unsignedTinyInteger('specialty')
                ->comment('得意分野：1=狩猟、2=採集');
            $table->string('avatar', 255)->nullable()
                ->comment('キャラクター画像のパス。NULLなら既定画像');
            $table->timestamp('created_at')->nullable()
                ->comment('作成日時');
            $table->timestamp('updated_at')->nullable()
                ->comment('更新日時');

            $table->unique(['user_id', 'slot'], 'characters_user_slot_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('characters');
    }
};
