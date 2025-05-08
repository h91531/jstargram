import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { supabase } from "../lib/supabaseClient"; // 경로는 프로젝트에 맞게 수정

export default function PostCard({ post }) {
  let imageUrls = [];

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
  };

  const handleDelete = async () => {
    const isConfirmed = window.confirm("정말 이 글을 삭제하시겠습니까?");
    if (!isConfirmed) return;

    const { error } = await supabase.from("diary").delete().eq("id", post.id);

    if (error) {
      alert("삭제 실패: " + error.message);
    } else {
      alert("글이 삭제되었습니다.");
      window.location.reload(); // 홈페이지 새로고침
    }
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
              <img src={url.trim()} alt={`게시물 이미지 ${index + 1}`} />
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
    </div>
  );
}
