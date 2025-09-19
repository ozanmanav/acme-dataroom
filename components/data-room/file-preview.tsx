'use client';

import { useState } from 'react';
import { X, Download, FileText } from 'lucide-react';
import { FileItem } from '@/types';
import { Button } from '@/components/ui/button';
import { downloadFile, formatFileSize, formatDate } from '@/lib/utils-data-room';

interface FilePreviewProps {
  file: FileItem;
  onClose: () => void;
}

export function FilePreview({ file, onClose }: FilePreviewProps) {
  const [loading, setLoading] = useState(true);

  const handleDownload = () => {
    downloadFile(file.content, file.name);
  };

  const pdfUrl = `data:application/pdf;base64,${file.content}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <FileText size={20} className="text-red-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-gray-900 truncate" title={file.name}>
                {file.name}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{formatFileSize(file.size)}</span>
                <span>•</span>
                <span>Modified {formatDate(file.updatedAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={handleDownload} variant="outline" size="sm">
              <Download size={16} className="mr-2" />
              Download
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 relative bg-gray-100">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            </div>
          )}
          
          <iframe
            src={pdfUrl}
            className="w-full h-full border-none"
            onLoad={() => setLoading(false)}
            title={file.name}
          />
        </div>
      </div>
    </div>
  );
}