// useStore.js
import {create} from 'zustand';

const useStore = create((set) => ({
    isMobileMenuOpen: false,
    toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
}));

export default useStore;
