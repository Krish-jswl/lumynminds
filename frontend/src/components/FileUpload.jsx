// Tracked by Git
import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, FileText, Loader2, AlertCircle } from 'lucide-react';

export default function FileUpload({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  // Drag and Drop Handlers
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('curriculum', file);

    try {
      const response = await axios.post('http://localhost:5000/api/ingest/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setIsUploading(false);
      onUploadSuccess(response.data); // Pass the Knowledge Graph data up to App.jsx
    } catch (err) {
      setIsUploading(false);
      setError(err.response?.data?.error || 'Failed to connect to the backend.');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div 
        className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400 bg-slate-50'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input 
          type="file" 
          accept="application/pdf"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
          {file ? (
            <div className="flex flex-col items-center">
              <FileText className="w-12 h-12 text-blue-500 mb-2" />
              <p className="text-lg font-semibold text-slate-700">{file.name}</p>
              <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <>
              <UploadCloud className="w-12 h-12 text-slate-400" />
              <p className="text-lg font-medium text-slate-700">Drag & drop your curriculum PDF here</p>
              <p className="text-sm text-slate-500">or click to browse files</p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className={`w-full mt-6 py-3 px-4 rounded-xl text-white font-medium flex items-center justify-center transition-all ${
          !file || isUploading ? 'bg-slate-300 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 shadow-md'
        }`}
      >
        {isUploading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Extracting Knowledge Graph via Groq...
          </>
        ) : (
          'Generate Knowledge Graph'
        )}
      </button>
    </div>
  );
}
