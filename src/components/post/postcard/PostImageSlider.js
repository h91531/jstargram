import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function PostImageSlider({ imageUrls }) {
  if (!imageUrls.length) return null;

  return (
    <Swiper modules={[Pagination]} spaceBetween={10} slidesPerView={1} pagination={{ clickable: true }}>
      {imageUrls.map((url, index) => (
        <SwiperSlide key={index}>
          <img src={url.trim()} alt={`게시물 이미지 ${index + 1}`} style={{ width: "100%", height: "auto" }} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
