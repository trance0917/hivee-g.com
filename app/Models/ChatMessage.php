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
        'sender_user_text_id',
        'type',
        'target_id',
        'recipient_user_id',
        'recipient_user_text_id',
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

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_user_id');
    }

    /** 履歴・送信結果・リアルタイム配信で共通の公開項目。IP/UA等の管理情報は含めない。 */
    public function toChatPayload(): array
    {
        return [
            'id' => $this->id,
            'type' => (int) $this->getRawOriginal('type'),
            'user_id' => $this->user_id,
            'sender_user_name' => $this->user?->name,
            // 新規送信はスナップショット、旧履歴のみ現在のユーザー公開IDにフォールバック。
            'sender_user_text_id' => $this->sender_user_text_id ?? $this->user?->text_id,
            'recipient_user_id' => $this->recipient_user_id,
            'recipient_user_name' => $this->recipient?->name,
            'recipient_user_text_id' => $this->recipient_user_text_id ?? $this->recipient?->text_id,
            'message' => $this->message,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
