import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export const POST = async (req) => {
  try {
    const formData = await req.json();
    const { user_id, user_password, user_name, user_birth, user_phone, user_nickname } = formData;

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
        },
      ]);

    if (error) {
      throw error;
    }

    // 성공적인 가입 응답
    return new NextResponse(
      JSON.stringify({ message: '회원가입 성공' }),
      { status: 200 }
    );
  } catch (error) {
    console.error("서버에서 오류 발생:", error);
    return new NextResponse(
      JSON.stringify({ message: '서버 오류' }),
      { status: 500 }
    );
  }
};
