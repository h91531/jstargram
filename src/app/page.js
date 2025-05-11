// src/app/page.js (서버 컴포넌트)
import PostList from '../components/post/PostList';

export default function HomePage() {
  return (
    <div>
      <PostList />
    </div>
  );
}
