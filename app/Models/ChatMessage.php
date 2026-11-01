<?php

namespace App\Models;

use App\Enums\ChatMessageType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ChatMessage extends Model
{
    use SoftDeletes;

    // IP/UAおよび公開IDのスナップショットはクライアント値で上書きさせず、送信APIでサーバー側から設定する。
    protected $fillable = [
        'user_id',
        'character_id',
        'type',
        'target_id',
        'recipient_user_id',
        'recipient_character_id',
        'origin_h3',
        'message',
    ];

    // 管理用の接続情報を通常のAPIレスポンスに含めない。
    protected $hidden = [
        'ip_address',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'type' => ChatMessageType::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function character(): BelongsTo
    {
        return $this->belongsTo(Character::class);
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_user_id');
    }

    public function recipientCharacter(): BelongsTo
    {
        return $this->belongsTo(Character::class, 'recipient_character_id');
    }
}
