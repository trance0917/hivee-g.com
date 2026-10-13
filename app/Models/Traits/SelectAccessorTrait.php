<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Builder;

trait SelectAccessorTrait
{
    public function scopeSelectAccessor(Builder $query, array $keys, string $value = ''): Builder
    {
        foreach ($keys as $key) {
            $query->selectRaw("? AS `$key`", [$value]);
        }
        return $query;
    }
}
