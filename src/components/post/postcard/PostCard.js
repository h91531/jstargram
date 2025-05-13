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

export default function PostCard({ post }) {
  const {userStore_id} = userStore();
  const contentRef = useRef(null);
  const [isEllipsed, setIsEllipsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { commentStates, toggleComment, closeComment } = useCommentStore();
  const isCommentOpen = commentStates[post.id];
  const router = useRouter();

  const imageUrls = useMemo(() => parseImageUrls(post?.image_url), [post?.image_url]);

  const [comments, setComments] = useState([]);

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
  console.log(post.user_id);
  console.log(userStore_id);

  return (
    <div className="card">
      <div className="container">
        {post?.nickname && (<h2 className="post_nickname">{post?.nickname}님의 게시물</h2>)}
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
