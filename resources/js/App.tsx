import {BrowserRouter, Routes, Route, Link} from 'react-router-dom';
import MapSample from './Index';

function Home() {
    return (
        <div style={{padding: '2rem'}}>
            <h1>村ゲー 設定ツール</h1>
            <ul>
                <li>
                    <Link to="/test/map-sample" style={{color: 'blue'}}>
                        マップテスト画面へ（/map-sample）
                    </Link>
                </li>
                <li>
                    <Link to="/test/map-sample-2" style={{color: 'blue'}}>
                        マップテスト画面へ（/map-sample-2）
                    </Link>
                </li>
                <li>
                    <Link to="/test/map-sample-3" style={{color: 'blue'}}>
                        マップテスト画面へ（/test/map-sample-3）
                    </Link>
                </li>
                <li>
                    <Link to="/test/chat" style={{color: 'blue'}}>
                        チャットテストへ（/test/chat）
                    </Link>
                </li>
            </ul>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/test/" element={<Home/>}/>
                <Route path="/test/map-sample" element={<MapSample/>}/>
                <Route path="/test/map-sample-2" element={<MapSample2/>}/>
                <Route path="/test/map-sample-3" element={<MapSample3/>}/>
                <Route path="/test/chat" element={<ChatTest/>}/>
            </Routes>
        </BrowserRouter>
    );
}
