import './globals.css'
import Link from "next/link";



export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
      <Link href="/upload" style={{ textAlign: "center", display: "block" }}>글 작성</Link>
        {children}
        </body>
    </html>
  )
}
