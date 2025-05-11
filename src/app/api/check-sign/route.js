import { supabase } from '@/lib/supabaseClient'; // supabase 클라이언트

// 아이디 또는 닉네임 중복 확인 (POST 요청으로 받는 방식)
export const POST = async (req) => {
  const { type, value } = await req.json(); // 요청 본문에서 type과 value를 추출

  try {
    // 'type'에 따라 처리
    let existingUser;

    if (type === 'id') {
      // user_id 중복 확인 (사용자가 설정한 로그인 아이디)
      const { data, error } = await supabase
        .from('users')
        .select('user_id')  // user_id로 변경
        .eq('user_id', value)  // user_id로 변경
        .maybeSingle()
      
      if (error) {
        console.error('Supabase error:', error.message);  // 오류 메시지 출력
        return new Response(
          JSON.stringify({ message: '서버 오류가 발생했습니다.' }),
          { status: 500 }
        );
      }

      existingUser = data;
    } else if (type === 'nickname') {
      // user_nickname 중복 확인 (닉네임)
      const { data, error } = await supabase
        .from('users')
        .select('user_nickname')  // user_nickname으로 변경
        .eq('user_nickname', value)  // user_nickname으로 변경
        .maybeSingle()

      if (error) {
        console.error('Supabase error:', error.message);  // 오류 메시지 출력
        return new Response(
          JSON.stringify({ message: '서버 오류가 발생했습니다.' }),
          { status: 500 }
        );
      }

      existingUser = data;
    } else {
      return new Response(
        JSON.stringify({ message: '유효하지 않은 타입입니다.' }),
        { status: 400 }
      );
    }

    if (existingUser) {
      // 중복이 있는 경우
      return new Response(
        JSON.stringify({ message: `이미 사용 중인 ${type === 'id' ? '아이디' : '닉네임'}입니다.` }),
        { status: 409 }
      );
    }

    // 사용 가능한 경우
    return new Response(
      JSON.stringify({ message: `사용 가능한 ${type === 'id' ? '아이디' : '닉네임'}입니다.` }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Request handling error:', error);  // 요청 처리 중 발생한 오류 출력
    return new Response(
      JSON.stringify({ message: '서버 오류' }),
      { status: 500 }
    );
  }
};
