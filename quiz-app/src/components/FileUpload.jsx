import { useState, useRef } from 'react';

export function FileUpload({ onFileUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (selectedFile) => {
    setFile(selectedFile);
    setIsUploading(true);
    
    try {
      await onFileUpload(selectedFile);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  const getFileTypeLabel = () => {
    if (!file) return '';
    
    if (file.type === 'application/pdf') {
      return 'PDF Document';
    } else if (file.type.startsWith('image/')) {
      return 'Image File';
    } else if (file.type === 'text/plain') {
      return 'Text File';
    } else {
      return 'Document';
    }
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg,.txt"
        ref={fileInputRef}
      />
      
      {!file && !isUploading && (
        <>
          <div className="mx-auto w-16 h-16 mb-4">
            <svg className="w-full h-full text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Upload a file to generate quiz</h3>
          <p className="text-gray-500 mb-4">Drag and drop your file here, or click to browse</p>
          <button 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            onClick={handleBrowseClick}
          >
            Browse Files
          </button>
          <p className="text-xs text-gray-500 mt-4">Supported formats: PDF, Images (JPG, PNG), TXT</p>
        </>
      )}
      
      {file && !isUploading && (
        <div className="py-4">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-lg font-medium">File uploaded successfully</span>
          </div>
          <p className="text-gray-600 mb-1">{file.name}</p>
          <p className="text-gray-500 text-sm">{getFileTypeLabel()} • {(file.size / 1024).toFixed(1)} KB</p>
        </div>
      )}
      
      {isUploading && (
        <div className="py-8">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full border-4 border-t-blue-600 border-b-blue-600 border-l-gray-200 border-r-gray-200 animate-spin mb-4"></div>
            <p className="text-gray-600">Processing your file...</p>
            <p className="text-gray-500 text-sm mt-1">This may take a moment</p>
          </div>
        </div>
      )}
    </div>
  );
}