<?php

namespace App\Http\Controllers\Api;

use App\Enums\ChatMessageType;
use App\Events\ChatMessage as ChatMessageEvent;
use App\Http\Controllers\Controller;
use App\Models\Character;
use App\Models\ChatBan;
use App\Models\ChatMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * hiveeの初期対応: 全体チャット(#)・DM(@公開ID 本文)。
 * 他のチャット種別の入力は、誤って全体配信しないよう拒否する。
 */
class ChatController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user('sanctum')?->id;
        $limit = 50;

        // 各検索をINDEX + LIMITで実行。全表走査してから絞る方式にしない。
        $global = ChatMessage::query()
            ->where('type', ChatMessageType::Global->value)
            ->orderByDesc('id')
            ->limit($limit)
            ->get();

        if ($userId === null) {
            $messages = $global;
        } else {
            $sent = ChatMessage::query()
                ->where('type', ChatMessageType::Direct->value)
                ->where('user_id', $userId)
                ->orderByDesc('id')
                ->limit($limit)
                ->get();

            $received = ChatMessage::query()
                ->where('type', ChatMessageType::Direct->value)
                ->where('recipient_user_id', $userId)
                ->orderByDesc('id')
                ->limit($limit)
                ->get();

            $messages = $global->concat($sent)->concat($received)
                ->unique('id')
                ->sortByDesc('id')
                ->take($limit);
        }

        return response()->json([
            'messages' => $messages->sortBy('id')->values()->map(
                fn (ChatMessage $message): array => $this->formatMessage($message)
            ),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user, 401);

        $data = $request->validate([
            'message' => ['required', 'string', 'max:350'],
            'character_id' => ['nullable', 'integer'],
        ]);

        // DBの状態が正。フロントのreadonlyだけに送信制限を任せない。
        $isBanned = ChatBan::query()
            ->where('user_id', $user->id)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->exists();

        if ($isBanned) {
            throw ValidationException::withMessages(['message' => '現在チャットを送信できません。']);
        }

        $raw = trim($data['message']);
        if (preg_match('/^#\s+(.+)$/us', $raw, $matches)) {
            $type = ChatMessageType::Global;
            $body = trim($matches[1]);
            $recipient = null;
        } elseif (preg_match('/^@\s*([a-zA-Z0-9_-]{3,32})\s+(.+)$/us', $raw, $matches)) {
            $type = ChatMessageType::Direct;
            $body = trim($matches[2]);
            $recipient = Character::query()->where('text_id', $matches[1])->first();
            if (!$recipient) {
                throw ValidationException::withMessages(['message' => '宛先のキャラクターIDが見つかりません。']);
            }
        } else {
            throw ValidationException::withMessages([
                'message' => '全体は「# 本文」、個人宛は「@公開ID 本文」で送信してください。',
            ]);
        }

        if ($body === '' || mb_strlen($body) > 300) {
            throw ValidationException::withMessages(['message' => '本文は1〜300文字で入力してください。']);
        }

        // 現在キャラクター選択機能が無い場合はslot順の先頭を使用。
        // まだ作成していないユーザーもアカウントとしてチャット可能。
        $characterId = $data['character_id'] ?? null;
        $sender = $characterId
            ? Character::query()->where('user_id', $user->id)->whereKey($characterId)->first()
            : Character::query()->where('user_id', $user->id)->orderBy('slot')->first();

        if ($characterId && !$sender) {
            throw ValidationException::withMessages(['character_id' => '自分のキャラクターを選択してください。']);
        }

        $message = DB::transaction(function () use ($request, $user, $sender, $recipient, $type, $body): ChatMessage {
            $message = new ChatMessage();
            $message->user_id = $user->id;
            $message->character_id = $sender?->id;
            $message->sender_character_text_id = $sender?->text_id;
            $message->type = $type;
            $message->target_id = null;
            $message->recipient_user_id = $recipient?->user_id;
            $message->recipient_character_id = $recipient?->id;
            $message->recipient_character_text_id = $recipient?->text_id;
            $message->origin_h3 = null;
            $message->message = $body;
            $message->ip_address = $request->ip();
            $message->user_agent = mb_substr($request->userAgent() ?? '', 0, 512);
            $message->save();

            return $message;
        });

        // 全体は誰でも購読できる公開チャンネル、DMは両者のprivate channel。
        // Channel権限をクライアントから受け取らない。
        $channels = $type === ChatMessageType::Global
            ? ['chat.global']
            : array_values(array_unique([
                'chat.user.'.$user->id,
                'chat.user.'.$recipient->user_id,
            ]));

        broadcast(new ChatMessageEvent($message, $channels));

        return response()->json(['message' => $this->formatMessage($message)], 201);
    }

    private function formatMessage(ChatMessage $message): array
    {
        return [
            'id' => $message->id,
            'type' => (int) $message->getRawOriginal('type'),
            'user_id' => $message->user_id,
            'character_id' => $message->character_id,
            'sender_character_text_id' => $message->sender_character_text_id,
            'recipient_character_text_id' => $message->recipient_character_text_id,
            'message' => $message->message,
            'created_at' => $message->created_at?->toIso8601String(),
        ];
    }
}
