"use client";
import React, { useRef, useEffect, useState, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import "../app/css/post.css";
import useCommentStore from "../store/commentStore";

const parseImageUrls = (imageUrl) => {
  if (Array.isArray(imageUrl)) return imageUrl;
  if (typeof imageUrl === "string") {
    try {
      const parsed = JSON.parse(imageUrl);
      return Array.isArray(parsed) ? parsed : imageUrl.split(",");
    } catch (e) {
      return imageUrl.split(",");
    }
  }
  return [];
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date)) return "날짜 오류";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const mi = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
};

export default function PostCard({ post }) {
  const contentRef = useRef(null);
  const [isEllipsed, setIsEllipsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { commentEnter, setCommentEnter } = useCommentStore();
  const router = useRouter();

  const { commentStates, toggleComment, closeComment } = useCommentStore();
  const isCommentOpen = commentStates[post.id];

  const [comments, setComments] = useState([]);

  // 디버깅용 전체 post 로그
  useEffect(() => {
    console.log("🪵 전체 post 객체:", post);
    console.log("🧪 post.id:", post?.id, typeof post?.id);
    console.log("🧪 post.title:", post?.title, typeof post?.title);
    console.log("🧪 post.content:", post?.content, typeof post?.content);
    console.log("🧪 post.image_url:", post?.image_url, typeof post?.image_url);
    console.log("🧪 post.created_at:", post?.created_at, typeof post?.created_at);

    const el = contentRef.current;
    if (el) {
      setIsEllipsed(el.scrollHeight > el.clientHeight + 1);
    }
    fetchComments();
  }, []);

  const imageUrls = useMemo(() => parseImageUrls(post?.image_url), [post?.image_url]);

  const handleContentClick = () => {
    if (isEllipsed) {
      setIsExpanded(true);
    }
  };

  const handleDelete = async () => {
    const isConfirmed = window.confirm("정말 이 글을 삭제하시겠습니까?");
    if (!isConfirmed) return;

    try {
      const imagePaths = imageUrls
        .map((url) => {
          const match = url.match(/\/img\/(.+)$/);
          return match ? match[1] : null;
        })
        .filter(Boolean);

      if (imagePaths.length > 0) {
        const { error: storageError } = await supabase.storage.from("img").remove(imagePaths);
        if (storageError) {
          alert("이미지 삭제 실패: " + storageError.message);
          return;
        }
      }

      const { error } = await supabase.from("diary").delete().eq("id", post.id);
      if (error) {
        alert("글 삭제 실패: " + error.message);
      } else {
        alert("글과 이미지가 삭제되었습니다.");
        window.location.reload();
      }
    } catch (error) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleEdit = () => {
    router.push(`/edit/${post.id}`);
  };

  const handleCommentClick = () => {
    toggleComment(post.id);
  };

  const handleCloseComment = () => {
    closeComment(post.id);
    setCommentEnter(post.id, "");
  };

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

  const handleCommentSubmit = async () => {
    const commentText = commentEnter[post.id];
    if (!commentText?.trim()) {
      alert("댓글을 입력해주세요.");
      return;
    }

    try {
      const { error } = await supabase.from("comments").insert([
        {
          diary_id: post.id,
          text: commentText,
        },
      ]);

      if (error) {
        alert("댓글 등록 실패: " + error.message);
      } else {
        alert("댓글이 등록되었습니다!");
        setCommentEnter(post.id, "");
        fetchComments();
      }
    } catch (error) {
      console.error("댓글 등록 오류:", error);
      alert("댓글 등록 중 오류가 발생했습니다.");
    }
  };

  const handleCommentDelete = async (commentId) => {
    const isConfirmed = window.confirm("정말 이 댓글을 삭제하시겠습니까?");
    if (!isConfirmed) return;

    try {
      const { error } = await supabase.from("comments").delete().eq("id", commentId);

      if (error) {
        alert("댓글 삭제 실패: " + error.message);
      } else {
        alert("댓글이 삭제되었습니다.");
        fetchComments();
      }
    } catch (error) {
      console.error("댓글 삭제 오류:", error);
      alert("댓글 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="card">
      <div className="container">
        {imageUrls.length > 0 && (
          <Swiper modules={[Pagination]} spaceBetween={10} slidesPerView={1} pagination={{ clickable: true }}>
            {imageUrls.map((url, index) => (
              <SwiperSlide key={index}>
                <img src={url.trim()} alt={`게시물 이미지 ${index + 1}`} style={{ width: "100%", height: "auto" }} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        <div className="content_wrap">
          <div className="txt_wrap">
            <i className="comment_icon" onClick={handleCommentClick}>
              <img src="/comment.svg" alt="댓글 아이콘" /> {comments.length}
            </i>
            <h2>{typeof post?.title === "string" ? post.title : String(post?.title || "제목 없음")}</h2>
            <p
              ref={contentRef}
              onClick={handleContentClick}
              className={`truncated ${isEllipsed && !isExpanded ? "ellipsed" : ""}`}
              style={isExpanded ? { display: "block", cursor: "auto" } : {}}
            >
              {typeof post?.content === "string" ? post.content : String(post?.content || "")}
            </p>
            <span>{formatDate(post?.created_at)}</span>
          </div>

          <div className="btn_wrap">
            <button onClick={handleDelete} className="delete_btn">글 삭제</button>
            <button onClick={handleEdit} className="modify_btn">글 수정</button>
          </div>
        </div>

        <div className={`comment_wrap ${isCommentOpen ? 'on' : ''}`}>
          <div className="title_wrap">
            <h2>댓글</h2>
            <img src="/close.svg" alt="닫기" onClick={handleCloseComment} />
          </div>
          <div className="comment_hidden">
            <div className="comment">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.id} className="comment_txt">
                    <i>{formatDate(comment.created_at)}</i>
                    <span>{typeof comment.text === "string" ? comment.text : String(comment.text || "")}</span>
                    <img
                      src="/close.svg"
                      alt="삭제"
                      onClick={() => handleCommentDelete(comment.id)}
                    />
                  </div>
                ))
              ) : (
                <p>댓글이 없습니다.</p>
              )}
            </div>
          </div>
          <div className="comment_input_wrap">
            <input 
              type="text" 
              placeholder="댓글을 입력하세요." 
              value={commentEnter[post.id] || ""}
              onChange={(e) => setCommentEnter(post.id, e.target.value)} 
            />
            <button className="comment_submit_btn" onClick={handleCommentSubmit}>등록</button>
          </div>
        </div>
      </div>
    </div>
  );
}
