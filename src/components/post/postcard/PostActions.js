import { supabase } from "../../../lib/supabaseClient";

export default function PostActions({ post, imageUrls, router }) {
  const handleDelete = async () => {
    const isConfirmed = window.confirm("정말 이 글을 삭제하시겠습니까?");
    if (!isConfirmed) return;

    try {
      const imagePaths = imageUrls
        .map((url) => url.match(/\/img\/(.+)$/)?.[1])
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
    } catch {
      alert("삭제 중 오류가 발생했습니다.");
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
