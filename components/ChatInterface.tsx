
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User } from 'lucide-react';
import { generateRepairAdvice } from '../services/geminiService';
import { ChatMessage } from '../types';

interface ChatInterfaceProps {
  onClose: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: '你好！我是优服佳智能助手。您可以告诉我您的需求，比如“家里水管漏了”或“想找人剪头发”，我会为您推荐合适的服务并预估价格。' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await generateRepairAdvice(userMsg.text);
      const modelMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: '抱歉，网络连接异常，请稍后再试。', isError: true };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 flex flex-col animate-slide-up">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">智能服务助手</h2>
            <p className="text-sm text-gray-500">AI 智能推荐 • 仅供参考</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
          <X size={24} className="text-gray-600" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f9f9f9]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             {msg.role === 'model' && (
                <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white mr-2 shrink-0 mt-1">
                  <Bot size={18} />
                </div>
             )}
            <div 
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-base leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-black text-white rounded-tr-sm' 
                  : 'bg-white text-gray-900 border border-gray-100 rounded-tl-sm'
              }`}
            >
              {msg.text}
            </div>
             {msg.role === 'user' && (
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 ml-2 shrink-0 mt-1">
                  <User size={18} />
                </div>
             )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white mr-2">
               <Bot size={18} />
            </div>
            <div className="bg-white px-5 py-4 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm flex items-center gap-1.5">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white p-4 border-t border-gray-100 safe-bottom">
        <div className="flex items-center gap-2 bg-gray-100 px-4 py-3 rounded-full">
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-base text-gray-900 placeholder-gray-400"
            placeholder="请描述您的需求..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={`p-2.5 rounded-full transition-colors ${input.trim() ? 'bg-black text-white' : 'bg-gray-300 text-gray-500'}`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
