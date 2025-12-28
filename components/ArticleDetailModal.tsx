
import React from 'react';
import { X, Calendar, Eye, FileText } from 'lucide-react';
import { Article } from '../services/api';

interface ArticleDetailModalProps {
    article: Article | null;
    onClose: () => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({ article, onClose }) => {
    if (!article) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <div className="pr-8">
                        <h2 className="text-2xl font-bold text-gray-900 leading-snug">
                            {article.title}
                        </h2>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            {article.created_at && (
                                <div className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    <span>{new Date(article.created_at).toLocaleDateString()}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1">
                                <Eye size={14} />
                                <span>{article.views || 0} 阅读</span>
                            </div>
                            {article.category && (
                                <span className="bg-orange-50 text-orange-600 px-2 py-0.5 rounded text-xs font-bold border border-orange-100">
                                    {article.category}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors absolute right-4 top-4"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                    {article.cover_image && (
                        <img
                            src={article.cover_image}
                            alt={article.title}
                            className="w-full h-64 object-cover rounded-xl mb-8 shadow-sm"
                        />
                    )}

                    {/* Render Content */}
                    <div className="prose prose-orange max-w-none text-gray-700 leading-relaxed space-y-4">
                        {article.content ? (
                            // Simple replacement for line breaks if not HTML
                            article.content.split('\n').map((paragraph, idx) => (
                                <p key={idx} className={paragraph.trim() === '' ? 'h-4' : ''}>
                                    {paragraph}
                                </p>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
                                <FileText size={48} className="text-gray-200" />
                                <p>暂无文章内容</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-900 text-white rounded-full font-bold hover:bg-gray-800 transition-colors"
                    >
                        关闭
                    </button>
                </div>

            </div>
        </div>
    );
};
