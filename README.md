# Hivee チャット修正 — 本文100文字・案内テキスト化

## 更新ファイル
- `app/Http/Requests/Api/StoreChatMessageRequest.php`: 本文は最大100文字。宛先指定も含む入力全体の上限は360文字。GitHub `main` の現行版をベースに変更。
- `resources/js/pages/world/components/panels/ChatPanel.tsx`: 直前のTS2345修正版をベースに、送信前の本文100文字チェックを追加。冒頭案内の `/help` ボタンを普通の文字に変更。
- `docs/GAME_RULES.md`: 文字数制限を明文化。
- `docs/DECISIONS.md`: 仕様変更を決定ログに記録。

## 挙動
- `** 本文`, `# 本文`, `@公開ID 本文` の **本文** が1〜100文字。
- `@公開ID` や先頭の記号は100文字に含めません。
- 入力欄に `/help` と入力した場合のローカルヘルプはそのままです。
- チャット履歴内の赤い案内 `/help` はクリックできない通常テキストです。
- 他のチャット表示・色・返信・フィルターは変更していません。

## 確認手順
1. 変更前に4ファイルのバックアップを取って上書き。
2. `php -l app/Http/Requests/Api/StoreChatMessageRequest.php` を実行。
3. `npm run build` またはプロジェクトのTypeScriptチェックを実行。
4. `** ` + 100文字で送信成功、101文字で拒否されることを確認。
5. `# ` と `@公開ID ` も同様に確認。
6. 案内 `/help` をクリックしても何も起きず、入力欄に `/help` と打つと6行が表示されることを確認。

※ 本環境では実際のDB／Laravel APIを起動した統合テストは未実施です。
