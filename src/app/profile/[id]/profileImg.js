'use client';

import Image from 'next/image';

export default function ProfileImg({ imgurl, user_nickname, postCount }) {
  const finalImgSrc = imgurl && typeof imgurl === 'string' && imgurl !== ''
    ? imgurl
    : '/normal_profile.webp';

  return (
    <div className="profileimg_wrap">
      <Image
        src={finalImgSrc}
        alt="유저 프로필 이미지"
        width={100}
        height={100}
        quality={100}
        priority={true}
        style={{
          borderRadius: '50%',
          objectFit: 'cover'
        }}
      />
      <h2>{user_nickname}</h2>
      <div>
        <p>게시물</p>
        <span>{postCount}</span>
      </div>

    </div>
  );
}