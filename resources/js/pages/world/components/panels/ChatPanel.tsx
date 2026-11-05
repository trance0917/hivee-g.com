import { useEffect, useRef, useState, type FormEvent } from 'react';
import axios from 'axios';
import { useUser } from '@/stores/useInitialDataStore';

/** 全チャットをひとつのタイムラインに表示。種類切替では再取得しない。 */
type ChatKind = 'normal' | 'village' | 'global' | 'direct' | 'nearby';

type ChatMessage = {
    id: number;
    type: number;
    user_id: number;
    character_id: number | null;
    sender_character_text_id: string | null;
    recipient_character_text_id: string | null;
    message: string;
    created_at: string | null;
};

type ChatHistoryResponse = {
    messages: ChatMessage[];
    character_ids: number[];
    village_id: number | null;
};

const CHAT_TYPES: Record<ChatKind, { label: string; dot: string; color: string }> = {
    normal:  { label: '通常', dot: 'bg-slate-300', color: 'text-slate-600' },
    village: { label: '村', dot: 'bg-pink-400', color: 'text-pink-500' },
    global:  { label: '全体', dot: 'bg-sky-400', color: 'text-sky-500' },
    direct:  { label: '個人', dot: 'bg-orange-400', color: 'text-orange-500' },
    nearby:  { label: '周辺', dot: 'bg-emerald-400', color: 'text-emerald-500' },
};

const KINDS = Object.keys(CHAT_TYPES) as ChatKind[];
const MESSAGE_LIMIT = 200;

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

function mergeMessages(previous: ChatMessage[], incoming: ChatMessage[]): ChatMessage[] {
    const byId = new Map<number, ChatMessage>();
    for (const message of previous) byId.set(message.id, message);
    for (const message of incoming) byId.set(message.id, message);
    return [...byId.values()].sort((a, b) => a.id - b.id).slice(-MESSAGE_LIMIT);
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
    const user = useUser();
    const [visibleKinds, setVisibleKinds] = useState<ChatKind[]>(KINDS);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const endRef = useRef<HTMLDivElement>(null);

    const allSelected = visibleKinds.length === KINDS.length;
    const filteredMessages = messages.filter((message) => visibleKinds.includes(messageKind(message.type)));

    useEffect(() => {
        endRef.current?.scrollIntoView({ block: 'nearest' });
    }, [messages, visibleKinds]);

    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        const characterChannels: string[] = [];
        let villageChannel: string | null = null;
        const echo = window.Echo;

        const receive = (message: ChatMessage) => {
            if (active) setMessages((previous) => mergeMessages(previous, [message]));
        };

        // 公開チャンネルは未ログインでも購読できる。
        echo.channel('chat.global').listen('.chat-message', receive);

        const initialize = async () => {
            setLoading(true);
            setError(null);
            setMessages([]);
            try {
                const { data } = await axios.get<ChatHistoryResponse>('/api/chat/messages', {
                    signal: controller.signal,
                });
                if (!active) return;

                // 受信済みイベントと重複する場合もIDで統合する。
                setMessages((previous) => mergeMessages(previous, data.messages));

                if (user) {
                    // 所属村のprivateチャンネル。認可はLaravel側で行う。
                    if (data.village_id !== null) {
                        villageChannel = `chat.village.${data.village_id}`;
                        echo.private(villageChannel).listen('.chat-message', receive);
                    }

                    for (const id of data.character_ids) {
                        const channel = `chat.character.${id}`;
                        characterChannels.push(channel);
                        echo.private(channel).listen('.chat-message', receive);
                    }
                }
            } catch (err) {
                if (active) setError(getErrorMessage(err));
            } finally {
                if (active) setLoading(false);
            }
        };

        void initialize();

        return () => {
            active = false;
            controller.abort();
            echo.leave('chat.global');
            if (villageChannel) echo.leave(villageChannel);
            for (const channel of characterChannels) echo.leave(channel);
        };
    }, [user?.id, user?.active_character_id]);

    const toggleKind = (kind: ChatKind) => {
        setVisibleKinds((previous) =>
            previous.includes(kind)
                ? previous.filter((value) => value !== kind)
                : [...previous, kind],
        );
    };

    const send = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const text = input.trim();
        if (!user || !text || isSending) return;

        setIsSending(true);
        setError(null);
        try {
            const { data } = await axios.post<{ message: ChatMessage }>('/api/chat/send', {
                message: text,
            });
            setMessages((previous) => mergeMessages(previous, [data.message]));
            setInput('');
        } catch (err) {
            setError(getErrorMessage(err));
            setInput('');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <section className="relative flex h-full min-w-0 flex-col" aria-label="チャット">
            <div className="absolute right-[5px] top-[-17px] bg-white/70 p-[4px] border rounded-[5px] border-yellow-300/70 flex flex-wrap gap-[5px]" aria-label="チャットの表示フィルター">
                <button
                    type="button"
                    onClick={() => setVisibleKinds(allSelected ? [] : KINDS)}
                    aria-pressed={allSelected}
                    title="すべて表示 / 非表示"
                    aria-label="すべて表示 / 非表示"
                    className={`grid h-[18px] w-[18px] place-items-center rounded-full border border-slate-300 bg-slate-400 text-[8px] text-white ${allSelected ? 'opacity-100' : 'opacity-40'}`}
                >All</button>
                {KINDS.map((kind) => (
                    <button
                        key={kind}
                        type="button"
                        title={`${CHAT_TYPES[kind].label}チャットを表示/非表示`}
                        aria-label={`${CHAT_TYPES[kind].label}チャットを表示/非表示`}
                        aria-pressed={visibleKinds.includes(kind)}
                        onClick={() => toggleKind(kind)}
                        className={`h-[18px] w-[18px] rounded-full border-2 border-white/40 ${CHAT_TYPES[kind].dot} ${visibleKinds.includes(kind) ? 'opacity-100' : 'opacity-40'}`}
                    />
                ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-[10px] pt-[8px] text-[13px] leading-5" role="log" aria-live="polite">
                {loading && <p className="text-slate-400">履歴を読み込み中...</p>}
                {filteredMessages.map((message) => {
                    const kind = messageKind(message.type);
                    const sender = message.sender_character_text_id ?? `ユーザー${message.user_id}`;
                    return (
                        <p key={message.id} className={`break-words ${CHAT_TYPES[kind].color}`}>
                            <span className="font-medium">{sender}：</span>
                            {kind === 'direct' && message.recipient_character_text_id && (
                                <span className="font-medium">@{message.recipient_character_text_id} </span>
                            )}
                            {message.message}
                        </p>
                    );
                })}
                <div ref={endRef} />
            </div>

            {error && <p role="alert" className="px-[8px] py-[2px] text-[12px] text-red-600">{error}</p>}
            <form onSubmit={send} className="flex min-w-0 gap-[5px] border-t border-white/20 px-[8px] py-[8px]">
                <input
                    type="text"
                    value={user ? input : ''}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={user ? 'メッセージを入力' : 'ログインしてチャットを送信'}
                    readOnly={!user || isSending}
                    title="所属村: # 本文 / 全体: ** 本文 / 個人: @キャラクターID 本文"
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
