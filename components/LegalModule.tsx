
import React, { useState, useEffect } from 'react';
import Card from './shared/Card';
import { ArrowDownTrayIcon, RegistrationIcon, DetectionIcon, EvaluationIcon, PencilSquareIcon, ExclamationTriangleIcon } from './shared/icons';
import { generateAuditTrail } from '../services/geminiService';
import { Case } from '../types';


const Notification: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-5 right-5 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg fade-in z-50">
            {message}
        </div>
    );
};

const iconMap: { [key: string]: React.ElementType } = {
    RegistrationIcon,
    DetectionIcon,
    EvaluationIcon,
    PencilSquareIcon,
    ExclamationTriangleIcon
};

interface LegalModuleProps {
    selectedCaseId: number | null;
    cases: Case[];
    onSelectCase: (id: number) => void;
}

const LegalModule: React.FC<LegalModuleProps> = ({ selectedCaseId, cases, onSelectCase }) => {
    const [notification, setNotification] = useState<string | null>(null);
    const [auditTrail, setAuditTrail] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const selectedCase = cases.find(c => c.id === selectedCaseId);

    const [royaltyForm, setRoyaltyForm] = useState({
        opponentName: '株式会社NextGen AI',
        amount: '5,000,000',
        rate: '3.5'
    });
    
    const [buyoutForm, setBuyoutForm] = useState({
        opponentName: 'グローバル・リサーチ社',
        amount: '25,000,000'
    });

    useEffect(() => {
        if (selectedCase) {
            setLoading(true);
            generateAuditTrail(selectedCase).then(trail => {
                setAuditTrail(trail);
                setLoading(false);
            });
        }
    }, [selectedCase]);

    const handleRoyaltyFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRoyaltyForm(prev => ({ ...prev, [name]: value }));
    };

    const handleBuyoutFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBuyoutForm(prev => ({ ...prev, [name]: value }));
    };

    const showNotification = (message: string) => {
        setNotification(message);
    };

    if (!cases || cases.length === 0) {
        return (
            <div className="text-center py-16">
                <h1 className="text-2xl font-bold mb-4">案件が登録されていません</h1>
                <p className="text-slate-400">「現状分析」から新規調査を開始して、案件を登録してください。</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
            <h1 className="text-3xl font-bold">証拠管理・法的措置</h1>
            <div className="max-w-md">
                <label htmlFor="case-select-legal" className="block text-sm font-medium text-gray-300 mb-1">対象案件の選択</label>
                <select
                    id="case-select-legal"
                    value={selectedCaseId ?? ''}
                    onChange={(e) => onSelectCase(Number(e.target.value))}
                    className="w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                    {cases.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div data-tour-id="evidence-section">
                    <Card className="h-full flex flex-col">
                        <h2 className="text-xl font-semibold mb-4">監査証跡タイムライン</h2>
                        <p className="text-sm text-gray-400 mb-4">
                            この案件に関する全ての操作は、タイムスタンプとハッシュ値と共に記録され、証拠の完全性を保証します。
                        </p>
                        <div className="flex-grow bg-slate-900/50 p-4 rounded-md border border-slate-700 overflow-y-auto max-h-[60vh]">
                            {loading ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                            ) : (
                                <div className="relative border-l-2 border-slate-600 pl-6 space-y-8">
                                    {auditTrail.map((item, index) => {
                                        const IconComponent = iconMap[item.icon] || PencilSquareIcon;
                                        return (
                                            <div key={index} className="relative">
                                                <div className="absolute -left-[34px] top-1 flex items-center justify-center w-6 h-6 bg-slate-800 rounded-full ring-4 ring-slate-900">
                                                    <IconComponent className={`h-4 w-4 ${item.color}`} />
                                                </div>
                                                <p className="font-semibold text-slate-200">{item.title}</p>
                                                <p className="text-xs text-slate-500 mb-1">{new Date(item.timestamp).toLocaleString()}</p>
                                                <p className="text-sm text-slate-300 mb-2">{item.details}</p>
                                                <p className="text-xs font-mono text-slate-400 bg-slate-800 p-1 rounded-sm inline-block">Hash: {item.hash}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={() => showNotification("エビデンス一式 (evidence_package.zip) がダウンロードされました。")}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                            >
                                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                                証拠パッケージをダウンロード
                            </button>
                        </div>
                    </Card>
                </div>
                
                <div data-tour-id="contract-section">
                    <Card className="h-full">
                         <h2 className="text-xl font-semibold mb-4">契約・見積もり生成</h2>
                         <p className="text-sm text-gray-400 mb-4">
                            相手方との交渉フェーズで使用する契約書ドラフトと見積もりを生成します。
                            事案に合わせてオプションを選択してください。
                        </p>
                        <div className="space-y-6">
                            <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
                                <h3 className="font-semibold text-lg text-green-400">オプションA: ロイヤリティ契約</h3>
                                <p className="text-xs text-gray-400 mt-1 mb-4">
                                    継続的な利用を許諾し、利用実績に応じたロイヤリティを受け取る場合の契約です。
                                </p>
                                <div className="space-y-3 mb-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">相手方氏名/企業名</label>
                                            <input type="text" name="opponentName" value={royaltyForm.opponentName} onChange={handleRoyaltyFormChange} className="w-full bg-slate-800 border border-slate-600 rounded-md p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">契約金額 (円)</label>
                                            <input type="text" name="amount" value={royaltyForm.amount} onChange={handleRoyaltyFormChange} className="w-full bg-slate-800 border border-slate-600 rounded-md p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">ロイヤリティ率 (%)</label>
                                        <input type="text" name="rate" value={royaltyForm.rate} onChange={handleRoyaltyFormChange} className="w-1/2 bg-slate-800 border border-slate-600 rounded-md p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button 
                                        onClick={() => showNotification("ロイヤリティ契約の見積書 (estimate_royalty.pdf) が生成されました。")}
                                        className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors">
                                        見積もり生成
                                    </button>
                                    <button 
                                        onClick={() => showNotification(`「${royaltyForm.opponentName}」向けのロイヤリティ契約書ドラフト (draft_royalty.docx) が生成されました。`)}
                                        className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors">
                                        契約書ドラフト生成
                                    </button>
                                </div>
                            </div>
                            
                             <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
                                <h3 className="font-semibold text-lg text-orange-400">オプションB: 著作権買い取り契約</h3>
                                <p className="text-xs text-gray-400 mt-1 mb-4">
                                    当該著作物に関する権利を相手方に譲渡し、一括で対価を受け取る場合の契約です。
                                </p>
                                 <div className="space-y-3 mb-4">
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">相手方氏名/企業名</label>
                                        <input type="text" name="opponentName" value={buyoutForm.opponentName} onChange={handleBuyoutFormChange} className="w-full bg-slate-800 border border-slate-600 rounded-md p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-400 block mb-1">契約金額 (円)</label>
                                        <input type="text" name="amount" value={buyoutForm.amount} onChange={handleBuyoutFormChange} className="w-full bg-slate-800 border border-slate-600 rounded-md p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                     <button 
                                        onClick={() => showNotification("著作権買い取りの見積書 (estimate_buyout.pdf) が生成されました。")}
                                        className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors">
                                        見積もり生成
                                    </button>
                                    <button 
                                        onClick={() => showNotification(`「${buyoutForm.opponentName}」向けの著作権買い取り契約書ドラフト (draft_buyout.docx) が生成されました。`)}
                                        className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors">
                                        契約書ドラフト生成
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LegalModule;