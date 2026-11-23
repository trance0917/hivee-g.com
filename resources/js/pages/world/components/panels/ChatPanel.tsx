import { useContext, useEffect, useRef, useState, type FormEvent } from 'react';
import { PanelLoadingScope } from '@/stores/useApiLoading';
import axios from 'axios';
import { useUser } from '@/stores/useInitialDataStore';

/** 全チャットをひとつのタイムラインに表示。種類切替では再取得しない。 */
type ChatKind = 'normal' | 'village' | 'global' | 'direct' | 'nearby';

type ChatMessage = {
    id: number;
    type: number;
    user_id: number;
    sender_user_text_id: string | null;
    recipient_user_id: number | null;
    recipient_user_text_id: string | null;
    message: string;
    created_at: string | null;
};

type ChatHistoryResponse = {
    messages: ChatMessage[];
    village_id: number | null;
};

// システム案内もチャットと同じ時系列に積み、後続の投稿で上へ流す。
type TimelineItem =
    | { kind: 'message'; message: ChatMessage }
    | { kind: 'system'; id: number; content: 'intro' | 'help' };

const CHAT_TYPES: Record<ChatKind, { label: string; dot: string; color: string }> = {
    normal:  { label: '通常', dot: 'bg-slate-300', color: 'text-slate-600' },
    village: { label: '村', dot: 'bg-pink-400', color: 'text-pink-500' },
    global:  { label: '全体', dot: 'bg-sky-400', color: 'text-sky-500' },
    direct:  { label: '個人', dot: 'bg-orange-400', color: 'text-orange-500' },
    nearby:  { label: '周辺', dot: 'bg-emerald-400', color: 'text-emerald-500' },
};

const KINDS = Object.keys(CHAT_TYPES) as ChatKind[];
const MESSAGE_LIMIT = 200;
const TIMELINE_LIMIT = MESSAGE_LIMIT + 50;

function messageKind(type: number): ChatKind {
    switch (type) {
        case 2: return 'village';
        case 3: return 'global';
        case 4: return 'direct';
        case 7:
        case 8: return 'nearby';
        default: return 'normal';
    }
}

function formatSender(kind: ChatKind, sender: string): string {
    switch (kind) {
        case 'global': return `[${sender}]`;
        case 'village': return `{${sender}}`;
        case 'direct': return `@${sender}`;
        default: return sender;
    }
}

function mergeMessages(previous: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
    const byId = new Map<number, ChatMessage>();
    for (const message of previous) byId.set(message.id, message);
    for (const message of incoming) byId.set(message.id, message);
    return [...byId.values()].sort((a, b) => a.id - b.id).slice(-MESSAGE_LIMIT);
}

function appendMessages(previous: TimelineItem[], incoming: ChatMessage[]): TimelineItem[] {
    const existingIds = new Set(
        previous.filter((item) => item.kind === 'message').map((item) => item.message.id),
    );
    const fresh = incoming
        .filter((message) => !existingIds.has(message.id))
        .sort((a, b) => a.id - b.id)
        .map((message): TimelineItem => ({ kind: 'message', message }));

    return [...previous, ...fresh].slice(-TIMELINE_LIMIT);
}

function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        const validation = data?.errors?.message?.[0] ?? data?.errors?.character_id?.[0];
        if (typeof validation === 'string') return validation;
        if (error.response?.status === 401) return 'ログインしてください。';
        if (error.response?.status === 429) return '送信が多すぎます。少し時間をおいてください。';
    }
    return '通信エラーが発生しました。';
}

export default function ChatPanel() {
    // 履歴の取得と送信のどちらも、チャットを囲んでいるフレームに表示する。
    const loadingScope = useContext(PanelLoadingScope);
    const user = useUser();
    const [visibleKinds, setVisibleKinds] = useState<ChatKind[]>(KINDS);
    const [timeline, setTimeline] = useState<TimelineItem[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const endRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const nextSystemId = useRef(0);

    const allSelected = visibleKinds.length === KINDS.length;
    // システム案内は全フィルターで表示し、チャット投稿と同じ場所でスクロールさせる。
    const visibleTimeline = timeline.filter(
        (item) => item.kind === 'system' || visibleKinds.includes(messageKind(item.message.type)),
    );

    useEffect(() => {
        endRef.current?.scrollIntoView({ block: 'nearest' });
    }, [timeline, visibleKinds]);

    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        let userChannel: string | null = null;
        let villageChannel: string | null = null;
        const echo = window.Echo;

        const receive = (message: ChatMessage) => {
            if (active) setTimeline((previous) => appendMessages(previous, [message]));
        };

        // 公開チャンネルは未ログインでも購読できる。
        echo.channel('chat.global').listen('.chat-message', receive);
        // DMはアカウントごとに1つの非公開チャンネルを購読する。
        if (user) {
            userChannel = `chat.user.${user.id}`;
            echo.private(userChannel).listen('.chat-message', receive);
        }

        const initialize = async () => {
            setLoading(true);
            setError(null);
            setTimeline([]);
            try {
                const { data } = await axios.get<ChatHistoryResponse>('/api/chat/messages', {
                    loadingScope,
                    signal: controller.signal,
                });
                if (!active) return;

                // 履歴は先頭に配置。取得中に届いたイベントはIDで重複排除する。
                setTimeline((previous) => {
                    const existingMessages = previous
                        .filter((item) => item.kind === 'message')
                        .map((item) => item.message);
                    const history = mergeMessages(existingMessages, data.messages)
                        .map((message): TimelineItem => ({ kind: 'message', message }));
                    const localItems = previous.filter((item) => item.kind === 'system');
                    return [...history, ...localItems].slice(-TIMELINE_LIMIT);
                });

                if (user) {
                    // 所属村のprivateチャンネル。認可はLaravel側で行う。
                    if (data.village_id !== null) {
                        villageChannel = `chat.village.${data.village_id}`;
                        echo.private(villageChannel).listen('.chat-message', receive);
                    }
                }
            } catch (err) {
                if (active) setError(getErrorMessage(err));
            } finally {
                if (active) {
                    // 履歴の取得結果にかかわらず、初回案内はタイムラインへ1件追加する。
                    const id = ++nextSystemId.current;
                    const introItem: TimelineItem = { kind: 'system', id, content: 'intro' };
                    setTimeline((previous) => [
                        ...previous,
                        introItem,
                    ].slice(-TIMELINE_LIMIT));
                    setLoading(false);
                }
            }
        };

        void initialize();

        return () => {
            active = false;
            controller.abort();
            echo.leave('chat.global');
            if (villageChannel) echo.leave(villageChannel);
            if (userChannel) echo.leave(userChannel);
        };
    }, [user?.id, user?.village_id, loadingScope]);

    // 単一選択。選択中の種類を再度押してもOFFにはしない。
    const selectKind = (kind: ChatKind) => {
        setVisibleKinds([kind]);
    };

    // 名前を押すとユーザー公開IDを宛先にセットし、本文の入力位置へ移動する。
    const prepareWhisper = (textId: string) => {
        if (!user || isSending) return;

        setInput(`@${textId} `);
        // Reactの入力値反映後にカーソルを半角スペースの直後へ移動する。
        window.requestAnimationFrame(() => {
            const field = inputRef.current;
            if (!field) return;
            field.focus();
            field.setSelectionRange(field.value.length, field.value.length);
        });
    };

    const openHelp = () => {
        // ヘルプをチャットタイムラインに1件追加（API/DBには保存しない）。
        const id = ++nextSystemId.current;
        const helpItem: TimelineItem = { kind: 'system', id, content: 'help' };
        setTimeline((previous) => [
            ...previous,
            helpItem,
        ].slice(-TIMELINE_LIMIT));
        setError(null);
    };

    const send = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const text = input.trim();
        if (text === '/help') {
            // ローカルのヘルプ。チャットAPIへは送信せず、DBにも保存しない。
            openHelp();
            setInput('');
            return;
        }
        if (!user || !text || isSending) return;

        // 宛先指定（**、#、@公開ID）を除いた本文だけを100文字で判定する。
        const body = text.startsWith('** ')
            ? text.slice(3).trim()
            : text.startsWith('# ')
                ? text.slice(2).trim()
                : text.match(/^@[A-Za-z0-9_-]{3,255}\s+(.+)$/us)?.[1]?.trim();
        if (body !== undefined && Array.from(body).length > 100) {
            setError('本文は1〜100文字で入力してください。');
            return;
        }

        setIsSending(true);
        setError(null);
        try {
            const { data } = await axios.post<{ message: ChatMessage }>('/api/chat/send', {
                message: text,
            }, { loadingScope });
            setTimeline((previous) => appendMessages(previous, [data.message]));
            setInput('');
        } catch (err) {
            // 再入力を強制しない。バリデーションエラー時も本文を保持する。
            setError(getErrorMessage(err));
        } finally {
            setIsSending(false);
        }
    };

    return (
        <section className="relative flex h-full min-w-0 flex-col" aria-label="チャット">
            <div className="absolute right-[5px] top-[-17px] bg-white/70 p-[4px] border rounded-[5px] border-yellow-300/70 flex flex-wrap gap-[5px]" aria-label="チャットの表示フィルター">
                <button
                    type="button"
                    onClick={() => setVisibleKinds(KINDS)}
                    aria-pressed={allSelected}
                    title="すべて表示"
                    aria-label="すべて表示"
                    className={`grid h-[18px] w-[18px] place-items-center rounded-full border border-slate-300 bg-slate-400 text-[8px] text-white ${allSelected ? 'opacity-100' : 'opacity-40'}`}
                >All</button>
                {KINDS.map((kind) => (
                    <button
                        key={kind}
                        type="button"
                        title={`${CHAT_TYPES[kind].label}チャットのみ表示`}
                        aria-label={`${CHAT_TYPES[kind].label}チャットのみ表示`}
                        aria-pressed={visibleKinds.includes(kind)}
                        onClick={() => selectKind(kind)}
                        className={`h-[18px] w-[18px] rounded-full border-2 border-white/40 ${CHAT_TYPES[kind].dot} ${visibleKinds.includes(kind) ? 'opacity-100' : 'opacity-40'}`}
                    />
                ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-[10px] pt-[8px] text-[13px] leading-5" role="log" aria-live="polite">
                {loading && <p className="text-slate-400">履歴を読み込み中...</p>}
                {visibleTimeline.map((item) => {
                    if (item.kind === 'system') {
                        return item.content === 'intro' ? (
                            <p key={`system-${item.id}`} className="break-words text-red-600">
                                チャットの使い方については/help と入力してください
                            </p>
                        ) : (
                            <div key={`system-${item.id}`} className="break-words text-red-600" aria-label="チャットの使い方">
                                <p>チャットの使い方</p>
                                <p>全体チャット：** 本文</p>
                                <p>村チャット：# 本文（所属村の設定が必要）</p>
                                <p>ウィスパー：@ユーザー公開ID 本文</p>
                                <p>名前をタップすると、相手へのウィスパーを入力できます。</p>
                                <p>右上のAll／色ボタンで表示種類を切り替えられます。本文は最大100文字です。</p>
                            </div>
                        );
                    }

                    const message = item.message;
                    const kind = messageKind(message.type);
                    const sender = message.sender_user_text_id ?? `ユーザー${message.user_id}`;
                    // ウィスパーは送信者なら宛先、受信者なら送信元を表示する。
                    const isSentDirect = kind === 'direct' && message.user_id === user?.id;
                    const partner = isSentDirect
                        ? message.recipient_user_text_id
                            ?? (message.recipient_user_id !== null ? `ユーザー${message.recipient_user_id}` : sender)
                        : sender;
                    // DMは画面に表示されている「相手」、それ以外は発言者を返信先にする。
                    const replyTextId = isSentDirect ? message.recipient_user_text_id : message.sender_user_text_id;
                    const replyUserId = isSentDirect ? message.recipient_user_id : message.user_id;
                    // 公開ID不明の旧履歴と、自分自身への返信は操作不可（サーバーも自己DMを拒否）。
                    const canReply = !!user && !isSending && !!replyTextId && replyUserId !== null && replyUserId !== user.id;
                    return (
                        <p key={message.id} className={`break-words ${CHAT_TYPES[kind].color}`}>
                            {canReply ? (
                                <button
                                    type="button"
                                    onClick={() => { if (replyTextId) prepareWhisper(replyTextId); }}
                                    title={`${partner} にウィスパーを送る`}
                                    aria-label={`${partner} にウィスパーを送る`}
                                    className="cursor-pointer font-medium text-inherit transition-opacity duration-150 hover:opacity-60 focus-visible:opacity-60 focus-visible:underline active:opacity-40"
                                >
                                    {formatSender(kind, partner)}
                                </button>
                            ) : (
                                <span className="font-medium">{formatSender(kind, partner)}</span>
                            )}
                            ：{message.message}
                        </p>
                    );
                })}
                <div ref={endRef} />
            </div>

            {error && <p role="alert" className="px-[8px] py-[2px] text-[12px] text-red-600">{error}</p>}
            <form onSubmit={send} className="flex min-w-0 gap-[5px] border-t border-white/20 px-[8px] py-[8px]">
                <input
                    ref={inputRef}
                    type="text"
                    value={user ? input : ''}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={user ? 'メッセージを入力' : 'ログインしてチャットを送信'}
                    readOnly={!user || isSending}
                    title="所属村: # 本文 / 全体: ** 本文 / 個人: @ユーザーID 本文"
                    aria-label="チャット入力"
                    className={`min-w-0 flex-1 rounded border border-slate-300/80 px-[5px] py-[5px] text-[13px] text-slate-600 outline-none focus:border-slate-400/60 ${!user ? 'cursor-not-allowed placeholder:text-red-400 bg-slate-200' : 'bg-white/50'}`}
                />
                <button
                    type="submit"
                    disabled={!user || !input.trim() || isSending}
                    className="rounded px-[10px] py-[5px] bg-blue-400 text-white text-[14px] disabled:cursor-not-allowed disabled:bg-slate-400/80"
                >
                    {isSending ? '送信中' : '送信'}
                </button>
            </form>
        </section>
    );
}
