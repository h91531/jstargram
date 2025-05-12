import { create } from 'zustand'

const useSwitchStore = create((set) => ({
  useNewUrl: 0, // 0: 기존, 1: 새 URL
  toggleUrl: () => set((state) => ({ useNewUrl: state.useNewUrl === 1 ? 0 : 1 })),
}))

export default useSwitchStore