'use client';

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import '../../css/edit.css';
import useSwitchStore from '../../../store/switchStore'

export default function EditPostPage() {
  const { useNewUrl } = useSwitchStore()
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [post, setPost] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleRemoveExistingImage = async (imageUrlToRemove) => {
    const isConfirmed = window.confirm("이 이미지를 삭제하시겠습니까?");
    if (!isConfirmed) return;

    try {
      const path = imageUrlToRemove.split("/storage/v1/object/public/")[1];
      const filePath = path.replace(/^img\//, "");

      const { error: storageError } = await supabase.storage
        .from("img")
        .remove([filePath]);

      if (storageError) {
        alert("이미지 삭제 실패: " + storageError.message);
        return;
      }

      setExistingImages((prev) => prev.filter((url) => url !== imageUrlToRemove));
      alert("이미지가 삭제되었습니다.");
    } catch (e) {
      alert("이미지 삭제 실패");
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

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("이미지 변환 실패"));
            const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpeg", {
              type: "image/jpeg",
            });
            resolve(newFile);
          },
          "image/jpeg",
          quality
        );
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

    for (let file of files) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        alert("JPEG, PNG, WebP 파일만 업로드 가능합니다.");
        continue;
      }

      try {
        const compressedFile = await resizeAndCompressImage(file);
        const fileName = `${Date.now()}-${compressedFile.name}`;

        const { error: uploadError } = await supabase.storage
          .from("img")
          .upload(fileName, compressedFile);

        if (uploadError) {
          alert("이미지 업로드 실패: " + uploadError.message);
          setLoading(false);
          return;
        }

        const imageUrl = `${useNewUrl === 1
          ? "https://chggmmhloccondzfrtpz.supabase.co"
          : "https://purrosepipqhtcxxxdmj.supabase.co"
        }/storage/v1/object/public/img/${fileName}`;
        uploadedUrls.push(imageUrl);
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
