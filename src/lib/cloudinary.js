// lib/cloudinary.js 또는 src/lib/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,  // NEXT_PUBLIC_ 접두사 추가
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,        // NEXT_PUBLIC_ 접두사 추가
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,  // NEXT_PUBLIC_ 접두사 추가
  secure: true, // HTTPS를 사용하여 안전한 URL을 반환하도록 설정
});

export default cloudinary;