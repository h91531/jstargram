import './globals.css'
import './css/reset.css'
import Bg from '../components/background'
import Header from '../components/Header'



export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <Bg></Bg>
      <Header></Header>
      <main>
        {children}
      </main>
        </body>
    </html>
  )
}
