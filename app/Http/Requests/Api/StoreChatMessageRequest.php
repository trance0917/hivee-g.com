<?php

namespace App\Http\Requests\Api;

use App\Enums\ChatMessageType;
use App\Models\ChatBan;
use App\Models\User;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;
use LogicException;

/**
 * チャットの発言主体はユーザー。操作中のキャラクターに依存しない。
 * 対応形式: # 本文 / ** 本文 / @ユーザー公開ID 本文
 */
class StoreChatMessageRequest extends FormRequest
{
    private ?ChatMessageType $resolvedType = null;
    private string $resolvedBody = '';
    private ?User $resolvedRecipient = null;

    public function authorize(): bool
    {
        if ($this->user() === null) {
            throw new AuthenticationException();
        }

        return true;
    }

    public function rules(): array
    {
        return [
            // 本文最大300文字 + 公開IDによる宛先指定の長さを許容。
            'message' => ['required', 'string', 'max:100'],
        ];
    }

    /** @return array<callable> */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                $user = $this->user();
                if (ChatBan::query()->where('user_id', $user->id)->active()->exists()) {
                    $validator->errors()->add('message', '現在チャットを送信できません。');
                    return;
                }

                $raw = trim($this->input('message'));
                $recipient = null;

                if (str_starts_with($raw, '** ')) {
                    $type = ChatMessageType::Global;
                    $body = trim(substr($raw, 3));
                } elseif (preg_match('/^@([A-Za-z0-9_-]{3,255})\s+(.+)$/us', $raw, $matches)) {
                    $type = ChatMessageType::Direct;
                    $body = trim($matches[2]);
                    $recipient = User::query()->where('text_id', $matches[1])->first();

                    if ($recipient === null) {
                        $validator->errors()->add('message', '宛先のユーザー公開IDが見つかりません。');
                        return;
                    }
                    if ((int) $recipient->id === (int) $user->id) {
                        $validator->errors()->add('message', '自分自身には送れません。');
                        return;
                    }
                } elseif (str_starts_with($raw, '# ')) {
                    $type = ChatMessageType::VillageMember;
                    $body = trim(substr($raw, 2));

                    if ($user->village_id === null) {
                        $validator->errors()->add('message', 'ユーザーの所属村が設定されていません。');
                        return;
                    }
                } else {
                    $validator->errors()->add(
                        'message',
                        '所属村は「# 本文」、全体は「** 本文」、個人宛は「@ユーザーID 本文」で送信してください。'
                    );
                    return;
                }

                if ($body === '' || mb_strlen($body) > 300) {
                    $validator->errors()->add('message', '本文は1〜300文字で入力してください。');
                    return;
                }

                $this->resolvedType = $type;
                $this->resolvedBody = $body;
                $this->resolvedRecipient = $recipient;
            },
        ];
    }

    /** @return array{type: ChatMessageType, body: string, recipient: ?User} */
    public function chatPayload(): array
    {
        if ($this->resolvedType === null) {
            throw new LogicException('チャット送信のバリデーションが完了していません。');
        }

        return [
            'type' => $this->resolvedType,
            'body' => $this->resolvedBody,
            'recipient' => $this->resolvedRecipient,
        ];
    }
}
