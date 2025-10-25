/**
 * Photo upload component with drag-and-drop functionality
 */
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Image, X, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/axios';

interface PhotoUploadProps {
  patientId: number;
  onUploadSuccess?: () => void;
}

export const PhotoUpload = ({ patientId, onUploadSuccess }: PhotoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploadedFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeFile = (fileToRemove: File) => {
    setUploadedFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  const uploadFiles = async () => {
    if (uploadedFiles.length === 0) return;

    setIsUploading(true);

    try {
      const uploadPromises = uploadedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        return api.post(`/patients/${patientId}/photos`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      });

      await Promise.all(uploadPromises);

      toast({
        title: "Upload successful",
        description: `${uploadedFiles.length} photo(s) uploaded successfully`,
      });

      setUploadedFiles([]);
      onUploadSuccess?.();
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload photos. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Upload Patient Photos</h3>
            <p className="text-muted-foreground mb-4">
              {isDragActive
                ? "Drop the files here..."
                : "Drag & drop photos here, or click to select files"
              }
            </p>
            <p className="text-sm text-muted-foreground">
              Supports: JPEG, PNG, WebP (max 10MB each)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File list */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Selected Files ({uploadedFiles.length})</h4>
          {uploadedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center space-x-3">
                <Image className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFile(file)}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {/* Upload button */}
          <Button
            onClick={uploadFiles}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>Uploading...</>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Upload {uploadedFiles.length} Photo(s)
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};