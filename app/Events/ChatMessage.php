<?php

namespace App\Events;

use App\Models\ChatMessage as ChatMessageModel;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/** 全体は公開チャンネル、DMは所有者のみ購読可能な非公開チャンネルへ配信。 */
class ChatMessage implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    /**
     * @param array<int, string> $channels
     * 例: ['chat.global'] / ['chat.user.12', 'chat.user.34']
     */
    public function __construct(
        public ChatMessageModel $chatMessage,
        public array $channels,
    ) {}

    /** @return array<int, Channel> */
    public function broadcastOn(): array
    {
        return array_map(
            static fn (string $name): Channel => $name === 'chat.global'
                ? new Channel($name)
                : new PrivateChannel($name),
            array_values(array_unique($this->channels)),
        );
    }

    public function broadcastAs(): string
    {
        return 'chat-message';
    }

    /** IPアドレスやUser-Agent等の管理情報は配信しない。 */
    public function broadcastWith(): array
    {
        return $this->chatMessage->toChatPayload();
    }
}
