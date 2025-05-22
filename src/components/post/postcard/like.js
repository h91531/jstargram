"use client";
import { useState, useEffect } from "react";
import useUserStore from "../../../store/userStore";
import { supabase } from "../../../lib/supabaseClient";

export default function Like({ post_id }) {
  const { userStore_id } = useUserStore();
  const [isPushed, setIsPushed] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showUserListModal, setShowUserListModal] = useState(false);
  const [likedUsers, setLikedUsers] = useState([]);

  // 좋아요 개수 가져오기
  async function fetchLikeCount(postId) {
    const { error, count } = await supabase
      .from("likes")
      .select("id", { count: "exact" }) // * 대신 id만 선택
      .eq("post_id", postId);

    if (error) {
      console.error("좋아요 개수 조회 실패:", error);
      return 0;
    }
    return count || 0;
  }

  // 좋아요 누른 사용자 ID 목록 가져오기
  async function fetchLikedUsers(postId) {
    const { data, error } = await supabase
      .from("likes")
      .select("user_id") // 명시적으로 user_id만 선택
      .eq("post_id", postId);

    if (error) {
      console.error("좋아요 누른 유저 목록 조회 실패:", error);
      return [];
    }

    return data.map(item => item.user_id);
  }

  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!userStore_id) return;

      const { data, error } = await supabase
        .from("likes")
        .select("id") // 명시적으로 id만 선택
        .eq("user_id", userStore_id)
        .eq("post_id", post_id)
        .maybeSingle(); // error 방지용

      if (data) setIsPushed(true);
    };

    const getInitialLikeCount = async () => {
      const count = await fetchLikeCount(post_id);
      setLikeCount(count);
    };

    fetchLikeStatus();
    getInitialLikeCount();
  }, [userStore_id, post_id]);

  const handleClick = async () => {
    if (!userStore_id) return alert("로그인 후 이용해주세요");

    if (isPushed) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("user_id", userStore_id)
        .eq("post_id", post_id);

      if (!error) {
        setIsPushed(false);
        setLikeCount(prev => prev - 1);
      }
    } else {
      const { error } = await supabase
        .from("likes")
        .insert([{ user_id: userStore_id, post_id }]);

      if (!error) {
        setIsPushed(true);
        setLikeCount(prev => prev + 1);
      }
    }
  };

  const show_user_list = async () => {
    if (likeCount === 0) {
      alert("아직 좋아요를 누른 사람이 없습니다.");
      return;
    }
    const users = await fetchLikedUsers(post_id);
    setLikedUsers(users);
    setShowUserListModal(true);
  };

  const closeUserListModal = () => {
    setShowUserListModal(false);
    setLikedUsers([]);
  };

  return (
    <div className="likes_wrap">
      <img
        src={isPushed ? "/push_heart.png" : "/heart.png"}
        alt="좋아요"
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      />
      <strong
        className="user_list"
        onClick={show_user_list}
        style={{ cursor: "pointer" }}
      >
        {likeCount}
      </strong>

      {showUserListModal && (
        <div className="modal_overlay">
          <div className="modal_content">
            <h3>좋아요 누른 사람들</h3>
            <ul>
              {likedUsers.length > 0 ? (
                likedUsers.map((userId, index) => (
                  <li key={index}>{userId}</li>
                ))
              ) : (
                <li>목록을 불러오는 중이거나, 좋아요를 누른 사람이 없습니다.</li>
              )}
            </ul>
            <button onClick={closeUserListModal}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
