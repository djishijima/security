
import { supabase } from './supabaseClient';
import { Case, Trace, LlmProviderRisk, GeneratedReport } from '../types';

// --- MOCK DATA FOR DEMO MODE ONLY ---

const mockCases: Case[] = [
    {
        id: 1,
        title: '深層学習を用いたタンパク質構造予測の精度向上',
        author: '田中 聡',
        journal: '人工知能学会論文誌',
        riskScore: 92,
        phase: 'III',
        status: '公開済',
        lastDetectionDate: '2024-07-21',
        llmProvider: 'GPT-4'
    },
    {
        id: 2,
        title: 'マルチエージェント強化学習における協調行動の創発',
        author: '佐藤 健一',
        journal: '応用物理学会論文誌',
        riskScore: 85,
        phase: 'II',
        status: '査読中',
        lastDetectionDate: '2024-07-19',
        llmProvider: 'Claude 3'
    },
    {
        id: 3,
        title: '量子アニーリングによる最適化問題の高速解法',
        author: '鈴木 裕子',
        journal: '日本分子生物学会年会',
        riskScore: 75,
        phase: 'IV',
        status: '公開済',
        lastDetectionDate: '2024-06-30',
        llmProvider: 'Gemini Advanced'
    },
    {
        id: 4,
        title: '細胞内シグナル伝達の確率的モデル',
        author: '伊藤 あゆみ',
        journal: '日本生物物理学会',
        riskScore: 68,
        phase: 'I',
        status: '採択済・未公開',
        lastDetectionDate: '2024-07-22',
        llmProvider: 'N/A'
    },
    {
        id: 5,
        title: 'Transformerモデルの解釈可能性に関する研究',
        author: '渡辺 雄大',
        journal: '人工知能学会論文誌',
        riskScore: 55,
        phase: 'II',
        status: '公開済',
        lastDetectionDate: '2024-07-15',
        llmProvider: 'GPT-4'
    },
    {
        id: 6,
        title: 'ゲノム編集技術CRISPR/Cas9のオフターゲット効果予測',
        author: '中村 美咲',
        journal: '日本分子生物学会年会',
        riskScore: 45,
        phase: 'I',
        status: '未公開',
        lastDetectionDate: '2024-07-20',
        llmProvider: 'N/A'
    },
];

const mockLlmProviderRisks: LlmProviderRisk[] = [
    { name: 'Google Search Index', traceCount: 150, cumulativeSda: 0, highestRisk: 'High', confidenceScore: 99 },
    { name: 'GPT-4', traceCount: 48, cumulativeSda: 85.2, highestRisk: 'High', confidenceScore: 95 },
    { name: 'Claude 3', traceCount: 32, cumulativeSda: 79.8, highestRisk: 'High', confidenceScore: 92 },
    { name: 'Gemini Advanced', traceCount: 25, cumulativeSda: 75.1, highestRisk: 'Medium', confidenceScore: 88 },
    { name: 'Llama 3', traceCount: 15, cumulativeSda: 68.4, highestRisk: 'Medium', confidenceScore: 85 },
    { name: 'Command R+', traceCount: 8, cumulativeSda: 62.5, highestRisk: 'Low', confidenceScore: 80 }
];

const mockTraces: Trace[] = [
    { id: 1, target: 'タンパク質構造予測モデル', fingerprintSimilarity: 88, structuralDependency: 92, paraphraseScore: 75, llmProvider: 'GPT-4' },
    { id: 2, target: '強化学習の報酬関数', fingerprintSimilarity: 82, structuralDependency: 85, paraphraseScore: 68, llmProvider: 'Claude 3' },
    { id: 3, target: '量子アニーリングのアルゴリズム', fingerprintSimilarity: 70, structuralDependency: 75, paraphraseScore: 80, llmProvider: 'Gemini Advanced' },
];

const mockReports: GeneratedReport[] = [
    { id: 'REP-2024-001', caseId: 1, caseTitle: '深層学習を用いたタンパク質構造予測の精度向上', riskScore: 92, llmProviders: ['GPT-4', 'Claude 3'], generatedAt: '2024-07-22 14:30', format: 'PDF', status: 'Archived', version: 2 },
    { id: 'REP-2024-002', caseId: 10, caseTitle: 'グラフニューラルネットワークの分子設計への応用', riskScore: 95, llmProviders: ['Gemini Advanced'], generatedAt: '2024-07-23 10:15', format: 'PDF', status: 'Archived', version: 1 },
];


// --- EXPLICIT DEMO DATA FUNCTIONS ---

export function getDemoCases(): Promise<Case[]> {
    console.log("Fetching DEMO cases...");
    return Promise.resolve(mockCases);
}

export function getDemoLlmProviderRisks(): Promise<LlmProviderRisk[]> {
    console.log("Fetching DEMO LLM risks...");
    return Promise.resolve(mockLlmProviderRisks);
}

export function getDemoTraces(): Promise<Trace[]> {
    console.log("Fetching DEMO traces...");
    return Promise.resolve(mockTraces);
}

export function getDemoReports(): Promise<GeneratedReport[]> {
    console.log("Fetching DEMO reports...");
    return new Promise(resolve => setTimeout(() => resolve(mockReports), 500));
}


// --- Supabase Data Mappers ---

const caseFromSupabase = (c: any): Case => ({
    id: c.id,
    title: c.title,
    author: c.author,
    journal: c.journal,
    riskScore: c.risk_score,
    phase: c.phase,
    status: c.status,
    lastDetectionDate: c.last_detection_date,
    llmProvider: c.llm_provider,
    createdAt: c.created_at,
});

const caseToSupabase = (c: Partial<Omit<Case, 'id' | 'createdAt'>>) => ({
    title: c.title,
    author: c.author,
    journal: c.journal,
    risk_score: c.riskScore,
    phase: c.phase,
    status: c.status,
    last_detection_date: c.lastDetectionDate,
    llm_provider: c.llmProvider,
});

const llmRiskFromSupabase = (r: any): LlmProviderRisk => ({
    name: r.name,
    traceCount: r.trace_count,
    cumulativeSda: r.cumulative_sda,
    highestRisk: r.highest_risk,
    confidenceScore: r.confidence_score,
});

const traceFromSupabase = (t: any): Trace => ({
    id: t.id,
    target: t.target,
    fingerprintSimilarity: t.fingerprint_similarity,
    structuralDependency: t.structural_dependency,
    paraphraseScore: t.paraphrase_score,
    llmProvider: t.llm_provider,
});

const reportFromSupabase = (r: any): GeneratedReport => ({
    id: r.id,
    caseTitle: r.case_title,
    caseId: r.case_id,
    riskScore: r.risk_score,
    llmProviders: r.llm_providers,
    generatedAt: r.generated_at,
    format: r.format,
    status: r.status,
    version: r.version,
});


// --- LIVE API FUNCTIONS (NO MOCK FALLBACKS) ---

export async function getCases(): Promise<Case[]> {
  console.log("Fetching LIVE cases from Supabase...");
  try {
    const { data, error, status } = await supabase.from('cases').select('*').order('id');
    if (error && status !== 406) throw error;
    return data ? data.map(caseFromSupabase) : [];
  } catch (error: any) {
    console.error(`Could not fetch 'cases' from Supabase. Returning empty array. Error: ${error.message}`);
    return [];
  }
}

export async function getCaseById(id: number): Promise<Case | null> {
    console.log(`Fetching LIVE case id=${id} from Supabase...`);
    try {
        const { data, error } = await supabase.from('cases').select('*').eq('id', id).single();
        if (error) throw error;
        return data ? caseFromSupabase(data) : null;
    } catch(error) {
        console.error(`Could not fetch case id=${id}. Error:`, error);
        return null;
    }
}

export async function getLlmProviderRisks(): Promise<LlmProviderRisk[]> {
  console.log("Fetching LIVE LLM risks from Supabase...");
  try {
    const { data, error, status } = await supabase.from('llm_provider_risks').select('*');
    if (error && status !== 406) throw error;
    return data ? data.map(llmRiskFromSupabase) : [];
  } catch (error: any) {
    console.error(`Could not fetch 'llm_provider_risks' from Supabase. Returning empty array. Error: ${error.message}`);
    return [];
  }
}

export async function getTraces(): Promise<Trace[]> {
  console.log("Fetching LIVE traces from Supabase...");
  try {
    const { data, error, status } = await supabase.from('traces').select('*').order('id');
    if (error && status !== 406) throw error;
    return data ? data.map(traceFromSupabase) : [];
  } catch (error: any) {
    console.error(`Could not fetch 'traces' from Supabase. Returning empty array. Error: ${error.message}`);
    return [];
  }
}

export async function getReports(): Promise<GeneratedReport[]> {
    console.log("Fetching LIVE reports from Supabase...");
    try {
        const { data, error, status } = await supabase.from('reports').select('*').order('generated_at', { ascending: false });
        if (error && status !== 406) throw error;
        return data ? data.map(reportFromSupabase) : [];
    } catch (error: any) {
        console.error(`Could not fetch 'reports' from Supabase. Returning empty array. Error: ${error.message}`);
        return [];
    }
}

export async function addReport(reportDetails: Omit<GeneratedReport, 'id' | 'generatedAt' | 'caseId'> & { caseId: number }): Promise<GeneratedReport> {
    const newReport: GeneratedReport = {
        ...reportDetails,
        id: `REP-2024-00${mockReports.length + 1}`,
        generatedAt: new Date().toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-'),
    };
    mockReports.unshift(newReport); 
    return new Promise(resolve => setTimeout(() => resolve(newReport), 500));
}

export async function addCase(newCase: Omit<Case, 'id' | 'createdAt' | 'lastDetectionDate'> & { lastDetectionDate?: string }): Promise<Case | null> {
    try {
        const caseToAdd = {
            ...newCase,
            lastDetectionDate: new Date().toISOString().split('T')[0]
        };
        const { data, error } = await supabase
            .from('cases')
            .insert([caseToSupabase(caseToAdd)])
            .select()
            .single();

        if (error) throw error;
        
        return data ? caseFromSupabase(data) : null;
    } catch(error: any) {
        console.error(`Could not add case to Supabase. Error: ${error.message}`);
        return null;
    }
}