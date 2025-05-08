'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import PostCard from '../components/PostCard'

export default function HomePage() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from('diary')
        .select('*')
        .order('created_at', { ascending: false })

      setPosts(data || [])
    }
    fetchPosts()
  }, [])

  return (
    <div className="container">
      <h1>📸 피드</h1>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
