'use client';

import Link from "next/link";
import { usePathname } from 'next/navigation';
import useSearchStore from '../store/searchStore'
import '../app/css/header.css';

export default function Header() {
    const pathname = usePathname();
    const hideSearch = pathname.includes('upload') || pathname.includes('edit');
    const uploadPath = pathname.includes('upload');
    
    const setSearchQuery = useSearchStore((state) => state.setSearchQuery);
    
    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
    };

    return (
        <header>
            <div className="container">
                <ul>
                    <li><Link href="/" className="upload_link">홈<b>♥</b></Link></li>
                    {!uploadPath && (
                        <li><Link href="/upload" className="upload_link">글 쓰기<b>♥</b></Link></li>
                    )}
                    {!hideSearch && (
                        <li className="search_nav">
                            <img src="/search.svg" alt="검색" />
                            <input
                                type="text"
                                placeholder="검색"
                                onChange={handleSearchChange}
                            />
                        </li>
                    )}
                </ul>
            </div>
        </header>
    );
}
