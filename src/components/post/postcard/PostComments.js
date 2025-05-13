import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import useCommentStore from "../../../store/commentStore";
import formatDate from "../../../utils/formatDate";
import userStore from "../../../store/userStore";

export default function PostComments({ postId, isOpen, comments, fetchComments }) {
  const { commentEnter, setCommentEnter, closeComment } = useCommentStore();
  const [loading, setLoading] = useState(false);
  const { nickname, userStore_id } = userStore()

  const handleSubmit = async () => {
    const text = commentEnter[postId];
    if (!text?.trim()) {
      alert("댓글을 입력해주세요.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("comments").insert([
      { diary_id: postId, text, nickname }
    ]);
    setLoading(false);

    if (error) {
      alert("댓글 등록 실패: " + error.message);
    } else {
      alert("댓글이 등록되었습니다.");
      setCommentEnter(postId, "");
      fetchComments();
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("정말 이 댓글을 삭제하시겠습니까?")) return;

    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (error) {
      alert("댓글 삭제 실패: " + error.message);
    } else {
      fetchComments();
    }
  };

  return (
    <div className={`comment_wrap ${isOpen ? 'on' : ''}`}>
      <div className="title_wrap">
        <h2>댓글</h2>
        <img src="/close.svg" alt="닫기" onClick={() => {
          closeComment(postId);
          setCommentEnter(postId, "");
        }} />
      </div>
      <div className="comment_hidden">
        <div className="comment">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="comment_txt">
                <i>{formatDate(comment.created_at)}</i>
                {comment.nickname && (<h2>{comment?.nickname}님 댓글</h2>)}
                <span>{comment.text || "내용 없음"}</span>
                <img src="/close.svg" alt="삭제" onClick={() => handleDelete(comment.id)} />
              </div>
            ))
          ) : (
            <p>댓글이 없습니다.</p>
          )}
        </div>
      </div>
      {userStore_id && userStore_id != null ? (
      <div className="comment_input_wrap">
        <input
          type="text"
          placeholder="댓글을 입력하세요."
          value={commentEnter[postId] || ""}
          onChange={(e) => setCommentEnter(postId, e.target.value)}
        />
        <button className="comment_submit_btn" onClick={handleSubmit} disabled={loading}>
          등록
        </button>
      </div>
      ) :
      (<div className="comment_input_wrap">
        <p>로그인 후 이용하세요.</p>
      </div>)}
    </div>
  );
}
