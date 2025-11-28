import React, { useCallback, useState } from 'react';

interface ImageUploadProps {
  onImageSelected: (file: File, url: string) => void;
  disabled?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelected, disabled }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageSelected(file, url);
    }
  }, [onImageSelected]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        onImageSelected(file, url);
    }
  }, [onImageSelected]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      <div
        onDrop={disabled ? undefined : handleDrop}
        onDragOver={disabled ? undefined : handleDragOver}
        onDragLeave={disabled ? undefined : handleDragLeave}
        className={`
          relative group cursor-pointer
          border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out
          ${isDragging ? 'border-fashion-black bg-fashion-beige' : 'border-gray-300 bg-white'}
          ${previewUrl ? 'h-96' : 'h-64'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-fashion-black hover:bg-gray-50'}
          flex flex-col items-center justify-center overflow-hidden shadow-sm
        `}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        {previewUrl ? (
          <img 
            src={previewUrl} 
            alt="Upload preview" 
            className="absolute inset-0 w-full h-full object-cover" 
          />
        ) : (
          <div className="text-center p-6">
            <div className="mx-auto w-16 h-16 mb-4 bg-fashion-beige rounded-full flex items-center justify-center text-2xl">
              📸
            </div>
            <p className="font-serif text-xl text-fashion-black mb-2">Upload your look</p>
            <p className="text-sm text-gray-500">Click or drag & drop a photo here</p>
          </div>
        )}

        {previewUrl && !disabled && (
           <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-medium shadow-lg">
             Click to change
           </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;