'use client'

import { useState } from 'react';
import '../css/signup.css';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [birth, setBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [nickname, setNickname] = useState('');
  
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!isIdChecked) {
      alert('아이디 중복 확인을 해주세요.');
      return;
    }

    if (!isNicknameChecked) {
      alert('닉네임 중복 확인을 해주세요.');
      return;
    }

    // formData 객체 수정하여 JSON으로 전송
    const formData = {
      user_id: id,
      user_password: password,
      user_name: name,
      user_birth: birth,
      user_phone: phone,
      user_nickname: nickname,
    };


    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });


      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        setId('');
        setPassword('');
        setName('');
        setBirth('');
        setPhone('');
        setNickname('');
        setIsIdChecked(false);
        setIsNicknameChecked(false);
        router.push('/login');
        
      } else {
        alert(data.message);
      }
    } catch (error) {
    }
  };

const checkAvailability = async (type) => {
  const value = type === 'id' ? id : nickname;

  // 아이디나 닉네임이 1글자 이상인지 체크
  if (value.length <= 5) {
    alert(`${type === 'id' ? '아이디를 5자 이상' : '닉네임을 5자 이상'} 입력해주세요.`);
    return;
  }

  const res = await fetch('/api/check-sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value, type }),
  });

  const data = await res.json();

  if (data.message.includes('이미 사용 중')) {
    alert(data.message);
    if (type === 'id') setIsIdChecked(false);
    if (type === 'nickname') setIsNicknameChecked(false);
  } else {
    alert(`사용 가능한 ${type === 'id' ? '아이디' : '닉네임'}입니다.`);
    if (type === 'id') setIsIdChecked(true);
    if (type === 'nickname') setIsNicknameChecked(true);
  }
};


  return (
    <div className="sign_up">
      <div className="signup-container inner">
        <h1>회원가입</h1>
        <form onSubmit={handleSignup}>
          <div className="id_check">
            <input
              className="signup-input id_check_input"
              type="text"
              placeholder="아이디"
              value={id}
              onChange={(e) => {
                setId(e.target.value);
                setIsIdChecked(false);
              }}
              required
            />
            <button type="button" id="id_check_btn" className="login_btn" onClick={() => checkAvailability('id')}>
              중복확인
            </button>
          </div>

          <div className="id_check">
            <input
              className="signup-input id_check_input"
              type="text"
              placeholder="닉네임"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setIsNicknameChecked(false);
              }}
              required
            />
            <button type="button" id="nickname_check_btn" className="login_btn" onClick={() => checkAvailability('nickname')}>
              중복확인
            </button>
          </div>

          <input
            className="signup-input"
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            className="signup-input"
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className="signup-input"
            type="date"
            placeholder="생년월일"
            value={birth}
            onChange={(e) => setBirth(e.target.value)}
            required
          />
          <input
            className="signup-input"
            type="text"
            placeholder="전화번호"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />

          <button className="signup-button" type="submit">
            가입하기
          </button>
        </form>
      </div>
    </div>
  );
}
