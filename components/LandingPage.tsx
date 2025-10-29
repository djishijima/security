import React, { useState } from 'react';
import { ShieldCheckIcon, CpuChipIcon, DocumentMagnifyingGlassIcon, GlobeIcon, ArrowDownTrayIcon, ClipboardDocumentListIcon, ExclamationTriangleIcon, FolderIcon, ArrowLeftIcon, BuildingOfficeIcon } from './shared/icons';

const FeatureCard: React.FC<{ icon: React.ReactElement; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 text-center flex flex-col items-center h-full">
        <div className="bg-slate-700 p-3 rounded-full mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-slate-400 text-sm flex-grow">{children}</p>
    </div>
);

const StrengthCard: React.FC<{ icon: React.ReactElement; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 flex flex-col md:flex-row items-center text-center md:text-left">
        <div className="flex-shrink-0 bg-slate-700 p-4 rounded-full mb-4 md:mb-0 md:mr-6">
            {icon}
        </div>
        <div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-sm">{children}</p>
        </div>
    </div>
);

const LandingPage: React.FC<{ onStartDiagnosis: (domain: string) => void; }> = ({ onStartDiagnosis }) => {
    const [domain, setDomain] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedDomain = domain.trim();
        if (!trimmedDomain) {
            setError('診断するWebサイトのドメインを入力してください。');
            return;
        }
        // A simple regex to check for something that looks like a domain.
        if (!/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmedDomain)) {
            setError('有効なドメイン形式ではありません。（例: example.co.jp）');
            return;
        }
        setError('');
        onStartDiagnosis(trimmedDomain);
    };
    
    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8 text-center fade-in">
            <header className="mb-12">
                <h1 className="text-5xl font-extrabold text-white tracking-tight sm:text-6xl">
                    企業のWebサイトに潜む、<br />
                    <span className="text-blue-400">見えない脅威</span>をAIが可視化
                </h1>
                <p className="mt-6 max-w-3xl mx-auto text-lg text-slate-300">
                    ドメインを入力するだけで、意図しない情報漏洩、サーバーの脆弱性、そしてLLMへの学習データとしての不正利用リスクを即時診断します。
                </p>
                <form onSubmit={handleSubmit} className="mt-10 flex flex-col items-center">
                    <div className="relative w-full max-w-xl">
                        <GlobeIcon className="w-6 h-6 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="text"
                            value={domain}
                            onChange={(e) => setDomain(e.target.value)}
                            placeholder="example.co.jp"
                            className="w-full bg-slate-800 border-2 border-slate-600 rounded-lg py-4 pl-12 pr-40 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors glowing-input"
                            aria-label="診断するドメイン"
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md text-base transition-transform transform hover:scale-105"
                        >
                            無料診断を開始
                        </button>
                    </div>
                    {error && <p className="text-red-400 mt-3 text-sm">{error}</p>}
                </form>
            </header>

            <main>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<DocumentMagnifyingGlassIcon className="w-8 h-8 text-purple-400" />}
                        title="公開コンテンツの棚卸し"
                    >
                        検索エンジンにインデックスされているページやPDFをAIが自動で収集・分析。意図せず公開されている機密情報や個人情報を洗い出します。
                    </FeatureCard>
                    <FeatureCard
                        icon={<ShieldCheckIcon className="w-8 h-8 text-green-400" />}
                        title="サーバー脆弱性スキャン"
                    >
                        HTTPヘッダーやSSL/TLS設定など、外部から観測可能な情報に基づき、サーバーの一般的な脆弱性を診断。サイバー攻撃の足がかりを未然に防ぎます。
                    </FeatureCard>
                    <FeatureCard
                        icon={<CpuChipIcon className="w-8 h-8 text-orange-400" />}
                        title="LLM学習データ汚染リスク評価"
                    >
                        あなたのサイトのコンテンツが、主要な大規模言語モデル（LLM）の学習データとして無断で利用されている可能性を評価します。知的財産の流出を監視します。
                    </FeatureCard>
                </div>
            </main>
            
            <section id="company-info" className="mt-20 pt-10 border-t border-slate-700/50">
                 <header className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                        創業98年、ハッキング被害ゼロ。
                    </h1>
                    <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-blue-400 sm:text-4xl">
                        なぜ印刷会社がサイバーセキュリティに強いのか？
                    </h2>
                    <p className="mt-6 max-w-3xl mx-auto text-lg text-slate-300">
                        一見、無関係に見える「印刷」と「サイバーセキュリティ」。しかし、その根底に流れるのは、98年間変わることのない「情報を守り抜く」という私たちのDNAです。
                    </p>
                </header>

                <main className="space-y-8">
                    <StrengthCard
                        icon={<FolderIcon className="w-10 h-10 text-purple-400" />}
                        title="1. 40年以上にわたるデジタルデータ管理の歴史"
                    >
                        私たちのデータ管理は、約40年前、SONYのDAT（デジタルオーディオテープ）で顧客とデータをやり取りした時代にまで遡ります。DATからMD、CD、DVD-Rへ、そして現代のクラウドへ。媒体は変われど、「データを安全に保管する」という原則は変わりません。長年にわたり、外部ネットワークから隔離されたオフラインサーバーで重要データを管理してきた経験は、私たちのセキュリティポリシーの根幹を成しています。これは一夜にして生まれたものではなく、日本の商習慣の中で脈々と受け継がれてきた、データの取り扱いに関する哲学そのものなのです。
                    </StrengthCard>

                    <StrengthCard
                        icon={<ExclamationTriangleIcon className="w-10 h-10 text-orange-400" />}
                        title="2. 1文字のミスも許さない『完璧』を求める精度"
                    >
                        印刷の世界では、1文字の誤植が数千、数万部の印刷物をすべて無価値にしてしまいます。この「完璧さ」への執着が、私たちの品質管理の根幹です。同様に、サイバーセキュリティの世界でも、たった一つの設定ミスが致命的な情報漏洩に繋がります。私たちは、印刷の版下をチェックするのと同じ目で、システムの脆弱性を徹底的に洗い出します。
                    </StrengthCard>

                    <StrengthCard
                        icon={<ShieldCheckIcon className="w-10 h-10 text-green-400" />}
                        title="3. 98年間の歴史が証明する『信頼』"
                    >
                        私たちの最大の強みは、98年間、一度として大規模な情報漏洩やハッキング被害を出していないという事実です。これは偶然ではありません。時代が変わり、情報のかたちが変わっても、「お客様の資産を絶対に守る」という原則を決して曲げなかった結果です。この揺ぎない実績こそが、私たちのセキュリティサービスが信頼できる何よりの証左です。
                    </StrengthCard>
                </main>

                <div className="mt-16 text-left max-w-4xl mx-auto">
                    <h3 className="text-2xl font-bold text-center mb-8 text-white">会社概要</h3>
                    <div className="bg-slate-800/50 p-8 rounded-lg border border-slate-700 space-y-8">
                        
                        <div className="bg-slate-700/50 p-4 rounded-md border border-yellow-400/30">
                            <h4 className="font-bold text-lg text-yellow-300">経済産業大臣賞 受賞</h4>
                            <p className="text-sm text-slate-300 mt-2">
                                第15回 印刷産業環境優良工場表彰にて「経済産業大臣賞」を授賞。これは、企画・デザインから物流までワンストップで提供する、環境と技術に配慮した確かな実績の証です。
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="border-b border-slate-700">
                                        <td className="py-3 pr-4 font-semibold text-slate-400 whitespace-nowrap align-top">社名</td>
                                        <td className="py-3 text-white">文唱堂印刷株式会社</td>
                                    </tr>
                                    <tr className="border-b border-slate-700">
                                        <td className="py-3 pr-4 font-semibold text-slate-400 align-top">本社所在地</td>
                                        <td className="py-3 text-white">〒101-0025 東京都千代田区神田佐久間町3-37</td>
                                    </tr>
                                    <tr className="border-b border-slate-700">
                                        <td className="py-3 pr-4 font-semibold text-slate-400">創業</td>
                                        <td className="py-3 text-white">1927年6月25日</td>
                                    </tr>
                                    <tr className="border-b border-slate-700">
                                        <td className="py-3 pr-4 font-semibold text-slate-400">資本金</td>
                                        <td className="py-3 text-white">8,000万円（2023年6月現在）</td>
                                    </tr>
                                     <tr className="border-b border-slate-700">
                                        <td className="py-3 pr-4 font-semibold text-slate-400">代表者</td>
                                        <td className="py-3 text-white">代表取締役　橋本唱市</td>
                                    </tr>
                                    <tr>
                                        <td className="py-3 pr-4 font-semibold text-slate-400">ホームページ</td>
                                        <td className="py-3 text-white">
                                            <a href="https://www.b-p.co.jp/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                                                https://www.b-p.co.jp/
                                            </a>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div className="pt-6 border-t border-slate-700">
                             <div className="flex items-start">
                                <ShieldCheckIcon className="w-8 h-8 text-green-400 mr-4 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold text-lg text-slate-200">認定資格</p>
                                    <ul className="mt-2 space-y-2">
                                        <li>
                                            <p className="font-medium text-white">プライバシーマーク</p>
                                            <p className="text-sm text-slate-400">認定番号: 第10190033号</p>
                                        </li>
                                        <li className="pt-2">
                                            <p className="font-medium text-white">ISMS (ISO/IEC 27001)</p>
                                            <p className="text-sm text-slate-400">認証登録番号: IS 510950</p>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="mt-20 text-center">
                <p className="text-slate-400">
                    より詳細な分析や、継続的なモニタリングをご希望の法人様は、<br/>
                    デモシステムをご覧いただくか、
                    <a href="#company-info" className="text-blue-400 hover:underline mx-1">印刷会社がセキュリティに強い理由</a>
                    をご確認の上、<a href="https://form.b-p.co.jp/#/inquiry" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">お問い合わせフォーム</a>よりご相談ください。
                </p>
            </footer>
        </div>
    );
};

export default LandingPage;