<?php

namespace App\Http\Controllers\Api;

use App\Enums\ChatMessageType;
use App\Events\ChatMessage as ChatMessageEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreChatMessageRequest;
use App\Models\Character;
use App\Models\ChatMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * 現段階で送信できるチャット: 所属村 (#本文)・全体 (**本文)・個人 (@公開キャラクターID 本文)。
 * それ以外を誤って全体チャットとして扱わない。
 */
class ChatController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user('sanctum');
        $userId = $user?->id;
        $limit = 200;

        // 送信時と同じく、操作中キャラクターの所属村のみを対象にする。
        $activeCharacter = ($user && $user->active_character_id)
            ? Character::query()->whereKey($user->active_character_id)->where('user_id', $userId)->first()
            : null;
        $villageId = $activeCharacter?->village_id;

        // 各クエリを最新200件で打ち切ってから結合（既存インデックスを利用）。
        $global = ChatMessage::query()
            ->where('type', ChatMessageType::Global->value)
            ->orderByDesc('id')
            ->limit($limit)
            ->get();

        $village = $villageId !== null
            ? ChatMessage::query()
                ->where('type', ChatMessageType::VillageMember->value)
                ->where('target_id', $villageId)
                ->orderByDesc('id')
                ->limit($limit)
                ->get()
            : collect();

        $characterIds = [];
        $messages = $global->concat($village);

        if ($userId !== null) {
            $characterIds = Character::query()
                ->where('user_id', $userId)
                ->orderBy('slot')
                ->pluck('id')
                ->map(static fn ($id): int => (int) $id)
                ->all();

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

            $messages = $global->concat($village)->concat($sent)->concat($received)
                ->unique('id')
                ->sortByDesc('id')
                ->take($limit);
        }

        return response()->json([
            'messages' => $messages->sortBy('id')->values()->map(
                fn (ChatMessage $message): array => $this->formatMessage($message)
            ),
            'character_ids' => $characterIds,
            'village_id' => $villageId !== null ? (int) $villageId : null,
        ]);
    }

    public function store(StoreChatMessageRequest $request): JsonResponse
    {
        // 入力形式・茶禁・宛先・送信キャラの所有権はFormRequestで検証済み。
        $user = $request->user();
        [
            'type' => $type,
            'body' => $body,
            'sender' => $sender,
            'recipient' => $recipient,
        ] = $request->chatPayload();

        $message = DB::transaction(function () use ($request, $user, $sender, $recipient, $type, $body): ChatMessage {
            $message = new ChatMessage();
            $message->user_id = $user->id;
            $message->character_id = $sender?->id;
            $message->sender_character_text_id = $sender?->text_id;
            $message->type = $type;
            $message->target_id = match ($type) {
                ChatMessageType::VillageMember => (int) $sender->village_id,
                default => null,
            };
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

        // 配信チャンネルは入力値からではなく、検証済みDBレコードから構築する。
        // 全体は公開、村とDMは非公開チャンネル。宛先は検証済みデータから構築する。
        $channels = match ($type) {
            ChatMessageType::Global => ['chat.global'],
            ChatMessageType::VillageMember => ['chat.village.'.$message->target_id],
            ChatMessageType::Direct => array_values(array_unique([
                'chat.character.'.$sender->id,
                'chat.character.'.$recipient->id,
            ])),
        };

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
