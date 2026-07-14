import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;
let testAccount: nodemailer.TestAccount | null = null;

async function initEmailService() {
  if (transporter) return transporter;
  
  try {
    testAccount = await nodemailer.createTestAccount();
    console.log('📧 Ethereal Email Account created:', testAccount.user);
    console.log('🔗 You can view sent emails at: https://ethereal.email/login');
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    return transporter;
  } catch (err) {
    console.error('Failed to initialize email service:', err);
    throw err;
  }
}

export const emailService = {
  async sendComposerEmail(to: string, subject: string, body: string, isHtml: boolean = false) {
    const t = await initEmailService();
    const info = await t.sendMail({
      from: '"TalentGraph Platform" <platform@talentgraph.ai>',
      to,
      subject,
      text: isHtml ? undefined : body,
      html: isHtml ? body : undefined
    });
    
    console.log('✉️ Email sent: %s', info.messageId);
    console.log('🔗 Preview URL: %s', nodemailer.getTestMessageUrl(info));
    return nodemailer.getTestMessageUrl(info);
  },

  async sendDigestEmail(to: string, reportData: any) {
    const t = await initEmailService();
    
    const htmlBody = `
      <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
        <h2 style="color: #111827;">TalentGraph Org Pulse</h2>
        <p style="color: #4b5563;">Here is your automated ${reportData.frequency} report for <strong>${reportData.title}</strong>.</p>
        
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-top: 20px;">
          <h3 style="margin-top: 0; color: #374151;">Quick Summary</h3>
          <ul style="color: #4b5563;">
            <li>Total Records: ${reportData.count}</li>
            <li>Report Type: ${reportData.type}</li>
          </ul>
        </div>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px; text-align: center;">
          This is an automated message from your TalentGraph instance.
        </p>
      </div>
    `;

    const info = await t.sendMail({
      from: '"TalentGraph Automation" <pulse@talentgraph.ai>',
      to,
      subject: `[Org Pulse] ${reportData.title}`,
      html: htmlBody,
    });
    
    console.log('✉️ Digest Email sent: %s', info.messageId);
    const url = nodemailer.getTestMessageUrl(info);
    console.log('🔗 Preview URL: %s', url);
    return url;
  }
};
