"use client";

import React, { useEffect } from 'react';
import useCommentStore from "../store/commentStore";

export default function BackgroundChanger() {
    const { commentStates, closeComment, clearCommentEnter } = useCommentStore();

    const handleClick = () => {
        // 배경 클릭 시 모든 댓글창을 닫고 입력란 초기화
        Object.keys(commentStates).forEach(postId => {
            closeComment(postId);
        });

        // 댓글 입력란 초기화
        clearCommentEnter();  // Zustand를 통해 상태 초기화
    };

    // 댓글창이 하나라도 열려 있으면 true
    const isCommentOpen = Object.values(commentStates).includes(true);

    // ✨ 댓글창이 열릴 때 body에 .noscroll 클래스 추가
    useEffect(() => {
        if (isCommentOpen) {
            document.body.classList.add("notscroll");
        } else {
            document.body.classList.remove("notscroll");
        }

        return () => {
            document.body.classList.remove("notscroll");
        };
    }, [isCommentOpen]);

    return (
        <div
            onClick={handleClick}
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                width: '100%',
                height: '100%',
                display: isCommentOpen ? 'block' : 'none',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 10,
            }}
            className="bg"
        />
    );
}
