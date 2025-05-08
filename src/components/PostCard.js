import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function PostCard({ post }) {
  const router = useRouter();
  let imageUrls = [];

  // 이미지 URL 파싱
  if (Array.isArray(post?.image_url)) {
    imageUrls = post.image_url;
  } else if (typeof post?.image_url === "string") {
    try {
      const parsed = JSON.parse(post.image_url);
      imageUrls = Array.isArray(parsed) ? parsed : post.image_url.split(",");
    } catch (e) {
      imageUrls = post.image_url.split(",");
    }
  }

  console.log("이미지 URL들:", imageUrls);

  // 날짜 포맷
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  };

  // 글 삭제
  const handleDelete = async () => {
    const isConfirmed = window.confirm("정말 이 글을 삭제하시겠습니까?");
    if (!isConfirmed) return;

    try {
      // 🔽 이미지 경로 파싱
      const imagePaths = imageUrls
        .map((url) => {
          try {
            const path = url.split("/storage/v1/object/public/")[1];
            if (!path) throw new Error("유효하지 않은 URL 경로");

            // img 버킷이라면, 앞에 'img/' 붙여줘야 Supabase에서 인식함
            const fullPath = `img/${path}`;
            console.log("삭제 대상 전체 경로:", fullPath);
            return fullPath;
          } catch (e) {
            console.error("경로 파싱 실패:", url, e);
            return null;
          }
        })
        .filter(Boolean)
        .map((path) => path.replace(/^img\//, "")); // supabase.storage.from("img") 사용 시 img/ 제거

      console.log("삭제할 이미지 경로들:", imagePaths);

      if (imagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("img")
          .remove(imagePaths);

        if (storageError) {
          console.error("이미지 삭제 실패:", storageError);
          alert("이미지 삭제 실패: " + storageError.message);
          return;
        } else {
          console.log("이미지 삭제 성공");
        }
      }

      const { error } = await supabase.from("diary").delete().eq("id", post.id);

      if (error) {
        console.error("글 삭제 실패:", error);
        alert("글 삭제 실패: " + error.message);
      } else {
        console.log("글 삭제 성공:", post.id);
        alert("글과 이미지가 삭제되었습니다.");
        window.location.reload();
      }
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleEdit = () => {
    router.push(`/edit/${post.id}`);
  };

  return (
    <div className="card">
      {imageUrls.length > 0 && (
        <Swiper
          modules={[Pagination]}
          spaceBetween={10}
          slidesPerView={1}
          pagination={{ clickable: true }}
        >
          {imageUrls.map((url, index) => (
            <SwiperSlide key={index}>
              <img
                src={url.trim()}
                alt={`게시물 이미지 ${index + 1}`}
                style={{ width: "100%", height: "auto" }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
      <h2>{post?.title}</h2>
      <p>{post?.content}</p>
      <span>{formatDate(post?.created_at)}</span>
      <button onClick={handleDelete} className="delete_btn">
        글 삭제
      </button>
      <button onClick={handleEdit} className="modify_btn">
        글 수정
      </button>
    </div>
  );
}
