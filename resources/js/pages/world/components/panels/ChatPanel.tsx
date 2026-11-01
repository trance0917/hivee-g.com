import { useEffect, useRef, useState, type FormEvent } from 'react';

/** 見た目を確認するための仮データ。APIやWebSocketはまだ使用しない。 */
type ChatKind = 'normal' | 'village' | 'global' | 'direct' | 'nearby';

type PreviewMessage = {
    id: number;
    kind: ChatKind;
    name: string;
    text: string;
};

const CHAT_TYPES: Record<ChatKind, { label: string; dot: string; color: string }> = {
    normal:  { label: '通常', dot: 'bg-slate-300', color: 'text-slate-600' },
    village: { label: '村', dot: 'bg-pink-400', color: 'text-pink-500' },
    global:  { label: '全体', dot: 'bg-sky-400', color: 'text-sky-500' },
    direct:  { label: '個人', dot: 'bg-orange-400', color: 'text-orange-500' },
    nearby:  { label: '周辺', dot: 'bg-emerald-400', color: 'text-emerald-500' },
};

const KINDS = Object.keys(CHAT_TYPES) as ChatKind[];

const INITIAL_MESSAGES: PreviewMessage[] = [
    { id: 1, kind: 'global', name: 'ミナ', text: 'みんな、おはよう！' },
    { id: 2, kind: 'normal', name: 'コハク', text: 'この村に着いたよ' },
    { id: 3, kind: 'village', name: 'ルナ', text: '精霊樹の育成、あと少しだね' },
    { id: 4, kind: 'direct', name: 'アオイ', text: '一緒に採集に行かない？' },
    { id: 5, kind: 'nearby', name: 'ソラ', text: '近くに誰かいる？' },
    { id: 6, kind: 'normal', name: 'コハク', text: 'よろしくお願いします！' },
];

export default function ChatPanel() {
    const [visibleKinds, setVisibleKinds] = useState<ChatKind[]>(KINDS);
    const [messages, setMessages] = useState<PreviewMessage[]>(INITIAL_MESSAGES);
    const [input, setInput] = useState('');
    const endRef = useRef<HTMLDivElement>(null);

    const allSelected = visibleKinds.length === KINDS.length;
    const filteredMessages = messages.filter((message) => visibleKinds.includes(message.kind));

    useEffect(() => {
        endRef.current?.scrollIntoView({ block: 'nearest' });
    }, [messages, visibleKinds]);

    const toggleKind = (kind: ChatKind) => {
        setVisibleKinds((previous) =>
            previous.includes(kind)
                ? previous.filter((value) => value !== kind)
                : [...previous, kind],
        );
    };

    const sendPreview = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const text = input.trim();
        if (!text) return;

        // 画面確認用。サーバーへの送信は行わない。
        setMessages((previous) => [
            ...previous,
            { id: previous.length ? previous[previous.length - 1].id + 1 : 1, kind: 'normal', name: '自分（仮）', text },
        ]);
        setInput('');
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
                        title={`${CHAT_TYPES[kind].label}チャットを表示/非表示`}
                        aria-label={`${CHAT_TYPES[kind].label}チャットを表示/非表示`}
                        aria-pressed={visibleKinds.includes(kind)}
                        onClick={() => toggleKind(kind)}
                        className={`h-[18px] w-[18px] rounded-full border-2 border-white/40 ${CHAT_TYPES[kind].dot} ${visibleKinds.includes(kind) ? 'opacity-100' : 'opacity-40'}`}
                    />
                ))}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-[10px] pt-[8px] text-[13px] leading-5" role="log" aria-live="polite">
                {filteredMessages.map((message) => (
                    <p key={message.id} className={`break-words ${CHAT_TYPES[message.kind].color}`}>
                        <span className="font-medium">{message.name}：</span>{message.text}
                    </p>
                ))}
                <div ref={endRef} />
            </div>

            <form onSubmit={sendPreview} className="flex min-w-0 gap-[5px] border-t border-white/20 px-[8px] py-[8px]">
                <input
                    type="text"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="メッセージを入力"
                    aria-label="チャット入力"
                    className="min-w-0 flex-1 rounded border border-slate-300/80 bg-white/50 px-[5px] py-[5px] text-[13px] text-slate-600 outline-none focus:border-slate-400/60"
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className="rounded px-[10px] py-[5px] bg-slate-400 text-white text-[14px] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    送信
                </button>
            </form>
        </section>
    );
}
