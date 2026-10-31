<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast; // ★Nowをつける
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMessage implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public string $message;

    public function __construct(string $message)
    {
        $this->message = $message;
    }

    public function broadcastOn(): array
    {
        // ログイン不要で誰でも受信できるよう、PrivateChannelではなく通常のChannelを使う
        return [
            new Channel('public-chat'),
        ];
    }

    // ★これを追加！明示的にイベント名を指定する
    public function broadcastAs(): string
    {
        return 'chat-message';
    }
}
