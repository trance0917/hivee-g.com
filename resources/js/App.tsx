import {BrowserRouter, Routes, Route, Link} from 'react-router-dom';
import Index from '@/pages/Index';
import { LoginModalProvider, useLoginModal } from "@/contexts/LoginModalContext";
import LoginModal from "@/components/LoginModal";
// モーダルをマウントするラッパー
const GlobalLoginModal = () => {
    const { isOpen, closeLoginModal } = useLoginModal();
    return <LoginModal isOpen={isOpen} onClose={closeLoginModal} />;
};

export default function App() {
    return (
        <LoginModalProvider>
            <BrowserRouter>
                <Routes>
                    <Route index element={<Index/>}/>
                </Routes>
                <GlobalLoginModal />
            </BrowserRouter>
        </LoginModalProvider>
    );
}
