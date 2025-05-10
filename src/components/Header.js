import Link from "next/link";
import '../app/css/header.css';

export default function Header() {
    return (
        <header>
            <div className="container">
                <ul>
                    <li><Link href="/" className="upload_link">홈<b>♥</b></Link></li>
                    <li><Link href="/upload" className="upload_link">글 쓰기<b>♥</b></Link></li>
                </ul>
            </div>
        </header>
    )
}