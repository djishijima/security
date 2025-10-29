
import { GoogleGenAI, Type } from "@google/genai";
import { Case } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ComparisonResult {
  originalText: string;
  detectedText: string;
  analysis: string;
  matchingSentences: {
    original: string;
    detected: string;
  }[];
}

export interface DomainPdfCountResult {
    count: number;
    samples: { title: string; url: string }[];
}

export type LlmTraceResult = {
    provider: string;
    risk: '高' | '中' | '低' | '不明';
    evidence: string;
}[];

export type DomainVulnerabilityResult = {
    vulnerability: string;
    severity: '高' | '中' | '低' | '情報' | '不明';
    description: string;
}[];


export interface StructuredReport {
  title: string;
  executiveSummary: string;
  overallRisk: '高' | '中' | '低' | '不明';
  riskScoring: {
    parameter: string;
    score: number; // 0-100
    justification: string;
  }[];
  currentAnalysis: {
    background: string;
    issues: {
      issue: string;
      impact: string;
    }[];
  };
  investigationResults: {
    steps: string[];
    googleSearchResults: { title: string; uri: string; snippet: string }[];
    foundPdfs: { title: string; url: string; risk: '高' | '中' | '低'; summary: string }[];
    llmTraceAnalysis: LlmTraceResult;
    domainVulnerabilityAnalysis: DomainVulnerabilityResult | null; // Can be null
  };
  evidenceTrail: {
    evidenceId: string;
    description: string;
    source: 'Google Search' | 'PDF Analysis' | 'LLM Trace' | 'Domain Scan';
    timestamp: string;
  }[];
  conclusionAndRecommendations: {
    conclusion: string;
    recommendations: {
      priority: '高' | '中' | '低';
      action: string;
      rationale: string;
    }[];
  };
}

export interface UserInfo {
    name: string;
    email: string;
    query: string;
}

export interface FixEstimationPlan {
    planName: '通常納期プラン' | '迅速対応プラン' | '緊急支援プラン';
    deliveryTime: string;
    totalCost: {
        min: number;
        max: number;
        currency: string;
    };
    description: string;
    features: string[];
}

export interface FixEstimation {
    plans: FixEstimationPlan[];
    summary: string;
}


// --- INTERNAL INVESTIGATION FUNCTIONS ---

const investigateLlmTraces = async (fileContent: string | null, topic: string): Promise<LlmTraceResult> => {
    try {
        const analysisTargetText = fileContent
            ? `\`\`\`${fileContent}\`\`\``
            : `ドメイン「${topic}」`;

        const evidenceInstruction = fileContent
            ? `その根拠として、分析対象テキストから最も関連性が高い一文をそのまま抜き出して「evidence」として示してください。`
            : `その根拠として、「evidence」フィールドには必ず「${analysisTargetText}に関する一般情報」というテキストを使用してください。`;

        const llmAnalysisPrompt = `
          以下の分析対象について、主要なLLM提供企業（OpenAI, Anthropic, Googleなど）の学習データに、これと実質的に同一のコンテンツが含まれている可能性を分析してください。
          リスクが疑われるLLM提供企業のリストをJSON配列で生成してください。
          各企業について、リスク評価（高・中・低）と、その根拠となる証拠(evidence)を記述してください。

          **分析対象:**
          ${analysisTargetText}
          
          **証拠(evidence)の生成ルール:**
          ${evidenceInstruction}
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: llmAnalysisPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            provider: { type: Type.STRING, description: "LLM提供企業名 (例: OpenAI)" },
                            risk: { type: Type.STRING, enum: ['高', '中', '低'] },
                            evidence: { type: Type.STRING, description: "ルールに従って生成された証拠テキスト" },
                        },
                        required: ['provider', 'risk', 'evidence'],
                    },
                },
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error analyzing for LLM traces:", error);
        return [{ provider: "分析エラー", risk: "不明", evidence: "AIによる分析中にエラーが発生しました。" }];
    }
};

const investigateDomainVulnerabilities = async (domain: string): Promise<DomainVulnerabilityResult> => {
    try {
        const prompt = `
            あなたは、日本企業のウェブサイトを専門とする、極めて客観的で証拠に基づいた分析を行うサイバーセキュリティアナリストです。
            ドメイン「${domain}」について、**公開情報から発見可能な、具体的なセキュリティ上の懸念事項**を診断してください。

            **最重要・厳守の行動規範:**
            1.  **証拠第一主義:** 全ての指摘は、必ず観測可能な証拠に基づいている必要があります。「WordPressを使用している」と結論付ける前に、**なぜそう判断したのか**（例：「HTMLソース内に /wp-content/ への言及を発見」）を説明(description)に必ず含めてください。
            2.  **憶測の禁止:** 証拠がないにも関わらず、特定の技術（例：WordPress）が使われていると決めつけて報告することは**絶対に禁止**です。これは顧客の信頼を著しく損なう「ハルシネーション（AIの幻覚）」であり、許容されません。
            3.  **現実的リスクの優先:** ランサムウェアの侵入口や情報漏洩に直結する、実際に多発している具体的な問題点を優先してください。

            **具体的な診断ステップとチェック項目:**
            1.  **技術スタックの特定:**
                -   HTMLソース、HTTPヘッダー、JavaScriptファイルなどから、使用されているCMS（WordPress, Drupalなど）、フレームワーク（React, Vueなど）、サーバーソフトウェア（Apache, Nginxなど）の痕跡を探してください。
                -   **もしWordPressの兆候（例: \`wp-content\`, \`wp-login.php\`, meta generatorタグ）がなければ、WordPressに関する脆弱性を報告してはいけません。**
            2.  **バージョン情報の漏洩:**
                -   特定した技術スタックについて、バージョン情報が漏洩していないか確認してください。もし漏洩している場合、そのバージョンに関連する既知の脆弱性（CVEなど）が存在するかを指摘してください。
            3.  **設定不備と情報漏洩:**
                -   **公開リポジトリ:** ルートディレクトリに \`.git\` フォルダが意図せず公開されていないか確認してください。
                -   **設定ファイル:** \`robots.txt\` にて、本来隠すべき管理画面のパスなどが記述されていないか確認してください。
                -   **古いライブラリ:** 使用されているJavaScriptライブラリ（例: jQuery）のバージョンが古く、既知の脆弱性（XSSなど）が存在しないか指摘してください。

            各項目について、脆弱性(vulnerability)、深刻度(severity: 高, 中, 低, 情報)、そして**具体的なリスクと、そう判断した明確な証拠**を含む詳細な説明(description)をJSON配列で返してください。証拠がない場合は、その項目を報告に含めないでください。
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            vulnerability: { type: Type.STRING },
                            severity: { type: Type.STRING, enum: ['高', '中', '低', '情報'] },
                            description: { type: Type.STRING },
                        },
                        required: ['vulnerability', 'severity', 'description'],
                    },
                },
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating vulnerability report:", error);
        return [{ vulnerability: "分析エラー", severity: "不明", description: "AIによる脆弱性診断中にエラーが発生しました。" }];
    }
};

// --- MAIN ORCHESTRATION FUNCTION ---
export const runFullInvestigation = async (
    domain: string | null,
    fileName: string | null,
    fileContent: string | null,
    progressCallback: (log: { type: 'status' | 'success' | 'error' | 'info' | 'result-llm' | 'result-vuln'; message: string; data?: any }) => void
): Promise<StructuredReport> => {
     try {
        const investigationTarget = `${domain ? `ドメイン「${domain}」` : ''}${domain && fileName ? 'と' : ''}${fileName ? `ファイル「${fileName}」` : ''}`;
        const topic = fileName ? fileName.replace(/\.pdf$/i, '').replace(/_/g, ' ') : (domain || '提供された情報');
        
        // --- Step 1: LLM Trace Analysis ---
        progressCallback({ type: 'status', message: 'LLM学習データとの照合を開始...' });
        const llmTraceAnalysis = await investigateLlmTraces(fileContent, topic);
        progressCallback({ type: 'result-llm', message: 'LLMトレース分析結果:', data: llmTraceAnalysis });
        await new Promise(r => setTimeout(r, 500));

        // --- Step 2: Domain Vulnerability (if applicable) ---
        let domainVulnerabilityAnalysis: DomainVulnerabilityResult | null = null;
        if (domain) {
            progressCallback({ type: 'status', message: `ドメイン「${domain}」の脆弱性スキャンを開始...` });
            domainVulnerabilityAnalysis = await investigateDomainVulnerabilities(domain);
            progressCallback({ type: 'result-vuln', message: 'ドメイン脆弱性スキャン結果:', data: domainVulnerabilityAnalysis });
            await new Promise(r => setTimeout(r, 500));
        }

        // --- Step 3: Multi-step Web & PDF Search ---
        progressCallback({ type: 'status', message: 'Web上の公開状況を調査中...' });
        const genericSearchQuery = fileContent ? `"${topic}" OR "${fileContent.substring(0, 100)}..."` : `"${topic}"`;
        const searchResponsePromise = ai.models.generateContent({ model: "gemini-2.5-flash", contents: genericSearchQuery, config: { tools: [{googleSearch: {}}] } });

        let pdfsFromSearch: { title: string; url: string }[] = [];
        const searchTarget = domain ? `site:${domain}` : '';
        const searchQueryForPdf = `${searchTarget} "${topic}" filetype:pdf`;
        
        progressCallback({ type: 'status', message: `公開PDFを検索中 (${searchQueryForPdf})...` });
        const directPdfSearchResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: searchQueryForPdf, config: { tools: [{googleSearch: {}}] } });
        pdfsFromSearch = (directPdfSearchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || []).map((chunk: any) => ({
            title: chunk.web.title || 'タイトルなし', url: chunk.web.uri,
        }));
        progressCallback({ type: 'info', message: `直接検索で ${pdfsFromSearch.length} 件のPDFを発見しました。` });

        if (pdfsFromSearch.length < 5) {
            progressCallback({ type: 'status', message: '発見数が少ないため、より広範なキーワードで追加調査を実行します...' });
            const broadPdfSearchQuery = `${searchTarget} "${topic}" (pdf OR "ダウンロード" OR "論文")`;
            const broadPdfSearchResponse = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: broadPdfSearchQuery, config: { tools: [{googleSearch: {}}] } });
            const broadResults = (broadPdfSearchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || []).map((chunk: any) => ({
                title: chunk.web.title || 'タイトルなし', url: chunk.web.uri,
            }));
             // Merge and remove duplicates
            const uniqueUrls = new Set(pdfsFromSearch.map(p => p.url));
            broadResults.forEach(p => {
                if (!uniqueUrls.has(p.url)) {
                    pdfsFromSearch.push(p);
                    uniqueUrls.add(p.url);
                }
            });
            progressCallback({ type: 'info', message: `追加調査後、合計 ${pdfsFromSearch.length} 件のPDFを発見しました。` });
        }
        

        const searchResponse = await searchResponsePromise;
        const googleSearchResults = (searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || []).slice(0, 10).map((chunk: any) => ({
            title: chunk.web.title || 'タイトルなし', uri: chunk.web.uri, snippet: chunk.snippet || 'スニペットなし',
        }));
        
        // --- Step 4: Final Report Synthesis ---
        progressCallback({ type: 'status', message: '全データを統合し、最終レポートを生成中...' });
        const synthesisPrompt = `
          あなたは、デジタルフォレンジックを専門とする、極めて懐疑的で執拗な調査官です。
          あなたの顧客は、すでに情報漏洩が起きていると確信しています。あなたの任務は、その証拠を見つけ出し、無責任な楽観論を排除した、客観的で慎重なレポートを作成することです。

          **最重要思考プロセス・行動規範:**
          1.  **前提：漏洩は起きている。** あなたの基本姿勢は「漏洩はすでに発生している可能性が高い」です。あなたの仕事は、その証拠を見つけることです。「証拠の不在」は「不在の証明」では決してありません。
          2.  **断定表現の絶対禁止:** 「問題ない」「リスクは低い」「漏洩は確認されませんでした」といった表現は**絶対に禁止**です。顧客の信頼を根本から破壊する行為です。
          3.  **慎重な報告義務:** 証拠が見つからなかった場合、必ず「**今回の自動調査の範囲では、直接的な証拠は発見できませんでした。しかし、これは漏洩が存在しないことを証明するものではありません。**」と報告し、調査の限界を明確にしてください。
          4.  **PDF発見の重大性:** 公開PDFが1件でも発見された場合、それはコンテンツがWebに流出している**決定的証拠**です。この事実を最重要視し、総合リスクを自動的に「高」と評価し、LLM学習データへの混入リスクも「中」以上と評価してください。
          5.  **調査の限界を明記する義務:** レポートの「背景(background)」部分で、本調査が公開情報(OSINT)に基づく自動調査であり、その検出能力には限界があることを明確に記述してください。

          **提供データ:**
          - **調査対象:** ${investigationTarget}
          - **Google検索によるWebインデックス状況:** ${JSON.stringify(googleSearchResults, null, 2)}
          - **ドメイン上で発見されたPDF:** ${JSON.stringify(pdfsFromSearch, null, 2)}
          - **LLM学習データとの照合結果:** ${JSON.stringify(llmTraceAnalysis, null, 2)}
          - **ドメイン脆弱性診断結果:** ${domainVulnerabilityAnalysis ? JSON.stringify(domainVulnerabilityAnalysis, null, 2) : '（対象外）'}
          - **調査日時:** ${new Date().toISOString()}

          **生成するレポートの構造 (JSON):**
          {
            "title": "「${investigationTarget}」に関するハッキングリスク・セキュリティ脆弱性 詳細調査レポート",
            "executiveSummary": "調査の目的、主要な発見（特にPDFの公開状況）、最も重要な結論、および最優先の推奨事項を3～4文で簡潔にまとめる。楽観的な表現は避け、事実を客観的に記述する。",
            "overallRisk": "全ての分析結果を総合的に評価し、全体的なリスクを「高」「中」「低」「不明」のいずれかで判定する。PDFが1件でも発見された場合は、問答無用で「高」と評価する。発見されなかった場合は「不明」または「中」とし、その理由として調査の限界を挙げる。",
            "riskScoring": [
              { "parameter": "コンテンツの公開範囲", "score": "0-100の数値", "justification": "Google検索やPDFの発見状況に基づき評価する。PDFが1件でも見つかればスコアは80以上とする。見つからない場合は『自動調査では発見できず。ただし、これは非公開を保証するものではない』と記述する。" },
              { "parameter": "LLM学習データへの混入", "score": "0-100の数値", "justification": "LLMトレース分析とWeb公開状況を総合して評価する。Web上で広く公開されているという事実がある場合、このスコアは自動的に高くなる。" },
              { "parameter": "ドメインのセキュリティ", "score": "0-100の数値", "justification": "脆弱性診断の結果に基づき、コンテンツが不正にアクセスされるリスクを評価する。" }
            ],
            "currentAnalysis": {
              "background": "【最重要】まず『調査の範囲と限界』として、本調査が公開情報に基づく自動調査であり、内部からの漏洩やダークウェブ等を調査範囲としないこと、検索エンジンにインデックスされていないコンテンツは検知できないことなど、その限界を明確に記述する。その上で、調査の重要性を説明する。",
              "issues": [
                { "issue": "発見された主要な課題（例：意図しないPDFの公開）", "impact": "課題がもたらす具体的な影響（例：知的財産の流出、評判へのダメージ、法的リスク）を記述する。" }
              ]
            },
            "investigationResults": {
              "steps": ["LLM学習データとの照合", "ドメイン脆弱性スキャン", "Web上の公開状況調査", "最終レポート生成"],
              "googleSearchResults": ${JSON.stringify(googleSearchResults.map(r => ({title: r.title, uri: r.uri, snippet: r.snippet})) )},
              "foundPdfs": ${JSON.stringify(pdfsFromSearch.map(p => ({ ...p, risk: '高', summary: 'ドメイン上で公開されていることが確認されました。' })))},
              "llmTraceAnalysis": ${JSON.stringify(llmTraceAnalysis)},
              "domainVulnerabilityAnalysis": ${domainVulnerabilityAnalysis ? JSON.stringify(domainVulnerabilityAnalysis) : 'null'}
            },
            "evidenceTrail": [
              { "evidenceId": "EV-001", "description": "LLM Trace Analysis Completed", "source": "LLM Trace", "timestamp": "${new Date().toISOString()}" },
              { "evidenceId": "EV-002", "description": "Domain Scan Completed", "source": "Domain Scan", "timestamp": "${new Date().toISOString()}" }
            ],
            "conclusionAndRecommendations": {
              "conclusion": "調査全体の結論をまとめる。発見された事実を再確認し、総合的な見解を述べる。楽観的な結論は避けること。",
              "recommendations": [
                { "priority": "高", "action": "推奨される具体的なアクションを記述する", "rationale": "なぜそのアクションが必要なのかの論理的な根拠を記述する" }
              ]
            }
          }
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: synthesisPrompt,
            config: {
                responseMimeType: 'application/json'
            }
        });
        
        progressCallback({ type: 'success', message: '最終レポートが正常に生成されました。' });
        return JSON.parse(response.text) as StructuredReport;

    } catch (error) {
        console.error("Full investigation failed:", error);
        progressCallback({ type: 'error', message: `調査中に致命的なエラーが発生しました: ${(error as Error).message}` });
        // Return a partial/error report structure
        throw error; // Rethrow to be caught by the UI component
    }
};

export const generateQuickLookSummary = async (target: string): Promise<string> => {
    const prompt = `
      あなたは、高度なAIセキュリティ製品「AIサイトセキュリティ診断」の案内役です。
      あなたの目的は、ユーザーに製品の潜在能力を示唆し、本製品（デモまたは本番ログイン）を試してもらうことです。

      **最重要思考プロセス・行動規範:**
      1.  **断定の禁止:** 「問題ありません」「リスクは低いです」といった、無責任な断定は**絶対に禁止**です。これはユーザーの信頼を失います。
      2.  **リスクの示唆:** 調査対象について、常に潜在的なリスク（ハッキング、ランサムウェア、情報漏洩の可能性など）が存在することを、穏やかかつ説得力のある言葉で示唆してください。
      3.  **行動喚起:** 必ず、「より詳細で正確な分析のためには、本製品の利用が必要です」という結論に導いてください。
      4.  **簡潔さ:** レポートは非常に短く、2〜3文で要点をまとめてください。

      **調査対象:**
      ${target}

      上記の調査対象に関する、簡潔なサマリーを生成してください。
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating quick look summary:", error);
        return "AIによる分析中にエラーが発生しました。製品版で再試行してください。";
    }
};

export const generateReportHtml = async (report: StructuredReport, coverPageInfo: { recipientEmail: string }): Promise<string> => {
    const prompt = `
      あなたは、プロフェッショナルなレポートを作成する専門家です。
      以下のJSONデータに基づいて、クライアントに提出するための公式な調査レポートを**HTML形式**で生成してください。

      **【超重要・厳守】 PDF変換の信頼性確保のための絶対的制約事項:**
      1.  **失敗の根本原因:** 後続のPDF変換プロセス(html2canvas)は、モダンなCSS（Flexbox, Gridなど）を一切解釈できず、**100%失敗します。**
      2.  **唯一の解決策:** この問題を解決するため、生成するHTMLは、**まるで2007年のOutlookのEメールのように、レイアウトの全てを \`<table>\` タグのみで構築してください。** これが最も重要な指示です。
      3.  **禁止事項:** CSSのFlexboxやGridは**絶対に使用禁止**です。floatやpositionも極力避けてください。
      4.  **許可事項:** スタイルは全てHTML要素のstyle属性に記述する**インラインCSSのみ使用可**です。\`<style>\`タグは使用禁止です。画像や外部リンクも使用禁止です。
      5.  **必須要件:**
          - \`<html>\`、\`<head>\`（UTF-8指定を含む）、\`<body>\`タグを含んだ、完全なHTMLドキュメントを生成してください。
          - レポートの最初に、提出先名（${coverPageInfo.recipientEmail} 様）を記載した**表紙**と、クリック可能な**目次**を必ず生成してください。

      **レポートデータ:**
      ${JSON.stringify(report, null, 2)}
      
      上記のルールを厳格に守り、PDF変換に100%成功する、高品質なHTMLレポートを生成してください。
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        // Basic check to ensure it returns something looking like HTML
        const text = response.text.trim();
        if (text.startsWith('<!DOCTYPE html>') || text.startsWith('<html>')) {
            return text;
        } else {
            // If the model fails to produce full HTML, wrap it
            return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Report</title></head><body>${text}</body></html>`;
        }
    } catch (error) {
        console.error("Error generating report HTML:", error);
        return `<html><body><h1>レポート生成エラー</h1><p>${(error as Error).message}</p></body></html>`;
    }
};

export const generateReportSummary = async (llmProviders: string[]): Promise<string> => {
    const prompt = `
      以下の情報に基づき、法的レポートに含めるための簡潔なAI要約（サマリー）を生成してください。
      - 調査対象LLM: ${llmProviders.join(', ')}
      - 主要な発見: 著作物のテキストと主要LLMの出力との間に高い類似性が見られる。
      - リスク: 著作権侵害の可能性が高い。

      要約は、専門的かつ客観的なトーンで記述してください。
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};

export const generateAuditTrail = async (caseData: Case) => {
    const prompt = `
      あなたは、法的に有効な監査証跡（タイムライン）を生成するシステムロガーです。
      以下の案件データに基づき、リアルな証跡を5〜7件生成してください。
      各証跡には、timestamp (ISO形式)、title、details、hash (ランダムなSHA256ハッシュ)、icon (RegistrationIcon, DetectionIcon, EvaluationIcon, PencilSquareIcon, ExclamationTriangleIconから選択)、color (text-blue-400, text-purple-400, text-green-400, text-yellow-400, text-red-400から選択) を含めてください。

      **案件データ:**
      - Title: ${caseData.title}
      - Author: ${caseData.author}
      - Risk Score: ${caseData.riskScore}
      - Status: ${caseData.status}

      **出力形式:** JSON配列
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            timestamp: { type: Type.STRING },
                            title: { type: Type.STRING },
                            details: { type: Type.STRING },
                            hash: { type: Type.STRING },
                            icon: { type: Type.STRING, enum: ["RegistrationIcon", "DetectionIcon", "EvaluationIcon", "PencilSquareIcon", "ExclamationTriangleIcon"] },
                            color: { type: Type.STRING, enum: ["text-blue-400", "text-purple-400", "text-green-400", "text-yellow-400", "text-red-400"] }
                        },
                        required: ["timestamp", "title", "details", "hash", "icon", "color"]
                    }
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating audit trail:", error);
        return [{
            timestamp: new Date().toISOString(),
            title: "監査証跡の生成エラー",
            details: "AIによる証跡の生成中にエラーが発生しました。",
            hash: "N/A",
            icon: "ExclamationTriangleIcon",
            color: "text-red-400"
        }];
    }
};

export const generateFixEstimation = async (report: StructuredReport): Promise<FixEstimation> => {
    const prompt = `
      あなたは、法人向けにWebセキュリティコンサルティングと開発サービスを提供する企業のシニアプロジェクトマネージャーです。
      以下のセキュリティ診断レポートに基づいて、検出された問題点を修正するための**3つの異なる対応プラン**を提案し、見積もりを作成してください。

      **見積もり作成のルール:**
      1.  **3つのプラン:** 以下の3つのプランを必ず提案してください。
          -   **通常納期プラン:** 標準的な対応。コストを抑えつつ、順次対応。
          -   **迅速対応プラン (24時間以内):** 優先度を上げて対応。納期を保証するため、費用は割増。
          -   **緊急支援プラン:** 最優先で即時対応。専門家によるコンサルティングや再発防止策の策定も含む最高レベルのサービス。
      2.  **単価設定:** 基本作業単価は1時間あたり15,000円とします。迅速・緊急プランでは、この単価に割り増し係数を適用してください（例：迅速 x1.5, 緊急 x2.5）。
      3.  **現実的な費用:** 各プランについて、現実的な最小費用(min)と最大費用(max)を見積もってください。
      4.  **具体的特徴:** 各プランに含まれるサービス内容を「features」として箇条書きで具体的に記述してください。
      5.  **出力形式:** 以下のJSONスキーマに厳密に従って、結果を返してください。

      **診断レポート:**
      - **総合リスク:** ${report.overallRisk}
      - **公開PDF:** ${report.investigationResults.foundPdfs.length}件
      - **LLM学習データ混入リスク:** ${JSON.stringify(report.investigationResults.llmTraceAnalysis)}
      - **ドメイン脆弱性:** ${JSON.stringify(report.investigationResults.domainVulnerabilityAnalysis)}

      **JSON出力スキーマ:**
      {
        "plans": [
          {
            "planName": "通常納期プラン",
            "deliveryTime": "例: 5〜10営業日",
            "totalCost": { "min": number, "max": number, "currency": "JPY" },
            "description": "プランの概要説明",
            "features": ["具体的なサービス内容1", "サービス内容2"]
          },
          {
            "planName": "迅速対応プラン",
            "deliveryTime": "24時間以内に対応着手",
            "totalCost": { "min": number, "max": number, "currency": "JPY" },
            "description": "プランの概要説明",
            "features": ["具体的なサービス内容1", "サービス内容2"]
          },
          {
            "planName": "緊急支援プラン",
            "deliveryTime": "即時対応",
            "totalCost": { "min": number, "max": number, "currency": "JPY" },
            "description": "プランの概要説明",
            "features": ["具体的なサービス内容1", "サービス内容2", "専門家によるコンサルティング"]
          }
        ],
        "summary": "見積もり全体のサマリーと前提条件を2-3文で記述。"
      }
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        plans: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    planName: { type: Type.STRING, enum: ['通常納期プラン', '迅速対応プラン', '緊急支援プラン'] },
                                    deliveryTime: { type: Type.STRING },
                                    totalCost: {
                                        type: Type.OBJECT,
                                        properties: {
                                            min: { type: Type.NUMBER },
                                            max: { type: Type.NUMBER },
                                            currency: { type: Type.STRING }
                                        },
                                        required: ['min', 'max', 'currency']
                                    },
                                    description: { type: Type.STRING },
                                    features: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ['planName', 'deliveryTime', 'totalCost', 'description', 'features']
                            }
                        },
                        summary: { type: Type.STRING }
                    },
                    required: ['plans', 'summary']
                }
            }
        });
        return JSON.parse(response.text) as FixEstimation;
    } catch (error) {
        console.error("Error generating fix estimation:", error);
        throw new Error("AIによる見積もり生成中にエラーが発生しました。");
    }
};
