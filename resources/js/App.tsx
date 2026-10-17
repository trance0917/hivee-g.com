import { useEffect } from 'react';
import {BrowserRouter, Routes, Route, Link} from 'react-router-dom';
import Index from '@/pages/Index';
import LoginModal from "@/components/LoginModal";
import { useInitialDataStore } from "@/stores/useInitialDataStore";

export default function App() {
    const fetchInitialData = useInitialDataStore((state) => state.fetchInitialData);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);
    return (
        <BrowserRouter>
            <Routes>
                <Route index element={<Index/>}/>
            </Routes>
            <LoginModal />
        </BrowserRouter>
    );
}
