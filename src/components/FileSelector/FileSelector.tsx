import React, { useState, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { getCurrentWebview } from '@tauri-apps/api/webview';
import './FileSelector.css';

interface FileSelectorProps {
  onFilesSelected: (files: Partial<FileWithPath>[]) => void;
}

interface FileWithPath {
  name: string;
  path: string;
  size?: number;
}

interface DragDropPayload {
  type: 'hover' | 'drop' | 'cancel';
  paths: string[];
  position?: { x: number; y: number };
}

const FileSelector: React.FC<FileSelectorProps> = ({ onFilesSelected }) => {
  const [selectedFiles, setSelectedFiles] = useState<Partial<FileWithPath>[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    console.log('Browser handleDrop triggered');
    e.preventDefault();
    setIsDragging(false);
  }, [onFilesSelected]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Browser handleFileSelect triggered');
    const files = Array.from(e.target.files || []);
    console.log('Browser selected files:', files);
    const filesData = files.map(file => ({ name: file.name, path: file.name, size: file.size }));
    setSelectedFiles(filesData);
    onFilesSelected(filesData);
  }, [onFilesSelected]);

  useEffect(() => {
    console.log('[EFFECT HOOK] Setting up Tauri onDragDropEvent listener...');
    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      try {
        const currentWebview = getCurrentWebview();
        console.log('[EFFECT HOOK] Got current webview, attaching listener...');

        unlisten = await currentWebview.onDragDropEvent((event) => {
          console.log(`***** Tauri onDragDropEvent received! Type: ${event.payload.type}`, event.payload);

          switch (event.payload.type) {
            case 'over':
              console.log('Hovering detected (over)');
              setIsDragging(true);
              break;
            case 'drop':
              console.log('Drop detected');
              setIsDragging(false);
              const paths = event.payload.paths;
              if (!paths || paths.length === 0) {
                console.log('No paths received in drop payload.');
                return;
              }
              const filesData = paths.map(path => ({
                name: path.substring(path.lastIndexOf('\\') + 1).substring(path.lastIndexOf('/') + 1),
                path: path,
              }));
              console.log('Processed files data:', filesData);
              setSelectedFiles(filesData);
              onFilesSelected(filesData);
              break;
            case 'leave':
              console.log('Drag cancelled (leave)');
              setIsDragging(false);
              break;
            default:
              console.warn('Unhandled drag drop event type:', event.payload.type);
              setIsDragging(false);
              break;
          }
        });

        console.log('[EFFECT HOOK] Tauri onDragDropEvent listener attached successfully.');

        return () => {
          console.log('[EFFECT HOOK CLEANUP] Cleaning up Tauri onDragDropEvent listener...');
          unlisten && unlisten();
        };

      } catch (error) {
        console.error('[EFFECT HOOK ERROR] Failed to set up Tauri onDragDropEvent listener:', error);
      }
    };

    const setupPromise = setupListener();

    return () => {
      setupPromise.then(cleanupFn => {
        if (cleanupFn) {
          cleanupFn();
        }
      }).catch(err => {
        console.error('[EFFECT HOOK CLEANUP ERROR] Error resolving setup promise for cleanup:', err);
      });
    };

  }, [onFilesSelected]);

  const formatFileSize = (bytes?: number): string => {
    if (bytes === undefined || bytes === null || bytes === 0) return '';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="file-selector">
      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="file-input"
          id="file-input"
        />
        <label htmlFor="file-input" className="file-input-label">
          <div className="upload-icon">📁</div>
          <div className="upload-text">
            Drag and drop files here or click to select
          </div>
        </label>
      </div>
      
      {selectedFiles.length > 0 && (
        <div className="selected-files">
          <h3>Selected Files:</h3>
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={index}>
                <div className="file-info">
                  <span className="file-name">{file.name}</span>
                  <span className="file-path" title={file.path}>
                    {file.path || 'Path not available'}
                  </span>
                  {file.size !== undefined && (
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileSelector; 