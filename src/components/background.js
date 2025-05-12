"use client"

import React, { useEffect } from 'react';
import useCommentStore from "../store/commentStore";
import useStore from "../store/useStore";

export default function BackgroundChanger() {
    const { commentStates, closeComment, clearCommentEnter } = useCommentStore();
    const { isMobileMenuOpen } = useStore(); // 모바일 메뉴 상태 가져오기

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

    // 댓글창이나 모바일 메뉴가 열려 있을 때 body에 .noscroll 클래스 추가
    useEffect(() => {
        if (isCommentOpen || isMobileMenuOpen) {
            document.body.classList.add("notscroll");
        } else {
            document.body.classList.remove("notscroll");
        }

        return () => {
            document.body.classList.remove("notscroll");
        };
    }, [isCommentOpen, isMobileMenuOpen]);

    return (
        <div
            onClick={handleClick}
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                width: '100%',
                height: '100%',
                display: (isCommentOpen || isMobileMenuOpen) ? 'block' : 'none',
                position: 'fixed',
                top: 0,
                left: 0,
                zIndex: 10,
            }}
            className="bg"
        />
    );
}
