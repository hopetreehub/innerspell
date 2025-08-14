import { useCallback } from 'react';

export function useCSRFFetch() {
  const getCsrfToken = useCallback(() => {
    // Get CSRF token from cookie
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrf-token') {
        return value;
      }
    }
    return null;
  }, []);

  const csrfFetch = useCallback(async (url: string, options: RequestInit = {}) => {
    const csrfToken = getCsrfToken();
    
    const headers = new Headers(options.headers);
    if (csrfToken) {
      headers.set('x-csrf-token', csrfToken);
    }
    
    return fetch(url, {
      ...options,
      headers
    });
  }, [getCsrfToken]);

  const uploadFile = useCallback(async (file: File, uploadUrl: string = '/api/blog/upload-firebase') => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await csrfFetch(uploadUrl, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }
    
    return response.json();
  }, [csrfFetch]);

  return {
    csrfFetch,
    uploadFile,
    getCsrfToken
  };
}