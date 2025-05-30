// components/post/PostList.js
// 'use client'가 가장 위에 명시되어 있어야 합니다.

'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import PostCard from './postcard/PostCard';
import useSearchStore from '../../store/searchStore';
import formatDate from '../../utils/formatDate';

// PostList 컴포넌트는 이제 'posts'라는 prop을 선택적으로 받습니다.
// 'posts' prop이 제공되면 해당 데이터를 사용하고, 없으면 자체적으로 데이터를 불러옵니다.
export default function PostList({ posts }) { 
  // 'posts' prop으로 받은 데이터 또는 자체적으로 불러올 데이터를 저장할 상태
  const [internalData, setInternalData] = useState([]);
  const [error, setError] = useState(null);
  const [showTopButton, setShowTopButton] = useState(false); // 👈 버튼 보이기 상태

  const searchQuery = useSearchStore((state) => state.searchQuery);

  useEffect(() => {
    // 'posts' prop이 제공되었을 때
    if (posts) {
      setInternalData(posts); // prop으로 받은 데이터를 바로 사용
      setError(null);
    } 
    // 'posts' prop이 제공되지 않았을 때 (즉, 이 컴포넌트가 자체적으로 데이터를 불러와야 할 때)
    else { 
      const fetchData = async () => {
        setError(null); // 에러 상태 초기화
        try {
          const { data, error: fetchError } = await supabase
            .from('diary')
            .select('*')
            .order('created_at', { ascending: false });

          if (fetchError) {
            setError(fetchError.message);
          } else {
            setInternalData(data); // 자체적으로 불러온 데이터를 상태에 저장
          }
        } catch (err) {
          console.error('Supabase 게시물 쿼리 오류:', err.message);
          setError(`데이터를 불러오는 데 실패했습니다: ${err.message}`);
        }
      };
      fetchData();
    }
  }, [posts]); // 'posts' prop이 변경될 때마다 useEffect 재실행

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

  // 실제로 렌더링할 데이터는 internalData 상태를 사용합니다.
  // 검색 쿼리에 따라 필터링합니다.
  const filteredData = searchQuery
    ? internalData.filter((post) => {
        const lowerSearchQuery = searchQuery.toLowerCase();
        return (
          (post.title && post.title.toLowerCase().includes(lowerSearchQuery)) ||
          (post.content && post.content.toLowerCase().includes(lowerSearchQuery)) ||
          (post.created_at && formatDate(post.created_at).toLowerCase().includes(lowerSearchQuery))
        );
      })
    : internalData; // 검색 쿼리가 없으면 모든 데이터



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