'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import '../../css/edit.css'

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [post, setPost] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // 게시글 데이터 불러오기
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

          // image_url 파싱
          let images = [];
          try {
            if (Array.isArray(data.image_url)) {
              images = data.image_url;
            } else if (typeof data.image_url === "string") {
              const parsed = JSON.parse(data.image_url);
              images = Array.isArray(parsed) ? parsed : data.image_url.split(",");
            }
          } catch (e) {
            images = data.image_url.split(",");
          }
          setExistingImages(images.map((url) => url.trim()));
        }
      };
      fetchPost();
    }
  }, [id]);

  // 기존 이미지 제거
  const handleRemoveExistingImage = async (imageUrlToRemove) => {
    const isConfirmed = window.confirm("이 이미지를 삭제하시겠습니까?");
    if (!isConfirmed) return;

    // Supabase 스토리지에서 삭제
    try {
      const path = imageUrlToRemove.split("/storage/v1/object/public/")[1];
      const filePath = path.replace(/^img\//, ""); // img 버킷 경로

      const { error: storageError } = await supabase.storage
        .from("img")
        .remove([filePath]);

      if (storageError) {
        alert("이미지 삭제 실패: " + storageError.message);
        return;
      }

      // 상태에서 제거
      setExistingImages((prev) => prev.filter((url) => url !== imageUrlToRemove));
      alert("이미지가 삭제되었습니다.");
    } catch (e) {
      alert("이미지 삭제 실패");
    }
  };

  // 글 수정 (기존 + 새 이미지 포함)
  const handleUpload = async () => {
    if ((!title || !content) || (files.length === 0 && existingImages.length === 0)) {
      alert("제목, 내용, 이미지 중 하나라도 빠져있습니다.");
      return;
    }

    setLoading(true);
    const uploadedUrls = [...existingImages];

    for (let file of files) {
      const fileName = `${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("img")
        .upload(fileName, file);

      if (uploadError) {
        alert("이미지 업로드 실패");
        setLoading(false);
        return;
      }

      const imageUrl = `https://purrosepipqhtcxxxdmj.supabase.co/storage/v1/object/public/img/${fileName}`;
      uploadedUrls.push(imageUrl);
    }

    // 데이터베이스 업데이트
    const { error: updateError } = await supabase
      .from("diary")
      .update({
        title,
        content,
        image_url: uploadedUrls,
      })
      .eq("id", id);

    if (updateError) {
      alert("수정 실패: " + updateError.message);
    } else {
      alert("글이 수정되었습니다.");
      router.push("/");
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

      {/* 기존 이미지 표시 및 삭제 버튼 */}
      {existingImages.length > 0 && (
        <div>
          <h3>기존 이미지</h3>
          <div className="existing-images">
            {existingImages.map((imageUrl, index) => (
              <div key={index} className="img_wrap">
                <img
                  src={imageUrl}
                  alt={`기존 이미지 ${index + 1}`}
                />
                <button onClick={() => handleRemoveExistingImage(imageUrl)} className="delete_btn">
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 새 이미지 업로드 */}
      <input
        type="file"
        onChange={(e) => setFiles(Array.from(e.target.files))}
        multiple
        className="add_img_input"
      />
      <div className="add_img">
        {files.length > 0 ? `선택된 파일: ${files.length}개` : "선택된 파일: 0개"}
      </div>
      <button onClick={handleUpload} disabled={loading} className="update_btn">
        {loading ? "업로드 중..." : "저장하기"}
      </button>
    </div>
  );
}
