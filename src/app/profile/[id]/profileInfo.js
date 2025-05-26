// src/app/profile/[id]/profileInfo.js (또는 ProfileInfo.jsx)

import React, { useState, useEffect } from 'react';

export default function ProfileInfo({ currentProfileData, onInfoChange }) {
  // currentProfileData의 변경에 따라 내부 상태를 동기화합니다.
  const [userName, setUserName] = useState(currentProfileData?.user_name || '');
  const [userPhone, setUserPhone] = useState(currentProfileData?.user_phone || '');
  const [userDate, setUserDate] = useState(currentProfileData?.user_birth || ''); // 생년월일 필드 추가

  // currentProfileData가 변경될 때마다 내부 상태를 업데이트합니다.
  // 모달이 다시 열리거나 currentProfileData가 업데이트될 때 유용합니다.
  useEffect(() => {
    setUserName(currentProfileData?.user_name || '');
    setUserPhone(currentProfileData?.user_phone || '');
    setUserDate(currentProfileData?.user_birth || '');
  }, [currentProfileData]);

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setUserName(newName);
    // 변경된 값을 부모 컴포넌트에 알립니다.
    onInfoChange({ userName: newName, userPhone, userDate });
  };

  const handlePhoneChange = (e) => {
    const newPhone = e.target.value;
    setUserPhone(newPhone);
    // 변경된 값을 부모 컴포넌트에 알립니다.
    onInfoChange({ userName, userPhone: newPhone, userDate });
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setUserDate(newDate);
    // 변경된 값을 부모 컴포넌트에 알립니다.
    onInfoChange({ userName, userPhone, userDate: newDate });
  };

  return (
    <div className="info_wrap">
      <input
        type="text"
        placeholder="이름"
        value={userName}
        onChange={handleNameChange}
      ></input>
      <input
        type="date"
        value={userDate} // 날짜 입력 필드도 value와 onChange를 추가하여 제어합니다.
        onChange={handleDateChange}
      ></input>
      <input
        type="text"
        placeholder="전화번호"
        value={userPhone}
        onChange={handlePhoneChange}
      ></input>
    </div>
  );
}