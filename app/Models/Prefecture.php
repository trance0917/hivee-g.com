<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * @property int $id
 * @property string $name
 * @property string $view_name
 * @property string|null $furigana
 * @property string|null $code
 * @property int $order_sort
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @property \Illuminate\Support\Carbon|null $deleted_at
 * @method static Builder<static>|Prefecture newModelQuery()
 * @method static Builder<static>|Prefecture newQuery()
 * @method static Builder<static>|Prefecture onlyTrashed()
 * @method static Builder<static>|Prefecture ordered()
 * @method static Builder<static>|Prefecture query()
 * @method static Builder<static>|Prefecture whereCode($value)
 * @method static Builder<static>|Prefecture whereCreatedAt($value)
 * @method static Builder<static>|Prefecture whereDeletedAt($value)
 * @method static Builder<static>|Prefecture whereFurigana($value)
 * @method static Builder<static>|Prefecture whereId($value)
 * @method static Builder<static>|Prefecture whereName($value)
 * @method static Builder<static>|Prefecture whereOrderSort($value)
 * @method static Builder<static>|Prefecture whereUpdatedAt($value)
 * @method static Builder<static>|Prefecture whereViewName($value)
 * @method static Builder<static>|Prefecture withTrashed(bool $withTrashed = true)
 * @method static Builder<static>|Prefecture withoutTrashed()
 * @mixin \Eloquent
 */
class Prefecture extends Model
{
    use SoftDeletes;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'order_sort' => 'integer',
        ];
    }

    /**
     * 表示順のローカルスコープ
     * 例: Prefecture::ordered()->get();
     */
    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('order_sort', 'asc')->orderBy('id', 'asc');
    }
}
