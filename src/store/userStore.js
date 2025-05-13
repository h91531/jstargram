// store/userStore.js
import {create} from 'zustand';

const useUserStore = create((set) => ({
  userStore_id: null,
  setId : (userStore_id) => set({userStore_id}),
  nickname: null,
  setNickname: (nickname) => set({ nickname }),
  logout: () => set({ userStore_id: null }),  
}));

export default useUserStore;
