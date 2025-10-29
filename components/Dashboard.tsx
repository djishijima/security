import React, { useState, useMemo, useEffect } from 'react';
import Card from './shared/Card';
import { Case, LlmProviderRisk, Trace } from '../types';
import { getLlmProviderRisks, getTraces, getDemoLlmProviderRisks, getDemoTraces } from '../services/dataService';
import { AlertIcon, DollarIcon, FolderIcon, ChartBarIcon, CpuChipIcon, ArrowUpRightIcon, ArrowDownRightIcon, GlobeIcon } from './shared/icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#ef4444', '#f97316', '#a855f7', '#3b82f6', '#14b8a6'];

const getRiskColor = (score: number) => {
  if (score > 80) return 'text-red-400';
  if (score > 60) return 'text-orange-400';
  if (score > 40) return 'text-yellow-400';
  return 'text-green-400';
};

const getRiskBgColor = (score: number) => {
  if (score > 80) return 'bg-red-400';
  if (score > 60) return 'bg-orange-400';
  if (score > 40) return 'bg-yellow-400';
  return 'bg-green-400';
};

const getStatusColor = (status: Case['status']) => {
    switch (status) {
        case '公開済': return 'bg-sky-900 text-sky-300';
        case '査読中': return 'bg-yellow-900 text-yellow-300';
        case '未公開': return 'bg-slate-600 text-slate-300';
        case '採択済・未公開': return 'bg-purple-900 text-purple-300';
    }
}

interface DashboardProps {
    cases: Case[];
    loading: boolean;
    onSelectLlmProvider: (provider: string) => void;
    onSelectCase: (caseId: number) => void;
    isDemoMode: boolean;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
);

const StatCard: React.FC<{
  icon: React.ReactElement;
  label: string;
  value: string | number;
  trend: string;
  trendDirection: 'up' | 'down';
}> = ({ icon, label, value, trend, trendDirection }) => {
  const isUp = trendDirection === 'up';
  const trendColor = isUp ? 'text-green-400' : 'text-red-400';

  return (
    <Card>
      <div className="flex items-center">
        {icon}
        <div className="ml-4">
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
      <div className={`flex items-center text-xs mt-2 ${trendColor}`}>
        {isUp ? <ArrowUpRightIcon className="w-4 h-4 mr-1" /> : <ArrowDownRightIcon className="w-4 h-4 mr-1" />}
        <span>{trend}</span>
      </div>
    </Card>
  );
};


const Dashboard: React.FC<DashboardProps> = ({ cases, loading, onSelectLlmProvider, onSelectCase, isDemoMode }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [llmRiskData, setLlmRiskData] = useState<LlmProviderRisk[]>([]);
  const [traces, setTraces] = useState<Trace[]>([]);
  const [loadingDashboardData, setLoadingDashboardData] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoadingDashboardData(true);
      const [fetchedLlmRisks, fetchedTraces] = isDemoMode
        ? await Promise.all([getDemoLlmProviderRisks(), getDemoTraces()])
        : await Promise.all([getLlmProviderRisks(), getTraces()]);
      setLlmRiskData(fetchedLlmRisks);
      setTraces(fetchedTraces);
      setLoadingDashboardData(false);
    };
    fetchDashboardData();
  }, [isDemoMode]);

  const filteredCases = useMemo(() => {
    if (statusFilter === 'all') {
      return cases;
    }
    
    const status = statusFilter.split('-')[1];
    switch (status) {
        case 'published':
          return cases.filter(c => c.status === '公開済');
        case 'review':
          return cases.filter(c => c.status === '査読中');
        case 'accepted':
          return cases.filter(c => c.status === '採択済・未公開');
        default:
          return cases;
    }
  }, [statusFilter, cases]);

  const llmDistributionData = useMemo(() => {
    return llmRiskData
      .filter(risk => risk.name !== 'Google Search Index')
      .map(risk => ({
        name: risk.name,
        value: risk.traceCount
      }));
  }, [llmRiskData]);

  const topProvidersBySimilarity = useMemo(() => {
    if (traces.length === 0) return [];

    const maxSimilarityByProvider: { [key: string]: number } = {};

    traces.forEach(trace => {
      if (!maxSimilarityByProvider[trace.llmProvider] || trace.fingerprintSimilarity > maxSimilarityByProvider[trace.llmProvider]) {
        maxSimilarityByProvider[trace.llmProvider] = trace.fingerprintSimilarity;
      }
    });

    return Object.entries(maxSimilarityByProvider)
      .map(([name, maxSimilarity]) => ({ name, maxSimilarity }))
      .sort((a, b) => b.maxSimilarity - a.maxSimilarity)
      .slice(0, 5);
  }, [traces]);
  
  const handlePieClick = (data: any) => {
    if (data.name) {
      onSelectLlmProvider(data.name);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">セキュリティダッシュボード</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-tour-id="stat-cards">
        <StatCard 
          icon={<FolderIcon className="w-8 h-8 text-blue-400" />} 
          label="登録論文数" 
          value={loading ? '-' : cases.length} 
          trend="+5 last month"
          trendDirection="up"
        />
        <StatCard 
          icon={<ChartBarIcon className="w-8 h-8 text-orange-400" />} 
          label="高リスク論文" 
          value={loading ? '-' : cases.filter(c => c.riskScore > 80).length}
          trend="+2 last month"
          trendDirection="up"
        />
        <StatCard 
          icon={<AlertIcon className="w-8 h-8 text-red-400" />}
          label="要対応アクション"
          value={isDemoMode ? "3" : "0"}
          trend="-1 last week"
          trendDirection="down"
        />
        <StatCard 
          icon={<DollarIcon className="w-8 h-8 text-yellow-400" />}
          label="推定累積損害額"
          value={isDemoMode ? "¥2.1億" : "¥0"}
          trend="+1.5% last quarter"
          trendDirection="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">高リスク論文リスト</h2>
                <div className="flex space-x-1 bg-slate-700 p-1 rounded-lg">
                    <button onClick={() => setStatusFilter('all')} className={`px-2 py-1 text-xs rounded-md ${statusFilter === 'all' ? 'bg-blue-600' : ''}`}>全て</button>
                    <button onClick={() => setStatusFilter('status-published')} className={`px-2 py-1 text-xs rounded-md ${statusFilter === 'status-published' ? 'bg-blue-600' : ''}`}>公開済</button>
                    <button onClick={() => setStatusFilter('status-review')} className={`px-2 py-1 text-xs rounded-md ${statusFilter === 'status-review' ? 'bg-blue-600' : ''}`}>査読中</button>
                    <button onClick={() => setStatusFilter('status-accepted')} className={`px-2 py-1 text-xs rounded-md ${statusFilter === 'status-accepted' ? 'bg-blue-600' : ''}`}>採択済・未公開</button>
                </div>
            </div>
            <div className="overflow-x-auto" data-tour-id="high-risk-table">
              {loading ? <LoadingSpinner /> : (
                filteredCases.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <p className="font-semibold">表示する案件がありません。</p>
                    <p className="text-sm mt-1">「現状分析」から新しい案件を登録・調査してください。</p>
                  </div>
                ) : (
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-400 uppercase bg-slate-700">
                      <tr>
                        <th scope="col" className="px-4 py-3">論文ID</th>
                        <th scope="col" className="px-6 py-3">論文名</th>
                        <th scope="col" className="px-6 py-3">最終検出日</th>
                        <th scope="col" className="px-6 py-3">リスクスコア</th>
                        <th scope="col" className="px-6 py-3">ステータス</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCases.map((c) => (
                        <tr 
                          key={c.id} 
                          className="border-b border-slate-700 hover:bg-slate-700 active:bg-blue-900/60 cursor-pointer transition-colors"
                          onClick={() => onSelectCase(c.id)}
                        >
                          <td className="px-4 py-4 font-mono text-xs text-gray-400">CASE-{c.id.toString().padStart(3,'0')}</td>
                          <td className="px-6 py-4 font-medium">{c.title}</td>
                          <td className="px-6 py-4 text-gray-300">{c.lastDetectionDate}</td>
                          <td className="px-6 py-4 font-bold">
                            <div className="flex items-center">
                              <span className={`${getRiskColor(c.riskScore)} w-8`}>{c.riskScore}</span>
                              <div className="w-full bg-slate-600 rounded-full h-2">
                                <div className={`${getRiskBgColor(c.riskScore)} h-2 rounded-full`} style={{ width: `${c.riskScore}%` }}></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(c.status)}`}>{c.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
            </div>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold mb-4">リスク要因ランキング</h2>
            {loadingDashboardData ? <LoadingSpinner /> : (
            <ul className="space-y-2" data-tour-id="llm-risk-list">
                {llmRiskData.map((p) => (
                    <li 
                      key={p.name} 
                      onClick={() => {
                          if (p.name !== 'Google Search Index') {
                              onSelectLlmProvider(p.name);
                          }
                      }}
                      className={`p-2 rounded-md ${p.name !== 'Google Search Index' ? 'cursor-pointer hover:bg-slate-700' : 'cursor-default'} transition-colors bg-slate-700/50`}
                    >
                        <div className="flex justify-between items-center">
                            <p className="font-semibold text-sm flex items-center">
                                {p.name === 'Google Search Index'
                                    ? <GlobeIcon className="w-4 h-4 mr-2 text-yellow-400" />
                                    : <CpuChipIcon className="w-4 h-4 mr-2 text-blue-400" />}
                                <span className={p.name !== 'Google Search Index' ? 'hover:text-blue-400' : ''}>{p.name}</span>
                            </p>
                            <span className="text-xs text-blue-300 bg-blue-900/50 px-2 py-0.5 rounded-full">信頼度: {p.confidenceScore}%</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-1 pl-6">
                           {p.name === 'Google Search Index' ? (
                                <>
                                    <span title="著作物がWebに公開・インデックスされている件数">公開インデックス: {p.traceCount}件</span>
                                    <span className={p.highestRisk === 'High' ? 'text-red-400' : 'text-orange-400'}>リスク: {p.highestRisk}</span>
                                </>
                            ) : (
                                <>
                                    <span>痕跡: {p.traceCount}件</span>
                                    <span>累積SDA: {p.cumulativeSda}</span>
                                    <span className={p.highestRisk === 'High' ? 'text-red-400' : 'text-orange-400'}>最高: {p.highestRisk}</span>
                                </>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
            )}
          </Card>
          <Card>
            <h2 className="text-lg font-semibold mb-4">DP近似度トップ5 LLM</h2>
            {loadingDashboardData ? <LoadingSpinner /> : (
                topProvidersBySimilarity.length > 0 ? (
                    <ul className="space-y-3">
                        {topProvidersBySimilarity.map((p) => (
                            <li
                                key={p.name}
                                onClick={() => onSelectLlmProvider(p.name)}
                                className="p-3 rounded-md cursor-pointer hover:bg-slate-700 transition-colors bg-slate-700/50"
                            >
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-sm flex items-center">
                                        <CpuChipIcon className="w-4 h-4 mr-2 text-blue-400" />
                                        <span className="hover:text-blue-400">{p.name}</span>
                                    </p>
                                    <span className={`font-bold text-lg ${getRiskColor(p.maxSimilarity)}`}>{p.maxSimilarity}%</span>
                                </div>
                                <div className="w-full bg-slate-600 rounded-full h-2 mt-2">
                                    <div className={`${getRiskBgColor(p.maxSimilarity)} h-2 rounded-full`} style={{ width: `${p.maxSimilarity}%` }}></div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 text-sm text-center py-4">分析データがありません。</p>
                )
            )}
          </Card>
          <Card>
            <h2 className="text-lg font-semibold mb-4">LLM利用分布</h2>
            <div className="h-48">
              {loadingDashboardData ? <LoadingSpinner /> : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={llmDistributionData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={40}
                    outerRadius={60} 
                    fill="#8884d8"
                    paddingAngle={5}
                    onClick={handlePieClick}
                    className="cursor-pointer"
                  >
                    {llmDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155' }} />
                  <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
              </ResponsiveContainer>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;