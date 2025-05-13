'use client';

import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import useSearchStore from '../store/searchStore';
import useStore from '../store/useStore'; 
import userStore from '../store/userStore.js';
import React, { useState, useEffect } from 'react'; 
import '../app/css/header.css';

export default function Header({ nickname, id }) {
  const pathname = usePathname();
  const hideSearch = pathname.includes('upload') || pathname.includes('edit');
  const uploadPath = pathname.includes('upload');
  const router = useRouter();
  const { setNickname, setId, logout } = userStore(); 
  const { isMobileMenuOpen, toggleMobileMenu } = useStore();
  const setSearchQuery = useSearchStore((state) => state.setSearchQuery);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout');
      logout();
      window.location.href="/login";
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  useEffect(() => {
    if (nickname && id) {
      setNickname(nickname);
      setId(id);
    }
  }, [nickname, id, setNickname, setId]);

  // ✅ 경로가 변경되면 모바일 메뉴 닫기
  useEffect(() => {
    if (isMobileMenuOpen) {
      toggleMobileMenu();
    }
  }, [pathname]);

  return (
    <header>
      <div className="container">
        <h1><Link href="/">로고</Link></h1>
            {nickname && (
               <h2 className="user_nickname">{nickname}님</h2>
            )}
        <ul className="nav">
          <li onClick={toggleMobileMenu}><img src="/menu.svg" alt="메뉴" /></li>
        </ul>
      </div>
      <div className={`mob ${isMobileMenuOpen ? 'on' : ''}`}>
        <ul className="mob_nav">
          {!uploadPath && (
            <li><Link href="/upload" className="upload_link">글 쓰기<b></b></Link></li>
          )}
          {nickname ? (
            <>
              <li className="log_out" onClick={handleLogout} style={{ cursor: 'pointer' }}>
                로그아웃
              </li>
            </>
          ) : (
            <>
              <li><Link href="/login">로그인</Link></li>
              <li><Link href="/signup">회원가입</Link></li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
}
