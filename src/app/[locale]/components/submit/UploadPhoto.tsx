'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { useDropzone } from 'react-dropzone';

interface FileWithPreview extends File {
  preview: string;
}

const UploadPhoto = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [rejectedNames, setRejectedNames] = useState<string[]>([]);

  useEffect(() => {
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);



  const processFiles = useCallback((newFiles: File[]) => {

    const maxSize = 5 * 1024 * 1024;

    const acceptedBatch: FileWithPreview[] = [];
    const rejectedBatch: string[] = [];

    newFiles.forEach((file) => {
      if (file.size <= maxSize) {
        Object.assign(file, {
          preview: URL.createObjectURL(file)
        });
        acceptedBatch.push(file as FileWithPreview);
      } else {
        rejectedBatch.push(file.name);
      }
    });

    if (acceptedBatch.length > 0) {
      setFiles((prev) => [...prev, ...acceptedBatch]);
    }

    setRejectedNames(rejectedBatch);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: processFiles, // Pass our refactored function here
    accept: { 'image/*': [] }, // Restrict to images
    multiple: true
  });

  const handleRemovePhoto = useCallback((index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  }, []);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold border-b border-border pb-2">3. Photos</h2>
      
      <div 
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center hover:bg-muted/50 transition-colors cursor-pointer ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
      >
      <input
        {...getInputProps()}
        className={`${isDragActive ? 'text-primary' : 'text-muted-foreground'}`}
      />

        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-medium text-foreground mb-1">Click to upload or drag and drop</p>
        <p className="text-xs text-muted-foreground">Images only (max. 5MB per file)</p>
      </div>

      {/* Preview Gallery */}
      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {files.map((file, index) => (
            <div key={index} className="relative group border rounded-lg p-2 bg-muted/50 flex gap-2 items-center min-h-[60px]">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border">
                <Image 
                  src={file.preview} 
                  fill 
                  alt={file.name} 
                  className="object-cover" 
                />
              </div>
              <div className="flex-grow min-w-0">
                <p className="text-xs font-medium truncate">{file.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <Button 
                type="button"
                variant="destructive"
                size="icon"           
                onClick={(e) => {e.stopPropagation(); handleRemovePhoto(index)}} 
                
                className="cursor-pointer absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove photo</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {rejectedNames.length > 0 && (
        <p className="text-xs text-red-500 font-medium animate-in fade-in slide-in-from-top-1">
          Skipped (over 5MB): {rejectedNames.join(", ")}
        </p>
      )}
    </section>
  )
}

export default UploadPhoto