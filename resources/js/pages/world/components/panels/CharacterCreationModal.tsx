import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useInitialDataStore } from '@/stores/useInitialDataStore';
import './CharacterCreationModal.css';

// idはサーバーのCharacterSpecialty（1=狩猟、2=採集）に対応する。
const choices = [
    { id: 1, label: '狩猟系', art: 'hunter' },
    { id: 2, label: '採集系', art: 'gatherer' },
];

export default function CharacterCreationModal() {
    const user = useInitialDataStore((state) => state.user);
    const characters = useInitialDataStore((state) => state.characters);
    // /worldで表示され、ログイン済み・所有0体のときだけフォームを作る。
    // 作成成功後にcharactersが更新されると、ここが再描画されモーダルも閉じる。
    if (!user || characters.length > 0) return null;
    // ユーザーが切り替わった場合は、前の入力内容を破棄する。
    return <CreationForm key={user.id} />;
}

function CreationForm() {
    const dialog = useRef<HTMLDialogElement>(null);
    // refは即座に更新されるため、busyが画面に反映される前の連打も防げる。
    const submitting = useRef(false);
    // nullは未選択。選択したidに対応するイラストだけカラー表示する。
    const [specialty, setSpecialty] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const setInitialData = useInitialDataStore((state) => state.setInitialData);
    // Unicodeコードポイント数で数える。サーバーでも16文字上限を検証する。
    const length = Array.from(name).length;
    const trimmedName = name.trim();
    let nameError = '';
    if (length > 16) {
        nameError = '名前は16文字以内で入力してください。';
    } else if (/^\p{Nd}+$/u.test(trimmedName)) {
        // 作成APIと同じく、全角を含む十進数字だけの名前を弾く。
        nameError = '数字だけの名前は使えません。';
    } else if (trimmedName.includes('【GM】')) {
        nameError = '【GM】はゲームマスター専用の表記です。';
    }
    const canSubmit = !busy && specialty !== null && trimmedName !== '' && !nameError;

    useEffect(() => {
        // ネイティブdialogで背景操作を抑え、キーボードのフォーカスを内側に保つ。
        dialog.current?.showModal();
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        // 作成完了や/worldからの移動で消えるときに、元のスクロール状態へ戻す。
        return () => { document.body.style.overflow = previousOverflow; };
    }, []);

    async function submit(event: React.FormEvent) {
        event.preventDefault();
        if (submitting.current || !canSubmit) return;
        submitting.current = true;
        setBusy(true);
        setError('');
        try {
            const { data } = await axios.post('/api/characters', { specialty, name: trimmedName });
            // POST成功レスポンスは/api/initial-dataと同じ形式。
            // 全ページ共通のストアを更新すると、上の所有数判定も更新される。
            setInitialData(data);
        } catch (cause) {
            let message = '作成できませんでした。時間をおいて再度お試しください。';
            if (axios.isAxiosError(cause)) {
                const errors = cause.response?.data?.errors;
                message = errors ? String(Object.values(errors).flat()[0]) : message;
                if (cause.response?.status === 401 || cause.response?.status === 419) {
                    message = 'ログインの有効期限が切れました。ページを再読み込みしてください。';
                }
            }
            setError(message);
        } finally {
            submitting.current = false;
            setBusy(false);
        }
    }

    return (
        // 作成が完了するまでEscキーで閉じない。
        <dialog ref={dialog} className="character-dialog" aria-labelledby="character-title" onCancel={(event) => event.preventDefault()}>
            <form className="character-scene" onSubmit={submit}>
                <header className="character-heading">
                    <h2 id="character-title" tabIndex={-1} autoFocus>キャラクターを選択してください</h2>
                    <p>あなたとともに、この世界を歩む<br />妖精を選び、名前をつけましょう。</p>
                </header>
                {/* 操作は中央の紋章に集約し、同じ選択状態を左右の立ち絵にも反映する。 */}
                <div className="character-portraits" aria-hidden="true">
                    {choices.map((choice) => (
                        <img key={choice.id} alt="" width={440} height={760}
                            className={`character-portrait ${choice.art}`} data-selected={specialty === choice.id}
                            src={`/assets/images/characters/select-${choice.art}.png`} />
                    ))}
                </div>
                <fieldset disabled={busy} className="character-choices">
                    <legend className="sr-only">キャラクターの種類</legend>
                    {choices.map((choice) => (
                        <label key={choice.id} className="character-choice">
                            <input className="sr-only" type="radio" name="specialty" value={choice.id} aria-label={choice.label}
                                checked={specialty === choice.id} onChange={() => setSpecialty(choice.id)} required />
                            <img alt="" width={448} height={526} src={`/assets/images/characters/select-emblem-${choice.art}.png`} />
                        </label>
                    ))}
                </fieldset>
                <div className="character-details">
                    <label className="character-name" htmlFor="character-name">キャラクター名</label>
                    <div className="character-input">
                        <input id="character-name" value={name} onChange={(event) => setName(event.target.value)} required disabled={busy} autoComplete="off" placeholder="名前を入力"
                            aria-invalid={Boolean(nameError)} aria-describedby={nameError ? 'character-name-limit character-name-error' : 'character-name-limit'} />
                        <span id="character-name-limit">{length} / 16</span>
                    </div>
                    {nameError && <p id="character-name-error" role="alert">{nameError}</p>}
                    {error && <p role="alert">{error}</p>}
                    <button className="world-primary-button mt-[25px]" disabled={!canSubmit}>
                        {busy ? '作成しています…' : 'このキャラクターで始める'}
                    </button>
                </div>
            </form>
        </dialog>
    );
}
