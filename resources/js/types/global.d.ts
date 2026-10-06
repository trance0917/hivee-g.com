/// <reference types="vite/client" />

import {AxiosStatic} from 'axios';
import Pusher from 'pusher-js';
import Echo from 'laravel-echo';

declare global {
    interface Window {
        axios: AxiosStatic;
        Pusher: typeof Pusher;
        Echo: Echo;
    }
}
