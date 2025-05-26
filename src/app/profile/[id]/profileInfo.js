export default function ProfileInfo({currentProfileData}){
  return(
    <div className="info_wrap">
      <input type="text" placeholder="이름"></input>
      <input type="date"></input>
      <input type="text" placeholder="전화번호"></input>
      <div>{currentProfileData.user_phone}</div>
    </div>
  )
}