
import React, { useState, useEffect } from 'react';
import { FileText, ChevronRight } from 'lucide-react';
import { cmsApi, Article } from '../services/api';
import { ArticleDetailModal } from './ArticleDetailModal';

// Fallback data in case API fails
const FALLBACK_ARTICLES: Article[] = [
    {
        id: '1',
        title: '如何选择靠谱的维修师傅？',
        summary: '拒绝踩坑！这3点关键资质一定要看...',
        category: '避坑指南',
        views: 23000
    },
    {
        id: '2',
        title: '家电清洗频率大揭秘',
        summary: '洗衣机不洗比马桶还脏？专家建议...',
        category: '健康生活',
        views: 15000
    },
    {
        id: '3',
        title: '服务验收标准清单',
        summary: '水管修完怎么验？电路安全怎么查？',
        category: '验收干货',
        views: 9800
    },
    {
        id: '4',
        title: '二手房交易流程全解析',
        summary: '从看房到过户，手把手教你搞定...',
        category: '房产百科',
        views: 31000
    }
];

interface PopularArticlesProps {
    onArticleClick?: (articleId: string) => void;
}

export const PopularArticles: React.FC<PopularArticlesProps> = ({ onArticleClick }) => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const data = await cmsApi.getArticles({ type: 'article', sort: 'views', limit: 4 });
                if (data && data.articles) {
                    setArticles(data.articles);
                } else {
                    setArticles(FALLBACK_ARTICLES);
                }
            } catch (error) {
                console.error('Failed to fetch articles:', error);
                setArticles(FALLBACK_ARTICLES);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArticles();
    }, []);

    const getLabel = (key?: string) => {
        if (!key) return '文章';
        const map: Record<string, string> = {
            'guide': '避坑指南',
            'health': '健康生活',
            'real_estate': '房产百科',
            'news': '行业资讯'
        };
        return map[key] || key;
    };

    return (
        <div className="px-4 pb-6 mt-4 md:px-8">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-orange-400 rounded-full"></div>
                    <h2 className="text-xl font-bold text-gray-900">热门文章</h2>
                </div>
                <span className="text-base font-bold text-grey-400 flex items-center gap-0.5 cursor-pointer hover:text-orange-500">
                    更多 <ChevronRight size={16} />
                </span>
            </div>

            {/* Responsive Grid: 1 col on mobile, 2 on md, 4 on lg */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {articles.map((article) => (
                    <div
                        key={article.id}
                        onClick={() => onArticleClick?.(article.id)}
                        className="bg-white rounded-xl p-3 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-transform cursor-pointer flex flex-col justify-between h-36 hover:shadow-md hover:border-orange-100"
                    >
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                                    {getLabel(article.category)}
                                </span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-xl line-clamp-2 leading-snug">
                                {article.title}
                            </h3>
                            <p className="text-base font-bold text-gray-600 mt-1 line-clamp-1">
                                {article.summary || article.content || '暂无简介'}
                            </p>
                        </div>
                        <div className="flex items-center gap-1 mt-2 text-gray-600">
                            <FileText size={12} />
                            <span className="text-sm">{(article.views || 0).toLocaleString()} 阅读</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
