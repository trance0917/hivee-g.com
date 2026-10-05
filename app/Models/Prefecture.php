<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

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
