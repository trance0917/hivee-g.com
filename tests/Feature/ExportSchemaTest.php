<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use PDO;
use RuntimeException;
use Symfony\Component\Filesystem\Filesystem;
use Tests\TestCase;

class ExportSchemaTest extends TestCase
{
    private string $directory;

    protected function setUp(): void
    {
        parent::setUp();

        // テスト用DBと出力先を両方分け、開発中のスナップショットを保護する。
        config(['database.default' => 'sqlite', 'database.connections.sqlite.database' => ':memory:']);
        $this->directory = sys_get_temp_dir().'/hivee-schema-'.bin2hex(random_bytes(8));
        $this->app->useDatabasePath($this->directory);
    }

    protected function tearDown(): void
    {
        (new Filesystem)->remove($this->directory);
        parent::tearDown();
    }

    public function test_exports_reusable_table_and_index_definitions_without_rows(): void
    {
        $source = DB::connection()->getPdo();
        $source->exec('CREATE TABLE villages (id INTEGER PRIMARY KEY, name TEXT UNIQUE)');
        $source->exec('CREATE TABLE fairies (village_id INTEGER REFERENCES villages(id), name TEXT)');
        $source->exec('CREATE INDEX fairies_by_name ON fairies(name)');
        $source->exec("INSERT INTO villages VALUES (1, 'record-must-stay-private')");

        $this->artisan('schema:export')->assertSuccessful();
        $path = database_path('schema/current_schema.sql');
        $first = file_get_contents($path);
        $this->assertStringNotContainsString('record-must-stay-private', $first);
        $copy = new PDO('sqlite::memory:');
        $copy->exec($first);
        $this->assertSame('villages', $copy->query("PRAGMA foreign_key_list('fairies')")->fetch()['table']);
        $this->assertSame('fairies_by_name', $copy->query("PRAGMA index_list('fairies')")->fetch()['name']);
        $this->assertSame(0, $copy->query('SELECT COUNT(*) FROM villages')->fetchColumn());
        $this->assertSame(1, $source->query('SELECT COUNT(*) FROM villages')->fetchColumn());

        $source->exec('ALTER TABLE fairies ADD COLUMN weight INTEGER');
        $this->artisan('schema:export')->assertSuccessful();
        $this->assertStringContainsString('weight INTEGER', file_get_contents($path));
    }

    public function test_keeps_existing_file_when_connection_fails(): void
    {
        $path = database_path('schema/current_schema.sql');
        (new Filesystem)->dumpFile($path, 'previous complete export');
        config(['database.connections.sqlite.database' => $this->directory.'/missing.sqlite']);

        $this->artisan('schema:export')->assertFailed();
        $this->assertSame('previous complete export', file_get_contents($path));
    }

    public function test_failed_replacement_keeps_previous_sql_and_removes_temporary_file(): void
    {
        $path = database_path('schema/current_schema.sql');
        (new Filesystem)->dumpFile($path, 'previous complete export');
        // 実行ユーザーの権限に依存せず、一時ファイルを書いた後の置換失敗を再現する。
        $files = $this->createPartialMock(Filesystem::class, ['rename']);
        $files->expects($this->once())->method('rename')->willThrowException(new RuntimeException('rename failed'));
        $this->app->instance(Filesystem::class, $files);

        $this->artisan('schema:export')->assertFailed();
        $this->assertSame('previous complete export', file_get_contents($path));
        $this->assertSame([], glob(dirname($path).'/.current_schema-*'));
    }
}
