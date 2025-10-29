
import React, { useState } from 'react';
import { EnvelopeIcon, CheckBadgeIcon } from './shared/icons';

const InquiryModule: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would send this data to a backend.
    // For this demo, we just show a success message.
    setSubmitted(true);
  };

  const commonInputClasses = "w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white placeholder-slate-400";
  const commonLabelClasses = "block text-sm font-medium text-gray-300 mb-1 text-left";

  if (submitted) {
    return (
        <div className="flex items-center justify-center min-h-full py-12 px-4 sm:px-6 lg:px-8 fade-in">
            <div className="w-full max-w-md space-y-8 bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center">
                <CheckBadgeIcon className="mx-auto h-16 w-auto text-green-400" />
                <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white">
                    お問い合わせありがとうございます
                </h2>
                <p className="text-slate-300">
                    ご入力いただいた内容を確認の上、担当者よりご連絡させていただきます。
                </p>
            </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-full py-12 px-4 sm:px-6 lg:px-8 fade-in">
      <div className="w-full max-w-md space-y-8 bg-slate-800 p-8 rounded-2xl border border-slate-700">
        <div>
          <EnvelopeIcon className="mx-auto h-12 w-auto text-blue-400" />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white">
            お問い合わせ
          </h2>
           <p className="mt-2 text-center text-sm text-slate-400">
            製品に関するご質問や、導入に関するご相談はこちらからお寄せください。
          </p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className={commonLabelClasses}>お名前</label>
              <input 
                id="name" 
                name="name" 
                type="text" 
                required
                className={commonInputClasses} 
                placeholder="田中 聡"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
             <div>
              <label htmlFor="organization" className={commonLabelClasses}>所属 (学会名・企業名など)</label>
              <input 
                id="organization" 
                name="organization" 
                type="text" 
                className={commonInputClasses} 
                placeholder="人工知能学会"
                value={formData.organization}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="email" className={commonLabelClasses}>メールアドレス</label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                autoComplete="email" 
                required
                className={commonInputClasses} 
                placeholder="s.tanaka@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
             <div>
              <label htmlFor="message" className={commonLabelClasses}>お問い合わせ内容</label>
              <textarea
                id="message" 
                name="message"
                rows={4}
                required
                className={commonInputClasses} 
                placeholder="製品の導入を検討しています。詳しい資料をいただけますでしょうか。"
                value={formData.message}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <button type="submit" className="group mt-4 relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900">
                送信する
              </button>
            </div>
        </form>
      </div>
    </div>
  );
}

export default InquiryModule;