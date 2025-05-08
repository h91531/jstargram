import { supabase } from "../lib/supabaseClient";

export default function DeleteImageButton() {
  const handleDeleteImage = async () => {
    const imageUrl = "https://purrosepipqhtcxxxdmj.supabase.co/storage/v1/object/public/img/1746693236037-car_img.png";
    
    // URL에서 경로만 추출 (img/1746693236037-car_img.png)
    const imagePath = imageUrl.split('supabase.co/storage/v1/object/public/')[1];

    console.log("삭제할 이미지 경로:", imagePath); // 이미지 경로 확인

    try {
      const { data, error } = await supabase.storage
        .from("img") // 'img' 버킷에서 이미지 삭제
        .remove([imagePath]); // 이미지 경로 배열로 전달

      // 데이터 확인
      if (data) {
        console.log("삭제된 데이터:", data);
      }

      if (error) {
        console.error("이미지 삭제 실패:", error.message);
        alert("이미지 삭제 실패: " + error.message);
      } else {
        console.log("이미지 삭제 성공:", data);
        alert("이미지가 삭제되었습니다.");
      }
    } catch (error) {
      console.error("삭제 과정 중 오류 발생:", error);
      alert("이미지 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <button onClick={handleDeleteImage}>이미지 삭제</button>
    </div>
  );
}
