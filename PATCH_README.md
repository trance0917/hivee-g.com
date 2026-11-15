# Hivee ユーザー主体・村・チャット再設計パッチ（2026-11-15 改訂）

**このZIPは変更ファイルのみを元の階層で収録したパッチです。** 2026-11-15の前回「user_chat_and_rules_patch.zip」を**置き換える改訂版**です。**両方を重ねて適用しないでください。** 前回の新規migration（`2026_11_15_200000` と `200100`）をまだ実行していないことを想定しています。

## 現在のDBと方針

- 旧migrationにより、実DBには `users.active_character_id`、`characters.text_id`、`characters.village_id`、`chat_messages` のキャラクター送受信4カラムが存在する（開発者のDBスクリーンショットでも確認）。
- **ユーザー**が所属村（`users.village_id`）を持ち、DM送受信・村チャットの主体となる。`users.text_id` はユーザーDM公開宛先として維持。
- **妖精**は `characters.id`（内部ID）で管理し、`user_id` で所有者、`slot` で所有枠、`village_id` で**滞在村**を表す。`village_id` の列名・FK・NULL可否は変更せず、DBコメントを滞在村に更新。
- `users.active_character_id`、`characters.text_id`、`chat_messages.character_id` / `sender_character_text_id` / `recipient_character_id` / `recipient_character_text_id` は新しい差分migrationで削除する。
- **旧DMの user_id / recipient_user_id / type / 本文 / created_at などは保持する。** ただし旧キャラクター名義の履歴列の**値は消失**する。履歴保全が必要な場合はこのmigrationを実行する前に別途アーカイブする。
- ユーザー所有の重量無制限倉庫、妖精の重量制バッグ・遠征・回収・奉納は**仕様確定のみで未実装**。今回倉庫テーブルは追加していない。

## 適用手順

1. **DBとソースをバックアップ**する。特にチャットの旧キャラクター紐付けが必要なら事前保存する。
2. 旧DMの宛先ユーザーIDが欠けていないか確認する。`SELECT COUNT(*) FROM chat_messages WHERE type = 4 AND recipient_user_id IS NULL;` が **0** である必要がある。非0の場合は**現行のキャラクター参照列が残っているうちに**受信ユーザーを確認・補正する。自動で適当に埋めない。新migrationにも同じチェックを追加している。
3. Laravelのプロジェクトルートへ `PATCH_README.md` 以外のファイルをパスそのまま配置する。前回の新規migrationをまだ実行していない場合は同名2ファイルを本版で上書きする。
4. `php artisan migrate:status` と `php artisan migrate --pretend` で未実行migration・DDL内容を確認する。**`2026_11_05_000906_add_village_id_to_characters_table` が未完了なら、旧migrationの仕様上、妖精の滞在村ID未設定で停止する可能性がある。スクリーンショットでは `characters.village_id` がNULL許可に見えるので、実DBとmigration履歴を必ず照合する。** **PHP 8.5環境**の検証DBで `php artisan migrate` を実行する。
5. Laravelのキャッシュを `php artisan optimize:clear` でクリアし、Reverb・queue・PHPワーカーを運用方式に合わせて再起動。`npm run build` を実行。ブラウザーも再読み込みする。
6. 2アカウント以上で `** 本文`（全体）、`@users.text_id 本文`（DM）、`# 本文`（ユーザー所属村）を確認する。`/api/initial-data` は `user` と `characters[]` を返し、`character` 単体は返さない。村未登録ユーザーは村チャット不可。

### 新規migration 4本

| ファイル | 役割 |
|---|---|
| `2026_11_15_200000_add_village_id_to_users_table.php` | `users.village_id` に所属村を追加。既存ユーザーへ自動割当しない |
| `2026_11_15_200100_add_user_public_ids_to_chat_messages_table.php` | DMの送受信ユーザー公開IDのスナップショットを追加 |
| `2026_11_15_200200_remove_character_chat_identity_columns.php` | チャットの旧キャラ列・`users.active_character_id`・`characters.text_id` のFKと列を削除。旧DMの宛先欠損があれば停止 |
| `2026_11_15_200300_update_character_village_comment.php` | `characters.village_id` のDBコメントを「滞在村」に変更。FK・列名・現在のNULL可否は維持 |

**注意:** 古い `create_users_table` や `create_characters_table` などの既存migrationは、すでに適用済みのDBの履歴なので書き換えていません。今回の差分migrationで移行します。**`migrate:fresh` / `migrate:refresh` は本番データを消すため実行しないでください。** 差分migrationの`down()`は列を作り直せても、削除前のIDの値は復元できません。

## テスト観点

- `chat_messages` の `user_id` / `recipient_user_id` で旧DMを表示できる（キャラクターの当時の公開IDは表示できない）。
- `characters` は `text_id` 不要で作成でき、`user_id` が所有者、`village_id` が滞在村。`characters.slot` のユーザー単位unique制約は残る。
- `/api/initial-data` はユーザーに紐づく**全妖精をslot順**で返す（未ログイン時は空配列）。
- `chat.user.{userId}` は本人のみ購読、`chat.village.{villageId}` はユーザー所属村が一致する場合のみ購読。妖精の滞在村や選択状態でアクセス権が変化しない。
- `POST /api/chat/send` のキャラクターID指定は422。送信時にDBへキャラクターIDを設定しない。旧 `chat.character.{id}` 購読は使用しない。
- ユーザーの村移籍後のWebSocket購読切替・移籍中の閲覧権限はまだ未実装。運用前の別途実装対象。

## 検証状況

差分のPHP構文検査・文字列参照の静的確認まで。ここで利用できるPHPは8.4で、プロジェクトの要件はPHP `^8.5`。ZIPに`vendor/`/`node_modules/`/lockファイルは無いため、**Laravel migration実行・統合テスト・Vite本番ビルドは未実施**。実DBのデータ内容と適用履歴は確認していない。

`.env`、実DB、画像、ビルド成果物はこのパッチに含めない。
