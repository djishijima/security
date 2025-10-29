import React from 'react';
import { ShieldCheckIcon, ExclamationTriangleIcon, ArrowLeftIcon, FolderIcon } from './shared/icons';

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


const CompanyInfo: React.FC<{ onNavigateBack: () => void; }> = ({ onNavigateBack }) => {
    return (
        <div className="w-full max-w-5xl mx-auto px-4 py-12 text-white fade-in">
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

            <footer className="mt-16 text-center">
                <p className="text-slate-400 mb-6">
                    私たちのセキュリティサービスは、単なるITソリューションではありません。<br/>
                    98年の歴史で培った、情報保護への執念と責任感の結晶です。
                </p>
                <button
                    onClick={onNavigateBack}
                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    トップページに戻る
                </button>
            </footer>
        </div>
    );
};


export default CompanyInfo;