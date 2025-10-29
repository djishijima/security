
import React from 'react';
import Card from './shared/Card';
import { GeneratedReport } from '../types';
import { ArrowDownTrayIcon } from './shared/icons';

interface ReportListModuleProps {
    onSelectCase: (caseId: number) => void;
    reports: GeneratedReport[];
    loading: boolean;
}

const ReportListModule: React.FC<ReportListModuleProps> = ({ onSelectCase, reports, loading }) => {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">生成済みレポート一覧</h1>

            <Card data-tour-id="report-history">
                <h2 className="text-xl font-semibold mb-4">全案件レポート履歴</h2>
                <div className="overflow-x-auto max-h-[75vh]">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-slate-700 sticky top-0">
                            <tr>
                                <th className="px-4 py-3">レポートID</th>
                                <th className="px-6 py-3">関連案件</th>
                                <th className="px-6 py-3">リスクスコア</th>
                                <th className="px-6 py-3">対象LLM</th>
                                <th className="px-6 py-3">生成日時</th>
                                <th className="px-6 py-3">ステータス</th>
                                <th className="px-4 py-3 text-center">アクション</th>
                            </tr>
                        </thead>
                        <tbody className="bg-slate-800">
                            {loading ? (
                                <tr><td colSpan={7} className="text-center p-8">読み込み中...</td></tr>
                            ) : (
                                reports.map(report => (
                                    <tr key={report.id} onClick={() => onSelectCase(report.caseId)} className="border-b border-slate-700 hover:bg-slate-600/50 cursor-pointer transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs text-gray-400">{report.id}</td>
                                        <td className="px-6 py-3 font-medium truncate max-w-xs">{report.caseTitle}</td>
                                        <td className="px-6 py-3 font-bold text-red-400">{report.riskScore}</td>
                                        <td className="px-6 py-3 text-xs">{report.llmProviders.join(', ')}</td>
                                        <td className="px-6 py-3 text-gray-300">{report.generatedAt}</td>
                                        <td className="px-6 py-3">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${report.status === 'Archived' ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'}`}>{report.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button className="p-1 text-gray-400 hover:text-white">
                                                <ArrowDownTrayIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ReportListModule;