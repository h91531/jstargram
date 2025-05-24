import userStore from '../../../store/userStore';
import { supabase } from '../.././../lib/supabaseClient';

// onOpenModal 프롭스를 받도록 추가합니다.
export default function ProfileModify({ params_id, onOpenModal }) {
  const { userStore_id } = userStore();

  // modifyBtn 함수에서 onOpenModal을 호출하도록 변경합니다.
  const modifyBtn = () => {
    console.log("프로필 편집 버튼 클릭!"); // 확인용 로그
    if (onOpenModal) { // onOpenModal 함수가 있는지 확인하고 호출
      onOpenModal();
    }
  };

  return (
    <div>
      {/* 현재 로그인한 사용자와 프로필 페이지의 user_id가 같을 때만 '프로필 편집' 관련 UI 표시 */}
      {userStore_id == params_id ? (
        <>
          {/* 이미지 변경 input은 그대로 두셔도 됩니다. */}
          <label htmlFor="image-upload">이미지 변경</label>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
          />
          {/* '프로필 편집' 버튼 클릭 시 modifyBtn 함수가 실행됩니다. */}
          <button type="button" onClick={modifyBtn} className="modify_btn">프로필 편집</button>
        </>
      ) : (
        // 팔로우 버튼 등의 다른 사용자에게 보여줄 UI
        <div>팔로우</div>
      )}
    </div>
  );
}