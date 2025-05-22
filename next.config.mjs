// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 'res.cloudinary.com' 도메인을 여기에 추가해야 합니다.
    domains: ['res.cloudinary.com'],
    // 만약 다른 설정들이 있다면 여기에 이어서 작성하세요.
  },
};

export default nextConfig; // export default로 내보냅니다.