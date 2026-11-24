<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use PDO;
use RuntimeException;
use Symfony\Component\Filesystem\Filesystem;
use Throwable;

#[Signature('schema:export')]
#[Description('現在の接続先のテーブルDDLを database/schema/current_schema.sql に書き出す')]
class ExportSchema extends Command
{
    public function handle(Filesystem $files): int
    {
        $path = database_path('schema/current_schema.sql');

        try {
            $connection = DB::connection();
            $ddl = match ($connection->getDriverName()) {
                'mysql', 'mariadb' => $this->mysqlSchema($connection->getPdo()),
                'sqlite' => $this->sqliteSchema($connection->getPdo()),
                default => throw new RuntimeException('未対応のDBドライバーです: '.$connection->getDriverName()),
            };

            $this->replaceSnapshot($files, $path, $ddl);
        } catch (Throwable $error) {
            $this->error('スキーマの出力に失敗しました: '.$error->getMessage());

            return self::FAILURE;
        }

        $this->info('スキーマを出力しました: '.$path);

        return self::SUCCESS;
    }

    private function replaceSnapshot(Filesystem $files, string $path, string $ddl): void
    {
        $directory = dirname($path);
        $files->mkdir($directory);
        // 同じディレクトリで排他的に作成し、同時実行でも一時ファイルを共有しない。
        $temporary = $files->tempnam($directory, '.current_schema-', '.tmp');
        try {
            // 容量不足などで途中までしか書けなかった場合も、前回のSQLを保持する。
            if (file_put_contents($temporary, $ddl) !== strlen($ddl)) {
                throw new RuntimeException('DDLを最後まで書き込めませんでした。');
            }
            $mode = is_file($path) ? fileperms($path) & 0777 : 0666 & ~umask();
            $files->chmod($temporary, $mode);
            $files->rename($temporary, $path, true);
        } finally {
            $files->remove($temporary);
        }
    }

    private function mysqlSchema(PDO $pdo): string
    {
        // 同じ接続で物理テーブルを列挙し、制約・索引・コメントを含むDB本来のDDLを取得する。
        $tables = $pdo->query("SHOW FULL TABLES WHERE Table_type IN ('BASE TABLE', 'SYSTEM VERSIONED')")
            ->fetchAll(PDO::FETCH_COLUMN);
        sort($tables, SORT_STRING);

        // 循環参照のある定義も読み込めるよう、外部キー検査の切り替えは出力SQLだけに含める。
        $statements = ['SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;', 'SET FOREIGN_KEY_CHECKS = 0;'];
        foreach ($tables as $table) {
            $identifier = str_replace('`', '``', $table);
            $ddl = $pdo->query("SHOW CREATE TABLE `$identifier`")->fetchColumn(1);
            if (! is_string($ddl) || $ddl === '') {
                throw new RuntimeException("テーブル {$table} のDDLを取得できませんでした。");
            }
            $statements[] = $ddl.';';
        }
        $statements[] = 'SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;';

        return implode("\n\n", $statements)."\n";
    }

    private function sqliteSchema(PDO $pdo): string
    {
        // 自動索引はCREATE TABLEの制約に含まれる。独立した索引はテーブルの後に書く。
        // 仮想テーブルが内部で生成する補助テーブルも二重に書き出さない。
        $definitions = $pdo->query(<<<'SQL'
            SELECT s.sql
            FROM main.sqlite_schema AS s
            JOIN pragma_table_list AS t ON t.schema = 'main' AND t.name = s.tbl_name
            WHERE t.type IN ('table', 'virtual')
              AND s.type IN ('table', 'index') AND s.sql IS NOT NULL
              AND s.tbl_name NOT GLOB 'sqlite_*'
            ORDER BY CASE s.type WHEN 'table' THEN 0 ELSE 1 END, s.name
            SQL)->fetchAll(PDO::FETCH_COLUMN);

        $statements = ['-- SQLite table and index definitions'];
        foreach ($definitions as $ddl) {
            $statements[] = $ddl.';';
        }

        return implode("\n\n", $statements)."\n";
    }
}
