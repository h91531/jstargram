'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function UploadPage() {
  const [files, setFiles] = useState([])  // 파일 배열로 상태 변경
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  // 파일이 이미 존재하는지 확인하는 함수
  const checkIfFileExists = async (fileName) => {
    const { data, error } = await supabase.storage.from('img').list()

    if (error) {
      console.error('파일 체크 실패:', error.message)  // 문제 발생 시 확인
      return false
    }

    // 같은 이름의 파일이 있는지 확인
    return data?.some(item => item.name === fileName)
  }

  const handleUpload = async () => {
    if (files.length === 0 || !title || !content) {
      alert('파일, 제목, 내용 모두 입력해야 합니다.')
      return
    }

    setLoading(true)

    const uploadedUrls = []  // 업로드된 이미지 URL들을 저장할 배열
    
    for (let file of files) {
      // 파일명에 시간 추가
      let fileName = `${Date.now()}-${file.name}`

      // 중복 방지
      let fileExists = await checkIfFileExists(fileName)
      while (fileExists) {
        fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}-${file.name}`
        fileExists = await checkIfFileExists(fileName)
      }

      // 실제 파일 업로드
      const { error: uploadError } = await supabase.storage
        .from('img') // 📌 'img' 버킷이 존재해야 함
        .upload(fileName, file)

      if (uploadError) {
        console.error('업로드 실패:', uploadError.message)
        alert('이미지 업로드 실패')
        setLoading(false)
        return
      }

      // 업로드된 파일의 퍼블릭 URL 생성
      const imageUrl = `https://purrosepipqhtcxxxdmj.supabase.co/storage/v1/object/public/img/${fileName}`
      uploadedUrls.push(imageUrl)
    }

    // DB에 저장 (이미지 URL을 배열 형태로 저장)
    const { error: insertError } = await supabase
      .from('diary') // 📌 'diary' 테이블 존재 확인 필요
      .insert([{ title, content, image_url: uploadedUrls, created_at: new Date() }])  // 'image_url'을 배열로 저장

    if (insertError) {
      console.error('DB 저장 실패:', insertError.message)
      alert('데이터 저장 실패')
    } else {
      alert('업로드 성공!')
      setTitle('')
      setContent('')
      setFiles([])
    }

    setLoading(false)
  }

  return (
    <div className="container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1>📝 게시물 업로드</h1>
      <input
        type="text"
        placeholder="제목을 입력하세요"
        value={title}
        onChange={e => setTitle(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '10px' }}
      />
      <textarea
        rows="3"
        placeholder="내용을 입력하세요"
        value={content}
        onChange={e => setContent(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: '10px' }}
      />
      <input
        type="file"
        onChange={e => setFiles(Array.from(e.target.files))}  // 여러 파일 선택 처리
        multiple  // 여러 파일 업로드 가능
        style={{ marginBottom: '10px' }}
      />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? '업로드 중...' : '업로드'}
      </button>
    </div>
  )
}
