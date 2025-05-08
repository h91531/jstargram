import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

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

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
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
    </div>
  );
}
