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
import Image from 'next/image'; // Next.js의 Image 컴포넌트를 사용하기 위해 임포트합니다.

export default function PostCard({ post }) {
  const { userStore_id } = userStore();
  const contentRef = useRef(null);
  const [isEllipsed, setIsEllipsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { commentStates, toggleComment, closeComment } = useCommentStore();
  const isCommentOpen = commentStates[post.id];
  const router = useRouter();

  // 사용자 프로필 이미지를 위한 상태와 로딩/에러 상태
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);


  const imageUrls = useMemo(() => parseImageUrls(post?.image_url), [post?.image_url]);
  const [comments, setComments] = useState([]);

  // 사용자 프로필 이미지 가져오기 로직 (이전 Profile 컴포넌트의 내용)
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
          console.log(`User ID '${post.user_id}'의 프로필 이미지:`, data.user_profile_image);
        } else {
          setUserProfileImage(null);
          console.log(`User ID '${post.user_id}'에 대한 프로필 이미지를 찾을 수 없습니다.`);
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
  }, [post?.user_id]); // post.user_id가 변경될 때마다 다시 실행합니다.

  // 댓글 데이터 가져오기 로직 (기존 PostCard의 내용)
  useEffect(() => {
    if (post?.id) {
      fetchComments();
    }

    const el = contentRef.current;
    if (el) {
      setIsEllipsed(el.scrollHeight > el.clientHeight + 1);
    }
  }, [post?.id]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
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
      <div className="container">
        <div className="profile_wrap">
          {/* 프로필 이미지 표시 */}
          {profileLoading ? (
            <div>프로필 로딩 중...</div>
          ) : profileError ? (
            <div>프로필 이미지 로딩 오류: {profileError}</div>
          ) : userProfileImage ? (
            <Image
              src={userProfileImage}
              alt={`User ${post?.user_id || 'Unknown'}'s profile image`}
              width={80}
              height={80}
              quality={100}
              priority={true}
            />
          ) : (
            <Image
              src="/normal_profile.webp"
              alt="기본 프로필 이미지"
              width={80}
              height={80}
              style={{ borderRadius: '50%', objectFit: 'cover' }}
              priority={true}
            />
          )}
          {post?.nickname && (<h2 className="post_nickname">{post?.nickname}님의 게시물</h2>)}
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
          comments={comments}
          fetchComments={fetchComments}
        />
      </div>
    </div>
  );
}