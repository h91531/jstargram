'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import PostCard from './postcard/PostCard';
import useSearchStore from '../../store/searchStore'; // Zustand에서 검색어 가져오기
import formatDate from '../../utils/formatDate'; // formatDate 함수 import

export default function PostList() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  
  // Zustand에서 검색어 가져오기
  const searchQuery = useSearchStore((state) => state.searchQuery);

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

  // 검색어가 있다면 데이터를 필터링
  const filteredData = searchQuery
    ? data.filter((post) => {
        const lowerSearchQuery = searchQuery.toLowerCase();

        // 제목, 내용, 날짜를 포함한 필터링
        return (
          (post.title && post.title.toLowerCase().includes(lowerSearchQuery)) || // 제목 필터링
          (post.content && post.content.toLowerCase().includes(lowerSearchQuery)) || // 내용 필터링
          (post.created_at && formatDate(post.created_at).toLowerCase().includes(lowerSearchQuery)) // 날짜 필터링
        );
      })
    : data;

  return (
    <div className="post_wrap">
      {filteredData.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
