import { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import useCommentStore from "../../../store/commentStore";
import formatDate from "../../../utils/formatDate";
import userStore from "../../../store/userStore";
import Image from 'next/image'; // Next.js의 Image 컴포넌트를 임포트합니다.

export default function PostComments({ postId, isOpen, comments, fetchComments }) {
  const { commentEnter, setCommentEnter, closeComment } = useCommentStore();
  const [loading, setLoading] = useState(false);
  const { nickname, userStore_id } = userStore();

  // 프로필 이미지가 없을 때 사용할 기본 이미지 경로를 정의합니다.
  const defaultProfileImage = '/normal_profile.webp'; // 프로젝트에 맞는 경로로 설정해주세요.

  const handleSubmit = async () => {
    const text = commentEnter[postId];
    if (!text?.trim()) {
      alert("댓글을 입력해주세요.");
      return;
    }

    setLoading(true);
    // 댓글 등록 시 현재 로그인한 사용자의 user_id도 함께 저장합니다.
    const { error } = await supabase.from("comments").insert([
      { diary_id: postId, text, nickname, user_id: userStore_id }
    ]);
    setLoading(false);

    if (error) {
      alert("댓글 등록 실패: " + error.message);
    } else {
      alert("댓글이 등록되었습니다.");
      setCommentEnter(postId, "");
      fetchComments(); // 댓글 등록 후 목록 새로고침
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("정말 이 댓글을 삭제하시겠습니까?")) return;

    const { error } = await supabase.from("comments").delete().eq("id", commentId);
    if (error) {
      alert("댓글 삭제 실패: " + error.message);
    } else {
      fetchComments(); // 댓글 삭제 후 목록 새로고침
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
            comments.map((comment) => {
              // 각 댓글 작성자의 프로필 이미지 URL을 가져오거나 기본 이미지로 폴백
              const commentUserProfileImage = comment.users?.user_profile_image;
              const imageSrc = commentUserProfileImage || defaultProfileImage;

              return (
                <div key={comment.id} className="comment_txt">
                  <i>{formatDate(comment.created_at)}</i>
                  {comment.nickname && (
                    <div className="comments_profile">
                      {/* 댓글 작성자의 프로필 이미지 표시 */}
                      <Image
                        src={imageSrc}
                        alt={`${comment.nickname}님의 프로필 이미지`}
                        width={40} // 댓글 옆에 표시될 이미지 크기
                        height={40} // 댓글 옆에 표시될 이미지 크기
                        style={{ borderRadius: '50%', objectFit: 'cover' }}
                        priority={true}
                      />
                      <h2>{comment?.nickname}님 댓글</h2>
                    </div>
                  )}
                  <span>{comment.text || "내용 없음"}</span>
                  {/* 현재 로그인한 사용자와 댓글 작성자가 같을 경우에만 삭제 버튼 표시 */}
                  {nickname === comment.nickname && (
                    <img src="/close.svg" alt="삭제" onClick={() => handleDelete(comment.id)} className="close_btn" />
                  )}
                </div>
              );
            })
          ) : (
            <p>댓글이 없습니다.</p>
          )}
        </div>
      </div>
      {userStore_id ? ( // 사용자가 로그인한 상태일 때만 댓글 입력 필드 표시
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
      ) : (
        <div className="comment_input_wrap">
          <p>로그인 후 이용하세요.</p>
        </div>
      )}
    </div>
  );
}