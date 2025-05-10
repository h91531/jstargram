// HomePage.js (서버 컴포넌트)
import { supabase } from '../lib/supabaseClient'
import PostCard from '../components/PostCard'

export default async function HomePage() {
  const { data } = await supabase
    .from('diary')
    .select('*')
    .order('created_at', { ascending: false })

  return (
      <div>
        <div className="post_wrap">
          {data.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
  )
}
