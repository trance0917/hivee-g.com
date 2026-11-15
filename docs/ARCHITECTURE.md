# Hivee — 技術構成・ソースコード案内

> 調査日: 2026-11-15  
> 調査対象: `project-dump_20261115_144614.zip`。今回のコード変更後の差分も併記。  
> この文書は**コードから確認した事実**を中心とする。推奨・改善案は区別して記す。  
> 注意: ランタイム起動や実DB接続の動作検証は実施していない。

## 1. 技術スタック（依存宣言）

### PHP / Laravel (`composer.json`)

- PHP `^8.5`、Laravel Framework `^13.17`
- Sanctum `^4.0`、Socialite `^5.31`、Reverb `^1.12`、Horizon `^5.48`
- `socialiteproviders/line`、`socialiteproviders/twitter`、Google API/Auth
- Intervention Image 4、AWS S3用Flysystem、Spatie Backupなど
- 開発依存: PHPUnit 12、Larastan 3、Pint 1、Telescope、Pail など

### React / TypeScript (`package.json` + ソース)

- React 19、React Router 7、Vite 8、Tailwind CSS 4
- Zustand 5、TanStack React Query 5、Axios
- MapLibre GL 6、h3-js 4
- Laravel Echo 2、Pusher JS、React Echo連携パッケージ
- フロントソースは `resources/js/**/*.ts` / `*.tsx` として実装されている。

**重要:** これは`^`で指定された依存制約。調査ZIPに `composer.lock` と `package-lock.json` は含まれておらず、正確な導入版は不明。

## 2. 画面・通信の全体像

```text
routes/web.php
  └─ Laravel Blade: resources/views/app.blade.php
      └─ Vite: resources/js/main.tsx
          └─ App.tsx (React Router / 初期化 / スプラッシュ)
              ├─ /              → pages/Index.tsx
              ├─ /world         → pages/world/Index.tsx
              └─ /test/chat     → ChatTest.tsx [試作用]

React → fetch / Axios → Laravel routes/api.php → Controller / FormRequest → Models / DB
React ← Reverb/Echo ← Laravel Broadcast Event
```

### 認証・初期データ

- `routes/web.php`: Google / X（twitter-oauth-2）/ LINEのSocialiteログイン・callbackを定義。
- `app/Http/Controllers/LoginController.php`: SNSログイン後にユーザー・連携アカウントを取得／作成し、Laravel認証ログインする。
- `app/Services/UserService.php`: SNS新規アカウントの生成、アバター保存の処理。
- `GET /api/initial-data`: ユーザーの公開ID・所属村IDと、所有する妖精一覧 `characters[]` を返す（今回の未適用パッチ）。旧 `character` 単体フィールドは廃止。
- `resources/js/stores/useInitialDataStore.ts`: 初期取得、重複通信防止、Zustandへの保存。
- `resources/js/App.tsx`: 初期データ取得完了まで画面遷移先の描画を待ち、スプラッシュを表示。

**実装上の注意:** `resources/js/hooks/useInitialData.ts` にReact Queryを使う別フックが残っているが、`resources/js/main.tsx` の `QueryClientProvider` はコメントアウトされている。**React Queryがアプリ全体ですでに稼働しているとは言わないこと。**

## 3. マップ機能の構造

| ファイル | 役割（コードから確認） |
|---|---|
| `resources/js/pages/world/Index.tsx` | ワールド画面のレイアウト・パネル構成 |
| `resources/js/pages/world/components/WorldMap.tsx` | 地図コンテナ |
| `resources/js/pages/world/hooks/useWorldMap.ts` | MapLibreの生成、イベント、H3セルクリック、破棄 |
| `resources/js/pages/world/context/WorldMapContext.tsx` | ズーム、視点リセット等のマップ操作API |
| `resources/js/pages/world/map/config.ts` | 地図中心・ズーム・H3解像度・スタイルURL |
| `resources/js/pages/world/map/h3Grid.ts` | 選択セルをH3境界からGeoJSONへ変換、描画更新 |
| `resources/js/pages/world/map/registeredHexLayer.ts` | 登録済みセルをAPI取得し、地形色で描画 |
| `resources/js/pages/world/stores/useWorldStore.ts` | 選択セル集合、現在の選択セル |
| `resources/js/pages/world/stores/useWorldUIStore.ts` | パネルの開閉状態 |
| `resources/js/pages/world/components/panels/HexInfoPanel.tsx` | 選択H3のID・座標などを表示 |

### 観測済みの挙動

- 現在のH3解像度設定は `8`（`config.ts`）。
- 地図のクリックで座標をH3セルIDへ変換し、Zustandの選択状態を更新する。
- 選択したセルはGeoJSONソース `hex-grid`、レイヤー `hex-fill` で表示される。
- 登録済みセルは `GET /api/get-registed-villages` を使い、ソース `registered-hex` と塗り・輪郭レイヤーを追加する。**`registed` の綴りは現行のAPI契約に存在するので勝手に変更しない。**
- 地図が破棄されるときにイベント解除・API abort・`map.remove()` の処理がある。
- `h3Grid.ts` の**背景全面グリッド生成処理はコメントアウトされている**。地図の見た目だけで全面グリッド機能が完成していると判定しない。
- MapLibreスタイルは `VITE_MAPTILER_KEY` があればMapTiler、なければMapLibreデモスタイルを利用する分岐がある（キーの値は文書化しない）。

### DBとの関係

- `terrains` が地形コード・色・移動コスト等を保持。
- `villages` がH3 `hex_id`、緯度経度、地形コード、level、points等を保持。
- `village_neighbors` がセル間の隣接ペアを保持。
- `VillageController::getRegistedVillages()` が登録済みマスを描画用JSONに整形して返す。
- `VillageController::saveVillages()` は存在するが、**このZIPのroutes/api.phpにはルート登録が見当たらない**。DB登録画面・動作中の書込APIがあるとは断定しない。

**現在のゲーム方針:** H3セル1個を村1つの単位とし、居住可能な村それぞれに精霊樹を設ける。`villages` は現時点ではH3セル情報として利用されており、住民票登録・精霊樹更新のAPIは未実装。

## 4. チャット機能の構造

| ファイル | 役割 |
|---|---|
| `app/Enums/ChatMessageType.php` | チャット8区分を整数で定義 |
| `app/Models/ChatMessage.php` | チャット履歴モデル、soft delete、公開除外属性 |
| `app/Models/ChatBan.php` | ユーザー単位の茶禁モデル、期限内の判定 |
| `app/Http/Requests/Api/StoreChatMessageRequest.php` | 送信形式、茶禁、ユーザー公開ID宛先・所属村を検証 |
| `app/Http/Controllers/Api/ChatController.php` | 履歴取得、送信保存、配信イベント発火 |
| `app/Events/ChatMessage.php` | Reverb向けブロードキャストイベント、イベント名 `chat-message` |
| `routes/channels.php` | DMの非公開チャネル購読権限 |
| `resources/js/pages/world/components/panels/ChatPanel.tsx` | 履歴・フィルタ・リアルタイム受信・送信UI |
| `resources/js/bootstrap.ts` | AxiosとLaravel Echoの初期化 |
| `resources/js/ChatTest.tsx` | 独立した試作画面（全体チャネル `chat.global` に合わせた） |

### 今回変更したチャットAPI（コード上の状態）

| Method / Path | 認証 | 処理 |
|---|---|---|
| `GET /api/chat/messages` | ルート自体は非認証 | 全体。ログイン時はユーザー所属村の履歴と送受信DMを含む |
| `POST /api/chat/send` | `auth:sanctum` + `throttle:15,1` | `#`（ユーザー所属村）、`**`（全体）、`@ユーザー公開ID`（ユーザーDM）を処理 |

- DMの宛先検索は **`users.text_id`** で行い、DBの `chat_messages.recipient_user_id` に保存。**キャラクターは送信に不要**。
- DMの購読先は **`chat.user.{userId}`**（PrivateChannel、本人のみ購読可能）。従来の `chat.character.{id}` は使用しない。
- 村チャットは**`users.village_id`** に基づく `chat.village.{villageId}`。キャラクターの滞在村とは独立。
- 新しいメッセージは `sender_user_text_id` / `recipient_user_text_id` をスナップショット保存。今回の新migrationで旧キャラクター送受信4カラムを削除する。旧DMの送受信ユーザーIDは維持する。
- 過去のDMは `user_id` / `recipient_user_id` で閲覧でき、旧ユーザー公開IDスナップショットは復元されない。APIレスポンスは現在のユーザー公開IDを補完する。
- フロントのChatPanelはユーザー単位のDMチャンネルを1つだけ購読し、表示名をキャラIDからユーザー公開IDへ変更。
- `GET /api/initial-data` に `user.text_id` / `user.village_id` を追加。旧ユーザー所属村の一括移行は実施せず、未設定ユーザーは村チャット不可。
- DB/enumには8区分が存在するが、**未対応の種類を実装済みとは扱わない**。
- Laravel実行環境でのDBマイグレーション・統合テストは未検証。

## 5. 主なLaravelモデルと関係

| Model | 主要な役割・確認した関連 |
|---|---|
| `User` | アカウント、Socialite連携、**所属村ID**、複数妖精の所有者、アバター、公開ID |
| `UserSocialAccount` | SNSプロバイダーと外部IDの紐付け |
| `Character` | ユーザー所有の妖精、枠番号、狩猟/採集、暫定 `village_id`（滞在村として扱う） |
| `Village` | H3セルID、地形、座標、level/points、隣接セル |
| `Terrain` | 地形コード・色・移動コスト・通行/開拓可否等 |
| `Prefecture` | 都道府県マスタ（soft delete・表示順） |
| `VillageNeighbor` | H3セル同士の隣接レコード |
| `ChatMessage` | チャット履歴、配信区分、送受信ユーザーと公開IDのスナップショット。妖精への参照は持たない |
| `ChatBan` | 発言禁止、管理者、理由、期限 |
| `Notification` | ユーザー通知（Model・migrationあり） |

### 主なDBスキーマ

- `characters`: `id`（内部ID）、`user_id`、`slot`（ユーザー×枠にunique）、`specialty`、`village_id`（妖精の**滞在村**）。今回の差分migrationで旧 `text_id` を削除する。`village_id` の列名・FK・現行のNULL可否は維持し、DBコメントを「滞在村」に変更する。
- `users`: **今回追加 `village_id`（nullable、villages参照）**。`users.text_id` は既存の公開IDでDMの宛先となる。旧 `active_character_id` は今回の差分migrationでFKごと削除する。
- `villages`: `hex_id` unique、`terrain_code`、座標、レベル・ポイント、都道府県ID。
- `terrains`: `code`主キー、`movement_cost`、`can_pass`、`is_developable`、`default_resources` 等。
- `chat_messages`: `user_id`、`recipient_user_id`、`type`、`target_id`、`origin_h3`、本文、削除日時、`sender_user_text_id`、`recipient_user_text_id`。今回、旧 `character_id` / `recipient_character_id` / `sender_character_text_id` / `recipient_character_text_id` を関連FKごと削除する。
- `chat_bans`: ユーザー・理由・期限。

**未実行の差分migrationの順番:** `2026_11_15_200000_add_village_id_to_users_table.php` → `200100_add_user_public_ids_to_chat_messages_table.php` → `200200_remove_character_chat_identity_columns.php` → `200300_update_character_village_comment.php`。元の2026-11-01～11-05のmigrationを修正しても適用済みDBの列は変化しないため、削除は必ず差分migrationで実行する。旧DMのユーザー宛先欠損をチェックしてから削除する。`down()` は削除した過去値を復元できない。

**重要:** migrationの宣言だけでは本番DBの適用済み状態や実際の値は確定できない。DB情報が必要な回答ではmigration、現在のDBスキーマ、既存データの差異を確認する。

## 6. ソースの位置案内

```text
app/
  Console/Commands/ProjectDump.php     # ZIP作成コマンド（共有安全性を要改善）
  Enums/                               # ChatMessageType, CharacterSpecialty
  Events/ChatMessage.php                # ブロードキャストイベント
  Http/Controllers/Api/                # InitialData, Village, Chat
  Http/Requests/Api/                   # StoreChatMessageRequest
  Models/                              # User, Character, Village, Terrain, Chat*
  Services/UserService.php              # ユーザー生成・アバター
bootstrap/app.php                       # ルーティング / statefulApi 等
config/                                 # Laravel構成
routes/api.php                          # APIルート
routes/web.php                          # Socialite + SPAフォールバック
routes/channels.php                     # ブロードキャスト認可
database/migrations/                    # スキーマ変遷
database/seeders/                       # Seeder
resources/js/main.tsx                   # React entry
resources/js/App.tsx                    # Router / 初期化
resources/js/pages/world/              # ワールド・MapLibre・H3・パネル
resources/js/components/               # 共通UI
resources/js/stores/                   # 初期データなど
resources/views/app.blade.php           # SPA用Blade
resources/css/app.css                   # スタイル
vite.config.js                          # Vite / alias @ / TLS等
```

## 7. 現時点で未確認の重要機能

下記は企画に存在するが、**今回のZIP内の関連API・モデル・画面からは完成実装を確認できていない**。

- キャラクターの枠課金・決済、体力・移動距離の消費式
- 経路探索、行軍値・開拓度の算定／永続化
- アイテム獲得・在庫、レア抽選、共同収集（キャラクター別インベントリ・**ユーザー所有の重量無制限倉庫**を含む）
- ユーザー所属村の変更、妖精の派遣・帰還・荷物回収、手動奉納、精霊樹の成長
- 通貨、アイテム取引、サブスク制限
- 祭り・討伐・財宝・装備・お守り
- チャットの村／都道府県／同盟／周辺セルへの配信

「未確認」は「他のブランチや非同梱ファイルにも存在しない」という意味ではない。

### 今回のゲーム設計と現行データ構造の差分（2026-11-15）

**今回の未適用コードパッチに含めた範囲:** `users.village_id`、`chat_messages` ユーザー公開ID控え、ユーザー主体の送受信・Channel/UI、旧キャラクター主体列の削除、`characters.village_id` コメント変更、初期データの `characters[]` 返却、Zustandの複数妖精保持。ユーザーの所属村を設定／変更するUI・API、移動、倉庫、採集、奉納、購入は未実装。

- **ユーザーの所属村:** `users.village_id`。`villages.id` に外部キー。既存レコードはNULLで開始し、ユーザーの意思確認なしの自動割当はしない。
- **妖精の滞在村:** `characters.village_id` を既存名のまま使用（列コメントのみ「滞在村」に更新）。移動管理は未完成。`Character::stayVillage()` relationを追加。既に適用された2026-11-05の作成migrationは書き換えない。
- **収穫品:** 妖精別の重量制在庫と、**ユーザー所有の重量無制限倉庫**はゲーム方針として確定。妖精帰還後の回収先はユーザー倉庫。妖精在庫・ユーザー倉庫・回収・寄与ポイントはいずれも**未実装**。倉庫の具体的なDB/API/スタック上限は未決定。
- **倉庫と村移籍:** 倉庫は`Village`ではなく**`User`に所有権が紐づく**。ユーザーが所属村を変更しても倉庫在庫は同じユーザーに残り、村別在庫の移し替え・在庫消失・自動奉納は起こさない。DB設計では村IDを倉庫の所有者識別子に使わず、ユーザーIDに関連付ける（具体的なテーブル名は未決定）。
- **回収:** 妖精がユーザー所属村へ帰還したことと妖精の所有者をサーバー側で確認し、妖精カバンの減算とユーザー倉庫の加算を一貫した取引として処理する。手動回収／自動回収、移籍中の扱いは未決定。
- **奉納:** ユーザー**倉庫**から現在のユーザー所属村へだけ手動で行う。導入時は倉庫所有・在庫・所属村・量・評価期間を検証し、倉庫在庫減算と村への寄与を同一DBトランザクション等で安全に扱う。
- **有償廃棄:** 遠征先での廃棄権を購入可能にする方針。具体的な課金／権限／ログ／返金処理は未定。
- **チャット履歴互換:** ユーザー主体に統一するため旧行のキャラクター紐付けは削除する。新規・旧DMとも `user_id` / `recipient_user_id` を使用する。旧 `recipient_user_id` がNULLのDMがあればmigrationを停止し補正を促す。**キャラクター単位の送信者・宛先履歴は消えるためバックアップ必須**。

**運用時の注意:** 所属村変更を実装する際、村チャット購読の解除・再購読、切替中の権限競合、履歴をどこまで閲覧可能にするかを必ず設計する。

## 8. 実装時に優先して確認したい具体箇所

1. **今回対応済み（コード上）** — 未対応チャット形式をエラーにする、本文上限を1〜300文字へ統一、都道府県記号コメントを `*` へ整理。
2. **未対応** — ユーザー所属村の登録UI／移動時間／村移籍を伴うチャンネル切替。倉庫はユーザー所有のため村移籍時に在庫を移すデータ処理は不要だが、移籍中の回収・奉納可否は未決定。
3. **要確認** — 旧 `users.village_id` 欠損データの設定方法、データ移行後の村チャット利用可否。
4. `app/Http/Controllers/Api/VillageController.php` — `saveVillages()` 内でtransaction外とtransaction内の**2回のupsert**があるように見える。保存API登録の有無も確認。
5. `resources/js/main.tsx` — React QueryのProviderがコメントアウト。`useInitialData` とZustand初期データ取得の二重系統を整理する余地。
6. `resources/js/ChatTest.tsx` — 今回 `chat.global` 購読に合わせたが、試作画面としての位置付けは継続。
7. `app/Console/Commands/ProjectDump.php` — `.env` / `database/` / `public/storage` 同梱、出力に `chmod(0777)`。**共有用ZIPとしては安全性の改善を優先。**

この節は**検討候補**であり、今回の依頼と無関係な修正をAIが勝手に実施してよいという意味ではない。

## 9. ソース受け渡し・環境

- 調査したZIPには`.env`、`database/database.sqlite`、`public/storage/users`、ビルド済み`public/build`が存在。
- **秘密値そのものはこの文書に記載しない。**
- ZIP作成スクリプトの現状は `.env` を明示的に同梱する。今後は安全な共有対象だけを収集するように改善する。
- 本番のDBエンジン、キュー接続、キャッシュ接続、Vite開発ドメイン等は実際の環境で確認する。`database.sqlite` がZIPにあるだけで本番DBがSQLiteと決めつけない。
- ZIP中に `tests/` やlockファイルが**同梱されていなかった**。プロジェクト外・別ブランチに存在しないことを意味しない。
