
import React, { useState } from 'react';
import Card from './shared/Card';
import { UploadIcon } from './shared/icons';

interface RegistrationModuleProps {
  onStartAnalysis: (file: File, fileContent: string | null) => void;
}

const RegistrationModule: React.FC<RegistrationModuleProps> = ({ onStartAnalysis }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const readFileAsText = (fileToRead: File): Promise<string | null> => {
    return new Promise((resolve) => {
      // For this demo, we assume PDF is text-readable. A real-world app would need pdf.js
      // to extract text, but this simulates the data flow effectively.
      if (fileToRead.type === 'application/pdf' || fileToRead.type.startsWith('text/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.onerror = () => {
          resolve(`Could not read file content for ${fileToRead.name}`);
        };
        reader.readAsText(fileToRead);
      } else {
        // Fallback for non-text/pdf files
        resolve(`Binary file content placeholder for: ${fileToRead.name}`);
      }
    });
  };

  const handleFileSelected = (selectedFiles: FileList | null) => {
    if (selectedFiles && selectedFiles.length > 0) {
      setFile(selectedFiles[0]);
    }
  };

  const handleStartAnalysisClick = async () => {
    if (!file) {
      alert('分析するファイルを選択してください。');
      return;
    }
    setIsProcessing(true);
    const fileContent = await readFileAsText(file);
    onStartAnalysis(file, fileContent);
    // The view will change, so no need to setIsProcessing(false)
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">論文登録・分析開始</h1>
      
      <Card>
        <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-semibold mb-2 text-center">調査する論文ファイルをアップロード</h2>
            <p className="text-sm text-center text-slate-400 mb-6">
                PDFファイルをアップロードすると、AIエージェントによる詳細調査が開始され、現状分析画面に遷移します。
            </p>
            <div 
                data-tour-id="file-dropzone"
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`mt-1 flex justify-center px-6 pt-10 pb-12 border-2 border-slate-600 border-dashed rounded-md bg-slate-900/50 transition-colors ${isDragging ? 'border-blue-500 bg-slate-800' : ''}`}
            >
                <div className="space-y-1 text-center">
                    <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-400">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-blue-400 hover:text-blue-300 focus-within:outline-none">
                            <span>ファイルを選択</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={(e) => handleFileSelected(e.target.files)} accept=".pdf" />
                        </label>
                    </div>
                    <p className="pl-1">またはドラッグ＆ドロップ</p>
                    <p className="text-xs text-gray-500">PDF形式のファイルに対応</p>
                </div>
            </div>

            {file && (
                <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-300">選択されたファイル:</h4>
                    <div className="mt-2 text-sm text-gray-300 bg-slate-800 p-3 rounded-md border border-slate-700 flex justify-between items-center">
                        <span>{file.name}</span>
                        <span className="font-mono text-xs text-slate-400">{(file.size / 1024).toFixed(2)} KB</span>
                    </div>
                </div>
            )}

            <div className="mt-8 text-center">
                <button 
                    onClick={handleStartAnalysisClick}
                    disabled={!file || isProcessing}
                    className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 disabled:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center mx-auto"
                >
                    {isProcessing && <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>}
                    {isProcessing ? '処理中...' : '分析開始'}
                </button>
            </div>
        </div>
      </Card>
    </div>
  );
};

export default RegistrationModule;