import formatDate from "../../../utils/formatDate";
import { useState } from "react";

export default function PostContent({
  post,
  commentsLength,
  contentRef,
  isEllipsed,
  isExpanded,
  setIsExpanded,
  onCommentClick
}) {
  const [isPushed, setIsPushed] = useState(false);
    const handleClick = () => {
    setIsPushed(prev => !prev); // 이전 상태 반전 (토글)
  };
  return (
    <div className="txt_wrap">
      <i className="comment_icon">
    <img
      src={isPushed ? "/push_heart.png" : "/heart.png"}
      alt="좋아요"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    />
        <img src="/comment.svg" alt="댓글 아이콘" onClick={onCommentClick}/> {commentsLength}
      </i>
      <h2>{post?.title || "제목 없음"}</h2>
      <p
        ref={contentRef}
        onClick={() => isEllipsed && setIsExpanded(true)}
        className={`truncated ${isEllipsed && !isExpanded ? "ellipsed" : ""}`}
        style={isExpanded ? { display: "block", cursor: "auto" } : {}}
      >
        {post?.content || "내용 없음"}
      </p>
      <span>{formatDate(post?.created_at)}</span>
    </div>
  );
}
