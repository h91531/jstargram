'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams(); // App Router에서 경로 파라미터 가져오기
  const id = params.id;

  const [post, setPost] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]); // 새로 추가될 파일 상태
  const [existingImages, setExistingImages] = useState([]); // 기존 이미지 URL 상태
  const [loading, setLoading] = useState(false);

  // 기존 게시물 로드
  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        const { data, error } = await supabase.from("diary").select("*").eq("id", id).single();
        if (error) {
          alert("글 불러오기 실패: " + error.message);
        } else {
          setPost(data);
          setTitle(data.title);
          setContent(data.content);

          // 기존 이미지 URL을 배열로 처리
          const images = Array.isArray(data.image_url)
            ? data.image_url
            : data.image_url
            ? [data.image_url]
            : [];
          
          setExistingImages(images); // 기존 이미지 배열로 처리
        }
      };
      fetchPost();
    }
  }, [id]);

  // 파일 업로드 함수
  const handleUpload = async () => {
    if ((files.length === 0 && existingImages.length === 0) || !title || !content) {
      alert("파일, 제목, 내용 모두 입력해야 합니다.");
      return;
    }

    setLoading(true);

    const uploadedUrls = [...existingImages]; // 기존 이미지 URL을 포함시켜서 시작

    // 새로 업로드할 파일들
    for (let file of files) {
      let fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('img')  // 'img'는 Supabase 버킷 이름
        .upload(fileName, file);

      if (uploadError) {
        console.error('업로드 실패:', uploadError.message);
        alert('이미지 업로드 실패');
        setLoading(false);
        return;
      }

      const imageUrl = `https://purrosepipqhtcxxxdmj.supabase.co/storage/v1/object/public/img/${fileName}`;
      uploadedUrls.push(imageUrl); // 기존 URL에 새로 업로드된 이미지 추가
    }

    // 기존 데이터와 결합하여 업데이트
    const { error: updateError } = await supabase
      .from("diary")
      .update({ title, content, image_url: uploadedUrls }) // 기존 이미지 URL을 포함하여 업데이트
      .eq("id", id);

    if (updateError) {
      alert("수정 실패: " + updateError.message);
    } else {
      alert("글이 수정되었습니다.");
      router.push("/"); // 메인 페이지로 이동
    }

    setLoading(false);
  };

  return (
    <div className="edit-container">
      <h1>글 수정</h1>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="제목"
        className="edit-input"
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="내용"
        className="edit-textarea"
      />
      
      {/* 기존 이미지 보여주기 */}
      {existingImages.length > 0 && (
        <div>
          <h3>기존 이미지</h3>
          <div className="existing-images">
            {existingImages.map((imageUrl, index) => (
              <img 
                key={index} 
                src={imageUrl} 
                alt={`기존 이미지 ${index + 1}`} 
                style={{ width: '100px', margin: '10px' }} 
              />
            ))}
          </div>
        </div>
      )}
      {/* 파일 선택 */}
      <input
        type="file"
        onChange={(e) => setFiles(Array.from(e.target.files))}  // 파일 선택 처리
        multiple  // 여러 파일 선택 가능
      />
      {files.length > 0 && <div>선택된 파일: {files.length}개</div>}

      <button onClick={handleUpload} disabled={loading} className="update_btn">
        {loading ? "업로드 중..." : "수정 저장하기"}
      </button>
    </div>
  );
}
