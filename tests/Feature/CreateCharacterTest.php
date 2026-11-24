<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class CreateCharacterTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // このAPIが使用する適用後スキーマを、一時SQLite上に用意する。
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('text_id');
            $table->unsignedBigInteger('village_id')->nullable();
            $table->string('avatar')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
        // 村名のフォールバックと初期滞在村を、異なる2つのセルで検証する。
        Schema::create('terrains', function (Blueprint $table) {
            $table->string('code')->primary();
            $table->string('name');
        });
        Schema::create('villages', function (Blueprint $table) {
            $table->id();
            $table->string('hex_id')->unique();
            $table->string('name')->nullable();
            $table->string('terrain_code');
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
        });
        DB::table('terrains')->insert(['code' => 'plain', 'name' => '平地']);
        DB::table('villages')->insert([
            ['id' => 8, 'hex_id' => '882e60eaa1fffff', 'name' => '若葉村', 'terrain_code' => 'plain', 'latitude' => 34.71, 'longitude' => 135.51],
            ['id' => 9, 'hex_id' => '882e60eaa3fffff', 'name' => null, 'terrain_code' => 'plain', 'latitude' => 34.72, 'longitude' => 135.52],
        ]);
        Schema::create('characters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->unsignedTinyInteger('slot');
            $table->string('name');
            $table->unsignedTinyInteger('specialty');
            $table->foreignId('village_id')->constrained('villages');
            $table->string('avatar')->nullable();
            $table->timestamps();
            $table->unique(['user_id', 'slot']);
        });
    }

    public function test_creation_returns_initial_data_and_retry_keeps_one_character(): void
    {
        $user = User::create(['name' => 'test']);
        $this->actingAs($user);
        // 最初の妖精には入村が必要。確定後は選んだ村からスタートする。
        $this->postJson('/api/characters', ['name' => 'あ', 'specialty' => 1])->assertConflict();
        $this->postJson('/api/villages/882e60eaa1fffff/join')->assertOk()->assertJsonPath('user.village_id', 8);
        $response = $this->postJson('/api/characters', ['name' => str_repeat('あ', 16), 'specialty' => 1, 'user_id' => 999, 'village_id' => 999]);
        $response->assertOk()->assertJsonCount(1, 'characters')->assertJsonPath('characters.0.user_id', $user->id)
            ->assertJsonPath('characters.0.village_id', 8);
        $this->assertSame($this->getJson('/api/initial-data')->json(), $response->json());
        $this->postJson('/api/characters', ['name' => '変更', 'specialty' => 2])->assertOk();
        $this->assertDatabaseCount('characters', 1);
        $this->assertDatabaseHas('characters', ['name' => str_repeat('あ', 16), 'specialty' => 1]);
        $this->actingAs(User::create(['name' => 'other']));
        $this->postJson('/api/villages/882e60eaa3fffff/join')->assertOk();
        $this->postJson('/api/characters', ['name' => str_repeat('あ', 16), 'specialty' => 2])->assertOk();
        $this->assertDatabaseCount('characters', 2);
    }

    public function test_first_village_selection_uses_terrain_name_and_cannot_transfer_membership(): void
    {
        // 表示・キャンセル相当のGETは所属を変更しない。確定済みの再送だけを許す。
        $village = '/api/villages/882e60eaa1fffff';
        $other = '/api/villages/882e60eaa3fffff';
        $this->postJson($village.'/join')->assertUnauthorized();
        $user = User::create(['name' => 'test']);
        $this->actingAs($user);
        $this->getJson($village)->assertOk()->assertJsonPath('name', '若葉村');
        $this->getJson($other)->assertOk()->assertJsonPath('name', '平地');
        $this->postJson('/api/villages/882e60eaa5fffff/join')->assertNotFound();
        $this->assertNull($user->fresh()->village_id);
        // 未所属のときは梅田を使い、入村後の初期データからは選んだ村の座標を取得できる。
        $this->getJson('/api/initial-data')->assertOk()->assertJsonPath('user.village', null);
        $response = $this->postJson($other.'/join')->assertOk()->assertJsonPath('user.village_id', 9)
            ->assertJsonPath('user.village.latitude', 34.72)
            ->assertJsonPath('user.village.longitude', 135.52);
        $this->assertSame($this->getJson('/api/initial-data')->json(), $response->json());
        $this->postJson($other.'/join')->assertOk();
        $this->postJson($village.'/join')->assertConflict();
        $this->assertSame(9, $user->fresh()->village_id);
    }

    public function test_authentication_and_validation_are_required(): void
    {
        $this->postJson('/api/characters', [])->assertUnauthorized();
        $this->actingAs(User::create(['name' => 'test']));
        $this->postJson('/api/characters', ['name' => str_repeat('あ', 17), 'specialty' => 3])
            ->assertUnprocessable()->assertJsonValidationErrors(['name', 'specialty']);
        $this->postJson('/api/characters', ['name' => '   ', 'specialty' => 1])
            ->assertUnprocessable()->assertJsonValidationErrors('name');
        $this->assertDatabaseCount('characters', 0);
    }

    public function test_names_made_entirely_of_decimal_digits_are_rejected(): void
    {
        $this->actingAs(User::create(['name' => 'test']));
        $this->postJson('/api/villages/882e60eaa1fffff/join')->assertOk();
        foreach (['0', '１２３', ' 1２3 ', '١٢٣'] as $name) {
            $this->postJson('/api/characters', ['name' => $name, 'specialty' => 1])
                ->assertUnprocessable()->assertJsonPath('errors.name.0', '数字だけの名前は使えません。');
        }
        $this->assertDatabaseCount('characters', 0);

        foreach (['【GM】', '【GM】はち', 'はち【GM】'] as $reserved) {
            $this->postJson('/api/characters', ['name' => $reserved, 'specialty' => 1])
                ->assertUnprocessable()->assertJsonPath('errors.name.0', '【GM】はゲームマスター専用の表記です。');
        }

        foreach (['Hivee123', '小春２', 'ハイビー', 'こはる', '하이비', '妖精🌸'] as $name) {
            $this->actingAs(User::create(['name' => $name]));
            $this->postJson('/api/villages/882e60eaa1fffff/join')->assertOk();
            $this->postJson('/api/characters', ['name' => $name, 'specialty' => 1])
                ->assertOk()->assertJsonPath('characters.0.name', $name);
        }
    }
}
