import { supabase } from "../../../lib/supabaseClient";

export default function PostActions({ post, router }) {
  const handleDelete = async () => {
    const isConfirmed = window.confirm("정말 이 글을 삭제하시겠습니까?");
    if (!isConfirmed) return;

    try {
      // 1. 클라우디너리 이미지 삭제 요청 (publicid가 배열인지 확인)
      if (Array.isArray(post.publicid) && post.publicid.length > 0) {
        // 각 publicid가 유효한지 확인 후 삭제
        for (const publicid of post.publicid) {
          if (!publicid) {
            console.error("publicid가 없습니다: ", publicid);
            continue; // publicid가 없으면 건너뜁니다.
          }

          // Cloudinary 경로 중복을 피하기 위해 "diary_images/"가 중복되지 않도록 처리
          const cleanedPublicId = publicid.startsWith("diary_images/")
            ? publicid
            : `diary_images/${publicid}`;

          console.log("삭제할 publicid:", cleanedPublicId);

          const response = await fetch("/api/deleteImage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ publicId: cleanedPublicId }),  // 중복된 경로 제거
          });

          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || "이미지 삭제 실패");
          }
        }
      }

      // 2. Supabase에서 글 삭제 (소문자 id 사용)
      const { error } = await supabase.from("diary").delete().eq("id", post.id);
      if (error) {
        alert("글 삭제 실패: " + error.message);
      } else {
        alert("글이 삭제되었습니다.");
        window.location.reload();
      }
    } catch (err) {
      alert("삭제 중 오류가 발생했습니다: " + err.message);
    }
  };

  const handleEdit = () => {
    router.push(`/edit/${post.id}?id=${post.user_id}`);
  };

  return (
    <div className="btn_wrap">
      <button onClick={handleDelete} className="delete_btn">글 삭제</button>
      <button onClick={handleEdit} className="modify_btn">글 수정</button>
    </div>
  );
}

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("🔍 [요청 본문] 받은 요청 데이터:", body);

    const { publicId } = body;
    if (!publicId) {
      console.error("⚠️ publicId가 없음");
      return Response.json({ error: 'publicId is required' }, { status: 400 });
    }

    // Cloudinary 경로 중복을 피하기 위해 "diary_images/"가 중복되지 않도록 처리
    const fullPublicId = publicId.startsWith("diary_images/")
      ? publicId
      : `diary_images/${publicId}`;

    console.log(`📁 [삭제 시도] Cloudinary에 보낼 전체 public_id: "${fullPublicId}"`);

    const result = await cloudinary.uploader.destroy(fullPublicId);
    console.log("✅ [Cloudinary 응답] 삭제 결과:", result);

    return Response.json(result);
  } catch (error) {
    console.error("❌ [에러 발생] 이미지 삭제 중 오류:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
