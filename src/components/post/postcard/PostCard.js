'use client';

import React, { useRef, useEffect, useState, useMemo } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import useCommentStore from "../../../store/commentStore";
import PostImageSlider from "./PostImageSlider";
import PostContent from "./PostContent";
import PostActions from "./PostActions";
import PostComments from "./PostComments";
import parseImageUrls from "../../../utils/parseImageUrls";
import userStore from '../../../store/userStore';
import '../../../app/css/post.css';
import Image from 'next/image';
import Link from 'next/link'

export default function PostCard({ post }) {
  const { userStore_id } = userStore();
  const contentRef = useRef(null);
  const [isEllipsed, setIsEllipsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { commentStates, toggleComment } = useCommentStore();
  const isCommentOpen = commentStates[post.id];
  const router = useRouter();

  // 게시물 작성자의 프로필 이미지와 닉네임을 위한 상태
  // 데이터베이스에서 직접 불러와 최신 정보를 유지합니다.
  const [authorProfile, setAuthorProfile] = useState({
    image: null,
    nickname: null,
    loading: true,
    error: null,
  });

  const imageUrls = useMemo(() => parseImageUrls(post?.image_url), [post?.image_url]);
  const [comments, setComments] = useState([]);

  // 게시물 작성자의 프로필 이미지와 닉네임을 불러오는 useEffect
  // post.user_id가 변경될 때마다 이 정보들을 새로 가져옵니다.
  useEffect(() => {
    // post나 user_id가 없으면 로딩을 완료 처리하고 함수를 종료합니다.
    if (!post || !post.user_id) {
      setAuthorProfile(prev => ({ ...prev, loading: false }));
      return;
    }

    async function fetchAuthorInfo() {
      // 정보 불러오기 시작 시 로딩 상태로 설정하고 에러를 초기화합니다.
      setAuthorProfile(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Supabase에서 users 테이블을 조회하여 프로필 이미지와 닉네임을 가져옵니다.
        // 여기에서 'nickname' 대신 'user_nickname'을 사용합니다.
        const { data, error: supabaseError } = await supabase
          .from("users")
          .select("user_profile_image, user_nickname") // <--- 'user_nickname'으로 컬럼명 수정
          .eq('user_id', post.user_id)
          .single(); // 단일 레코드만 가져오므로 single()을 사용합니다.

        if (supabaseError) {
          // 에러가 발생하면 throw하여 catch 블록으로 보냅니다.
          throw supabaseError;
        }

        if (data) {
          // 데이터가 있으면 상태를 업데이트합니다.
          setAuthorProfile({
            image: data.user_profile_image,
            nickname: data.user_nickname, // <--- 'data.nickname' 대신 'data.user_nickname'으로 수정
            loading: false,
            error: null,
          });
        } else {
          // 데이터가 없으면 null로 설정합니다.
          setAuthorProfile({
            image: null,
            nickname: null,
            loading: false,
            error: null,
          });
        }

      } catch (err) {
        // 오류 발생 시 콘솔에 에러를 기록하고 에러 상태를 설정합니다.
        console.error("작성자 정보를 가져오는 중 오류 발생:", err.message);
        setAuthorProfile({
          image: null,
          nickname: null,
          loading: false,
          error: err.message,
        });
      }
    }

    fetchAuthorInfo();
  }, [post?.user_id]); // post.user_id가 변경될 때마다 이 useEffect가 다시 실행됩니다.

  // 댓글 데이터와 내용 길이 확인을 위한 useEffect
  useEffect(() => {
    if (post?.id) {
      fetchComments(); // 게시물 ID가 있으면 댓글을 불러옵니다.
    }

    const el = contentRef.current;
    if (el) {
      // 내용이 넘치는지 확인하여 '더보기' 버튼 표시 여부를 결정합니다.
      setIsEllipsed(el.scrollHeight > el.clientHeight + 1);
    }
  }, [post?.id]); // post.id가 변경될 때마다 댓글을 다시 불러옵니다.

  // 댓글 데이터를 가져오는 함수
  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        users(user_profile_image) // users 테이블을 조인하여 댓글 작성자의 프로필 이미지를 가져옴
      `)
      .eq("diary_id", post.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setComments(data); // 에러가 없으면 댓글 상태를 업데이트합니다.
    } else {
      console.error("댓글 불러오기 실패:", error.message);
    }
  };

  return (
    <div className="card">
      <div className="inner">
        <div className="profile_wrap">
          {/* 게시물 작성자 프로필 이미지 표시 로직 */}
          {authorProfile.loading ? (
            <div>프로필 로딩 중...</div>
          ) : authorProfile.error ? (
            <div>프로필 이미지 로딩 오류: {authorProfile.error}</div>
          ) : authorProfile.image ? (
            <Image
              src={authorProfile.image}
              alt={`User ${post?.user_id || 'Unknown'}'s profile image`}
              width={50}
              height={50}
              quality={100}
              priority={true}
              style={{ borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <Image
              src="/normal_profile.webp" // 기본 프로필 이미지
              alt="기본 프로필 이미지"
              width={50}
              height={50}
              style={{ borderRadius: '50%', objectFit: 'cover' }}
              priority={true}
            />
          )}
          {/* 닉네임 표시 로직: 데이터베이스에서 불러온 최신 닉네임을 사용합니다. */}
          {authorProfile.nickname && (
            <Link href={`./profile/${post.user_id}`}>
              <h2 className="post_nickname">{authorProfile.nickname}님의 게시물</h2>
            </Link>
          )}
        </div>
        <PostImageSlider imageUrls={imageUrls} />
        <div className="content_wrap">
          <PostContent
            post={post}
            commentsLength={comments.length}
            contentRef={contentRef}
            isEllipsed={isEllipsed}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
            onCommentClick={() => toggleComment(post.id)}
          />
          {/* 현재 로그인한 사용자와 게시물 작성자가 동일할 경우에만 PostActions를 렌더링합니다. */}
          {post.user_id != null && post.user_id === userStore_id && (
            <PostActions post={post} imageUrls={imageUrls} router={router} />
          )}
        </div>
        <PostComments
          postId={post.id}
          isOpen={isCommentOpen}
          comments={comments} // `comments` 배열에 각 댓글 작성자의 프로필 이미지 정보가 포함되어 전달됨
          fetchComments={fetchComments}
        />
      </div>
    </div>
  );
}