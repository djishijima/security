
import React, { useState, useEffect } from 'react';
import Card from './shared/Card';
import { PaperAirplaneIcon } from './shared/icons';

// Locally defined component to avoid creating new files and minimize changes.
const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; label: string; }> = ({ enabled, onChange, label }) => {
  return (
    <div className="flex items-center justify-between py-2">
        <span className="text-sm text-slate-300">{label}</span>
        <button
            type="button"
            className={`${enabled ? 'bg-blue-600' : 'bg-slate-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900`}
            role="switch"
            aria-checked={enabled}
            onClick={() => onChange(!enabled)}
        >
            <span
            aria-hidden="true"
            className={`${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
        </button>
    </div>
  );
};

// Locally defined component to avoid creating new files and minimize changes.
const Notification: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed bottom-5 right-5 bg-green-600 text-white py-2 px-4 rounded-lg shadow-lg fade-in z-50">
            {message}
        </div>
    );
};


const SettingsModule: React.FC = () => {
  const [notifications, setNotifications] = useState({
    highRisk: true,
    reportGenerated: true,
  });
  const [apiKey, setApiKey] = useState('ipg-****************************');
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const [resendApiKey, setResendApiKey] = useState('');

  useEffect(() => {
    const storedKey = localStorage.getItem('resendApiKey');
    if (storedKey) {
      setResendApiKey(storedKey);
    }
  }, []);

  const handleToggleChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRegenerateApiKey = () => {
    const newKey = `ipg-${[...Array(28)].map(() => Math.random().toString(36)[2]).join('')}`;
    setApiKey(newKey);
    navigator.clipboard.writeText(newKey);
    setNotificationMessage('新しいAPIキーが生成され、クリップボードにコピーされました。');
  };
  
  const handleSaveChanges = () => {
    localStorage.setItem('resendApiKey', resendApiKey);
    // Here you would typically save other settings to a backend
    setNotificationMessage('設定が保存されました。');
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto fade-in">
      {notificationMessage && <Notification message={notificationMessage} onClose={() => setNotificationMessage(null)} />}
      <h1 className="text-3xl font-bold">設定</h1>

      <Card>
        <h2 className="text-xl font-semibold mb-2 border-b border-slate-700 pb-3">通知設定</h2>
        <div className="divide-y divide-slate-700">
          <ToggleSwitch
            label="高リスク論文検出時にメール通知"
            enabled={notifications.highRisk}
            onChange={() => handleToggleChange('highRisk')}
          />
          <ToggleSwitch
            label="レポート生成完了時にメール通知"
            enabled={notifications.reportGenerated}
            onChange={() => handleToggleChange('reportGenerated')}
          />
        </div>
      </Card>
      
      <Card>
         <h2 className="text-xl font-semibold mb-4 border-b border-slate-700 pb-3">API連携</h2>
         <div className="space-y-6">
            <div>
                <label htmlFor="api-key" className="block text-sm font-medium text-gray-300 mb-1">
                    アプリケーション APIキー
                </label>
                <div className="flex items-center space-x-2">
                    <input
                        id="api-key"
                        type="text"
                        readOnly
                        value={apiKey}
                        className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-sm font-mono text-slate-400 focus:outline-none"
                    />
                    <button
                        onClick={handleRegenerateApiKey}
                        className="bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors whitespace-nowrap"
                    >
                        再生成
                    </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    このAPIキーを使用して、外部システムからAIサイトセキュリティ診断のデータにアクセスできます。
                </p>
            </div>
            <div>
                <label htmlFor="resend-api-key" className="block text-sm font-medium text-gray-300 mb-1 flex items-center">
                    <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                    Resend APIキー
                </label>
                <input
                    id="resend-api-key"
                    type="password"
                    value={resendApiKey}
                    onChange={(e) => setResendApiKey(e.target.value)}
                    placeholder="re_************************"
                    className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-sm font-mono text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-2">
                    診断レポートをメールで送信するために使用します。APIキーは <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Resend公式サイト</a> で取得できます。
                </p>
            </div>
         </div>
      </Card>

      <div className="flex justify-end pt-4">
        <button
            onClick={handleSaveChanges}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
            変更を保存
        </button>
      </div>
    </div>
  );
};

export default SettingsModule;
