"use client"

import { useState } from 'react';
import '../css/login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function login_check(e) {
    e.preventDefault();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = '/dashboard';
      }
       else {
        setError(data.message || '아이디 또는 비밀번호가 틀렸습니다.');
        setUsername('');
        setPassword('');
      }
    } catch (error) {
      alert('서버에 문제가 발생했습니다. 다시 시도해주세요.');
      setUsername('');
      setPassword('');
    }
  }

  return (
    <div className="login_wrap">
      <div className="login-box inner">
        <h2 className="login-title">로그인</h2>
        <form className="login-form" onSubmit={login_check}>
          <div className="form-group">
            <label className="form-label">아이디</label>
            <input
              type="text"
              className="form-input"
              placeholder="아이디를 입력해주세요."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">비밀번호</label>
            <input
              type="password"
              className="form-input"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-button">
            로그인
          </button>
        </form>
        {error && <p className="error-message">{error}</p>}
        <p className="signup-link">
          계정이 없으신가요?{" "}
          <a href="/signup" className="signup-link-text">
            회원가입
          </a>
        </p>
      </div>
    </div>
  );
}
