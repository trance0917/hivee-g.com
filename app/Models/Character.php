<?php

namespace App\Models;

use App\Enums\CharacterSpecialty;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class   Character extends Model
{
    protected $fillable = [
        'slot',
        'text_id',
        'name',
        'specialty',
        'avatar',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (self $character): void {
            if (blank($character->text_id)) {
                do {
                    $text_id = Str::random(2) . '-' . Str::random(4) . '-' . Str::random(4);
                } while (self::where('text_id', $text_id)->exists());
                $character->text_id = $text_id;
            }
        });
    }

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

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class);
    }

    public function receivedMessages(): HasMany
    {
        return $this->hasMany(ChatMessage::class, 'recipient_character_id');
    }
}
