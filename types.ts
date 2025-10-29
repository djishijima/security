
export enum View {
  LandingPage = 'landing_page',
  Dashboard = 'dashboard',
  Detection = 'detection',
  Evaluation = 'evaluation',
  Reports = 'reports',
  Legal = 'legal',
  Settings = 'settings',
  QuickInvestigation = 'quick_investigation',
  Inquiry = 'inquiry',
}

export interface Case {
  id: number;
  title: string;
  author: string;
  journal: string;
  riskScore: number;
  phase: 'I' | 'II' | 'III' | 'IV';
  status: '公開済' | '査読中' | '未公開' | '採択済・未公開';
  lastDetectionDate: string;
  llmProvider?: string;
  createdAt?: string;
}

export interface Trace {
  id: number;
  target: string;
  fingerprintSimilarity: number;
  structuralDependency: number;
  paraphraseScore: number;
  llmProvider: string;
}

export interface LlmProviderRisk {
  name: string;
  traceCount: number;
  cumulativeSda: number;
  highestRisk: 'High' | 'Medium' | 'Low';
  confidenceScore: number;
}

export interface ExtractionStatus {
  success: boolean;
  errorMessage?: string;
}

export interface ExtractedMetadata {
  fileName: string;
  title: { value: string; status: ExtractionStatus };
  authors: { value: string; status: ExtractionStatus };
  doi: { value: string; status: ExtractionStatus };
  publicationDate: { value: string; status: ExtractionStatus };
  journal: { value: string; status: ExtractionStatus };
}

export interface OnboardingStep {
  selector?: string;
  title: string;
  content: string;
  navigateTo?: View;
}

export interface GeneratedReport {
  id: string;
  caseTitle: string;
  caseId: number;
  riskScore: number;
  llmProviders: string[];
  generatedAt: string;
  format: 'PDF' | 'XML';
  status: 'Archived' | 'Pending Review';
  version: number;
}