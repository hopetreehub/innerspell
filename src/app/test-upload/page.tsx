'use client';

import React, { useState } from 'react';
import { ImageUpload } from '@/components/ui/ImageUpload';

export default function TestUploadPage() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Image Upload Test</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Firebase Storage Image Upload</h2>
          <ImageUpload
            currentImageUrl={uploadedImageUrl}
            onImageUploaded={(url) => {
              setUploadedImageUrl(url);
              console.log('✅ Image uploaded:', url);
            }}
            onImageRemoved={() => {
              setUploadedImageUrl('');
              console.log('🗑️ Image removed');
            }}
            folder="test-images"
            placeholder="테스트 이미지를 업로드하세요"
          />
        </div>

        {uploadedImageUrl && (
          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
              ✅ Upload Successful!
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 break-all">
              URL: {uploadedImageUrl}
            </p>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
            📋 Test Instructions
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• Select an image file (JPG, PNG, WebP, GIF)</li>
            <li>• Watch for upload progress</li>
            <li>• Verify preview appears</li>
            <li>• Check console for Firebase/Mock storage logs</li>
            <li>• Test image removal functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
}