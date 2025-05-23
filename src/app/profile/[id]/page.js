'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';
import ProfileImg from './profileImg';
import '../../css/profile.css';
import ProfileModify from './profileModify';

export default function UserProfilePage() {
  const { id: userIdFromUrl } = useParams();
  const [userProfileData, setUserProfileData] = useState(null);
  const [postCount, setPostCount] = useState(0); // 게시물 수를 위한 상태 추가
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserProfileAndPosts() {
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
          .select('user_nickname, user_profile_image')
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
          .from('diary') // 게시물 테이블 이름을 'diary'로 변경
          .select('id', { count: 'exact' }) // 'id' 컬럼을 선택하고 정확한 개수를 셉니다.
          .eq('user_id', userIdFromUrl); // 'user_id' 컬럼으로 필터링합니다.

        if (postsError) {
          console.error('Supabase 게시물(diary) 수 쿼리 오류:', postsError.message);
          setPostCount(0); // 오류 시 게시물 수는 0으로 설정
        } else {
          setPostCount(postsCount || 0); // 가져온 게시물 수 설정 (null일 경우 0)
        }

      } catch (err) {
        console.error('예상치 못한 오류:', err.message);
        setError(`알 수 없는 오류 발생: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfileAndPosts();
  }, [userIdFromUrl]);

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

  return (
    <div className="profile_wrap">
      <div className="container">
        <ProfileImg
          imgurl={user_profile_image}
          user_nickname={user_nickname}
          postCount={postCount} // postCount를 props로 전달
        />
        <ProfileModify params_id ={userIdFromUrl}/>
      </div>
    </div>
  );
}