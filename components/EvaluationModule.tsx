
import React, { useState, useEffect, useMemo } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts';
import Card from './shared/Card';
import { generateReportSummary } from '../services/geminiService';
import { addReport } from '../services/dataService';
import { GeneratedReport, Case } from '../types';

const ALL_LLM_PROVIDERS = ['GPT-4', 'Claude 3', 'Gemini Advanced', 'Llama 3', 'Command R+'];

const getRiskColor = (score: number) => {
  if (score > 80) return 'text-red-400';
  if (score > 60) return 'text-orange-400';
  if (score > 40) return 'text-yellow-400';
  return 'text-green-400';
};

const getRiskLevelText = (score: number) => {
    if (score > 80) return '高リスク';
    if (score > 60) return '中リスク';
    if (score > 40) return '低リスク';
    return '軽微';
}

const ReportGenerationModal: React.FC<{isOpen: boolean; progress: number; status: string}> = ({ isOpen, progress, status }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-lg p-8 w-full max-w-md border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">レポートを生成中...</h3>
                <p className="text-sm text-slate-400 mb-2">{status}</p>
                <div className="w-full bg-slate-600 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                </div>
                {progress === 100 && <p className="text-center text-green-400 mt-4 font-bold">生成が完了しました。</p>}
            </div>
        </div>
    );
};

interface EvaluationModuleProps {
    onAddReport: (report: GeneratedReport) => void;
    selectedCaseId: number | null;
    cases: Case[];
}

const EvaluationModule: React.FC<EvaluationModuleProps> = ({ onAddReport, selectedCaseId, cases }) => {
    const [reportSummary, setReportSummary] = useState('');
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [selectedLlmProviders, setSelectedLlmProviders] = useState<string[]>(['GPT-4', 'Claude 3']);
    const [advancedOptions, setAdvancedOptions] = useState({ precedents: true, expertWitness: false, chainOfCustody: true });
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [generationStatus, setGenerationStatus] = useState('');

    const selectedCase = cases.find(c => c.id === selectedCaseId);

    const radarData = useMemo(() => {
        const score = selectedCase?.riskScore || 50;
        // Dynamically adjust radar data based on risk score for a more "live" feel
        return [
            { subject: '依拠性', A: Math.min(98, score + 7), fullMark: 100 },
            { subject: '類似性', A: Math.min(96, score + 5), fullMark: 100 },
            { subject: 'ユニーク表現', A: Math.max(20, score - 5), fullMark: 100 },
            { subject: '論理構造', A: Math.min(95, score + 2), fullMark: 100 },
            { subject: '創作性', A: Math.max(15, score - 10), fullMark: 100 },
        ];
    }, [selectedCase]);

    const damageData = useMemo(() => {
        const baseDamage = selectedCase ? (selectedCase.riskScore / 100) * 80 : 40; // Base damage in millions
        const litigationMultiplier = 1.6;
        return [
            { name: "Q1 '24", settlement: Math.round(baseDamage * 0.5), litigation: Math.round(baseDamage * 0.5 * litigationMultiplier) },
            { name: "Q2 '24", settlement: Math.round(baseDamage * 0.7), litigation: Math.round(baseDamage * 0.7 * litigationMultiplier) },
            { name: "Q3 '24", settlement: Math.round(baseDamage * 0.9), litigation: Math.round(baseDamage * 0.9 * litigationMultiplier) },
            { name: "Q4 '24", settlement: Math.round(baseDamage), litigation: Math.round(baseDamage * litigationMultiplier) },
            { name: "Q1 '25", settlement: Math.round(baseDamage * 1.2), litigation: Math.round(baseDamage * 1.2 * litigationMultiplier) },
            { name: "Q2 '25", settlement: Math.round(baseDamage * 1.4), litigation: Math.round(baseDamage * 1.4 * litigationMultiplier) },
        ];
    }, [selectedCase]);

    const handleLlmSelection = (provider: string) => {
        setSelectedLlmProviders(prev => 
            prev.includes(provider) 
            ? prev.filter(p => p !== provider)
            : [...prev, provider]
        );
    };

    const handleAdvancedOptionChange = (option: keyof typeof advancedOptions) => {
        setAdvancedOptions(prev => ({...prev, [option]: !prev[option]}));
    };

    const handleGenerateSummary = async () => {
        setLoadingSummary(true);
        setReportSummary('');
        const summary = await generateReportSummary(selectedLlmProviders);
        setReportSummary(summary);
        setLoadingSummary(false);
    }
    
    const handleFinalizeReport = () => {
        if (!selectedCase) {
            alert("レポートを生成する案件を選択してください。");
            return;
        }

        setIsGenerating(true);
        setGenerationProgress(0);
        setGenerationStatus('レポート生成を開始...');

        const statuses = [
            { progress: 10, status: '証拠データをコンパイル中...' },
            { progress: 30, status: 'ハッシュ値を検証中...' },
            { progress: 50, status: '法的判例を引用中...' },
            { progress: 75, status: '技術専門家の所見を添付中...' },
            { progress: 90, status: '最終ドキュメントをフォーマット中...' },
            { progress: 100, status: '完了' },
        ];

        let currentStatusIndex = 0;
        const interval = setInterval(() => {
            if (currentStatusIndex < statuses.length) {
                const { progress, status } = statuses[currentStatusIndex];
                setGenerationProgress(progress);
                setGenerationStatus(status);
                currentStatusIndex++;
            } else {
                clearInterval(interval);
                const newReportData = {
                    caseTitle: selectedCase.title,
                    caseId: selectedCase.id,
                    riskScore: selectedCase.riskScore,
                    llmProviders: selectedLlmProviders,
                    format: 'PDF' as const,
                    status: 'Pending Review' as const,
                    version: 1,
                };
                addReport(newReportData).then((addedReport) => {
                    if (addedReport) {
                        onAddReport(addedReport);
                    }
                    setTimeout(() => setIsGenerating(false), 1000);
                });
            }
        }, 700);
    };
  
    if (!selectedCase) {
        return (
            <div className="text-center py-16">
                <h1 className="text-2xl font-bold mb-4">案件が選択されていません</h1>
                <p className="text-slate-400">ダッシュボードまたはレポート一覧から案件を選択して、法的評価を開始してください。</p>
            </div>
        );
    }

  return (
    <div className="space-y-8">
      <ReportGenerationModal isOpen={isGenerating} progress={generationProgress} status={generationStatus} />
      <h1 className="text-3xl font-bold">法的評価・レポート出力</h1>
      <h2 className="text-xl font-semibold text-slate-300 -mt-4">対象案件: <span className="text-blue-400">{selectedCase.title}</span></h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col space-y-8">
          <Card className="flex-grow" data-tour-id="risk-scoreboard">
            <h2 className="text-xl font-semibold mb-2">侵害リスクスコアボード</h2>
            <div className="text-center my-4">
              <p className={`text-7xl font-bold ${getRiskColor(selectedCase.riskScore)}`}>{selectedCase.riskScore}<span className="text-4xl text-gray-400">/100</span></p>
              <p className={`text-xl font-semibold ${getRiskColor(selectedCase.riskScore)}`}>{getRiskLevelText(selectedCase.riskScore)}</p>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#475569"/>
                  <PolarAngleAxis dataKey="subject" fontSize={12} stroke="#94a3b8" />
                  <Radar name="リスク" dataKey="A" stroke="#f87171" fill="#ef4444" fillOpacity={0.6} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card>
             <h2 className="text-xl font-semibold mb-4">法的根拠照合</h2>
             <div className="w-full h-32 bg-slate-700/50 border border-slate-600 rounded-md p-3 text-sm text-gray-300 overflow-y-auto">
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>著作権法:</strong> 依拠性と類似性の要件に該当する可能性が高い。</li>
                  <li><strong>不正競争防止法:</strong> 未公開の技術情報が含まれる場合、営業秘密侵害の可能性。</li>
                  <li><strong>判例 (知財高裁):</strong> 「実質的同一性」の判断基準を満たす。</li>
                </ul>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 flex flex-col space-y-8">
          <Card className="flex-grow" data-tour-id="damage-chart">
             <h2 className="text-xl font-semibold mb-4">損害額シミュレーション (単位：百万円)</h2>
             <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={damageData}>
                     <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                     <YAxis stroke="#94a3b8" fontSize={12} />
                     <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} formatter={(value: number) => [`${value}百万円`, '金額']} cursor={{fill: 'rgba(100, 116, 139, 0.1)'}} />
                     <Legend verticalAlign="top" height={36}/>
                     <Bar dataKey="litigation" fill="#ef4444" name="訴訟時請求額" />
                     <Bar dataKey="settlement" fill="#3b82f6" name="推定和解額" />
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </Card>
          <Card data-tour-id="report-generator">
            <h2 className="text-xl font-semibold mb-4">完全レポート生成</h2>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">対象LLMの選択 (複数可)</label>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 bg-slate-700/50 p-3 rounded-md">
                       {ALL_LLM_PROVIDERS.map(p => (
                         <label key={p} className="flex items-center text-sm cursor-pointer">
                            <input type="checkbox" className="h-4 w-4 rounded border-slate-500 text-blue-500 bg-slate-800 focus:ring-blue-600 focus:ring-offset-slate-900" checked={selectedLlmProviders.includes(p)} onChange={() => handleLlmSelection(p)} />
                            <span className="ml-2 text-gray-300">{p}</span>
                        </label>
                       ))}
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">付属証拠資料 (裁判提出用)</label>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 bg-slate-700/50 p-3 rounded-md">
                        <label className="flex items-center text-sm cursor-pointer">
                            <input type="checkbox" className="h-4 w-4 rounded border-slate-500 text-blue-500 bg-slate-800 focus:ring-blue-600 focus:ring-offset-slate-900" checked={advancedOptions.precedents} onChange={() => handleAdvancedOptionChange('precedents')} />
                            <span className="ml-2 text-gray-300">関連判例引用</span>
                        </label>
                         <label className="flex items-center text-sm cursor-pointer">
                            <input type="checkbox" className="h-4 w-4 rounded border-slate-500 text-blue-500 bg-slate-800 focus:ring-blue-600 focus:ring-offset-slate-900" checked={advancedOptions.expertWitness} onChange={() => handleAdvancedOptionChange('expertWitness')} />
                            <span className="ml-2 text-gray-300">技術専門家所見 (プレースホルダ)</span>
                        </label>
                        <label className="flex items-center text-sm cursor-pointer">
                            <input type="checkbox" className="h-4 w-4 rounded border-slate-500 text-blue-500 bg-slate-800 focus:ring-blue-600 focus:ring-offset-slate-900" checked={advancedOptions.chainOfCustody} onChange={() => handleAdvancedOptionChange('chainOfCustody')} />
                            <span className="ml-2 text-gray-300">証拠の同一性保持(CoC)ログ</span>
                        </label>
                    </div>
                </div>
            </div>
            {reportSummary && (
                <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 fade-in">
                    <h3 className="font-semibold mb-2">生成されたAI要約：</h3>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{reportSummary}</p>
                </div>
            )}
            <div className="mt-6 flex justify-between items-center">
                <button 
                  onClick={handleGenerateSummary}
                  disabled={loadingSummary || selectedLlmProviders.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center"
                >
                  {loadingSummary && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>}
                  {loadingSummary ? '生成中...' : 'AI要約を生成'}
                </button>
                <button 
                  onClick={handleFinalizeReport}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                  レポート生成とハッシュ付与
                </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EvaluationModule;