import {BrowserRouter, Routes, Route, Link} from 'react-router-dom';
import Index from './Index';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route index element={<Index/>}/>
            </Routes>
        </BrowserRouter>
    );
}
