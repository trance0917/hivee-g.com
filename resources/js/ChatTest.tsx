import React, {useState, useEffect} from 'react';
import axios from 'axios';

export default function ChatTest() {
    const [messages, setMessages] = useState<string[]>([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        // パブリックチャンネルを購読してメッセージを待ち受ける
        window.Echo.channel('public-chat')
            .listen('.chat-message', (e: { message: string }) => {
                console.log('受け取ったぞ！', e);
                setMessages(prev => [...prev, e.message]);
            });

        // コンポーネントが消えるときにチャンネルから抜ける
        return () => {
            window.Echo.leaveChannel('public-chat');
        };
    }, []);

    const sendMessage = async () => {
        if (!input.trim()) return;
        // さっき作ったAPIにメッセージを送る
        await axios.post('/api/chat/send', {message: input});
        setInput('');
    };

    return (
        <div style={{padding: '20px', maxWidth: '400px'}}>
            <h2>テストチャット</h2>
            <div style={{
                height: '300px',
                overflowY: 'auto',
                border: '1px solid #ccc',
                marginBottom: '10px',
                padding: '10px'
            }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{padding: '5px', borderBottom: '1px solid #eee'}}>{msg}</div>
                ))}
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    style={{flex: 1, padding: '5px'}}
                />
                <button onClick={sendMessage} style={{padding: '5px 15px'}}>送信</button>
            </div>
        </div>
    );
}
