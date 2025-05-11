// src/components/PostList.js (클라이언트 컴포넌트)
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import PostCard from './postcard/PostCard';

export default function PostList() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 데이터를 비동기적으로 가져오기
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('diary')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setData(data);
      }
    };

    fetchData();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  if (error) {
    return <div>데이터를 불러오는 데 실패했습니다: {error}</div>;
  }

  return (
    <div className="post_wrap">
      {data.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
