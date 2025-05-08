import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import '../app/css/post.css'

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
      // 🔽 이미지 경로 파싱: /img/ 이후의 경로만 추출
      const imagePaths = imageUrls
        .map((url) => {
          const match = url.match(/\/img\/(.+)$/); // img/ 뒤 경로 추출
          return match ? match[1] : null;
        })
        .filter(Boolean);


      // 🔽 이미지 먼저 삭제
      if (imagePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("img")
          .remove(imagePaths);

        if (storageError) {
          alert("이미지 삭제 실패: " + storageError.message);
          return; // ❌ 이미지 삭제 실패 시, 중단
        }

      }

      // 🔽 DB 레코드 삭제
      const { error } = await supabase
        .from("diary")
        .delete()
        .eq("id", post.id);

      if (error) {
        alert("글 삭제 실패: " + error.message);
      } else {
        alert("글과 이미지가 삭제되었습니다.");
        window.location.reload();
      }
    } catch (error) {
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
