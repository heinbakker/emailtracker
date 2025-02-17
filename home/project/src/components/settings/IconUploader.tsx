import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { supabase } from '../../config/supabase';
import { translations } from '../../utils/translations';

export const IconUploader = () => {
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      for (const file of files) {
        const fileName = file.name.toLowerCase();
        let value: number;
        
        if (fileName.includes('happy')) {
          value = 5;
        } else if (fileName.includes('neutral')) {
          value = 3;
        } else if (fileName.includes('sad')) {
          value = 1;
        } else {
          console.error('Invalid file name:', fileName);
          continue;
        }

        // Upload to storage
        const { data: storageData, error: storageError } = await supabase.storage
          .from('icons')
          .upload(`smileys/${fileName}`, file, {
            upsert: true
          });

        if (storageError) throw storageError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('icons')
          .getPublicUrl(`smileys/${fileName}`);

        // Update default_icons table
        const { error: dbError } = await supabase
          .from('default_icons')
          .upsert({
            type: 'smileys',
            value,
            url: publicUrl
          });

        if (dbError) throw dbError;
      }

      // Refresh the page to see the new icons
      window.location.reload();
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload icons. Please try again.');
    }
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{translations.uploadIcons}</h2>
      <div className="relative">
        <input
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileChange}
          multiple
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Upload icons"
        />
        <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
          <Upload className="w-6 h-6 text-gray-400" />
          <span className="ml-2 text-sm text-gray-600">{translations.uploadIconsLabel}</span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {translations.uploadIconsHelp}
        </p>
      </div>
    </div>
  );
};