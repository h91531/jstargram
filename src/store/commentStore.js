import { create } from 'zustand';

const useCommentStore = create((set) => ({
  commentStates: {},  // 각 포스트의 댓글창 열림 상태를 추적
  commentEnter: {},   // 각 포스트에 대한 댓글 입력 상태 관리

  // 댓글창 열림 상태를 반전시키는 함수
  toggleComment: (postId) => set((state) => {
    const newCommentStates = { ...state.commentStates };
    newCommentStates[postId] = !newCommentStates[postId];
    return { commentStates: newCommentStates };
  }),

  // 특정 포스트의 댓글창 상태를 닫는 함수
  closeComment: (postId) => set((state) => {
    const newCommentStates = { ...state.commentStates };
    newCommentStates[postId] = false;  // 해당 포스트만 닫음
    return { commentStates: newCommentStates };
  }),

  // 특정 포스트의 댓글창 상태를 설정하는 함수
  setCommentState: (postId, state) => set((state) => {
    const newCommentStates = { ...state.commentStates, [postId]: state };
    return { commentStates: newCommentStates };
  }),

  // 댓글 입력 상태를 설정하는 함수 (포스트별로 관리)
  setCommentEnter: (postId, value) => set((state) => {
    const newCommentEnter = { ...state.commentEnter, [postId]: value };
    return { commentEnter: newCommentEnter };
  }),

  // 댓글 입력 상태를 초기화하는 함수 (모든 포스트의 댓글 입력란 초기화)
  clearCommentEnter: () => set({ commentEnter: {} }),
}));

export default useCommentStore;
