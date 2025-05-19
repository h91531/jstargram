"use client";
import { useState, useEffect } from "react";
import useUserStore from "../../../store/userStore";
import { supabase } from "../../../lib/supabaseClient";

export default function Like({ post_id }) {
  const { userStore_id } = useUserStore();
  const [isPushed, setIsPushed] = useState(false);
  const [likeCount, setLikeCount] = useState(0); // 좋아요 개수 상태 추가
  const [userList, setuserList] = useState(false);

  async function fetchLikeCount(postId) {
    const { data, error, count } = await supabase
      .from("likes")
      .select("*", { count: "exact" })
      .eq("post_id", postId);

    if (error) {
      console.error("좋아요 개수 조회 실패:", error);
      return 0;
    }

    return count || 0;
  }

  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!userStore_id) return;
      const { data } = await supabase
        .from("likes")
        .select("*")
        .eq("user_id", userStore_id)
        .eq("post_id", post_id)
        .single();

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
        setLikeCount((prevCount) => prevCount - 1);
      }
    } else {
      const { error } = await supabase.from("likes").insert([
        { user_id: userStore_id, post_id: post_id },
      ]);
      if (!error) {
        setIsPushed(true);
        setLikeCount((prevCount) => prevCount + 1);
      }
    }
  };

  const show_user_list = async () => {
    console.log(1);
  }

  return (
    <div className="likes_wrap">
      <img
        src={isPushed ? "/push_heart.png" : "/heart.png"}
        alt="좋아요"
        onClick={handleClick}
        style={{ cursor: "pointer" }}
      />
      <strong className="user_list" onClick={show_user_list}>{likeCount}</strong>
    </div>
  );
}