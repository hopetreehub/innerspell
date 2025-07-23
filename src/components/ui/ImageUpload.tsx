'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { uploadImageFile, validateImageFile, createImagePreview, revokeImagePreview, resizeImage, UploadProgress } from '@/lib/upload';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  onImageRemoved?: () => void;
  currentImageUrl?: string;
  disabled?: boolean;
  acceptedTypes?: string[];
  maxSize?: number;
  folder?: string;
  placeholder?: string;
  className?: string;
}

export function ImageUpload({
  onImageUploaded,
  onImageRemoved,
  currentImageUrl,
  disabled = false,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxSize = 5 * 1024 * 1024, // 5MB
  folder = 'blog-images',
  placeholder = '이미지를 업로드하세요',
  className = ''
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error || '파일이 유효하지 않습니다.');
      return;
    }

    try {
      setIsUploading(true);
      
      // Create preview
      const preview = createImagePreview(file);
      setPreviewUrl(preview);

      // Resize image if it's large
      let fileToUpload = file;
      if (file.size > 1024 * 1024) { // If larger than 1MB, resize
        try {
          fileToUpload = await resizeImage(file, 1200, 800, 0.8);
          console.log('📐 Image resized from', file.size, 'to', fileToUpload.size, 'bytes');
        } catch (resizeError) {
          console.warn('⚠️ Image resize failed, using original:', resizeError);
          fileToUpload = file;
        }
      }

      // Upload file with progress
      const uploadUrl = await uploadImageFile(fileToUpload, folder);
      
      // Clean up preview
      revokeImagePreview(preview);
      setPreviewUrl(null);
      
      // Notify parent component
      onImageUploaded(uploadUrl);
      
      console.log('✅ Image uploaded successfully:', uploadUrl);
    } catch (uploadError) {
      console.error('❌ Image upload failed:', uploadError);
      setError(uploadError instanceof Error ? uploadError.message : '이미지 업로드에 실패했습니다.');
      
      // Clean up preview on error
      if (previewUrl) {
        revokeImagePreview(previewUrl);
        setPreviewUrl(null);
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      revokeImagePreview(previewUrl);
      setPreviewUrl(null);
    }
    
    onImageRemoved?.();
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const displayImageUrl = previewUrl || currentImageUrl;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {/* Upload area */}
      {!displayImageUrl && (
        <div
          onClick={handleUploadClick}
          className={`
            border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8
            flex flex-col items-center justify-center space-y-4 cursor-pointer
            hover:border-gray-400 dark:hover:border-gray-500 transition-colors
            ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="text-center">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {isUploading ? '업로드 중...' : placeholder}
            </p>
            {!isUploading && (
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                JPG, PNG, WebP, GIF (최대 5MB)
              </p>
            )}
          </div>

          {/* Upload progress */}
          {isUploading && uploadProgress && (
            <div className="w-full max-w-xs">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">
                {uploadProgress.percentage}%
              </p>
            </div>
          )}
        </div>
      )}

      {/* Image preview/display */}
      {displayImageUrl && (
        <div className="relative">
          <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <img
              src={displayImageUrl}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
            
            {/* Loading overlay */}
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                  <p className="text-sm">업로드 중...</p>
                  {uploadProgress && (
                    <p className="text-xs">{uploadProgress.percentage}%</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Remove button */}
          {!isUploading && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemoveImage}
              disabled={disabled}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Upload/Replace button */}
      {displayImageUrl && !isUploading && (
        <Button
          type="button"
          variant="outline"
          onClick={handleUploadClick}
          disabled={disabled}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          이미지 교체
        </Button>
      )}

      {/* Error message */}
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}