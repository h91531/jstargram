import { supabase } from '@/lib/supabaseClient';
import jwt from 'jsonwebtoken';

const secretKey = process.env.SECRET_KEY

export async function POST(req) {
  const { username, password } = await req.json();

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', username)
    .single();

  if (error || !data || data.user_password !== password) {
    return new Response(
      JSON.stringify({ success: false, message: '아이디 또는 비밀번호가 틀렸습니다.' }),
      { status: 401 }
    );
  }

  const token = jwt.sign(
    { userid: data.user_id, username: data.user_name, usernickname: data.user_nickname, userprofile : data.user_profile_image },
    secretKey,
    { expiresIn: '7d' }
  );

  return new Response(
    JSON.stringify({ success: true, message: '로그인 성공' }),
    {
      status: 200,
      headers: {
        'Set-Cookie': `auth_token=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`,
        'Content-Type': 'application/json',
      },
    }
  );
}
