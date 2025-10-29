import React from 'react';
import { View } from '../types';
import { DashboardIcon, DetectionIcon, EvaluationIcon, ShieldIcon, QuestionMarkCircleIcon, ClipboardDocumentListIcon, GavelIcon, CogIcon, MagnifyingGlassPlusIcon, ArrowRightOnRectangleIcon, EnvelopeIcon, HomeIcon } from './shared/icons';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  restartTour: () => void;
  isLoggedIn: boolean;
  isDemoMode: boolean;
  onInquiry: () => void;
  onLogout: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactElement;
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}> = ({ icon, label, isActive, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg ${
      isActive
        ? 'bg-blue-600 text-white'
        : disabled
        ? 'text-gray-500 cursor-not-allowed'
        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
    }`}
  >
    {icon}
    <span className="ml-3">{label}</span>
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, restartTour, isLoggedIn, isDemoMode, onInquiry, onLogout }) => {
  return (
    <aside className="w-64 bg-slate-800 text-white flex flex-col p-4 border-r border-slate-700">
      <div className="flex items-center mb-8 px-2">
        <ShieldIcon className="w-8 h-8 text-blue-400" />
        <h1 className="text-xl font-bold ml-2">AIサイトセキュリティ診断</h1>
      </div>
      
      {isLoggedIn ? (
        <>
          <nav className="flex flex-col space-y-2" data-tour-id="sidebar-nav">
            <NavItem
              icon={<DashboardIcon className="w-5 h-5" />}
              label="ダッシュボード"
              isActive={activeView === View.Dashboard}
              onClick={() => setActiveView(View.Dashboard)}
            />
            <NavItem
              icon={<DetectionIcon className="w-5 h-5" />}
              label="現状分析"
              isActive={activeView === View.Detection}
              onClick={() => setActiveView(View.Detection)}
            />
            <NavItem
              icon={<EvaluationIcon className="w-5 h-5" />}
              label="法的評価"
              isActive={activeView === View.Evaluation}
              onClick={() => setActiveView(View.Evaluation)}
            />
            <NavItem
              icon={<ClipboardDocumentListIcon className="w-5 h-5" />}
              label="レポート一覧"
              isActive={activeView === View.Reports}
              onClick={() => setActiveView(View.Reports)}
            />
            <NavItem
              icon={<GavelIcon className="w-5 h-5" />}
              label="証拠管理・法的措置"
              isActive={activeView === View.Legal}
              onClick={() => setActiveView(View.Legal)}
            />
          </nav>
          <div className="mt-auto pt-4 border-t border-slate-700">
            <button
                onClick={() => setActiveView(View.Settings)}
                className={`flex items-center w-full px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg mb-2 ${
                  activeView === View.Settings
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <CogIcon className="w-5 h-5" />
                <span className="ml-3">設定</span>
              </button>
            <button
                onClick={restartTour}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-400 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
              >
                <QuestionMarkCircleIcon className="w-5 h-5" />
                <span className="ml-3">ツアーを再開</span>
              </button>
             <button
                onClick={onLogout}
                className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-400 hover:bg-slate-700 hover:text-white rounded-lg transition-colors mt-2"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span className="ml-3">{isDemoMode ? 'デモシステムを終了' : 'ログアウト'}</span>
              </button>
          </div>
        </>
      ) : (
        <>
          <nav className="flex flex-col space-y-2">
             <NavItem
              icon={<HomeIcon className="w-5 h-5" />}
              label="ホーム"
              isActive={activeView === View.LandingPage}
              onClick={() => setActiveView(View.LandingPage)}
            />
             <NavItem
              icon={<MagnifyingGlassPlusIcon className="w-5 h-5" />}
              label="セキュリティ診断"
              isActive={activeView === View.QuickInvestigation || activeView === View.Detection}
              onClick={() => setActiveView(View.QuickInvestigation)}
            />
             <NavItem
              icon={<EnvelopeIcon className="w-5 h-5" />}
              label="お問い合わせ"
              isActive={activeView === View.Inquiry}
              onClick={onInquiry}
            />
          </nav>
          <div className="mt-auto pt-4 border-t border-slate-700">
            <div className="p-4 bg-slate-700/50 rounded-lg text-center">
                <h3 className="font-semibold text-white">AIによる自動見積もり</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">診断結果に基づいて、検出された脆弱性の修正にかかる費用をAIが自動で見積もります。</p>
                <div className="space-y-2">
                    <button onClick={() => setActiveView(View.QuickInvestigation)} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition-colors text-sm">
                        診断して見積もりを開始
                    </button>
                </div>
            </div>
          </div>
        </>
      )}

      <div className="text-center text-xs text-gray-500 mt-4 shrink-0">
          <p>AIサイトセキュリティ診断</p>
          <p>&copy; 2024 文唱堂印刷株式会社</p>
      </div>
    </aside>
  );
};

export default Sidebar;