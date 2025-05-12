// store/userStore.js
import {create} from 'zustand';

const useUserStore = create((set) => ({
  nickname: null,
  setNickname: (nickname) => set({ nickname }),
}));

export default useUserStore;
