import React, { useState, useRef, useEffect } from 'react';
import { GlassCard } from './GlassCard';
import { api } from '../utils/api';
import {
  MessageSquareCode,
  X,
  Send,
  Sparkles,
  User,
  ArrowRight
} from 'lucide-react';

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
    {
      sender: 'bot',
      text: `### TalentGraph AI Assistant\n\nHello! I am your Workforce Intelligence copilot. You can ask me questions about organizational capabilities, projects, or candidate fits.\n\nTry clicking any of the **Quick Questions** below to see how I analyze our talent matrix!`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "Who is the best React developer?",
    "Who can lead our AI project?",
    "Who should be promoted?",
    "What skills should we hire next?"
  ];

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await api.askChatBot(text);
      setMessages(prev => [...prev, { sender: 'bot', text: response }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: '⚠️ Connection failed. Ensure the backend server is running.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert basic markdown in bot answers to simple HTML lists/paragraphs
  const formatBotMessage = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="font-outfit font-bold text-xs text-slate-100 mt-3 mb-1.5 uppercase tracking-wide">{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} className="font-outfit font-extrabold text-sm text-slate-100 mt-4 mb-2">{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} className="font-outfit font-black text-base text-slate-100 mt-4 mb-2">{line.replace('# ', '')}</h2>;
      }

      // Lists
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <li key={idx} className="list-disc list-inside ml-2.5 text-[11px] text-slate-300 py-0.5 leading-relaxed">
            {replaceBold(line.substring(2))}
          </li>
        );
      }

      // Ordered Lists
      const numMatch = line.match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="ml-1 py-0.5 text-[11px] text-slate-300 leading-relaxed">
            <span className="font-bold text-blue-400 mr-1.5">{numMatch[1]}.</span>
            {replaceBold(numMatch[2])}
          </div>
        );
      }

      // Standard text line
      if (line.trim() === '') return <div key={idx} className="h-2" />;
      return <p key={idx} className="text-[11px] text-slate-300 leading-relaxed py-0.5">{replaceBold(line)}</p>;
    });
  };

  // Replace bold tags in strings
  const replaceBold = (text: string) => {
    const parts = text.split('**');
    return parts.map((part, index) => {
      // odd indexes are bold
      return index % 2 === 1 ? <strong key={index} className="text-white font-bold">{part}</strong> : part;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-[0_4px_25px_rgba(59,130,246,0.35)] hover:scale-105 active:scale-95 transition-all duration-200 group"
        >
          <MessageSquareCode className="w-6 h-6 group-hover:rotate-6 transition-transform" />
          <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse" />
        </button>
      )}

      {/* Expanded chat window */}
      {isOpen && (
        <GlassCard glow className="w-[400px] h-[550px] flex flex-col justify-between border-slate-800 p-0 shadow-[0_10px_35px_rgba(3,7,18,0.6)]">
          {/* Header */}
          <div className="p-4 border-b border-slate-900 flex items-center justify-between bg-slate-950/60 shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="bg-blue-600/10 p-1.5 rounded-lg text-blue-400">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              </div>
              <div>
                <h4 className="font-outfit font-bold text-xs text-slate-200 leading-none">Capability Copilot</h4>
                <span className="text-[8px] font-semibold text-emerald-400 mt-1 block tracking-wider uppercase">Active Analyst Mode</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-900 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Logs */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/20">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-start space-x-2.5 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[10px] ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-900 border border-slate-800 text-slate-400'
                }`}>
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : 'AI'}
                </div>
                <div className={`p-3 rounded-2xl text-left border ${
                  msg.sender === 'user'
                    ? 'bg-blue-600/15 border-blue-500/20 text-blue-100 rounded-tr-none'
                    : 'bg-slate-900/60 border-slate-900 text-slate-300 rounded-tl-none'
                }`}>
                  {msg.sender === 'user' ? (
                    <span className="text-[11px] font-semibold">{msg.text}</span>
                  ) : (
                    <div className="space-y-1">{formatBotMessage(msg.text)}</div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start space-x-2.5 max-w-[85%]">
                <div className="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] text-slate-400 shrink-0">
                  AI
                </div>
                <div className="p-3 bg-slate-900/60 border border-slate-900 rounded-2xl rounded-tl-none flex items-center space-x-1.5 py-4">
                  <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Questions & Input Box */}
          <div className="p-4 border-t border-slate-900 bg-slate-950/60 shrink-0 space-y-3.5">
            {/* Quick list */}
            {messages.length === 1 && !isLoading && (
              <div className="space-y-1.5">
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block">Quick Suggestions</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="text-left p-2 bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-800 rounded-lg text-[9px] font-semibold text-slate-400 hover:text-slate-200 transition-all duration-200"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputText);
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                placeholder="Ask about engineers, cloud gaps, projects..."
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                disabled={isLoading}
                className="flex-1 glass-input px-3.5 py-2 rounded-xl text-[11px] text-slate-100 placeholder:text-slate-600 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="h-8 w-8 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-[0_0_10px_rgba(59,130,246,0.2)]"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
