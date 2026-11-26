<?php

namespace App\Http\Controllers\Api;

use App\Enums\ChatMessageType;
use App\Events\ChatMessage as ChatMessageEvent;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreChatMessageRequest;
use App\Models\ChatMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * チャット送信者とDM受信者はユーザー。村チャットは users.village_id で判定する。
 * 現段階の送信形式: # 本文 / ** 本文 / @ユーザー公開ID 本文
 */
class ChatController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user('sanctum');
        $userId = $user?->id;
        $villageId = $user?->village_id;
        $limit = 200;

        // 旧DM行にはユーザー公開IDスナップショットがないため、関係をまとめて取得する。
        $withUsers = ['user:id,name,text_id', 'recipient:id,name,text_id'];

        $global = ChatMessage::query()
            ->with($withUsers)
            ->where('type', ChatMessageType::Global->value)
            ->orderByDesc('id')
            ->limit($limit)
            ->get();

        $village = $villageId !== null
            ? ChatMessage::query()
                ->with($withUsers)
                ->where('type', ChatMessageType::VillageMember->value)
                ->where('target_id', $villageId)
                ->orderByDesc('id')
                ->limit($limit)
                ->get()
            : collect();

        $messages = $global->concat($village);

        if ($userId !== null) {
            $sent = ChatMessage::query()
                ->with($withUsers)
                ->where('type', ChatMessageType::Direct->value)
                ->where('user_id', $userId)
                ->orderByDesc('id')
                ->limit($limit)
                ->get();

            $received = ChatMessage::query()
                ->with($withUsers)
                ->where('type', ChatMessageType::Direct->value)
                ->where('recipient_user_id', $userId)
                ->orderByDesc('id')
                ->limit($limit)
                ->get();

            $messages = $messages->concat($sent)->concat($received);
        }

        return response()->json([
            'messages' => $messages
                ->unique('id')
                ->sortByDesc('id')
                ->take($limit)
                ->sortBy('id')
                ->values()
                ->map(fn (ChatMessage $message): array => $message->toChatPayload()),
            'village_id' => $villageId !== null ? (int) $villageId : null,
        ]);
    }

    public function store(StoreChatMessageRequest $request): JsonResponse
    {
        $user = $request->user();
        [
            'type' => $type,
            'body' => $body,
            'recipient' => $recipient,
        ] = $request->chatPayload();

        $message = DB::transaction(function () use ($request, $user, $recipient, $type, $body): ChatMessage {
            // 所属村を移動する処理が将来追加されても、旧所属村への誤送信を防ぐ。
            $villageId = null;
            if ($type === ChatMessageType::VillageMember) {
                $villageId = DB::table('users')->where('id', $user->id)
                    ->lockForUpdate()->value('village_id');
                if ($villageId === null) {
                    throw ValidationException::withMessages([
                        'message' => 'ユーザーの所属村が設定されていません。',
                    ]);
                }
            }

            $message = new ChatMessage();
            $message->user_id = $user->id;
            $message->sender_user_text_id = $user->text_id;
            $message->type = $type;
            $message->target_id = match ($type) {
                ChatMessageType::VillageMember => (int) $villageId,
                default => null,
            };
            $message->recipient_user_id = $recipient?->id;
            $message->recipient_user_text_id = $recipient?->text_id;
            $message->origin_h3 = null;
            $message->message = $body;
            $message->ip_address = $request->ip();
            $message->user_agent = mb_substr($request->userAgent() ?? '', 0, 512);
            $message->save();

            return $message;
        });

        $channels = match ($type) {
            ChatMessageType::Global => ['chat.global'],
            ChatMessageType::VillageMember => ['chat.village.'.$message->target_id],
            ChatMessageType::Direct => array_values(array_unique([
                'chat.user.'.$user->id,
                'chat.user.'.$recipient->id,
            ])),
        };

        $message->setRelation('user', $user)->setRelation('recipient', $recipient);
        broadcast(new ChatMessageEvent($message, $channels));

        return response()->json(['message' => $message->toChatPayload()], 201);
    }
}
