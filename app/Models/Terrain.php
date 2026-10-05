<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property string $code
 * @property string $name
 * @property float $movement_cost
 * @property bool $can_pass
 * @property bool|null $is_developable
 * @property array<array-key, mixed>|null $default_resources
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, Village> $villages
 * @property-read int|null $villages_count
 *
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Terrain newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Terrain newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Terrain query()
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Terrain whereCanPass($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Terrain whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Terrain whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Terrain whereDefaultResources($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Terrain whereIsDevelopable($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Terrain whereMovementCost($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Terrain whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder<static>|Terrain whereUpdatedAt($value)
 *
 * @mixin \Eloquent
 */
class Terrain extends Model
{
    protected $primaryKey = 'code';

    public $incrementing = false;

    protected $keyType = 'string';

    protected $guarded = [];

    // ★Laravel 11以降の推奨：casts() メソッドで定義
    protected function casts(): array
    {
        return [
            'movement_cost' => 'float',
            'can_pass' => 'boolean',
            'is_developable' => 'boolean',
            'default_resources' => 'array',
            'sort_order' => 'integer',
        ];
    }

    public function villages(): HasMany
    {
        return $this->hasMany(Village::class, 'terrain_code', 'code');
    }
}
