'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams } from 'next/navigation';
import ProfileImg from './profileImg';
import '../../css/profile.css';

export default function UserProfilePage() {
  const { id: userIdFromUrl } = useParams();
  const [userProfileData, setUserProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserProfile() {
      if (!userIdFromUrl) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('users')
          .select('user_nickname, user_profile_image')
          .eq('user_id', userIdFromUrl)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          setUserProfileData(data);
        } else {
          setError('해당 사용자를 찾을 수 없습니다.');
        }

      } catch (err) {
        console.error('프로필 데이터 불러오기 실패:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUserProfile();
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
        <p>오류가 발생했습니다: {error}</p>
        <p>사용자 정보를 불러올 수 없습니다.</p>
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

  const { user_nickname, user_profile_image} = userProfileData;

  return (
    <div className="profile_wrap">
      <div className="container">
        <ProfileImg imgurl={user_profile_image} user_nickname = {user_nickname} />
      </div>
    </div>
  );
}