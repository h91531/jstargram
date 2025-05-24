'use client'; // 클라이언트 컴포넌트임을 명시

import React, { useState, useEffect } from 'react'; // useEffect 추가
import { supabase } from '@/lib/supabaseClient'; // supabase 임포트

export default function ProfileModal({ isOpen, onClose, userId, currentProfileData, onProfileUpdate }) {
    // 모달이 열려있지 않으면 아무것도 렌더링하지 않습니다.
    if (!isOpen) {
        return null;
    }

    // 자기소개(bio)를 위한 상태를 만듭니다.
    // currentProfileData에서 user_bio를 초기값으로 설정합니다.
    const [editedBio, setEditedBio] = useState(currentProfileData?.user_bio || '');
    const [loading, setLoading] = useState(false); // 로딩 상태 추가
    const [error, setError] = useState(null); // 에러 상태 추가

    // currentProfileData가 변경될 때 editedBio를 업데이트합니다.
    // 이는 모달이 다시 열리거나 데이터가 새로고침될 때 유용합니다.
    useEffect(() => {
        setEditedBio(currentProfileData?.user_bio || '');
    }, [currentProfileData]);


    // 자기소개 수정 핸들러
    const handleSaveBio = async () => {
        setLoading(true);
        setError(null);
        try {
            // Supabase에 user_bio 업데이트 요청
            const { data, error } = await supabase
                .from('users')
                .update({ user_bio: editedBio })
                .eq('user_id', userId); // 해당 userId의 프로필을 업데이트

            if (error) {
                console.error('자기소개 업데이트 오류:', error.message);
                setError('자기소개 업데이트에 실패했습니다.');
            } else {
                console.log('자기소개 업데이트 성공:', data);
                // 업데이트 성공 후 상위 컴포넌트의 데이터 다시 불러오기
                if (onProfileUpdate) {
                    await onProfileUpdate();
                }
                // 모달 닫기
                onClose();
            }
        } catch (err) {
            console.error('예상치 못한 오류:', err.message);
            setError('알 수 없는 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile_modal_overlay"> {/* 모달 오버레이를 위한 클래스 추가 */}
            <div className="profile_modal_wrap inner">
                <h2>자기소개 수정</h2>
                <textarea
                    value={editedBio} // 상태 값으로 설정
                    onChange={(e) => setEditedBio(e.target.value)} // 입력 값 변경 시 상태 업데이트
                    placeholder="자기소개를 입력해주세요."
                ></textarea>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button
                    type="button"
                    onClick={handleSaveBio}
                    disabled={loading} // 로딩 중에는 버튼 비활성화
                >
                    {loading ? '수정 중...' : '수정하기'}
                </button>
                <button type="button" onClick={onClose}>닫기</button> {/* onClose 함수 호출로 모달 닫기 */}
            </div>
        </div>
    );
}