<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $hex_id
 * @property string $neighbor_hex_id
 * @property-read Village $village
 * @property-read Village $neighborVillage
 */
class VillageNeighbor extends Model
{
    // マイグレーションで timestamps を作っていないので false
    public $timestamps = false;

    protected $guarded = [];

    /**
     * 元の村（Hex）
     */
    public function village(): BelongsTo
    {
        return $this->belongsTo(Village::class, 'hex_id', 'hex_id');
    }

    /**
     * 隣接する村（Hex）
     */
    public function neighborVillage(): BelongsTo
    {
        return $this->belongsTo(Village::class, 'neighbor_hex_id', 'hex_id');
    }
}
