import { OnboardingStep, View } from './types';

export const onboardingSteps: OnboardingStep[] = [
    {
        title: 'AIサイトセキュリティ診断へようこそ！',
        content: 'このツアーでは、AIによる著作物盗用リスクを管理し、知的財産を保護するための主要な機能をご紹介します。',
    },
    {
        selector: '[data-tour-id="sidebar-nav"]',
        title: 'メインナビゲーション',
        content: 'システムの主要な機能はここにあります。「ダッシュボード」から「現状分析」「法的評価」などへとアクセスできます。',
    },
    {
        selector: '[data-tour-id="stat-cards"]',
        title: 'ダッシュボード概要',
        content: 'ここでは、登録された全著作物のリスク状況を一目で把握できます。登録数、高リスク案件、対応が必要なアクションなどが表示されます。',
    },
    {
        selector: '[data-tour-id="llm-risk-list"]',
        title: 'LLM利用リスクランキング',
        content: 'システムが監視しているLLM（大規模言語モデル）のリスクをランキング形式で表示します。ここから特定のLLMを選択すると、関連する分析情報が表示されます。',
    },
    {
        selector: '[data-tour-id="high-risk-table"]',
        title: '高リスク論文リスト',
        content: '特に注意が必要な高リスク案件がここにリストアップされます。論文のステータス（公開済、査読中など）で絞り込むことも可能です。',
    },
    {
        navigateTo: View.Detection,
        selector: '[data-tour-id="new-investigation-panel"]',
        title: '現状分析: 新規調査',
        content: 'ここから新しい調査を開始します。PDFファイルをアップロードし、「詳細調査を開始」ボタンを押すと、AIエージェントによる分析が始まります。',
    },
    {
        selector: '[data-tour-id="agent-workspace"]',
        title: 'AIエージェント・ワークスペース',
        content: '調査が始まると、ここにAIエージェントの活動がリアルタイムで記録されます。調査が完了すると、この場所に詳細なレポートが表示されます。',
    },
    {
        navigateTo: View.Evaluation,
        selector: '[data-tour-id="risk-scoreboard"]',
        title: '法的評価',
        content: 'このステップでは、分析結果を基に法的なリスクスコアが算出されます。依拠性や類似性などの観点から、侵害の可能性を総合的に評価します。',
    },
    {
        selector: '[data-tour-id="damage-chart"]',
        title: '損害額シミュレーション',
        content: '万が一、著作権侵害が認められた場合の推定和解額と、訴訟に発展した場合の請求額の推移をシミュレーションします。',
    },
    {
        navigateTo: View.Reports,
        selector: '[data-tour-id="report-history"]',
        title: 'レポート一覧',
        content: '過去に生成したすべてのレポートがここに一覧表示されます。必要に応じて、いつでも再ダウンロードや内容の確認が可能です。',
    },
    {
        navigateTo: View.Legal,
        selector: '[data-tour-id="evidence-section"]',
        title: '証拠管理・法的措置',
        content: 'ここでは、案件ごとの監査証跡（タイムライン）を確認できます。裁判提出用の証拠一式をここからダウンロードします。',
    },
    {
        title: 'ツアーは以上です',
        content: 'これで主要な機能の紹介は完了です。自由にシステムを操作してみてください。もう一度ツアーをご覧になりたい場合は、サイドバーのヘルプボタンをクリックしてください。',
    },
];