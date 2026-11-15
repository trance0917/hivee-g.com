# Hivee — 技術構成・ソースコード案内

> 調査日: 2026-11-15  
> 調査対象: `project-dump_20261105_224108.zip`（ファイル名に2026-11-05の日時を含むスナップショット）。  
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
- `GET /api/initial-data`: ログインユーザーと `users.active_character_id` に対応するキャラクターを返す。
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

**設計上の重要な未確認点:** `villages` というモデルがH3セルレジストリと、協力プレイの「所属村・精霊樹」を同時に表しているのか。仕様追加前に概念を整理する。

## 4. チャット機能の構造

| ファイル | 役割 |
|---|---|
| `app/Enums/ChatMessageType.php` | チャット8区分を整数で定義 |
| `app/Models/ChatMessage.php` | チャット履歴モデル、soft delete、公開除外属性 |
| `app/Models/ChatBan.php` | ユーザー単位の茶禁モデル、期限内の判定 |
| `app/Http/Requests/Api/StoreChatMessageRequest.php` | 送信形式、茶禁、送信キャラ所有権、宛先を検証 |
| `app/Http/Controllers/Api/ChatController.php` | 履歴取得、送信保存、配信イベント発火 |
| `app/Events/ChatMessage.php` | Reverb向けブロードキャストイベント、イベント名 `chat-message` |
| `routes/channels.php` | DMの非公開チャネル購読権限 |
| `resources/js/pages/world/components/panels/ChatPanel.tsx` | 履歴・フィルタ・リアルタイム受信・送信UI |
| `resources/js/bootstrap.ts` | AxiosとLaravel Echoの初期化 |
| `resources/js/ChatTest.tsx` | 独立した試作画面（実際のチャネル名との整合は要確認） |

### 現在のチャットAPI

| Method / Path | 認証 | 現在の処理 |
|---|---|---|
| `GET /api/chat/messages` | ルート自体は非認証 | 全体、ログイン時は自分のDMを合わせて返す |
| `POST /api/chat/send` | `auth:sanctum` + `throttle:15,1` | 全体 `**` / 個人 `@公開キャラクターID` の送信処理を主に実装 |

- グローバルチャンネル: `chat.global`（公開）。
- DMチャンネル: `chat.character.{characterId}`（PrivateChannel、キャラ所有者のみ）。
- イベントの `broadcastAs()` は `chat-message`。Echo側は `.chat-message` を購読。
- DBには送信者／宛先の公開IDのスナップショットを保存する。管理向けIP・UAは配信イベントpayloadに含めない。
- 履歴UIは重複IDをマージし、最大200件表示する意図の処理を持つ。

**注意:** DBとenumは8区分対応だが、送信処理は全8区分実装済みではない。記号・未対応分岐の問題は `GAME_RULES.md` / `DECISIONS.md` に記載。

## 5. 主なLaravelモデルと関係

| Model | 主要な役割・確認した関連 |
|---|---|
| `User` | アカウント、Socialite連携、選択中キャラID、アバター |
| `UserSocialAccount` | SNSプロバイダーと外部IDの紐付け |
| `Character` | ユーザー所有、枠番号、公開ID、狩猟/採集、所属村ID（migration） |
| `Village` | H3セルID、地形、座標、level/points、隣接セル |
| `Terrain` | 地形コード・色・移動コスト・通行/開拓可否等 |
| `Prefecture` | 都道府県マスタ（soft delete・表示順） |
| `VillageNeighbor` | H3セル同士の隣接レコード |
| `ChatMessage` | チャット履歴、配信区分、送受信キャラ |
| `ChatBan` | 発言禁止、管理者、理由、期限 |
| `Notification` | ユーザー通知（Model・migrationあり） |

### 主なDBスキーマ

- `characters`: `user_id`、`slot`（ユーザー×枠にunique）、`text_id`（公開IDでunique）、`specialty`。2026-11-05のmigrationで `village_id` が追加される設計。
- `users`: `active_character_id`（nullable、characters参照）。
- `villages`: `hex_id` unique、`terrain_code`、座標、レベル・ポイント、都道府県ID。
- `terrains`: `code`主キー、`movement_cost`、`can_pass`、`is_developable`、`default_resources` 等。
- `chat_messages`: `type`、`target_id`、DM宛先、`origin_h3`、本文、削除日時など。範囲別取得向けindexがある。
- `chat_bans`: ユーザー・理由・期限。

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
- アイテム獲得・在庫、レア抽選、共同収集
- 精霊樹の成長・村単位の寄与
- 通貨、アイテム取引、サブスク制限
- 祭り・討伐・財宝・装備・お守り
- チャットの村／都道府県／同盟／周辺セルへの配信

「未確認」は「他のブランチや非同梱ファイルにも存在しない」という意味ではない。

## 8. 実装時に優先して確認したい具体箇所

1. `app/Http/Requests/Api/StoreChatMessageRequest.php` — `elseif ($raw) {}` の未対応入力処理で `$type` / `$body` が決まらない可能性。
2. 同ファイル — `message` 全体 `max:100` と本文上限 `300` の不一致。
3. `app/Enums/ChatMessageType.php` — コメントの `$` / `$$` と企画・パーサーの `*` / `**` の不一致。
4. `app/Http/Controllers/Api/VillageController.php` — `saveVillages()` 内でtransaction外とtransaction内の**2回のupsert**があるように見える。保存API登録の有無も確認。
5. `resources/js/main.tsx` — React QueryのProviderがコメントアウト。`useInitialData` とZustand初期データ取得の二重系統を整理する余地。
6. `resources/js/ChatTest.tsx` — `public-chat` 購読と現行 `chat.global` に不一致。試作画面としての位置付けを確認。
7. `app/Console/Commands/ProjectDump.php` — `.env` / `database/` / `public/storage` 同梱、出力に `chmod(0777)`。**共有用ZIPとしては安全性の改善を優先。**

この節は**検討候補**であり、今回の依頼と無関係な修正をAIが勝手に実施してよいという意味ではない。

## 9. ソース受け渡し・環境

- 調査したZIPには`.env`、`database/database.sqlite`、`public/storage/users`、ビルド済み`public/build`が存在。
- **秘密値そのものはこの文書に記載しない。**
- ZIP作成スクリプトの現状は `.env` を明示的に同梱する。今後は安全な共有対象だけを収集するように改善する。
- 本番のDBエンジン、キュー接続、キャッシュ接続、Vite開発ドメイン等は実際の環境で確認する。`database.sqlite` がZIPにあるだけで本番DBがSQLiteと決めつけない。
- ZIP中に `tests/` やlockファイルが**同梱されていなかった**。プロジェクト外・別ブランチに存在しないことを意味しない。
