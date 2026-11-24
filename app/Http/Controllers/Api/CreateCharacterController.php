<?php

namespace App\Http\Controllers\Api;

use App\Enums\CharacterSpecialty;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CreateCharacterController extends Controller
{
    public function __invoke(Request $request, InitialDataController $initialData): JsonResponse
    {
        // ブラウザを経由しない送信にも備え、名前と種類をサーバーで検証する。
        // 名前のunique制約は付けず、同名の妖精を許可する。
        $data = $request->validate([
            // Unicodeの十進数字だけで構成された名前を拒否する（半角・全角の混在も対象）。
            'name' => [
                'bail', 'required', 'string', 'max:16', 'not_regex:/\A\p{Nd}+\z/u',
                static function (string $attribute, string $value, \Closure $fail): void {
                    if (str_contains($value, '【GM】')) {
                        $fail('【GM】はゲームマスター専用の表記です。');
                    }
                },
            ],
            'specialty' => ['required', Rule::enum(CharacterSpecialty::class)],
        ], [
            'name.required' => '名前を入力してください。',
            'name.max' => '名前は16文字以内で入力してください。',
            'name.not_regex' => '数字だけの名前は使えません。',
            'specialty.required' => 'キャラクターを選択してください。',
            'specialty.enum' => 'キャラクターを選び直してください。',
        ]);

        DB::transaction(function () use ($request, $data): void {
            // 同じユーザーからの連打・別タブでの作成を直列化する。
            $user = User::query()->lockForUpdate()->findOrFail($request->user()->id);
            // 保存後の通信切断などで再送されても、2体目は作らず既存データを返す。
            if ($user->characters()->exists()) {
                return;
            }

            // 画面を経由しないリクエストでも、最初の妖精は入村後にのみ作成できる。
            abort_if($user->village_id === null, 409, '先に所属する村を選択してください。');

            // 関連経由で作ることで、認証ユーザーのuser_idを自動で設定する。
            // 最初の妖精なのでslot=1を使用する。
            $character = $user->characters()->make([
                'slot' => 1,
                'name' => $data['name'],
                'specialty' => $data['specialty'],
            ]);
            // 暫定の滞在村261を、初回入村で決定した開始地点に置き換える。
            // サーバー側で直接代入し、フォームからの村IDは使用しない。
            $character->village_id = $user->village_id;
            $character->save();
        });

        // 保存完了後に既存の初期データ取得処理を呼び、同じJSON形式で返す。
        // フロントはこの結果を保存するだけで、全ページの情報を最新にできる。
        return $initialData($request);
    }
}
