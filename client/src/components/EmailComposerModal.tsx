import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

interface EmailComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
  recipientName: string;
  contextData: any;
}

export const EmailComposerModal: React.FC<EmailComposerModalProps> = ({ isOpen, onClose, recipientEmail, recipientName, contextData }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDraftAI = async (intent: string) => {
    setIsDrafting(true);
    try {
      const res = await fetch('/api/email/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent,
          context: JSON.stringify({ ...contextData, recipientName, recipientEmail })
        })
      });
      const data = await res.json();
      setSubject(data.subject);
      
      // Convert HTML breaks to newlines for the textarea
      let textBody = data.body || '';
      textBody = textBody.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<[^>]+>/g, '');
      setBody(textBody);
    } catch (err) {
      console.error('Failed to draft AI email', err);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSend = async () => {
    if (!subject || !body) return;
    setIsSending(true);
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipientEmail,
          subject,
          body: body.replace(/\n/g, '<br/>') // convert newlines to HTML
        })
      });
      const data = await res.json();
      if (data.success) {
        setPreviewUrl(data.previewUrl);
      }
    } catch (err) {
      console.error('Failed to send email', err);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col font-outfit"
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Compose Email</h2>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {previewUrl ? (
          <div className="p-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Email Sent Successfully!</h3>
            <p className="text-gray-500 mb-6">Your message to {recipientName} has been dispatched via Ethereal Mail.</p>
            <a 
              href={previewUrl} 
              target="_blank" 
              rel="noreferrer"
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Delivered Email
            </a>
          </div>
        ) : (
          <>
            <div className="p-4 bg-gray-50/50 flex gap-2 overflow-x-auto border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-2 self-center">AI Quick Drafts:</span>
              <button 
                onClick={() => handleDraftAI('Interview invitation')}
                className="whitespace-nowrap px-3 py-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors"
                disabled={isDrafting}
              >
                <Sparkles className="w-3.5 h-3.5" /> Interview Invite
              </button>
              <button 
                onClick={() => handleDraftAI('Upskilling nudge to suggest they take a course on a missing project skill')}
                className="whitespace-nowrap px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors"
                disabled={isDrafting}
              >
                <Sparkles className="w-3.5 h-3.5" /> Upskilling Nudge
              </button>
              <button 
                onClick={() => handleDraftAI('Check in on project flight risk')}
                className="whitespace-nowrap px-3 py-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-md text-sm font-medium flex items-center gap-1.5 transition-colors"
                disabled={isDrafting}
              >
                <Sparkles className="w-3.5 h-3.5" /> Flight Risk Check-in
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">To</label>
                <input 
                  type="text" 
                  value={`${recipientName} <${recipientEmail}>`}
                  disabled
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter subject line..."
                  className="px-3 py-2 border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Message</label>
                <textarea 
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type your message here or use AI to draft..."
                  className="px-3 py-2 border border-gray-200 rounded-lg text-gray-800 min-h-[200px] resize-y focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                {isDrafting && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-lg top-6">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button 
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSend}
                disabled={isSending || !subject || !body || isDrafting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Message
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
