
import React from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';

interface AiAssistantBarProps {
  onClick: () => void;
}

export const AiAssistantBar: React.FC<AiAssistantBarProps> = ({ onClick }) => {
  return (
    <div className="px-3 pb-2 bg-[#f2f2f2]">
      <div 
        onClick={onClick}
        className="bg-white rounded-xl p-3 shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform border border-gray-100"
      >
        <div className="flex flex-col gap-0.5">
           <div className="flex items-center gap-2">
             <span className="font-bold text-gray-900 text-base">智能找服务、问价格</span>
           </div>
           <div className="flex items-center gap-1">
             <span className="text-xs text-gray-400">问问</span>
             <span className="text-xs font-bold text-black">
               Gemini AI
             </span>
             <span className="text-[10px] text-gray-600 border border-gray-200 bg-gray-50 px-1 rounded">精准匹配服务</span>
           </div>
        </div>
        
        <div className="flex items-center">
           <div className="bg-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
             去提问 <MessageSquare size={12} className="fill-current" />
           </div>
           {/* Floating Avatar */}
           <div className="relative -ml-2 -mt-6">
              <div className="w-12 h-12 bg-white rounded-full border-2 border-white shadow-sm overflow-hidden p-1">
                <div className="w-full h-full bg-emerald-600 rounded-full flex items-center justify-center">
                    <Sparkles size={20} className="text-white" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gray-800 text-white text-[9px] font-bold text-center rounded-full py-0.5 scale-90 border border-white">
                 AI 推荐
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
