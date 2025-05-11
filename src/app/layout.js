import './globals.css'
import './css/reset.css'
import Bg from '../components/background'
import Header from '../components/Header'


export const metadata = {
  title: '지스타그램',
  icons: {
    apple: '/apple-touch-icon.png',
    icon: '/favicon.png'
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Bg />
        <Header />
        <main>{children}</main>
      </body>
    </html>
  )
}
