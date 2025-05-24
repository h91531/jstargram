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

  // 게시물 작성자의 프로필 이미지를 위한 상태
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const imageUrls = useMemo(() => parseImageUrls(post?.image_url), [post?.image_url]);
  const [comments, setComments] = useState([]);

  // 게시물 작성자의 프로필 이미지를 불러오는 useEffect
  useEffect(() => {
    if (!post || !post.user_id) {
      setProfileLoading(false);
      return;
    }

    async function fetchUserProfileImage() {
      setProfileLoading(true);
      setProfileError(null);

      try {
        const { data, error: supabaseError } = await supabase
          .from("users")
          .select("user_profile_image")
          .eq('user_id', post.user_id)
          .single();

        if (supabaseError) {
          throw supabaseError;
        }

        if (data && data.user_profile_image) {
          setUserProfileImage(data.user_profile_image);
        } else {
          setUserProfileImage(null);
        }

      } catch (err) {
        console.error("프로필 이미지를 가져오는 중 오류 발생:", err.message);
        setProfileError(err.message);
        setUserProfileImage(null);
      } finally {
        setProfileLoading(false);
      }
    }

    fetchUserProfileImage();
  }, [post?.user_id]);

  // 댓글 데이터와 내용 길이 확인을 위한 useEffect
  useEffect(() => {
    if (post?.id) {
      fetchComments();
    }

    const el = contentRef.current;
    if (el) {
      setIsEllipsed(el.scrollHeight > el.clientHeight + 1);
    }
  }, [post?.id]);

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
      setComments(data);
    } else {
      console.error("댓글 불러오기 실패:", error.message);
    }
  };

  return (
    <div className="card">
      <div className="inner">
        <div className="profile_wrap">
          {/* 게시물 작성자 프로필 이미지 표시 로직 */}
          {profileLoading ? (
            <div>프로필 로딩 중...</div>
          ) : profileError ? (
            <div>프로필 이미지 로딩 오류: {profileError}</div>
          ) : userProfileImage ? (
            <Image
              src={userProfileImage}
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
          {post?.nickname && (<Link href={`./profile/${post.user_id}`}><h2 className="post_nickname">{post?.nickname}님의 게시물</h2></Link>)}
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