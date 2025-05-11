import formatDate from "../../../utils/formatDate";

export default function PostContent({
  post,
  commentsLength,
  contentRef,
  isEllipsed,
  isExpanded,
  setIsExpanded,
  onCommentClick
}) {
  return (
    <div className="txt_wrap">
      <i className="comment_icon" onClick={onCommentClick}>
        <img src="/comment.svg" alt="댓글 아이콘" /> {commentsLength}
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
