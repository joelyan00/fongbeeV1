
import React, { useEffect, useState } from 'react';
import { Header } from './Header';
import { cmsApi, Article } from '../services/api';
import { Calendar, Eye, ArrowLeft, User } from 'lucide-react';

interface ArticleDetailPageProps {
    articleId: string;
    onBack: () => void;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({ articleId, onBack }) => {
    const [article, setArticle] = useState<Article | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!articleId) return;
            try {
                setIsLoading(true);
                const res = await cmsApi.getById(articleId);
                if (res.article) {
                    setArticle(res.article);
                }
            } catch (error) {
                console.error('Failed to fetch article details:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticle();
    }, [articleId]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    if (!article) {
        return (
            <div className="min-h-screen bg-gray-50 font-sans">
                <Header onSearchClick={() => { }} onLocationClick={() => { }} locationName="多伦多" />
                <div className="max-w-4xl mx-auto px-4 py-16 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">文章未找到</h2>
                    <button
                        onClick={onBack}
                        className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center justify-center gap-2 mx-auto"
                    >
                        <ArrowLeft size={20} /> 返回
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-12">
            <Header onSearchClick={() => { }} onLocationClick={() => { }} locationName="多伦多" />

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

                {/* Breadcrumb / Back Navigation */}
                <div className="mb-6 md:mb-8">
                    <button
                        onClick={onBack}
                        className="group flex items-center text-gray-500 hover:text-emerald-600 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-2 group-hover:border-emerald-200 group-hover:bg-emerald-50">
                            <ArrowLeft size={16} />
                        </div>
                        <span className="font-bold text-sm">返回</span>
                    </button>
                </div>

                <article className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

                    {/* Hero Image */}
                    {article.cover_image && (
                        <div className="h-64 md:h-96 w-full relative">
                            <img
                                src={article.cover_image}
                                alt={article.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            {article.category && (
                                <div className="absolute bottom-6 left-6 md:left-10">
                                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-extrabold tracking-wide uppercase shadow-sm">
                                        {article.category}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Content Body */}
                    <div className="p-6 md:p-12">

                        {/* Header Info */}
                        <div className="mb-10 border-b border-gray-100 pb-8">
                            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-6">
                                {article.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-medium">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                        <User size={14} />
                                    </div>
                                    <span>优服佳</span>
                                </div>

                                <div className="flex items-center gap-6 border-l border-gray-200 pl-6 h-8">
                                    {article.created_at && (
                                        <div className="flex items-center gap-2">
                                            <Calendar size={16} className="text-gray-400" />
                                            <span>{new Date(article.created_at).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Eye size={16} className="text-gray-400" />
                                        <span>{(article.views || 0).toLocaleString()} 阅读</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Article Text */}
                        <div className="prose prose-emerald max-w-none prose-lg text-gray-700 leading-relaxed">
                            {article.content ? (
                                article.content.split('\n').map((paragraph, idx) => (
                                    <p key={idx} className={`mb-4 ${paragraph.trim() === '' ? 'h-4' : ''}`}>
                                        {paragraph}
                                    </p>
                                ))
                            ) : (
                                <p className="text-gray-400 italic">暂无内容详情...</p>
                            )}
                        </div>

                    </div>
                </article>

            </main>

            {/* Simple Footer */}
            <div className="bg-white border-t border-gray-100 py-8 mt-12">
                <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
                    © 2025 YouFuJia Home Services
                </div>
            </div>
        </div>
    );
};
