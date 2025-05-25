// src/app/api/update-token/route.js
import { supabase } from '@/lib/supabaseClient'; // supabaseClient 경로 확인
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers'; // Next.js 13+ App Router에서 서버 쿠키 사용

const secretKey = process.env.SECRET_KEY; 

export async function POST(req) {
    if (!secretKey) {
        console.error('API /update-token: ❌ SECRET_KEY 환경 변수가 설정되지 않았습니다.');
        return new Response(
            JSON.stringify({ success: false, message: '서버 설정 오류: 비밀 키가 없습니다.' }),
            { status: 500 }
        );
    }

    // 변경: newProfileImageUrl도 함께 받습니다.
    const { userId, newNickname, newProfileImageUrl } = await req.json(); 

    // **디버깅용 로그:** API로 전달받은 userId, newNickname, newProfileImageUrl 확인
    console.log("API /update-token: 요청 userId:", userId); 
    console.log("API /update-token: 요청 newNickname:", newNickname);
    console.log("API /update-token: 요청 newProfileImageUrl:", newProfileImageUrl);


    // 변경: newProfileImageUrl도 필수로 추가했습니다.
    // 만약 프로필 이미지만 변경하고 닉네임은 변경하지 않을 경우, newNickname이 undefined가 될 수 있으므로
    // 모든 필드를 필수로 체크하는 것보다 각 필드의 존재 여부를 확인하고 적절히 처리하는 것이 더 견고합니다.
    // 여기서는 클라이언트에서 newNickname이 없으면 currentNickname을 보내도록 했으므로 이 체크는 유효합니다.
    if (!userId || !newNickname || !newProfileImageUrl) { 
        console.error('API /update-token: 필수 매개변수 누락 (userId, newNickname, 또는 newProfileImageUrl)');
        return new Response(
            JSON.stringify({ success: false, message: '사용자 ID, 새 닉네임, 새 프로필 이미지 URL이 필요합니다.' }),
            { status: 400 }
        );
    }

    try {
        // 1. Supabase에서 해당 사용자의 최신 정보 조회 
        // 닉네임과 이미지 URL은 클라이언트에서 받았으므로, 토큰에 필요한 다른 필드(예: user_name)만 조회합니다.
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('user_id, user_name') // 'user_nickname', 'user_profile_image'는 이제 클라이언트에서 받으므로 굳이 다시 조회할 필요 없음
            .eq('user_id', userId)
            .single();

        if (userError || !userData) {
            console.error('API /update-token: 사용자 데이터 조회 오류:', userError?.message || '데이터 없음');
            return new Response(
                JSON.stringify({ success: false, message: '사용자 정보를 찾을 수 없습니다.' }),
                { status: 404 } // Not Found
            );
        }

        // **디버깅용 로그:** Supabase에서 성공적으로 조회된 사용자 데이터 확인
        console.log("API /update-token: Supabase에서 조회된 사용자 데이터 (닉네임/이미지 제외):", userData);


        // 2. 새로운 닉네임과 이미지 URL로 JWT 페이로드 생성
        // 로그인 시 토큰에 포함했던 모든 필드를 여기에 동일하게 포함해야 합니다.
        const tokenPayload = {
            userid: userData.user_id,
            username: userData.user_name, 
            usernickname: newNickname, // <-- 클라이언트에서 받은 새 닉네임 사용
            userprofile: newProfileImageUrl, // <-- 클라이언트에서 받은 새 이미지 URL 사용
        };
        console.log("API /update-token: 새 토큰 페이로드:", tokenPayload);

        const newToken = jwt.sign(
            tokenPayload,
            secretKey,
            { expiresIn: '7d' } 
        );

        console.log("API /update-token: 새 JWT 토큰 길이:", newToken.length);

        const cookieStore = cookies(); 
        cookieStore.set('auth_token', newToken, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'lax',
            maxAge: 604800, // 7일 (초 단위)
        });

        console.log('API /update-token: 토큰이 성공적으로 갱신되었습니다.');
        return new Response(
            JSON.stringify({ success: true, message: '토큰이 성공적으로 갱신되었습니다.' }),
            { status: 200 }
        );

    } catch (error) {
        console.error('API /update-token: 토큰 갱신 API 오류 (catch 블록):', error.message);
        return new Response(
            JSON.stringify({ success: false, message: '서버 오류로 토큰 갱신에 실패했습니다.' }),
            { status: 500 }
        );
    }
}