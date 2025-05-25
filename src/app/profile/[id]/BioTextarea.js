// BioTextarea.jsx
'use client';

import React, { useState, useEffect } from 'react';

export default function BioTextarea({ currentBio, onBioChange }) {
    const [bio, setBio] = useState(currentBio || '');

    // 부모로부터 받은 currentBio 값이 변경될 때마다 내부 상태를 업데이트
    useEffect(() => {
        setBio(currentBio || '');
    }, [currentBio]);

    // textarea 값 변경 시 부모 컴포넌트로 변경된 값을 전달
    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setBio(newValue);
        onBioChange(newValue);
    };

    return (
        <>
            <h3>자기소개</h3>
            <textarea
                value={bio}
                onChange={handleInputChange}
                placeholder="자기소개를 입력해주세요."
            ></textarea>
        </>
    );
}