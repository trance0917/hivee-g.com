<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $hex_id
 * @property string $name
 * @property string $terrain_code
 * @property int $level
 * @property int $points
 * @property bool|null $can_pass
 * @property bool|null $is_developable
 * @property float $latitude
 * @property float $longitude
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Terrain $terrain
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Village newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Village newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Village query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Village whereCanPass($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Village whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Village whereHexId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Village whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Village whereIsDevelopable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Village whereLatitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Village whereLevel($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Village whereLongitude($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Village whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Village wherePoints($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Village whereTerrainCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Village whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class Village extends Model
{
    protected $guarded = [];

    // ★Laravel 11以降の推奨：casts() メソッド
    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'can_pass' => 'boolean',
            'is_developable' => 'boolean',
        ];
    }

    public function terrain(): BelongsTo
    {
        return $this->belongsTo(Terrain::class, 'terrain_code', 'code');
    }

    // ★モダンなアクセサ定義（Attribute クラスを使用）
    // getXxxAttribute() は古い書き方なのでこちらが推奨
    protected function canPass(): Attribute
    {
        return Attribute::make(
            get: fn (?bool $value) => $value ?? $this->terrain?->can_pass,
        );
    }

    protected function isDevelopable(): Attribute
    {
        return Attribute::make(
            get: fn (?bool $value) => $value ?? $this->terrain?->is_developable,
        );
    }

    /**
     * 隣接テーブルのレコード一覧
     */
    public function neighbors(): HasMany
    {
        return $this->hasMany(VillageNeighbor::class, 'hex_id', 'hex_id');
    }

    /**
     * 隣接する Village モデル一覧を直接取得（多対多）
     */
    public function adjacentVillages(): BelongsToMany
    {
        return $this->belongsToMany(
            Village::class,
            'village_neighbors',
            'hex_id',          // 中間テーブルの自分のキー
            'neighbor_hex_id', // 中間テーブルの相手のキー
            'hex_id',          // Village の自分のキー
            'hex_id'           // Village の相手のキー
        );
    }
}
