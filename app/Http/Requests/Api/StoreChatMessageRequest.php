<?php

namespace App\Http\Requests\Api;

use App\Enums\ChatMessageType;
use App\Models\Character;
use App\Models\ChatBan;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;
use LogicException;

/**
 * チャット送信の入力検証と、送信元・宛先の解決を担当する。
 * 現在対応する送信形式：** 本文 / @公開キャラクターID 本文
 */
class StoreChatMessageRequest extends FormRequest
{
    private ?ChatMessageType $resolvedType = null;
    private string $resolvedBody = '';
    private ?Character $resolvedSender = null;
    private ?Character $resolvedRecipient = null;

    public function authorize(): bool
    {
        // routes/api.php の auth:sanctum に加えて、直接呼ばれても401を返す。
        if ($this->user() === null) {
            throw new AuthenticationException();
        }

        return true;
    }

    public function rules(): array
    {
        return [
            'message' => ['required', 'string', 'max:100'],
            'character_id' => ['nullable', 'integer'],
        ];
    }

    /**
     * 通常のバリデーション後に、チャット特有の制約をまとめて確認する。
     *
     * @return array<callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                // required/string/integer等のエラーがある入力は処理しない。
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $user = $this->user();

                // UIのreadonlyだけに頼らず、送信時点で茶禁をチェック。
                if (ChatBan::query()->where('user_id', $user->id)->active()->exists()) {
                    $validator->errors()->add('message', '現在チャットを送信できません。');
                    return;
                }

                $raw = trim($this->input('message'));
                $recipient = null;

                if (str_starts_with($raw, '**')) {
                    $type = ChatMessageType::Global;
                    // 「**こんにちは」「** こんにちは」の両方に対応。
                    $body = trim(substr($raw, 2));
                } elseif (preg_match('/^@([a-zA-Z0-9_-]{3,32})\s+(.+)$/us', $raw, $matches)) {
                    $type = ChatMessageType::Direct;
                    $body = trim($matches[2]);
                    $recipient = Character::query()->where('text_id', $matches[1])->first();

                    if($user->activeCharacter->text_id === $matches[1]){
                        $validator->errors()->add('message', '自分自身には送れません。');
                        return;
                    }else if ($recipient === null) {
                        $validator->errors()->add('message', '宛先の公開キャラクターIDが見つかりません。');
                        return;
                    }
                } elseif (str_starts_with($raw, '#')) {

                } else {
                    $validator->errors()->add(
                        'message',
                        '全体は「** 本文」、個人宛は「@キャラクターID 本文」で送信してね。'
                    );
                    return;
                }

                if ($body === '' || mb_strlen($body) > 300) {
                    $validator->errors()->add('message', '本文は1〜300文字で入力してください。');
                    return;
                }

                // 送信元はusers.active_character_idだけを採用する。
                // 旧仕様の「character_id未指定ならslot順の最初のキャラ」は廃止。
                $activeCharacterId = $user->active_character_id;

                if ($activeCharacterId === null) {
                    $validator->errors()->add('message', '使用するキャラクターが選択されていません。');
                    return;
                }

                // 既存クライアントとの互換性のためcharacter_idは受け取れるが、
                // 操作中キャラ以外のIDを指定した場合は拒否する。
                $requestedCharacterId = $this->input('character_id');
                if ($requestedCharacterId !== null
                    && (int) $requestedCharacterId !== (int) $activeCharacterId) {
                    $validator->errors()->add('character_id', '現在操作中のキャラクター以外では送信できません。');
                    return;
                }

                // users.active_character_idの値だけを信用せず、所有権も確認する。
                $sender = Character::query()
                    ->where('user_id', $user->id)
                    ->whereKey($activeCharacterId)
                    ->first();

                if ($sender === null) {
                    $validator->errors()->add('message', '使用中のキャラクターが見つかりません。');
                    return;
                }

                // 以降は検証済みの情報だけをControllerへ渡す。
                $this->resolvedType = $type;
                $this->resolvedBody = $body;
                $this->resolvedSender = $sender;
                $this->resolvedRecipient = $recipient;
            },
        ];
    }

    /**
     * @return array{type: ChatMessageType, body: string, sender: Character, recipient: ?Character}
     */
    public function chatPayload(): array
    {
        if ($this->resolvedType === null) {
            throw new LogicException('チャット送信のバリデーションが完了していません。');
        }

        return [
            'type' => $this->resolvedType,
            'body' => $this->resolvedBody,
            'sender' => $this->resolvedSender,
            'recipient' => $this->resolvedRecipient,
        ];
    }
}
