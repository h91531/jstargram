// HomePage.js (서버 컴포넌트)
import { supabase } from '../lib/supabaseClient'
import PostCard from '../components/PostCard'

export default async function HomePage() {
  // 서버에서 데이터 가져오기
  const { data } = await supabase
    .from('diary')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="container">
      <h1>피드</h1>
      {data.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
