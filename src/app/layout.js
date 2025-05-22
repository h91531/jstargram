// layout.js
import './globals.css';
import './css/reset.css';
import Bg from '../components/background';
import Header from '../components/Header';

import { cookies } from 'next/headers';

export const metadata = {
  title: 'SNS',
  icons: {
    apple: '/apple-touch-icon.png',
  },
  viewport: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
};

// ✅ JWT를 직접 파싱하는 함수 (외부 라이브러리 없이)
function decodeJWT(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    console.log(decoded);
    return decoded;
  } catch (e) {
    console.error('❌ JWT parsing failed:', e);
    return null;
  }
}

export default async function RootLayout({ children }) {
  let nickname = ''; // `nickname`으로 변경
  let id = '';
  let profile = '';

  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;


  if (token) {
    const decoded = decodeJWT(token);
    nickname = decoded?.usernickname || '';
    id = decoded?.userid || '';
    profile = decoded?.userprofile || '';
  }
  
  return (
    <html lang="ko">
      <body>
        <Bg />
        <Header nickname={nickname} id ={id} profile = {profile} />
        <main>{children}</main>
      </body>
    </html>
  );
}
