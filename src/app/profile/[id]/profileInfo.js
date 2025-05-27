// src/app/profile/[id]/profileInfo.js (또는 ProfileInfo.jsx)

import React, { useState, useEffect } from 'react';

export default function ProfileInfo({ currentProfileData, onInfoChange }) {
  const [userName, setUserName] = useState(currentProfileData?.user_name || '');
  const [userPhone, setUserPhone] = useState(currentProfileData?.user_phone || '');
  const [userDate, setUserDate] = useState(currentProfileData?.user_birth || '');


  useEffect(() => {
    setUserName(currentProfileData?.user_name || '');
    setUserPhone(currentProfileData?.user_phone || '');
    setUserDate(currentProfileData?.user_birth || '');
  }, [currentProfileData]);

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setUserName(newName);
    onInfoChange({ userName: newName, userPhone, userDate });
  };

  const handlePhoneChange = (e) => {
    const newPhone = e.target.value;
    setUserPhone(newPhone);
    onInfoChange({ userName, userPhone: newPhone, userDate });
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setUserDate(newDate);
    onInfoChange({ userName, userPhone, userDate: newDate });
  };

  return (
    <div className="info_wrap">
      <ul>
        <li>
          <label htmlFor='modify_name'>이름</label>
          <input
            type="text"
            placeholder="이름"
            value={userName}
            onChange={handleNameChange}
            id="modify_name"
          ></input>
        </li>
        <li>
          <label htmlFor='modify_birth'>생년월일</label>
          <input
            type="date"
            value={userDate}
            onChange={handleDateChange}
            id="modify_birth"
          ></input>
        </li>
        <li>
          <label htmlFor='modify_phone'>전화번호</label>
          <input
            type="text"
            placeholder="전화번호"
            value={userPhone}
            onChange={handlePhoneChange}
            id="modify_phone"
          ></input>
        </li>
      </ul>


    </div>
  );
}