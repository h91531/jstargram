'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function NicknameInput({ userId, currentNickname, onNicknameChange, onNicknameAvailabilityChange }) {
    const [nickname, setNickname] = useState(currentNickname || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAvailable, setIsAvailable] = useState(false);
    const [hasChecked, setHasChecked] = useState(false);

    const prevNicknameRef = useRef(currentNickname);

    useEffect(() => {
        setNickname(currentNickname || '');
        setError(null);
        setIsAvailable(false);
        setHasChecked(false);
        prevNicknameRef.current = currentNickname; 

    }, [currentNickname]);

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setNickname(newValue);
        onNicknameChange(newValue); 

        setError(null);

        if (newValue.trim() !== prevNicknameRef.current.trim()) { 
            setIsAvailable(false);
            setHasChecked(false);
            onNicknameAvailabilityChange(false);
        } else if (newValue.trim() === prevNicknameRef.current.trim() && prevNicknameRef.current.trim() === currentNickname.trim()) {
            setIsAvailable(true);
            setHasChecked(true); 
            onNicknameAvailabilityChange(true);
        }
    };

    const handleCheckAvailability = async () => {
        setLoading(true);
        setError(null);
        setIsAvailable(false);
        setHasChecked(true); 
        if (!nickname.trim()) {
            setError('닉네임을 입력해주세요.');
            setLoading(false);
            onNicknameAvailabilityChange(false);
            return;
        }

        if (nickname.trim() === currentNickname.trim()) { 
            setIsAvailable(true);
            setLoading(false);
            alert('현재 사용 중인 닉네임입니다.');
            onNicknameAvailabilityChange(true);
            prevNicknameRef.current = nickname.trim(); 
            return;
        }

        try {
            const { data, error: fetchError } = await supabase
                .from('users')
                .select('user_id')
                .eq('user_nickname', nickname.trim()) 
                .single();

            if (data) {
                setError('이미 사용 중인 닉네임입니다.');
                setIsAvailable(false);
                onNicknameAvailabilityChange(false);
            } else if (fetchError && fetchError.code === 'PGRST116') { 
                setIsAvailable(true);
                alert('사용 가능한 닉네임입니다!');
                onNicknameAvailabilityChange(true);
                prevNicknameRef.current = nickname.trim(); 
            } else if (fetchError) {
                console.error('닉네임 중복 확인 오류:', fetchError.message);
                setError('닉네임 중복 확인에 실패했습니다.');
                onNicknameAvailabilityChange(false);
            }
        } catch (err) {
            console.error('예상치 못한 오류:', err.message);
            setError('알 수 없는 오류가 발생했습니다.');
            onNicknameAvailabilityChange(false);
        } finally {
            setLoading(false);
        }
    };
 

    return (
        <div className="profile_modal_nickname_wrap">
            <input
                type="text"
                placeholder="닉네임을 입력해주세요."
                value={nickname}
                onChange={handleInputChange}
            />
            <button
                type="button"
                onClick={handleCheckAvailability}
                disabled={loading || nickname.trim() === '' || (nickname.trim() === currentNickname.trim() && hasChecked && isAvailable)}
            >
                중복확인
            </button>
        </div>
    );
}