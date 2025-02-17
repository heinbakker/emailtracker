import { storageService } from '../services/storage';

export async function initializeIcons(files: FileList) {
  const iconMap = {
    'happy': 5,
    'neutral': 3,
    'sad': 1
  } as const;

  const iconFiles = Array.from(files).map(file => {
    const baseName = file.name.toLowerCase().replace(/\.[^/.]+$/, "");
    const value = iconMap[baseName as keyof typeof iconMap];
    
    if (!value) {
      throw new Error(`Invalid file name: ${file.name}. Expected: happy.png, neutral.png, or sad.png`);
    }

    return {
      name: baseName,
      value,
      file
    };
  });

  try {
    await storageService.initializeDefaultIcons(iconFiles);
    console.log('Icons initialized successfully');
  } catch (error) {
    console.error('Failed to initialize icons:', error);
    throw error;
  }
}