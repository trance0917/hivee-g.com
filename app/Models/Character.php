<?php

namespace App\Models;

use App\Enums\CharacterSpecialty;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Character extends Model
{
    protected $fillable = [
        'slot',
        'name',
        'specialty',
        'avatar',
    ];

    protected function casts(): array
    {
        return [
            'slot' => 'integer',
            'specialty' => CharacterSpecialty::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // characters.village_id は現状カラム名を維持し、ゲーム上は滞在村を表す。
    public function villages(): BelongsTo
    {
        return $this->belongsTo(Village::class, 'village_id');
    }
}
