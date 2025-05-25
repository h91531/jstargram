import userStore from '../../../store/userStore';
import { supabase } from '../.././../lib/supabaseClient';

// onOpenModal 프롭스를 받도록 추가합니다.
export default function ProfileModify({ params_id, onOpenModal }) {
  const { userStore_id } = userStore();

  // modifyBtn 함수에서 onOpenModal을 호출하도록 변경합니다.
  const modifyBtn = () => {
    if (onOpenModal) { // onOpenModal 함수가 있는지 확인하고 호출
      onOpenModal();
    }
  };

  return (
    <div>
      {userStore_id == params_id ? (
        <>
          <button type="button" onClick={modifyBtn} className="modify_btn">프로필 편집</button>
        </>
      ) : (
        // 팔로우 버튼 등의 다른 사용자에게 보여줄 UI
        <div>팔로우</div>
      )}
    </div>
  );
}