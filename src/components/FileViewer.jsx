import React from 'react';
import { X, Download, ExternalLink } from 'lucide-react';

const FileViewer = ({ file, onClose }) => {
  if (!file) return null;

  const getFileType = (fileName, url) => {
    const extension = fileName.split('.').pop().toLowerCase();
    
    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
      return 'image';
    }
    
    // Video files
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension)) {
      return 'video';
    }
    
    // Audio files
    if (['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(extension)) {
      return 'audio';
    }
    
    // PDF files
    if (extension === 'pdf') {
      return 'pdf';
    }
    
    // Text files
    if (['txt', 'md', 'csv'].includes(extension)) {
      return 'text';
    }
    
    // Code files
    if (['js', 'html', 'css', 'json', 'xml', 'py', 'java', 'cpp', 'c'].includes(extension)) {
      return 'code';
    }
    
    // Office documents
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
      return 'office';
    }
    
    return 'unknown';
  };

  const fileType = getFileType(file.name, file.url);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderFileContent = () => {
    switch (fileType) {
      case 'image':
        return (
          <div className="flex items-center justify-center h-full">
            <img 
              src={file.url} 
              alt={file.name}
              className="max-w-full max-h-full object-contain"
              style={{ maxHeight: '80vh' }}
            />
          </div>
        );

      case 'video':
        return (
          <div className="flex items-center justify-center h-full">
            <video 
              controls 
              className="max-w-full max-h-full"
              style={{ maxHeight: '80vh' }}
            >
              <source src={file.url} />
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case 'audio':
        const getAudioType = (fileName) => {
          const extension = fileName.split('.').pop().toLowerCase();
          const audioTypes = {
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'aac': 'audio/aac',
            'flac': 'audio/flac'
          };
          return audioTypes[extension] || 'audio/mpeg';
        };

        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="mb-8">
                <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-16 h-16 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 01-1.414-1.414A7.972 7.972 0 0017 12a7.972 7.972 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">{file.name}</h3>
              </div>
              <audio 
                controls 
                className="w-full max-w-md"
                preload="metadata"
              >
                <source src={file.url} type={getAudioType(file.name)} />
                Your browser does not support the audio tag.
              </audio>
            </div>
          </div>
        );

      case 'pdf':
        return (
          <div className="h-full">
            <iframe 
              src={file.url} 
              className="w-full h-full border-0"
              title={file.name}
            />
          </div>
        );

      case 'text':
      case 'code':
        return (
          <div className="h-full p-4 overflow-auto">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-4">
                Text preview not available. Click download to view the full content.
              </p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <Download size={16} />
                  <span>Download File</span>
                </button>
                <button
                  onClick={() => window.open(file.url, '_blank')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  <ExternalLink size={16} />
                  <span>Open in New Tab</span>
                </button>
              </div>
            </div>
          </div>
        );

      case 'office':
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{file.name}</h3>
              <p className="text-gray-600 mb-6">Office document preview not available</p>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => window.open(file.url, '_blank')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  <ExternalLink size={16} />
                  <span>Open in New Tab</span>
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-16 h-16 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">{file.name}</h3>
              <p className="text-gray-600 mb-6">Preview not available for this file type</p>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <Download size={16} />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => window.open(file.url, '_blank')}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  <ExternalLink size={16} />
                  <span>Open in New Tab</span>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {file.name}
            </h2>
            <span className="text-sm text-gray-500">
              {file.size}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              title="Download"
            >
              <Download size={20} />
            </button>
            <button
              onClick={() => window.open(file.url, '_blank')}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              title="Open in new tab"
            >
              <ExternalLink size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {renderFileContent()}
        </div>
      </div>
    </div>
  );
};

export default FileViewer;