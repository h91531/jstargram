'use client';

import React, { useState, useEffect, useCallback } from 'react'; // useCallback 추가
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';
import ProfileImg from './profileImg';
import '../../css/profile.css';
import ProfileModify from './profileModify';
import ProfileModal from './profileModal';

export default function UserProfilePage() {
  const { id: userIdFromUrl } = useParams();
  const [userProfileData, setUserProfileData] = useState(null);
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // 상태 이름 변경

  // 데이터를 불러오는 함수를 useCallback으로 감싸서 최적화
  const fetchUserProfileAndPosts = useCallback(async () => {
    if (!userIdFromUrl) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. 사용자 프로필 데이터 가져오기
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userIdFromUrl)
        .maybeSingle();

      if (userError) {
        console.error('Supabase 사용자 쿼리 오류:', userError.message);
        setError(`프로필 데이터 불러오기 실패: ${userError.message}`);
        setLoading(false);
        return;
      }

      if (userData) {
        setUserProfileData(userData);
      } else {
        setError('해당 사용자를 찾을 수 없습니다.');
        setUserProfileData(null);
        setLoading(false);
        return;
      }

      // 2. 해당 user_id의 게시물(diary) 수 가져오기
      const { count: postsCount, error: postsError } = await supabase
        .from('diary')
        .select('id', { count: 'exact' })
        .eq('user_id', userIdFromUrl);

      if (postsError) {
        console.error('Supabase 게시물(diary) 수 쿼리 오류:', postsError.message);
        setPostCount(0);
      } else {
        setPostCount(postsCount || 0);
      }

    } catch (err) {
      console.error('예상치 못한 오류:', err.message);
      setError(`알 수 없는 오류 발생: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [userIdFromUrl]); // userIdFromUrl이 변경될 때만 함수 재생성

  useEffect(() => {
    fetchUserProfileAndPosts();
  }, [fetchUserProfileAndPosts]); // useCallback으로 감싼 함수를 의존성 배열에 추가

  if (loading) {
    return (
      <div className="profile_wrap container">
        프로필 정보를 불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile_wrap container">
        <p>{error}</p>
      </div>
    );
  }

  if (!userProfileData) {
    return (
      <div className="profile_wrap container">
        <p>사용자를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const { user_nickname, user_profile_image } = userProfileData;

  // 모달을 여는 함수
  const openProfileModal = () => {
    setIsProfileModalOpen(true);
    document.body.classList.add('notscroll');
  };

  // 모달을 닫는 함수
  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    document.body.classList.remove('notscroll');
  };

  return (
    <div className="profile_wrap">
      <div className="container">
        <ProfileImg
          imgurl={user_profile_image}
          user_nickname={user_nickname}
          postCount={postCount}
        />
        <p className="bio">{userProfileData.user_bio}</p>
        <ProfileModify params_id={userIdFromUrl} onOpenModal={openProfileModal} /> 


      {isProfileModalOpen && (
                <ProfileModal
                    isOpen={isProfileModalOpen} // 모달 열림 여부
                    onClose={closeProfileModal} // 모달 닫기 함수
                    userId={userIdFromUrl} // 현재 사용자의 ID
                    currentProfileData={userProfileData} // 현재 프로필 데이터 (bio 포함)
                    onProfileUpdate={fetchUserProfileAndPosts} // 프로필 업데이트 후 데이터 다시 불러올 함수
                />
            )}
      </div>
    </div>
  );
}