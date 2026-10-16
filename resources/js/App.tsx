import {BrowserRouter, Routes, Route, Link} from 'react-router-dom';
import Index from '@/pages/Index';
import LoginModal from "@/components/LoginModal";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route index element={<Index/>}/>
            </Routes>
            <LoginModal />
        </BrowserRouter>
    );
}
