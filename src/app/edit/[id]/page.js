'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import userStore from '../../../store/userStore'
import '../../css/edit.css';
import Cookies from 'js-cookie';
import jwt from 'jsonwebtoken';

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
  const {setId, userStore_id} = userStore();

  const cloudinaryPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;



  useEffect(() => {
    if (id) {
      const fetchPost = async () => {
        const { data, error } = await supabase.from("diary").select("*").match({ "id": id, "user_id": userStore_id }).single();
        if (error) {
          alert("잘못된 접근입니다.");
          router.push("/");
        } else {
          setPost(data);
          setTitle(data.title);
          setContent(data.content);

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

  // 이미지 삭제 핸들러 (Cloudinary와 Supabase에서 삭제)
  const handleRemoveExistingImage = async (urlToRemove) => {
    const confirmDelete = confirm("이 이미지를 삭제하시겠습니까?");
    if (!confirmDelete) return;

    const publicId = urlToRemove.split('/').pop().split('.')[0];  // Cloudinary URL에서 public_id 추출
 
    try {
 
        const response = await fetch('/api/deleteImage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId }),
        });

      const result = await response.json();
      if (result.error) {
        console.error('이미지 삭제 실패:', result.error.message);
        alert('이미지 삭제 실패');
        return;
      }

      // Supabase에서 URL 제거
      setExistingImages((prev) => prev.filter((url) => url !== urlToRemove));

      // Supabase에서 해당 URL을 제외한 새로운 이미지 URL 배열로 업데이트
      const updatedImageUrls = existingImages.filter((url) => url !== urlToRemove);

      const { error: updateError } = await supabase
        .from("diary")
        .update({
          image_url: updatedImageUrls,
        })
        .eq("id", id);

      if (updateError) {
        console.error("수정 실패:", updateError.message);
        alert("이미지 삭제 후 DB 수정 실패");
      } else {
        alert("이미지가 삭제되었습니다.");
      }
    } catch (error) {
      console.error("이미지 삭제 중 오류 발생:", error.message);
      alert("이미지 삭제 중 오류 발생");
    }
  };

  const resizeAndCompressImage = (file, maxWidth = 1280, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = () => {
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error("이미지 변환 실패"));
          const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpeg", {
            type: "image/jpeg",
          });
          resolve(newFile);
        }, "image/jpeg", quality);
      };

      img.onerror = () => reject(new Error("이미지 로딩 실패"));
    });
  };

  const handleUpload = async () => {
    if ((!title || !content) || (files.length === 0 && existingImages.length === 0)) {
      alert("제목, 내용, 이미지 중 하나라도 빠져있습니다.");
      return;
    }

    setLoading(true);
    const uploadedUrls = [...existingImages];

    for (const file of files) {
      try {
        const compressedFile = await resizeAndCompressImage(file);

        const formData = new FormData();
        formData.append('file', compressedFile);
        formData.append('upload_preset', cloudinaryPreset);
        formData.append('folder', 'diary_images');

        const response = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();
        if (result.error) {
          alert("이미지 업로드 실패: " + result.error.message);
          setLoading(false);
          return;
        }

        uploadedUrls.push(result.secure_url);
      } catch (error) {
        alert("이미지 처리 중 오류 발생: " + error.message);
        setLoading(false);
        return;
      }
    }

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

      {existingImages.length > 0 && (
        <div>
          <h3>기존 이미지</h3>
          <div className="existing-images">
            {existingImages.map((imageUrl, index) => (
              <div key={index} className="img_wrap">
                <img src={imageUrl} alt={`기존 이미지 ${index + 1}`} loading="lazy" />
                <button onClick={() => handleRemoveExistingImage(imageUrl)} className="delete_btn">
                  삭제
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
