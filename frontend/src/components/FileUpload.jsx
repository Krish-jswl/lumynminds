// Tracked by Git
import { useState } from 'react';
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
    <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-soft border border-outline-variant/40">
      <div 
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
          isDragging ? 'border-brand-orange bg-surface-container' : 'border-outline-variant hover:border-brand-orange/60 bg-surface-container-low/50'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <input 
          type="file" 
            accept="application/pdf, text/plain"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
          {file ? (
            <div className="flex flex-col items-center">
              <FileText className="w-12 h-12 text-brand-orange mb-2" />
              <p className="text-lg font-semibold text-on-surface">{file.name}</p>
              <p className="text-sm text-on-surface-variant">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          ) : (
            <>
              <UploadCloud className="w-12 h-12 text-primary/60" />
              <p className="text-lg font-medium text-on-surface">Drag & drop your curriculum PDF here</p>
              <p className="text-sm text-on-surface-variant">or click to browse files</p>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-error/10 text-error rounded-xl flex items-center gap-2 border border-error/20">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className={`w-full mt-6 py-4 px-6 rounded-full text-white font-semibold flex items-center justify-center transition-all ${
          !file || isUploading ? 'bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed' : 'bg-brand-orange hover:bg-brand-orange-hover shadow-card hover:-translate-y-0.5'
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
