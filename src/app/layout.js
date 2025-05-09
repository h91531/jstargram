import './globals.css'
import './css/reset.css'
import Link from "next/link";



export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
      <Link href="/upload" style={{ textAlign: "center", display: "block" }}>글 작성</Link>
      <div className="bg"></div>
        {children}
        </body>
    </html>
  )
}
