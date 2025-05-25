// src/app/profile/[id]/profileImgUpdate.jsx
'use client';

import React, { useState, useEffect } from 'react';

// 기본 이미지 URL을 'normal_profile.webp'로 설정
const DEFAULT_PROFILE_IMAGE_URL = '/normal_profile.webp'; 

export default function ProfileImgUpdate({ currentProfileImageUrl, onFileSelect, onResetToDefault }) {
    const [previewUrl, setPreviewUrl] = useState(currentProfileImageUrl);
    const [selectedFile, setSelectedFile] = useState(null); 
    const [useDefaultImage, setUseDefaultImage] = useState(false); 

    useEffect(() => {
        const isCurrentlyDefault = currentProfileImageUrl === DEFAULT_PROFILE_IMAGE_URL;
        setUseDefaultImage(isCurrentlyDefault);
        setPreviewUrl(isCurrentlyDefault ? DEFAULT_PROFILE_IMAGE_URL : currentProfileImageUrl);
        setSelectedFile(null); 
    }, [currentProfileImageUrl]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file); 
            setPreviewUrl(URL.createObjectURL(file)); 
            onFileSelect(file); 
            setUseDefaultImage(false); 
        } else {
            setSelectedFile(null);
            if (!useDefaultImage) {
                setPreviewUrl(currentProfileImageUrl);
            } else {
                setPreviewUrl(DEFAULT_PROFILE_IMAGE_URL);
            }
            onFileSelect(null); 
        }
    };

    const handleDefaultImageCheckboxChange = (event) => {
        const checked = event.target.checked;
        setUseDefaultImage(checked); 
        if (checked) {
            setPreviewUrl(DEFAULT_PROFILE_IMAGE_URL); 
            setSelectedFile(null); 
            onFileSelect(null); 
            onResetToDefault(true); 
        } else {
            setPreviewUrl(currentProfileImageUrl); 
            onResetToDefault(false); 
        }
    };

    return (
        <div className="profile_image_update_section">
            <h3>프로필 이미지</h3>
            <div className="image_preview_container">
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt="Profile Preview"
                        className="profile_image_preview"
                        style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                        No Image
                    </div>
                )}
            </div>
            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={useDefaultImage} 
                className="update_input"
            />
            <label>
                <input
                    type="checkbox"
                    checked={useDefaultImage}
                    onChange={handleDefaultImageCheckboxChange}
                />
                기본 이미지 사용
            </label>
        </div>
    );
}