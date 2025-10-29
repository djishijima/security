
import React, { useState, useEffect, useRef } from 'react';
import Card from './shared/Card';
import { Case } from '../types';
import { 
    StructuredReport, 
    LlmTraceResult,
    DomainVulnerabilityResult,
    runFullInvestigation,
    generateReportHtml,
    FixEstimation,
    generateFixEstimation,
} from '../services/geminiService';
import { sendReportByEmail } from '../services/emailService';
import { CpuChipIcon, ShieldCheckIcon, DocumentTextIcon, XMarkIcon, ArrowDownTrayIcon, LightBulbIcon, ExclamationTriangleIcon, CheckBadgeIcon, PencilSquareIcon, UploadIcon, DollarIcon } from './shared/icons';

declare global {
    interface Window {
        jspdf: any;
        html2canvas: any;
    }
}


// --- UI Components for the AI Agent & Report ---

const getRiskColor = (risk: '高' | '中' | '低' | '不明' | '情報') => {
    switch (risk) {
        case '高': return 'text-red-400';
        case '中': return 'text-orange-400';
        case '低': return 'text-yellow-400';
        case '情報': return 'text-sky-400';
        default: return 'text-slate-400';
    }
};

const getRiskBgColor = (risk: '高' | '中' | '低' | '不明' | '情報') => {
    switch (risk) {
        case '高': return 'bg-red-500/20';
        case '中': return 'bg-orange-500/20';
        case '低': return 'bg-yellow-500/20';
        case '情報': return 'bg-sky-500/20';
        default: return 'bg-slate-500/20';
    }
};

const getPriorityColor = (priority: '高' | '中' | '低') => {
    switch (priority) {
        case '高': return { text: 'text-red-400', bg: 'bg-red-900/50', icon: <ExclamationTriangleIcon className="w-4 h-4 mr-2" /> };
        case '中': return { text: 'text-orange-400', bg: 'bg-orange-900/50', icon: <LightBulbIcon className="w-4 h-4 mr-2" /> };
        case '低': return { text: 'text-sky-400', bg: 'bg-sky-900/50', icon: <PencilSquareIcon className="w-4 h-4 mr-2" /> };
        default: return { text: 'text-slate-400', bg: 'bg-slate-700', icon: null };
    }
};


type LogEntry = {
    type: 'status' | 'success' | 'error' | 'info' | 'result-llm' | 'result-vuln';
    message: string;
    data?: any;
    timestamp: string;
};

const LogEntryDisplay: React.FC<{ entry: LogEntry }> = ({ entry }) => {
    const getIcon = () => {
        switch (entry.type) {
            case 'status': return <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-400"></div>;
            case 'success': return <CheckBadgeIcon className="w-4 h-4 text-green-400" />;
            case 'error': return <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />;
            case 'info': return <LightBulbIcon className="w-4 h-4 text-sky-400" />;
            case 'result-llm': return <CpuChipIcon className="w-4 h-4 text-purple-400" />;
            case 'result-vuln': return <ShieldCheckIcon className="w-4 h-4 text-orange-400" />;
            default: return null;
        }
    };

    return (
        <div className="flex items-start space-x-3 text-sm mb-3">
            <div className="flex-shrink-0 pt-1">{getIcon()}</div>
            <div className="flex-grow">
                <p className={`font-mono text-xs ${entry.type === 'error' ? 'text-red-400' : 'text-slate-400'}`}>{entry.message}</p>
                {entry.type === 'result-llm' && entry.data && (
                    <div className="mt-1 space-y-1 text-xs">
                        {(entry.data as LlmTraceResult).map((item, index) => (
                            <div key={index} className={`p-1.5 rounded-md ${getRiskBgColor(item.risk)}`}>
                                <span className={`font-semibold ${getRiskColor(item.risk)}`}>[{item.risk}]</span> {item.provider}: <span className="text-slate-300">"{item.evidence}"</span>
                            </div>
                        ))}
                    </div>
                )}
                {entry.type === 'result-vuln' && entry.data && (
                     <div className="mt-1 space-y-1 text-xs">
                        {(entry.data as DomainVulnerabilityResult).map((item, index) => (
                           <div key={index} className={`p-1.5 rounded-md ${getRiskBgColor(item.severity)}`}>
                                <span className={`font-semibold ${getRiskColor(item.severity)}`}>[{item.severity}]</span> {item.vulnerability}: <span className="text-slate-300">{item.description}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex-shrink-0 font-mono text-xs text-slate-500">{entry.timestamp}</div>
        </div>
    );
};

const ReportDisplay: React.FC<{ report: StructuredReport, onStartNew: () => void }> = ({ report, onStartNew }) => {
    const [activeTab, setActiveTab] = useState('results');
    const [recipientEmail, setRecipientEmail] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [sendStatus, setSendStatus] = useState('');
    const [sendError, setSendError] = useState('');
    const [estimation, setEstimation] = useState<FixEstimation | null>(null);
    const [isEstimating, setIsEstimating] = useState(false);
    const [estimationError, setEstimationError] = useState('');

    const handleSendReport = async () => {
        if (!recipientEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
            alert("有効なメールアドレスを入力してください。");
            return;
        }
        
        setIsSending(true);
        setSendStatus('');
        setSendError('');

        try {
            setSendStatus('レポートHTMLをAIで生成中...');
            const htmlContent = await generateReportHtml(report, { recipientEmail });
            
            const contentElement = document.createElement('div');
            contentElement.innerHTML = htmlContent;
            contentElement.style.width = '210mm'; 
            contentElement.style.padding = '0';
            contentElement.style.margin = '0';
            contentElement.style.position = 'absolute';
            contentElement.style.left = '-9999px';
            contentElement.style.top = '0';
            contentElement.style.backgroundColor = 'white';
            contentElement.style.color = 'black';
            document.body.appendChild(contentElement);

            setSendStatus('レポートを描画中 (レンダリングに約8秒かかります)...');
            await new Promise(resolve => setTimeout(resolve, 8000)); // Delay for stability

            setSendStatus('ページコンテンツをキャプチャ中...');
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const canvas = await window.html2canvas(contentElement, { scale: 2, useCORS: true, logging: false });
            
            setSendStatus('PDFに変換しています...');
            const imgData = canvas.toDataURL('image/png');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
              position = -heightLeft;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
              heightLeft -= pageHeight;
            }
            
            const pdfFileName = `AIサイトセキュリティ診断レポート.pdf`;
            
            setSendStatus(`PDFをBase64に変換中...`);
            const pdfBase64 = pdf.output('datauristring').split(',')[1];
            
            setSendStatus(`${recipientEmail} にメールを送信中...`);
            const emailResult = await sendReportByEmail(recipientEmail, pdfBase64, pdfFileName);
            
            if (!emailResult.success) {
                setSendError(emailResult.message);
            }

            setSendStatus('PDFをダウンロードしています...');
            pdf.save(pdfFileName);
            document.body.removeChild(contentElement);
            
             if (emailResult.success) {
                setSendStatus(`${recipientEmail} にレポートを送信しました。ダウンロードも完了しました。`);
            } else {
                // If there was an error, ensure it's displayed, but confirm download
                setSendStatus('PDFのダウンロードは完了しました。');
            }

        } catch (error) {
            const errorMessage = `エラーが発生しました: ${(error as Error).message}`;
            setSendError(errorMessage);
            setSendStatus(''); // Clear status on error
            console.error("Report sending error:", error);
            alert(errorMessage);
        } finally {
            setTimeout(() => {
              setIsSending(false);
              if (!sendError) setSendStatus('');
            }, 5000);
        }
    };
    
    const handleGetEstimation = async () => {
        setIsEstimating(true);
        setEstimation(null);
        setEstimationError('');
        try {
            const result = await generateFixEstimation(report);
            setEstimation(result);
        } catch (error) {
            setEstimationError((error as Error).message);
        } finally {
            setIsEstimating(false);
        }
    };

    const RiskScoringItem: React.FC<{ parameter: string; score: number; justification: string }> = ({ parameter, score, justification }) => {
        const textColorClass = score > 80 ? 'text-red-400' : score > 50 ? 'text-orange-400' : 'text-yellow-400';
        const segments = 5;
        const activeSegments = Math.ceil((score / 100) * segments);
        const getSegmentColor = () => {
            if (score > 80) return 'bg-red-500';
            if (score > 50) return 'bg-orange-500';
            return 'bg-yellow-500';
        };

        return (
            <div>
                <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-slate-300">{parameter}</p>
                    <p className={`text-sm font-bold ${textColorClass}`}>{score} / 100</p>
                </div>
                <div className="flex space-x-1 my-2">
                    {Array.from({ length: segments }).map((_, i) => (
                        <div key={i} className={`h-2 flex-1 rounded ${i < activeSegments ? getSegmentColor() : 'bg-slate-600'}`}></div>
                    ))}
                </div>
                <p className="text-xs text-slate-400">{justification}</p>
            </div>
        );
    };

    const TabButton: React.FC<{tabId: string; children: React.ReactNode}> = ({tabId, children}) => (
        <button onClick={() => setActiveTab(tabId)} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === tabId ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700/50'}`}>
            {children}
        </button>
    );

    return (
        <Card className="!p-0 border-blue-500/50">
            <div className="p-6">
                <h2 className="text-2xl font-bold text-blue-300">{report.title}</h2>
                <p className="text-sm text-slate-400 mt-1">調査完了: {new Date().toLocaleString()}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
                <div className="md:col-span-2 bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="font-semibold text-lg mb-2 text-slate-200">エグゼクティブサマリー</h3>
                    <p className="text-sm text-slate-300">{report.executiveSummary}</p>
                </div>
                <div className={`${getRiskBgColor(report.overallRisk)} p-4 rounded-lg flex flex-col justify-center items-center border ${getRiskColor(report.overallRisk).replace('text-','border-')}/50`}>
                    <p className="text-sm font-semibold uppercase tracking-wider text-slate-300">総合リスク評価</p>
                    <p className={`text-4xl font-bold ${getRiskColor(report.overallRisk)}`}>{report.overallRisk}</p>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="font-semibold text-lg mb-3 text-slate-200">リスクスコア内訳</h3>
                    <div className="space-y-4">
                        {report.riskScoring.map(item => <RiskScoringItem key={item.parameter} {...item} />)}
                    </div>
                </div>
                 <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="font-semibold text-lg mb-3 text-slate-200">推奨される対応</h3>
                    <div className="space-y-2">
                        {report.conclusionAndRecommendations.recommendations.map((rec, i) => {
                            const { text, bg, icon } = getPriorityColor(rec.priority);
                            return (
                                <div key={i} className={`p-2.5 rounded-md ${bg}`}>
                                    <p className={`font-semibold text-sm flex items-center ${text}`}>
                                        {icon}
                                        [{rec.priority}] {rec.action}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1 pl-6">{rec.rationale}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="px-6">
                <div className="border-b border-slate-600">
                    <TabButton tabId="results">調査結果詳細</TabButton>
                    <TabButton tabId="evidence">証拠トレイル</TabButton>
                    <TabButton tabId="conclusion">結論</TabButton>
                </div>
                <div className="bg-slate-700 p-4 rounded-b-lg min-h-[200px]">
                    {activeTab === 'results' && (
                        <div className="text-sm space-y-4">
                            <div>
                                <h4 className="font-semibold text-slate-200 mb-2">Google検索結果:</h4>
                                <ul className="list-disc list-inside space-y-1 text-slate-300">
                                    {report.investigationResults.googleSearchResults.slice(0, 5).map(r => <li key={r.uri}><a href={r.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{r.title}</a></li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-200 mb-2">発見されたPDF:</h4>
                                 <ul className="list-disc list-inside space-y-1 text-slate-300">
                                    {report.investigationResults.foundPdfs.slice(0, 5).map(p => <li key={p.url}><span className={`${getRiskColor(p.risk)}`}>[{p.risk}]</span> <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{p.title}</a></li>)}
                                </ul>
                            </div>
                        </div>
                    )}
                     {activeTab === 'evidence' && (
                        <div className="text-sm text-slate-300">
                            <table className="w-full text-left text-xs">
                                <thead><tr className="border-b border-slate-500"><th className="py-2">ID</th><th>説明</th><th>ソース</th><th>タイムスタンプ</th></tr></thead>
                                <tbody>{report.evidenceTrail.map(e => <tr key={e.evidenceId} className="border-b border-slate-600"><td className="py-2 pr-2 font-mono">{e.evidenceId}</td><td className="py-2 pr-2">{e.description}</td><td className="py-2 pr-2">{e.source}</td><td className="py-2 font-mono">{new Date(e.timestamp).toLocaleTimeString()}</td></tr>)}</tbody>
                            </table>
                        </div>
                    )}
                     {activeTab === 'conclusion' && (
                        <p className="text-sm text-slate-300">{report.conclusionAndRecommendations.conclusion}</p>
                    )}
                </div>
            </div>

            <div className="p-6 bg-slate-900/50 rounded-b-lg mt-px border-t border-slate-700">
                <h3 className="text-lg font-bold text-white mb-3">レポート出力</h3>
                <p className="text-sm text-slate-400 mb-4">
                    ご入力いただいたメールアドレスにレポートが送信されます。また、弊社のサービスに関するご案内をお送りする場合があります。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    <div>
                        <label htmlFor="recipientEmail" className="block text-sm font-medium text-slate-300 mb-1">レポート送付先メールアドレス <span className="text-red-400">*必須</span></label>
                        <input 
                            id="recipientEmail"
                            type="email" 
                            value={recipientEmail} 
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            placeholder="your-email@example.com" 
                            required 
                            disabled={isSending}
                            className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50" />
                    </div>
                    <div>
                        <button 
                            onClick={handleSendReport}
                            disabled={isSending || !recipientEmail}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors flex items-center justify-center disabled:bg-slate-500 disabled:cursor-not-allowed"
                        >
                            {isSending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                            ) : (
                                <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                            )}
                            {isSending ? '処理中...' : '送信してレポートを受け取る'}
                        </button>
                    </div>
                </div>
                {sendStatus && <p className="text-center text-sm text-blue-300 mt-3 animate-pulse">{sendStatus}</p>}
                {sendError && <p className="text-center text-sm text-red-400 mt-3">{sendError}</p>}
            </div>

            <div className="p-6 bg-slate-900/50 mt-px border-t border-slate-700">
                <h3 className="text-lg font-bold text-white mb-3">修正費用の自動見積もり</h3>
                <p className="text-sm text-slate-400 mb-4">
                    検出された脆弱性やリスクに対する修正作業の概算費用をAIが算出します。
                </p>
                <button
                    onClick={handleGetEstimation}
                    disabled={isEstimating}
                    className="w-full max-w-sm bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors flex items-center justify-center disabled:bg-slate-500 disabled:cursor-not-allowed"
                >
                    {isEstimating ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    ) : (
                        <DollarIcon className="w-4 h-4 mr-2" />
                    )}
                    {isEstimating ? 'AIが見積もり中...' : 'AIによる修正費用を見積もる'}
                </button>
                
                {estimationError && (
                    <p className="mt-4 text-sm text-red-400 text-center">{estimationError}</p>
                )}

                {estimation && (
                    <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700 fade-in">
                        <h4 className="text-lg font-bold text-teal-300 mb-4 text-center">AIによる修正プラン・概算費用</h4>
                        <p className="text-center text-xs text-slate-400 mb-6">{estimation.summary}</p>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {estimation.plans.map((plan, index) => {
                                const isHighlighted = plan.planName === '緊急支援プラン';
                                return (
                                    <div key={index} className={`rounded-lg p-6 border flex flex-col ${isHighlighted ? 'bg-teal-900/50 border-teal-500' : 'bg-slate-700/50 border-slate-600'}`}>
                                        <h5 className={`font-bold text-xl ${isHighlighted ? 'text-teal-300' : 'text-white'}`}>{plan.planName}</h5>
                                        <p className="text-xs text-slate-400 mb-4 flex-grow">{plan.description}</p>
                                        
                                        <div className="my-4">
                                             <p className="text-sm text-slate-400">納期</p>
                                             <p className="text-lg font-semibold text-white">{plan.deliveryTime}</p>
                                        </div>
                                        
                                        <div className="my-4">
                                             <p className="text-sm text-slate-400">概算費用</p>
                                             <p className="text-2xl font-bold text-white">¥{plan.totalCost.min.toLocaleString()}~</p>
                                        </div>

                                        <ul className="text-xs text-slate-300 space-y-2 mt-4">
                                            {plan.features.map((feature, fIndex) => (
                                                <li key={fIndex} className="flex items-start">
                                                    <CheckBadgeIcon className="w-4 h-4 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 flex justify-start items-center bg-slate-800 rounded-b-lg mt-px">
                 <a 
                    href="https://form.b-p.co.jp"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md text-sm transition-colors inline-flex items-center"
                >
                    専門家へのお問い合わせはこちら
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 ml-2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg>
                </a>
            </div>
        </Card>
    );
};


// --- Main Module Component ---

interface GuestInvestigationTarget {
  domain: string | null;
  file: File | null;
  fileContent: string | null;
  fileName: string | null;
}

interface DetectionModuleProps {
    cases?: Case[];
    loadingCases?: boolean;
    guestTarget?: GuestInvestigationTarget | null;
    onStartNew: () => void;
}

const DetectionModule: React.FC<DetectionModuleProps> = ({ cases, loadingCases, guestTarget, onStartNew }) => {
    const [selectedCaseId, setSelectedCaseId] = useState<string>('');
    
    const [isInvestigating, setIsInvestigating] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [reportData, setReportData] = useState<StructuredReport | null>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);
    
    // Auto-start investigation if it's a guest coming from the quick investigation module
    useEffect(() => {
        if (guestTarget) {
            handleGuestInvestigation();
        }
    }, [guestTarget]);
    
    // Logic for logged-in users to select a case
    useEffect(() => {
        if (!guestTarget && !loadingCases && cases && cases.length > 0 && !selectedCaseId) {
            setSelectedCaseId(String(cases[0].id));
        }
    }, [guestTarget, cases, loadingCases, selectedCaseId]);

    const addLog = (newLog: Omit<LogEntry, 'timestamp'>) => {
        const timestamp = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLogs(prev => [...prev, { ...newLog, timestamp }]);
    };
    
    const handleInvestigation = async (
        domain: string | null,
        fileName: string | null,
        fileContent: string | null,
        targetLog: string
    ) => {
        setIsInvestigating(true);
        setReportData(null);
        setLogs([]);

        addLog({ type: 'status', message: `詳細調査AIエージェントを起動します...` });
        await new Promise(r => setTimeout(r, 500));
        addLog({ type: 'info', message: `調査対象: ${targetLog}` });
        
        try {
            const finalReport = await runFullInvestigation(domain, fileName, fileContent, (log) => addLog(log));
            setReportData(finalReport);
        } catch (error) {
            console.error(error);
        } finally {
            setIsInvestigating(false);
        }
    };
    
    const handleGuestInvestigation = async () => {
        if (!guestTarget) return;
        const { domain, fileName, fileContent } = guestTarget;
        const targetLog = `${domain ? `ドメイン「${domain}」` : ''}${fileName ? `ファイル「${fileName}」` : ''}`;
        handleInvestigation(domain, fileName, fileContent, targetLog);
    };

    const handleStartExistingCaseInvestigation = async () => {
        if (!selectedCaseId || !cases) {
            addLog({ type: 'error', message: '調査対象の案件を選択してください。' });
            return;
        }
        const selectedCase = cases.find(c => c.id === parseInt(selectedCaseId, 10));
        if (!selectedCase) {
             addLog({ type: 'error', message: '選択された案件が見つかりません。' });
            return;
        }
        const fileContent = `論文内容: ${selectedCase.title} by ${selectedCase.author}`;
        handleInvestigation(null, selectedCase.title, fileContent, `既存案件「${selectedCase.title}」`);
    };

    const renderInitialState = () => (
        <Card className="flex flex-col min-h-[70vh]">
            <h1 className="text-3xl font-bold mb-4">現状分析</h1>
            <p className="text-slate-400 mb-6">登録済みの案件を選択して再調査を実行するか、サイドバーから新しい論文を登録してください。</p>
            <div className="flex-grow flex flex-col justify-center space-y-4 max-w-md mx-auto w-full">
               <label htmlFor="case-select" className="text-lg font-medium text-slate-300">調査対象の案件</label>
               {loadingCases ? <p>案件を読み込み中...</p> : (
                  <select
                      id="case-select"
                      value={selectedCaseId}
                      onChange={(e) => setSelectedCaseId(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 focus:outline-none text-lg"
                      disabled={isInvestigating}
                  >
                      {cases && cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
               )}
               <button
                  onClick={handleStartExistingCaseInvestigation}
                  disabled={isInvestigating || loadingCases || !selectedCaseId}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center"
              >
                  {isInvestigating ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div> : null}
                  {isInvestigating ? '調査中...' : '選択した案件を再調査'}
              </button>
            </div>
        </Card>
    );

    if (reportData) {
        return <ReportDisplay report={reportData} onStartNew={onStartNew} />;
    }

    if (isInvestigating || guestTarget) {
        return (
             <div className="space-y-4">
                 <h1 className="text-3xl font-bold">現状分析</h1>
                 <Card className="flex flex-col min-h-[70vh]">
                    <h2 className="text-xl font-semibold mb-4">AIエージェント・ワークスペース</h2>
                    <div className="flex-grow bg-slate-900/50 p-4 rounded-md border border-slate-700 overflow-y-auto">
                        {logs.length === 0 ? (
                           <div className="h-full flex items-center justify-center text-slate-500">
                                <p>AIエージェントを初期化中...</p>
                            </div>
                        ) : (
                             logs.map((log, index) => <LogEntryDisplay key={index} entry={log} />)
                        )}
                        <div ref={logsEndRef} />
                    </div>
                 </Card>
             </div>
        );
    }
    
    // Default view for logged-in users with no guestTarget
    return renderInitialState();
};

export default DetectionModule;
