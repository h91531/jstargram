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

  // 이미지 리사이즈 및 압축 함수 (JPEG, PNG 등을 JPEG로 변환하고 압축)
  const resizeAndCompressImage = (file, maxWidth = 1280, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const reader = new FileReader()

      reader.onload = () => {
        img.src = reader.result
      }

      reader.onerror = (error) => reject(error)
      reader.readAsDataURL(file)

      img.onload = () => {
        const canvas = document.createElement('canvas')
        const scale = Math.min(1, maxWidth / img.width)
        canvas.width = img.width * scale
        canvas.height = img.height * scale

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

        // JPEG 형식으로 변환 및 압축
        canvas.toBlob(
          (blob) => {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpeg", {
              type: "image/jpeg",
            })
            resolve(compressedFile)
          },
          'image/jpeg',
          quality
        )
      }

      img.onerror = () => reject(new Error("이미지 로딩 실패"))
    })
  }

  // 파일 업로드 처리
  const handleUpload = async () => {
    if (files.length === 0 || !title || !content) {
      alert('파일, 제목, 내용 모두 입력해야 합니다.')
      return
    }

    setLoading(true)

    const uploadedUrls = []  // 업로드된 이미지 URL들을 저장할 배열

    for (let file of files) {
      try {
        // 이미지 리사이즈 및 압축
        const compressedFile = await resizeAndCompressImage(file)

        // 업로드할 파일명 생성
        const fileName = `${Date.now()}-${compressedFile.name}`

        // Supabase에 파일 업로드
        const { error: uploadError } = await supabase.storage
          .from('img')  // 📌 'img' 버킷이 존재해야 함
          .upload(fileName, compressedFile)

        if (uploadError) {
          console.error('업로드 실패:', uploadError.message)
          alert('이미지 업로드 실패')
          setLoading(false)
          return
        }

        // 업로드된 파일의 퍼블릭 URL 생성
        const imageUrl = `https://purrosepipqhtcxxxdmj.supabase.co/storage/v1/object/public/img/${fileName}`
        uploadedUrls.push(imageUrl)

      } catch (error) {
        console.error('이미지 처리 중 오류 발생:', error.message)
        alert('이미지 처리 중 오류 발생')
        setLoading(false)
        return
      }
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
      window.location.href = "/"  // 업로드 후 페이지 리로드
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

      {/* 업로드된 이미지 목록 */}
      {uploadedUrls.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>업로드된 이미지</h3>
          {uploadedUrls.map((url, index) => (
            <div key={index} style={{ marginBottom: '10px' }}>
              <img src={url} alt={`업로드된 이미지 ${index + 1}`} style={{ width: '100px', marginRight: '10px' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
