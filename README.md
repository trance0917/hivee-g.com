# hivee チャット実装（全体・個人）

## 配置するファイル

- `app/Http/Controllers/Api/ChatController.php` : 既存ファイルを上書き
- `app/Events/ChatMessage.php` : 既存ファイルを上書き
- `routes/channels.php` : 既存ファイルを上書き（現在のApp.Models.User認可も残す）
- `resources/js/pages/world/components/panels/ChatPanel.tsx` : 既存ファイルを上書き

`routes/api.php` は今回のZIPに含めていません。既存で `GET /api/chat/messages` と `POST /api/chat/send` の両ルートが設定済みです。
`ChatMessageType` とチャット関連マイグレーションも変更不要です。

## 今回の仕様

- 全体: `** こんにちは` または `**こんにちは` → type=3、`chat.global`（公開）
- 個人: `@AB-1234-WXYZ こんにちは` → type=4、宛先を `characters.text_id` で検索
- 個人の送信者: 所有キャラの先頭を選択（将来 `character_id` 指定に対応済み）
- 個人DM: `chat.character.{characters.id}` に送信。所有ユーザー以外は購読拒否
- メッセージ保存: `chat_messages` に一度保存。IPとUser-AgentはAPI/WSに返さない
- 初回: 全体＋本人の送受信DMを合わせて最新200件。種類切替ではAPI再取得なし
- 新着: Echo/Reverbで受信し、200件まで保持。同じIDは重複表示しない
- 未ログイン: 全体の閲覧・購読だけ可能。送信不可

**注意**: `@` に続くのは内部の数値IDではなく、`characters.text_id`（公開ID）です。
**注意**: まだキャラクターを作っていないユーザーも全体チャットは送信できますが、DM送信にはキャラクターが必要です。

## デプロイ・確認

1. 4ファイルを本番・テストの該当パスへ設置。
2. チャット関連テーブルが作られているか `php artisan migrate:status` で確認。
3. `php artisan route:list --path=api/chat` と `php artisan route:list --path=broadcasting/auth` を確認。
4. `php artisan channel:list` で `chat.character.{characterId}` を確認。
5. `php artisan optimize:clear` を実行。
6. React側を `npm run build` して、デプロイ先の `public/build` へ反映。
7. ReverbとHorizonが起動していることを確認。
8. ブラウザを2つ開き、両方で `** はじめまして` がリアルタイムに表示されるか確認。
9. 所有する公開キャラIDで `@{公開ID} 内緒だよ` を送り、宛先ユーザーには表示、別ユーザーには表示されないことを確認。

## エラーの調べ方

- 401（送信）: ログイン状態・Sanctum設定を確認。
- 419（送信）: LaravelのCSRFトークン・`XSRF-TOKEN` Cookie・Axios設定を確認。
- 403 / 404（`/broadcasting/auth`）: `routes/channels.php` と `php artisan route:list`、所有キャラを確認。
- 422（DM）: 宛先公開ID、空本文、自キャラの有無を確認。
- WebSocket受信なし: `php artisan horizon:status`、Reverb/Supervisorを確認。
- 送信成功後でも他ブラウザに表示されなければ Horizonでのブロードキャスト処理を確認。

## 今後

キャラクター選択UIができた段階で送信時に `character_id` を渡すようにすれば、2枠目・3枠目のキャラで送信できます。その際はキャラクター切替時のプライベート購読再設定も追加してください。
