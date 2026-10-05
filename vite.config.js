import {defineConfig} from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import fs from 'fs';

// お使いのドメインに合わせて設定
const domain = 'local.hivee-g.com';
export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/main.tsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    // ↓ これを追加するだけ！
    optimizeDeps: {
        exclude: ['maplibre-gl']
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
    server: {
        host: true,
        cors: true,
        port: 5200, // ポートを変えたいなら 5200 などに変更
        https: {
            // 証明書のパスを環境に合わせて指定してね
            key: fs.readFileSync(`/etc/letsencrypt/live/${domain}/privkey.pem`),
            cert: fs.readFileSync(`/etc/letsencrypt/live/${domain}/cert.pem`),
        },
        hmr: {
            host: domain, // これでブラウザ側が wss://hivee-g.com で繋ぎにいく
        },
        watch: {
            usePolling: false,
        },
    },
});
