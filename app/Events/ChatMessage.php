<?php

namespace App\Events;

use App\Models\ChatMessage as ChatMessageModel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * 全チャット種別で共有するブロードキャストイベント。
 * 配信先チャンネルは送信APIの入力ではなく、
 * サーバー側で認証・判定して渡す。
 */
class ChatMessage implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    /**
     * @param array<int, string> $channels
     * 例: ['chat.global', 'chat.user.123']
     */
    public function __construct(
        public ChatMessageModel $chatMessage,
        public array $channels,
    ) {}

    /** @return array<int, PrivateChannel> */
    public function broadcastOn(): array
    {
        return $this->channels
                |> array_unique(...)
                |> array_values(...)
                |> (static fn (array $channels): array => array_map(
                    static fn (string $channel): PrivateChannel =>
                    new PrivateChannel($channel),
                    $channels
                ));
    }

    public function broadcastAs(): string
    {
        return 'chat-message';
    }

    /**
     * 公開してよいフィールドだけを配信する。
     * IP・User-Agent等の運営専用情報は配信しない。
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->chatMessage->id,
            'type' => (int) $this->chatMessage->getRawOriginal('type'),
            'user_id' => $this->chatMessage->user_id,
            'character_id' => $this->chatMessage->character_id,
            'sender_character_text_id' => $this->chatMessage->sender_character_text_id,
            'recipient_character_text_id' => $this->chatMessage->recipient_character_text_id,
            'message' => $this->chatMessage->message,
            'created_at' => $this->chatMessage->created_at?->toIso8601String(),
        ];
    }
}
