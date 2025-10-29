
const RESEND_API_ENDPOINT = 'https://api.resend.com/emails';

export const sendReportByEmail = async (
  recipientEmail: string,
  pdfBase64: string,
  fileName: string
): Promise<{ success: boolean; message: string }> => {
  const apiKey = localStorage.getItem('resendApiKey');

  if (!apiKey) {
    return {
      success: false,
      message: 'Resend APIキーが設定されていません。設定画面でキーを登録してください。',
    };
  }

  const payload = {
    from: 'AIサイトセキュリティ診断 <onboarding@resend.dev>', // resend.dev is required for free tier
    to: [recipientEmail],
    subject: '【AIサイトセキュリティ診断】診断レポートが完了しました',
    html: `
      <p>ご依頼いただいたAIサイトセキュリティ診断レポートが完了しました。</p>
      <p>添付のPDFファイルをご確認ください。</p>
      <br>
      <p>--</p>
      <p><strong>AIサイトセキュリティ診断</strong></p>
      <p>提供: 文唱堂印刷株式会社</p>
    `,
    attachments: [
      {
        filename: fileName,
        content: pdfBase64,
      },
    ],
  };

  try {
    const response = await fetch(RESEND_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API Error:', errorData);
      return {
        success: false,
        message: `メールの送信に失敗しました: ${errorData.message || response.statusText}`,
      };
    }

    return { success: true, message: 'メールが正常に送信されました。' };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      message: `メールの送信中にエラーが発生しました: ${(error as Error).message}`,
    };
  }
};
