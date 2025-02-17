import React, { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';
import { storageService } from '../../services/storage';
import { supabase } from '../../config/supabase';
import { translations } from '../../utils/translations';

const VALID_ICON_NAMES = ['excellent.png', 'negative.png', 'neutral-face.png', 'positive.png'];

export const IconUploader = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError(null);

    try {
      for (const file of files) {
        const fileName = file.name.toLowerCase();
        
        if (!VALID_ICON_NAMES.includes(fileName)) {
          throw new Error(`Invalid file name: ${fileName}. Expected: ${VALID_ICON_NAMES.join(', ')}`);
        }

        // Get icon value based on filename
        const value = storageService.getCustomIconValue(fileName);
        if (value === null) {
          throw new Error(`Could not determine value for icon: ${fileName}`);
        }

        // Upload file and get URL
        const { url } = await storageService.uploadIcon(file, 'custom');

        // Update default_icons table
        const { error: dbError } = await supabase
          .from('default_icons')
          .upsert({
            type: 'custom', // Always use 'custom' type
            value,
            url
          });

        if (dbError) throw dbError;
      }

      window.location.reload();
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload icons');
    } finally {
      setIsUploading(false);
    }
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{translations.uploadIcons}</h2>
      <div className="relative">
        <input
          type="file"
          accept="image/png"
          onChange={handleFileChange}
          multiple
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          aria-label="Upload icons"
        />
        <div className={`flex items-center justify-center p-4 border-2 border-dashed rounded-lg transition-colors ${
          isUploading ? 'border-gray-400 bg-gray-50' : 'border-gray-300 hover:border-gray-400'
        }`}>
          <Upload className={`w-6 h-6 ${isUploading ? 'text-gray-600 animate-pulse' : 'text-gray-400'}`} />
          <span className="ml-2 text-sm text-gray-600">
            {isUploading ? translations.uploading : translations.uploadIconsLabel}
          </span>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
        <p className="mt-2 text-sm text-gray-500">
          Upload PNG files for rating icons. Required files: excellent.png, negative.png, neutral-face.png, positive.png
        </p>
      </div>
    </div>
  );
};