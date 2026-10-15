<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // 1. email のユニーク制約を削除（インデックス名を指定）
            $table->dropUnique('users_email_unique');

            // （※もしemailをnull許可にしたい場合は、ここで nullable への変更も必要）
            // $table->string('email')->nullable()->change();

            // 2. ソフトデリート（deleted_at）の追加
            $table->softDeletes()->comment('削除日時');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // ロールバック時：email にユニーク制約を戻す
            $table->unique('email', 'users_email_unique');

            // ロールバック時：ソフトデリートのカラムを削除
            $table->dropSoftDeletes();
        });
    }
};
