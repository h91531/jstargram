'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import '../css/upload.css'

export default function UploadPage() {
  
  const [files, setFiles] = useState([])  // 파일 배열로 상태 변경
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadedUrls, setUploadedUrls] = useState([])  // 업로드된 URL들을 상태로 관리

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
      alert('업로드가 완료되었습니다.')
      setTitle('')
      setContent('')
      setFiles([])  // 파일 리스트 초기화
      setUploadedUrls(uploadedUrls)  // 업로드된 이미지 URL 상태 업데이트
      window.location.href="/";  // 업로드 후 페이지 리로드
    }

    setLoading(false)
  }

  // 이미지 삭제 함수
  const handleDelete = async (fileUrl) => {
    setLoading(true)

    const fileName = fileUrl.split('/storage/v1/object/public/')[1]  // 파일명 추출
    console.log('삭제할 파일 이름:', fileName);  // 파일 이름 콘솔에 출력

    const { error: deleteError } = await supabase.storage
      .from('img') // 'img' 버킷에서 삭제
      .remove([fileName])  // 파일명 배열로 전달

    if (deleteError) {
      console.error('이미지 삭제 실패:', deleteError.message)
      alert('이미지 삭제 실패')
      setLoading(false)
      return
    }

    // DB에서 해당 이미지 URL 삭제 (삭제된 URL만 필터링)
    const { error: updateError } = await supabase
      .from('diary')
      .update({
        image_url: uploadedUrls.filter(url => url !== fileUrl)  // 삭제된 URL 제외
      })
      .eq('image_url', fileUrl)

    if (updateError) {
      console.error('DB 업데이트 실패:', updateError.message)
      alert('DB에서 이미지 URL 삭제 실패')
    } else {
      alert('이미지 삭제가 완료되었습니다.')
      setUploadedUrls(uploadedUrls.filter(url => url !== fileUrl))  // 상태에서 삭제된 URL 제거
    }

    setLoading(false)

  }

  return (
    <div className="upload_container" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1>게시물 업로드</h1>
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
      <button onClick={handleUpload} disabled={loading} className="upload_btn">
        {loading ? '업로드 중...' : '업로드'}
      </button>

      {/* 업로드된 이미지와 삭제 버튼 */}
      {uploadedUrls.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>업로드된 이미지</h3>
          {uploadedUrls.map((url, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <img src={url} alt={`업로드된 이미지 ${index + 1}`} style={{ width: '100px', marginRight: '10px' }} />
              <button onClick={() => handleDelete(url)} disabled={loading}>
                {loading ? '삭제 중...' : '삭제'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}





