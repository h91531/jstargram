'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import PostCard from './postcard/PostCard';
import useSearchStore from '../../store/searchStore';
import formatDate from '../../utils/formatDate';

export default function PostList() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [showTopButton, setShowTopButton] = useState(false); // 👈 버튼 보이기 상태

  const searchQuery = useSearchStore((state) => state.searchQuery);

  useEffect(() => {
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
  }, []);

  // 👇 스크롤 이벤트 감지
  useEffect(() => {
    const handleScroll = () => {
      setShowTopButton(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return <div>데이터를 불러오는 데 실패했습니다: {error}</div>;
  }

  const filteredData = searchQuery
    ? data.filter((post) => {
        const lowerSearchQuery = searchQuery.toLowerCase();
        return (
          (post.title && post.title.toLowerCase().includes(lowerSearchQuery)) ||
          (post.content && post.content.toLowerCase().includes(lowerSearchQuery)) ||
          (post.created_at && formatDate(post.created_at).toLowerCase().includes(lowerSearchQuery))
        );
      })
    : data;

  return (
    <div className="post_wrap">
      {filteredData.map(post => (
        <PostCard key={post.id} post={post} />
      ))}

      {showTopButton && (
        <i className="top" onClick={scrollToTop}>
          <img src="/arrow_up.svg" alt="top버튼" />
        </i>
      )}
    </div>
  );
}
