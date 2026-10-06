import './bootstrap'; // Laravel初期生成のものがあれば
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';

import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

const queryClient = new QueryClient();

import App from './App';

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(
        <QueryClientProvider client={queryClient}>
            <App/>
            <ReactQueryDevtools initialIsOpen={false}/>
        </QueryClientProvider>
    );
}

//<StrictMode></StrictMode>
