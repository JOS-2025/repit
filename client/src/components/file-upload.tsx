import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
}

export default function FileUpload({
  files,
  onFilesChange,
  accept = "image/*",
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024 // 5MB
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    // Filter valid files
    const validFiles = selectedFiles.filter(file => {
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
        return false;
      }
      return true;
    });

    // Combine with existing files, respecting maxFiles limit
    const newFiles = [...files, ...validFiles].slice(0, maxFiles);
    onFilesChange(newFiles);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFiles = Array.from(event.dataTransfer.files);
    
    // Filter valid files
    const validFiles = droppedFiles.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image`);
        return false;
      }
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
        return false;
      }
      return true;
    });

    // Combine with existing files, respecting maxFiles limit
    const newFiles = [...files, ...validFiles].slice(0, maxFiles);
    onFilesChange(newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="space-y-4" data-testid="file-upload-container">
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-farm-green transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        data-testid="drop-zone"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={maxFiles > 1}
          onChange={handleFileSelect}
          className="hidden"
          data-testid="file-input"
        />
        
        <i className="fas fa-cloud-upload-alt text-3xl text-gray-400 mb-4"></i>
        <p className="text-gray-600 mb-2">
          Drag and drop images here, or click to select
        </p>
        <p className="text-sm text-gray-500">
          PNG, JPG up to {maxSize / (1024 * 1024)}MB each (max {maxFiles} files)
        </p>
        <Button type="button" className="mt-4 bg-farm-green hover:bg-farm-green-dark" data-testid="button-select-files">
          Select Images
        </Button>
      </div>

      {/* File Preview */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {files.map((file, index) => (
            <Card key={index} className="relative" data-testid={`file-preview-${index}`}>
              <CardContent className="p-2">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  data-testid={`button-remove-file-${index}`}
                >
                  <X className="w-3 h-3" />
                </button>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {file.name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
