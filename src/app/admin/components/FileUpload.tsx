"use client";

import { useState, useCallback } from "react";

interface FileUploadProps {
  onFileChange: (fileData: string | null) => void;
  currentValue?: string;
  accept?: string;
  maxSize?: number; // MB
  label?: string;
}

export default function FileUpload({
  onFileChange,
  currentValue,
  accept = "image/*,video/*,.pdf,.doc,.docx,.txt",
  maxSize = 10,
  label = "上传文件"
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentValue || null);
  const [fileType, setFileType] = useState<string>("");

  const handleFile = useCallback(async (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`文件大小不能超过 ${maxSize}MB`);
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        setFileType(file.type);
        onFileChange(result);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("文件读取失败:", error);
      alert("文件读取失败");
      setUploading(false);
    }
  }, [maxSize, onFileChange]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files?.[0]) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.[0]) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const removeFile = useCallback(() => {
    setPreview(null);
    setFileType("");
    onFileChange(null);
  }, [onFileChange]);

  const renderPreview = () => {
    if (!preview) return null;

    if (fileType.startsWith("image/")) {
      return (
        <img
          src={preview}
          alt="预览"
          className="max-w-full h-32 object-cover rounded-lg"
        />
      );
    } else if (fileType.startsWith("video/")) {
      return (
        <video
          src={preview}
          controls
          className="max-w-full h-32 rounded-lg"
        />
      );
    } else {
      return (
        <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="text-2xl mb-2">📄</div>
            <div className="text-sm text-gray-600">
              {fileType.split("/")[1]?.toUpperCase() || "文件"}
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      {preview ? (
        <div className="space-y-2">
          <div className="relative">
            {renderPreview()}
            <button
              type="button"
              onClick={removeFile}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>
          <div className="text-xs text-gray-500">
            点击右上角 × 可删除文件
          </div>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          
          {uploading ? (
            <div className="space-y-2">
              <div className="text-2xl">⏳</div>
              <div className="text-sm text-gray-600">正在处理文件...</div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-2xl">📁</div>
              <div className="text-sm text-gray-600">
                <span className="font-medium text-blue-600">点击选择文件</span>
                <span className="mx-1">或</span>
                <span>拖放文件到这里</span>
              </div>
              <div className="text-xs text-gray-500">
                支持图片、视频、PDF、Word、文本文件等
                <br />
                最大文件大小: {maxSize}MB
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 