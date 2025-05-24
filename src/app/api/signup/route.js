import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';
import cloudinary from '../../../lib/cloudinary';

export const POST = async (req) => {
  try {
    const formData = await req.formData();

    const user_id = formData.get('user_id');
    const user_password = formData.get('user_password');
    const user_name = formData.get('user_name');
    const user_birth = formData.get('user_birth');
    const user_phone = formData.get('user_phone');
    const user_nickname = formData.get('user_nickname');
    const profileImageFile = formData.get('profile_image');
    const user_bio = formData.get('user_bio');

    let profileImageUrl = null;

    if (profileImageFile && profileImageFile.size > 0) {
      try {
        const arrayBuffer = await profileImageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = `data:${profileImageFile.type};base64,${buffer.toString('base64')}`;

        const uploadResult = await cloudinary.uploader.upload(base64Image, {
          folder: 'user_profile_images',
          public_id: `${user_id}_profile_${Date.now()}`,
        });
        profileImageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary 프로필 이미지 업로드 실패:", uploadError);
        return new NextResponse(
          JSON.stringify({ message: '프로필 이미지 업로드 실패' }),
          { status: 500 }
        );
      }
    }

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          user_id,
          user_password,
          user_name,
          user_birth,
          user_phone,
          user_nickname,
          user_profile_image: profileImageUrl,
          user_bio,
        },
      ]);

    if (error) {
      console.error("Supabase 데이터 삽입 실패:", error);
      throw error;
    }

    return new NextResponse(
      JSON.stringify({ message: '회원가입 성공' }),
      { status: 200 }
    );
  } catch (error) {
    console.error("서버에서 오류 발생:", error);
    const errorMessage = error.message || '서버 오류';
    return new NextResponse(
      JSON.stringify({ message: errorMessage }),
      { status: 500 }
    );
  }
};