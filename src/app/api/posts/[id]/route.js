// app/api/posts/[id]/route.js

import { supabase } from "../../../../lib/supabaseClient";

export async function GET(req, { params }) {
  const { id } = await params;  // params를 비동기적으로 가져와야 합니다.

  try {
    // 게시글 가져오기
    const { data: post, error: postError } = await supabase
      .from("diary")
      .select("*")
      .eq("id", id)
      .single();
    
    if (postError) throw new Error(postError.message);

    // 댓글 가져오기
    const { data: comments, error: commentsError } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", id);

    if (commentsError) throw new Error(commentsError.message);

    return new Response(JSON.stringify({ post, comments }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
