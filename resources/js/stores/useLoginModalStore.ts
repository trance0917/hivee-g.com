import { create } from 'zustand';

type LoginModalStore = {
    isOpen: boolean;
    openLoginModal: () => void;
    closeLoginModal: () => void;
};

export const useLoginModalStore = create<LoginModalStore>((set) => ({
    isOpen: false,
    openLoginModal: () => set({ isOpen: true }),
    closeLoginModal: () => set({ isOpen: false }),
}));
