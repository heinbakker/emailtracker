import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { storageService } from '../../services/storage';

interface ImageUploadProps {
  onUpload?: (url: string) => void;
  className?: string;
}

export const ImageUpload = ({ onUpload, className = '' }: ImageUploadProps) => {
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      const data = await storageService.uploadImage(file);
      onUpload?.(data.url);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [onUpload]);

  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Upload image"
      />
      <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
        <Upload className="w-6 h-6 text-gray-400" />
        <span className="ml-2 text-sm text-gray-600">Upload Image</span>
      </div>
    </div>
  );
};