// src/app/profile/[id]/ProfileModal.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import NicknameInput from './NicknameInput';
import BioTextarea from './BioTextarea';
import userStore from '../../../store/userStore';
import ProfileImgUpdate from './profileImgUpdate'; 
import ProfileInfo from './profileinfo';
import Cookies from 'js-cookie'; 

// 기본 이미지 URL을 'normal_profile.webp'로 설정
const DEFAULT_PROFILE_IMAGE_URL = '/normal_profile.webp'; 

export default function ProfileModal({ isOpen, onClose, userId, currentProfileData, onProfileUpdate }) {
    if (!isOpen) {
        return null;
    }
    console.log(currentProfileData.user_phone);
    console.log(currentProfileData?.user_nickname);

    const [editedBio, setEditedBio] = useState(currentProfileData?.user_bio || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [editNickname, setEditNickname] = useState(currentProfileData?.user_nickname || '');
    const [isNicknameAvailable, setIsNicknameAvailable] = useState(true); 

    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [newProfileImageUrl, setNewProfileImageUrl] = useState(currentProfileData?.user_profile_image || null);
    const [resetToDefaultImage, setResetToDefaultImage] = useState(false); 

    const { nickname: userStoreNickname, setNickname: setuserStoreNickname } = userStore();

    useEffect(() => {
        setEditedBio(currentProfileData?.user_bio || '');
        setEditNickname(currentProfileData?.user_nickname || '');
        const isCurrentlyDefault = currentProfileData?.user_profile_image === DEFAULT_PROFILE_IMAGE_URL;
        setNewProfileImageUrl(isCurrentlyDefault ? DEFAULT_PROFILE_IMAGE_URL : currentProfileData?.user_profile_image);
        setResetToDefaultImage(isCurrentlyDefault); 
        setSelectedImageFile(null); 
        setIsNicknameAvailable(true); 
        setError(null); 
    }, [currentProfileData, isOpen]);

    const handleNicknameChange = (newNickname) => {
        setEditNickname(newNickname);
        if (newNickname !== currentProfileData?.user_nickname) {
            setIsNicknameAvailable(false); 
        } else {
            setIsNicknameAvailable(true); 
        }
    };

    const handleNicknameAvailabilityChange = (available) => {
        setIsNicknameAvailable(available);
    };

    const handleBioChange = (newBio) => {
        setEditedBio(newBio);
    };

    const handleFileSelect = (file) => {
        setSelectedImageFile(file);
        setResetToDefaultImage(false); 
    };

    const handleResetToDefault = (shouldReset = true) => {
        setResetToDefaultImage(shouldReset);
        if (shouldReset) {
            setNewProfileImageUrl(DEFAULT_PROFILE_IMAGE_URL);
            setSelectedImageFile(null);
        } else {
            setNewProfileImageUrl(currentProfileData?.user_profile_image); 
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        setError(null);

        if (editNickname !== currentProfileData?.user_nickname && !isNicknameAvailable) {
            alert('닉네임 중복 확인을 해주세요.');
            setLoading(false);
            return;
        }

        let imageUrlToSave = newProfileImageUrl; 

        if (selectedImageFile) {
            const formData = new FormData();
            formData.append('file', selectedImageFile);
            formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

            try {
                const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error.message || 'Cloudinary 이미지 업로드에 실패했습니다.');
                }

                const data = await response.json();
                imageUrlToSave = data.secure_url; 
                setNewProfileImageUrl(imageUrlToSave); 

            } catch (imageUploadError) {
                console.error('이미지 업로드 중 오류:', imageUploadError.message);
                setError('이미지 업로드에 실패했습니다: ' + imageUploadError.message);
                setLoading(false);
                return;
            }
        } 
        else if (resetToDefaultImage) {
            imageUrlToSave = DEFAULT_PROFILE_IMAGE_URL;
        }

        const isOldImageCloudinary = currentProfileData?.user_profile_image && 
                                     currentProfileData.user_profile_image !== DEFAULT_PROFILE_IMAGE_URL &&
                                     currentProfileData.user_profile_image.includes('res.cloudinary.com');

        const isImageChanged = imageUrlToSave !== currentProfileData?.user_profile_image;

        if (isOldImageCloudinary && isImageChanged) {
            try {
                const publicIdMatch = currentProfileData.user_profile_image.match(/\/v\d+\/(.+?)\.\w{3,4}$/);
                let publicId = '';
                if (publicIdMatch && publicIdMatch[1]) {
                    publicId = publicIdMatch[1];
                } else {
                    const parts = currentProfileData.user_profile_image.split('/');
                    const uploadIndex = parts.indexOf('upload');
                    if (uploadIndex > -1 && parts[uploadIndex + 1]) {
                        publicId = parts.slice(uploadIndex + 1).join('/').split('.')[0];
                    }
                }

                if (!publicId) {
                    console.warn('이전 이미지 삭제: Cloudinary public ID를 추출할 수 없습니다. URL:', currentProfileData.user_profile_image);
                } else {
                    console.log("이전 Cloudinary 이미지 삭제 시도. publicId:", publicId);
                    const deleteResponse = await fetch('/api/deleteImage', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ publicId: publicId }), 
                    });

                    if (!deleteResponse.ok) {
                        const errorData = await deleteResponse.json();
                        console.error('Cloudinary 이미지 삭제 실패:', errorData.error || '알 수 없는 오류');
                    } else {
                        console.log('이전 Cloudinary 이미지 삭제 성공');
                    }
                }
            } catch (deleteError) {
                console.error('이전 Cloudinary 이미지 삭제 중 네트워크 오류:', deleteError);
            }
        }


        try {
            const updates = {
                user_bio: editedBio,
                user_profile_image: imageUrlToSave, 
            };

            if (editNickname !== currentProfileData?.user_nickname && isNicknameAvailable) {
                updates.user_nickname = editNickname;
            }

            const { data, error: updateError } = await supabase
                .from('users')
                .update(updates)
                .eq('user_id', userId);

            if (updateError) {
                console.error('프로필 데이터베이스 업데이트 오류:', updateError.message);
                setError('프로필 업데이트에 실패했습니다.');
            } else {

                const hasNicknameChanged = updates.user_nickname !== undefined;
                const hasImageChanged = imageUrlToSave !== currentProfileData?.user_profile_image;

                if (hasNicknameChanged || hasImageChanged) {
                    try {
                        const response = await fetch('/api/update-token', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                userId: userId,
                                newNickname: hasNicknameChanged ? updates.user_nickname : currentProfileData?.user_nickname, 
                                newProfileImageUrl: imageUrlToSave 
                            }),
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.message || '토큰 갱신에 실패했습니다.');
                        }

                        const result = await response.json();
                        console.log("JWT 토큰 갱신 성공:", result);

                        if (hasNicknameChanged) {
                            setuserStoreNickname(updates.user_nickname);
                        }
                        
                        window.location.reload(); 

                    } catch (tokenRefreshError) {
                        console.error('ProfileModal: JWT 토큰 갱신 오류:', tokenRefreshError.message);
                        setError('토큰 갱신 중 오류가 발생했습니다.');
                        setLoading(false);
                        return;
                    }
                }

                if (onProfileUpdate) {
                    await onProfileUpdate();
                }

                onClose(); 
            }
        } catch (err) {
            console.error('ProfileModal: 프로필 저장 중 예상치 못한 오류:', err.message);
            setError('프로필 저장 중 알 수 없는 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="profile_modal_overlay">
            <div className="profile_modal_wrap inner">
                <h2>프로필 수정</h2>
                <NicknameInput
                    userId={userId}
                    currentNickname={currentProfileData?.user_nickname}
                    onNicknameChange={handleNicknameChange}
                    onNicknameAvailabilityChange={handleNicknameAvailabilityChange}
                />
                <ProfileInfo currentProfileData={currentProfileData}/>

                <ProfileImgUpdate
                    currentProfileImageUrl={currentProfileData?.user_profile_image} 
                    onFileSelect={handleFileSelect} 
                    onResetToDefault={handleResetToDefault} 
                />

                <BioTextarea
                    currentBio={currentProfileData?.user_bio}
                    onBioChange={handleBioChange}
                />

                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={loading || (editNickname !== currentProfileData?.user_nickname && !isNicknameAvailable)}
                >
                    {loading ? '수정 중...' : '수정하기'}
                </button>
                <button type="button" onClick={onClose} disabled={loading}>닫기</button>
            </div>
        </div>
    );
}