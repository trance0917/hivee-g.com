<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $this->updateComment(
            '妖精の滞在村ID（villages.id）。ユーザー所属村users.village_idとは別'
        );
    }

    public function down(): void
    {
        $this->updateComment(
            '所属する村のID（villages.id）。キャラクターは必ずいずれかの村に所属する'
        );
    }

    private function updateComment(string $comment): void
    {
        $connection = DB::connection();
        $driver = $connection->getDriverName();

        if (!in_array($driver, ['mysql', 'mariadb'], true)) {
            throw new RuntimeException('このmigrationはMySQL/MariaDB向けです。');
        }

        // Laravelのクエリ文法を使い、テーブルプレフィックスと識別子のクォートを反映。
        // INFORMATION_SCHEMAのTABLE_SCHEMA = DATABASE()検索に依存しない。
        $tableName = $connection->getQueryGrammar()->wrapTable('characters');
        $columns = $connection->select("SHOW FULL COLUMNS FROM {$tableName}");
        $column = null;

        foreach ($columns as $candidate) {
            if (($candidate->Field ?? null) === 'village_id') {
                $column = $candidate;
                break;
            }
        }

        if ($column === null) {
            $database = $connection->selectOne('SELECT DATABASE() AS database_name');
            $databaseName = $database?->database_name ?? '(取得できません)';
            $available = implode(', ', array_map(
                static fn (object $c): string => (string) ($c->Field ?? '?'),
                $columns
            ));

            throw new RuntimeException(
                "characters.village_id が見つかりません。DB={$databaseName}、テーブル={$tableName}、".
                "確認できた列=[{$available}]。接続先と既存migrationの適用状況を確認してください。"
            );
        }

        // 旧migrationが期待する型以外の場合、データ型を勝手に書き換えない。
        $type = strtolower(trim((string) ($column->Type ?? '')));
        if (!preg_match('/^bigint(?:\(\d+\))? unsigned$/', $type)) {
            throw new RuntimeException("characters.village_id の型が想定外です: {$type}");
        }

        $nullSetting = (string) ($column->Null ?? '');
        if (!in_array($nullSetting, ['YES', 'NO'], true)) {
            throw new RuntimeException('characters.village_id のNULL可否を判定できません。');
        }

        $extra = trim((string) ($column->Extra ?? ''));
        if ($extra !== '') {
            throw new RuntimeException("characters.village_id に想定外のExtra属性があります: {$extra}");
        }

        $default = $column->Default ?? null;
        if ($default !== null && strtoupper((string) $default) !== 'NULL') {
            throw new RuntimeException('characters.village_id に想定外のデフォルト値があります。');
        }

        $nullable = $nullSetting === 'YES';

        // 実際の列から判定したNULL可否を維持し、コメントのみを変更する。
        $connection->getSchemaBuilder()->table('characters', function (Blueprint $table) use ($nullable, $comment): void {
            $table->unsignedBigInteger('village_id')
                ->nullable($nullable)
                ->comment($comment)
                ->change();
        });
    }
};
