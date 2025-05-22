'use client'

import { useState, useEffect } from 'react';
import '../css/signup.css';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [birth, setBirth] = useState('');
    const [phone, setPhone] = useState('');
    const [nickname, setNickname] = useState('');
    const [profileImage, setProfileImage] = useState(null); // 실제 파일 객체
    // 프로필 이미지 미리보기를 위한 상태, 기본 이미지 URL로 초기화
    const [profileImagePreview, setProfileImagePreview] = useState('https://res.cloudinary.com/dzlsssxtp/image/upload/v1747885661/user_profile_images/54354354353_profile_1747885660689.webp');

    const [isIdChecked, setIsIdChecked] = useState(false);
    const [isNicknameChecked, setIsNicknameChecked] = useState(false);
    const router = useRouter();

    // profileImagePreview가 변경될 때마다 이전 Blob URL을 해제하여 메모리 누수 방지
    useEffect(() => {
        return () => {
            if (profileImagePreview && profileImagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(profileImagePreview);
            }
        };
    }, [profileImagePreview]);

    // 이미지 파일이 선택될 때 호출되는 함수
    const handleProfileImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImage(file);
            setProfileImagePreview(URL.createObjectURL(file)); // 미리보기 URL 생성
        } else {
            setProfileImage(null); // 파일 선택 취소 시 null로 설정
            // 파일 선택 취소 시 기본 이미지로 다시 설정
            setProfileImagePreview('https://res.cloudinary.com/dzlsssxtp/image/upload/v1747885661/user_profile_images/54354354353_profile_1747885660689.webp');
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!isIdChecked) {
            alert('아이디 중복 확인을 해주세요.');
            return;
        }

        if (!isNicknameChecked) {
            alert('닉네임 중복 확인을 해주세요.');
            return;
        }

        // FormData 객체를 사용하여 텍스트 데이터와 파일 함께 전송
        const formData = new FormData();
        formData.append('user_id', id);
        formData.append('user_password', password);
        formData.append('user_name', name);
        formData.append('user_birth', birth);
        formData.append('user_phone', phone);
        formData.append('user_nickname', nickname);
        if (profileImage) {
            formData.append('profile_image', profileImage); // 프로필 이미지 파일 추가
        }

        try {
            const res = await fetch('/api/signup', {
                method: 'POST',
                // FormData를 사용할 때는 Content-Type 헤더를 명시적으로 설정하지 않습니다.
                // 브라우저가 자동으로 'multipart/form-data'로 설정합니다.
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message);
                setId('');
                setPassword('');
                setName('');
                setBirth('');
                setPhone('');
                setNickname('');
                setProfileImage(null); // 이미지 상태 초기화
                // 이미지 미리보기 상태도 기본 이미지로 초기화
                setProfileImagePreview('https://res.cloudinary.com/dzlsssxtp/image/upload/v1747885661/user_profile_images/54354354353_profile_1747885660689.webp');
                setIsIdChecked(false);
                setIsNicknameChecked(false);
                router.push('/login');

            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('회원가입 중 오류 발생:', error);
            alert('회원가입 중 오류가 발생했습니다.');
        }
    };

    const checkAvailability = async (type) => {
        const value = type === 'id' ? id : nickname;

        // 아이디나 닉네임이 5글자 이상인지 체크
        if (value.length <= 5) {
            alert(`${type === 'id' ? '아이디를 5자 이상' : '닉네임을 5자 이상'} 입력해주세요.`);
            return;
        }

        try {
            const res = await fetch('/api/check-sign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value, type }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.message.includes('이미 사용 중')) {
                    alert(data.message);
                    if (type === 'id') setIsIdChecked(false);
                    if (type === 'nickname') setIsNicknameChecked(false);
                } else {
                    alert(`사용 가능한 ${type === 'id' ? '아이디' : '닉네임'}입니다.`);
                    if (type === 'id') setIsIdChecked(true);
                    if (type === 'nickname') setIsNicknameChecked(true);
                }
            } else {
                alert(data.message || '중복 확인 중 오류가 발생했습니다.');
                if (type === 'id') setIsIdChecked(false);
                if (type === 'nickname') setIsNicknameChecked(false);
            }
        } catch (error) {
            console.error('중복 확인 중 오류 발생:', error);
            alert('중복 확인 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="sign_up">
            <div className="signup-container inner">
                <h1>회원가입</h1>
                <form onSubmit={handleSignup}>
                    <div className="id_check">
                        <input
                            className="signup-input id_check_input"
                            type="text"
                            placeholder="아이디 (5자 이상)"
                            value={id}
                            onChange={(e) => {
                                setId(e.target.value);
                                setIsIdChecked(false); // 아이디 변경 시 중복 확인 초기화
                            }}
                            required
                        />
                        <button type="button" id="id_check_btn" className="login_btn" onClick={() => checkAvailability('id')}>
                            중복확인
                        </button>
                    </div>

                    <div className="id_check">
                        <input
                            className="signup-input id_check_input"
                            type="text"
                            placeholder="닉네임 (5자 이상)"
                            value={nickname}
                            onChange={(e) => {
                                setNickname(e.target.value);
                                setIsNicknameChecked(false); // 닉네임 변경 시 중복 확인 초기화
                            }}
                            required
                        />
                        <button type="button" id="nickname_check_btn" className="login_btn" onClick={() => checkAvailability('nickname')}>
                            중복확인
                        </button>
                    </div>

                    <input
                        className="signup-input"
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <input
                        className="signup-input"
                        type="text"
                        placeholder="이름"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        className="signup-input"
                        type="date"
                        placeholder="생년월일"
                        value={birth}
                        onChange={(e) => setBirth(e.target.value)}
                        required
                    />
                    <input
                        className="signup-input"
                        type="text"
                        placeholder="전화번호"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />

                    {/* 프로필 이미지 업로드 입력 필드 및 미리보기 */}
                    <div className="profile-image-upload">
                        <label htmlFor="profile-image-input" className="signup-label">
                            프로필 이미지:
                        </label>
                        <input
                            id="profile-image-input"
                            className="signup-input"
                            type="file"
                            accept="image/*" // 이미지 파일만 선택 가능하도록 설정
                            onChange={handleProfileImageChange}
                        />
                        {/* 이미지 미리보기 */}
                        <div className="profile-image-preview">
                            <img
                                src={profileImagePreview}
                                alt="프로필 이미지 미리보기"
                                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                        </div>
                        {profileImage && (
                            <p className="selected-image-info">선택된 파일: {profileImage.name}</p>
                        )}
                    </div>

                    <button className="signup-button" type="submit">
                        가입하기
                    </button>
                </form>
            </div>
        </div>
    );
}