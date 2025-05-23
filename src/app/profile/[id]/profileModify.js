import userStore from '../../../store/userStore';

export default function ProfileModify({params_id}){
  const {userStore_id} = userStore();
  return (
    <div>
      {userStore_id == params_id ? (
         <button type="button">프로필 편집</button>
      ): <div>팔로우</div>
      }
    </div>
  )
}