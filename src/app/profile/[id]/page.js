// components/profile/UserProfilePage.js
// 'use client'가 가장 위에 명시되어 있어야 합니다.

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';
import ProfileImg from './profileImg';
import '../../css/profile.css';
import ProfileModify from './profileModify';
import ProfileModal from './profileModal';
import PostList from '../../../components/post/PostList'; // PostList 컴포넌트 import
import UserStore from '../../../store/userStore';

export default function UserProfilePage() {
  const { id: userIdFromUrl } = useParams(); // URL에서 프로필 주인의 ID 가져오기
  const [userProfileData, setUserProfileData] = useState(null);
  const [postCount, setPostCount] = useState(0); // 프로필 상단에 표시될 게시물 총 개수
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { userStore_id } = UserStore(); // 현재 로그인한 사용자 ID (전역 스토어에서 가져옴)

  // 해당 프로필 주인의 게시물 데이터를 저장할 상태
  const [userPosts, setUserPosts] = useState([]); 

  // 사용자 프로필 및 게시물 데이터를 불러오는 함수
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

      // 2. 해당 user_id의 게시물(diary) 데이터를 가져오기
      // 여기서는 `userIdFromUrl`에 해당하는 모든 게시물을 가져옵니다.
      // `is_public` 컬럼이 없으므로 추가적인 DB 레벨 필터링은 없습니다.
      const { data: diaryData, error: diaryError } = await supabase
        .from('diary')
        .select('*') // 필요한 필드만 가져오도록 명시하는 것이 좋습니다: 'id, title, content, user_id, created_at'
        .eq('user_id', userIdFromUrl) // URL의 user_id에 해당하는 게시물만 가져옵니다.
        .order('created_at', { ascending: false }); // 최신순 정렬
      
      if (diaryError) {
        console.error('Supabase 게시물 데이터 쿼리 오류:', diaryError.message);
        setUserPosts([]); 
        setPostCount(0); // 오류 시 게시물 수 0으로 설정
      } else {
        setUserPosts(diaryData || []); // 가져온 게시물 데이터를 상태에 저장
        setPostCount(diaryData ? diaryData.length : 0); // 가져온 데이터의 실제 개수로 설정
      }

    } catch (err) {
      console.error('예상치 못한 오류:', err.message);
      setError(`알 수 없는 오류 발생: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [userIdFromUrl]); // userStore_id는 fetch 로직에 직접 영향을 주지 않으므로 의존성에서 제거

  useEffect(() => {
    fetchUserProfileAndPosts();
  }, [fetchUserProfileAndPosts]);

  // --- 로딩, 에러, 사용자 없음 UI ---
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
  // --- UI 끝 ---

  const { user_nickname, user_profile_image, user_bio } = userProfileData;

  // 프로필 수정 모달 제어 함수
  const openProfileModal = () => {
    setIsProfileModalOpen(true);
    document.body.classList.add('notscroll'); // 스크롤 방지
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    document.body.classList.remove('notscroll'); // 스크롤 허용
  };

  return (
    <div className="profile_wrap">
      <div className="container">
        <ProfileImg
          imgurl={user_profile_image}
          user_nickname={user_nickname}
          postCount={postCount} // 현재 user_id의 총 게시물 수
        />
        <p className="bio">{user_bio}</p>
        <ProfileModify params_id={userIdFromUrl} onOpenModal={openProfileModal} /> 

        {/* 프로필 수정 모달 */}
        {isProfileModalOpen && (
          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={closeProfileModal}
            userId={userIdFromUrl}
            currentProfileData={userProfileData}
            onProfileUpdate={fetchUserProfileAndPosts} // 프로필 업데이트 후 데이터 다시 불러오도록 설정
          />
        )}
        
        <div className="user_post_wrap on">
          {userStore_id === userIdFromUrl ? ( 
            userPosts.length > 0 ? (
                <PostList posts={userPosts} /> 
            ) : (
                <div className="post_list_empty">
                    아직 작성된 게시물이 없습니다.
                </div>
            )
          ) : (

            <div className="post_list_empty">
                다른 사용자의 게시물은 여기에 표시되지 않습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}