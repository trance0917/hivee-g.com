<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // MySQLはDDLをロールバックできない場合があるため、失敗後の再実行にも対応する。
        if (!Schema::hasColumn('characters', 'village_id')) {
            Schema::table('characters', function (Blueprint $table): void {
                $table->foreignId('village_id')
                    ->nullable()
                    ->after('user_id')
                    ->comment('所属する村のID（villages.id）。キャラクターは必ずいずれかの村に所属する');
            });
        }

        // NULL・0・存在しない村IDを自動補完せず、手動で正しい村へ割り当ててもらう。
        $unassigned = DB::table('characters')
            ->leftJoin('villages', 'characters.village_id', '=', 'villages.id')
            ->whereNull('villages.id')
            ->count();

        if ($unassigned > 0) {
            throw new RuntimeException(
                "村に正しく所属していないキャラクターが {$unassigned} 件あります。".
                ' characters.village_id を実在する villages.id に設定してから php artisan migrate を再実行してください。'
            );
        }

        // 全件が正しい村を参照するようになったら、NOT NULLと外部キーを設定する。
        Schema::table('characters', function (Blueprint $table): void {
            $table->unsignedBigInteger('village_id')
                ->comment('所属する村のID（villages.id）。キャラクターは必ずいずれかの村に所属する')
                ->change();
        });

        $hasForeignKey = collect(Schema::getForeignKeys('characters'))
            ->contains(fn (array $foreign): bool =>
                ($foreign['name'] ?? '') === 'characters_village_id_foreign'
            );

        if (!$hasForeignKey) {
            Schema::table('characters', function (Blueprint $table): void {
                $table->foreign('village_id', 'characters_village_id_foreign')
                    ->references('id')
                    ->on('villages')
                    ->restrictOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (!Schema::hasColumn('characters', 'village_id')) {
            return;
        }

        $hasForeignKey = collect(Schema::getForeignKeys('characters'))
            ->contains(fn (array $foreign): bool =>
                ($foreign['name'] ?? '') === 'characters_village_id_foreign'
            );

        Schema::table('characters', function (Blueprint $table) use ($hasForeignKey): void {
            if ($hasForeignKey) {
                $table->dropForeign('characters_village_id_foreign');
            }
            $table->dropColumn('village_id');
        });
    }
};
