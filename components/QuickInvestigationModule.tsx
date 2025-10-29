import React, { useState } from 'react';
import Card from './shared/Card';
import { UploadIcon, GlobeIcon, DocumentTextIcon, BeakerIcon, ShieldCheckIcon } from './shared/icons';

interface QuickInvestigationModuleProps {
    onStartInvestigation: (target: {
        domain: string | null;
        file: File | null;
        fileContent: string | null;
        fileName: string | null;
    }) => void;
}

const QuickInvestigationModule: React.FC<QuickInvestigationModuleProps> = ({ onStartInvestigation }) => {
    const [domain, setDomain] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setDomain(''); // Clear domain if file is selected
        }
    };
    
    const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDomain(e.target.value);
        if (file) {
            setFile(null); // Clear file if domain is being typed
        }
    };

    const readFileAsText = (fileToRead: File): Promise<string | null> => {
        return new Promise((resolve) => {
            if (fileToRead.type === 'application/pdf' || fileToRead.type.startsWith('text/')) {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target?.result as string);
                reader.onerror = () => resolve(`Could not read file content for ${fileToRead.name}`);
                reader.readAsText(fileToRead);
            } else {
                resolve(`Binary file content placeholder for: ${fileToRead.name}`);
            }
        });
    };

    const handleStart = async () => {
        if (!domain && !file) {
            setError('調査対象のドメインを入力するか、ファイルをアップロードしてください。');
            return;
        }

        setIsProcessing(true);
        setError('');

        let fileContent: string | null = null;
        if (file) {
            fileContent = await readFileAsText(file);
        }

        onStartInvestigation({
            domain: domain || null,
            file: file,
            fileContent: fileContent,
            fileName: file ? file.name : null,
        });
        // App.tsx will handle view change, so no need to setIsProcessing(false) here
    };

    return (
        <div className="max-w-5xl mx-auto fade-in">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-white">AIサイトセキュリティ診断</h1>
                <p className="mt-3 text-lg text-slate-300">
                    あなたの著作物がAIに不正利用されていないか、初期調査を開始します。
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                {/* Left Column: Explanations */}
                <div className="space-y-6 bg-slate-800/50 p-6 rounded-lg border border-slate-700 h-full">
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                            <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-400" />
                            アップロード対象PDF
                        </h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-slate-400 pl-2">
                            <li>公開されているPDF：学術論文、研究レポート等</li>
                            <li>所属団体のドメインに存在するPDF：大学、研究機関等</li>
                        </ul>
                    </div>
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                            <BeakerIcon className="w-5 h-5 mr-2 text-purple-400" />
                            診断の目的
                        </h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-slate-400 pl-2">
                            <li>Google検索での無断使用の特定</li>
                            <li>LLMサービス（ChatGPT、Claude等）での使用検出</li>
                            <li>知的財産権侵害のリスク評価</li>
                        </ul>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-700">
                        <h4 className="font-semibold text-white flex items-center">
                             <ShieldCheckIcon className="w-5 h-5 mr-2 text-green-400" />
                            プライバシー保護
                        </h4>
                        <p className="text-sm text-slate-400 mt-2 pl-1">
                            アップロードされたデータは分析にのみ使用され、調査完了後に即時破棄されます。サーバーにファイルが保存されることは一切ありません。
                        </p>
                    </div>
                </div>

                {/* Right Column: Input Form */}
                <Card className="!p-8">
                    <div className="space-y-6">
                        {error && <p className="text-red-400 text-center text-sm">{error}</p>}
                        
                        <div>
                            <label htmlFor="domain" className="text-lg font-semibold text-slate-200 block mb-2">
                                公開ドメイン調査
                            </label>
                            <p className="text-sm text-slate-400 mb-3">
                                ウェブサイト全体での公開状況や、サーバーの脆弱性を調査します。
                            </p>
                            <div className="relative">
                                <GlobeIcon className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    id="domain"
                                    type="text"
                                    value={domain}
                                    onChange={handleDomainChange}
                                    placeholder="www.your-society.or.jp"
                                    className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-3 pl-10 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                                    disabled={isProcessing}
                                />
                            </div>
                        </div>
                        
                        <div className="flex items-center text-slate-400">
                            <hr className="w-full border-slate-600" />
                            <span className="px-4 text-sm font-semibold">または</span>
                            <hr className="w-full border-slate-600" />
                        </div>
                        
                        <div>
                            <label className="text-lg font-semibold text-slate-200 block mb-2">
                                論文ファイル調査
                            </label>
                            <p className="text-sm text-slate-400 mb-3">
                                特定の論文がWeb上に流出していないか、LLMに学習されていないかを調査します。
                            </p>
                            <label htmlFor="file-upload" className={`mt-1 flex flex-col items-center justify-center px-6 py-10 border-2 border-slate-600 border-dashed rounded-md transition-colors ${isProcessing ? 'cursor-not-allowed bg-slate-800' : 'cursor-pointer hover:border-blue-500 hover:bg-slate-800'}`}>
                                <UploadIcon className="mx-auto h-12 w-12 text-slate-400" />
                                <span className="mt-2 block text-sm font-medium text-slate-300">
                                    {file ? `選択中: ${file.name}` : '論文PDFをドラッグ＆ドロップ'}
                                </span>
                                <p className="text-xs text-slate-500 mt-1">またはクリックして選択</p>
                                <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf" disabled={isProcessing} />
                            </label>
                        </div>
                    </div>
                     <div className="mt-8 text-center">
                        <button
                            onClick={handleStart}
                            disabled={isProcessing || (!domain && !file)}
                            className="w-full max-w-md bg-blue-600 hover:bg-blue-700 disabled:bg-slate-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center mx-auto text-lg"
                        >
                            {isProcessing && <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>}
                            {isProcessing ? 'AI分析中...' : '詳細調査を開始'}
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default QuickInvestigationModule;