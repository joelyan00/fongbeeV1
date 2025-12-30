import { useState, useEffect } from 'react';
import { ArrowRight, FileText, Eye } from 'lucide-react';
import { cmsApi } from '../services/api';

export default function PopularArticles() {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fallback data
    const fallbackArticles = [
        {
            id: 1,
            title: '如何选择靠谱的维修师傅？',
            summary: '拒绝踩坑！这3点关键资质一定要看...',
            views: '2.3w',
            tag: '避坑指南',
            cover_image: null
        },
        {
            id: 2,
            title: '家电清洗频率大揭秘',
            summary: '洗衣机不洗比马桶还脏？专家建议...',
            views: '1.5w',
            tag: '健康生活',
            cover_image: null
        },
        {
            id: 3,
            title: '服务验收标准清单',
            summary: '水管修完怎么验？电路安全怎么查？',
            views: '9800',
            tag: '验收干货',
            cover_image: null
        },
        {
            id: 4,
            title: '二手房交易流程全解析',
            summary: '从看房到过户，手把手教你搞定...',
            views: '3.1w',
            tag: '房产百科',
            cover_image: null
        }
    ];

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const data = await cmsApi.getArticles({ sort: 'views', limit: 4 });
                if (data.articles && data.articles.length > 0) {
                    setArticles(data.articles);
                } else {
                    setArticles(fallbackArticles);
                }
            } catch (e) {
                console.error('Fetch articles failed', e);
                setArticles(fallbackArticles);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, []);

    const getLabel = (cat: string) => {
        const map: Record<string, string> = {
            'guide': '避坑指南',
            'health': '健康生活',
            'real_estate': '房产百科',
            'news': '行业资讯'
        };
        return map[cat] || cat || '文章';
    };

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">热门文章</h2>
                        <p className="text-gray-500">精选干货，助您避坑</p>
                    </div>
                    <button className="text-gray-500 hover:text-emerald-600 font-medium flex items-center gap-1 transition-colors">
                        查看全部 <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        // Skeleton
                        [1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-gray-100 rounded-2xl animate-pulse"></div>)
                    ) : (
                        articles.map((article) => (
                            <div
                                key={article.id}
                                className="bg-white border boundary-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between h-full border border-gray-100"
                                onClick={() => window.location.href = `/article/${article.id}`} // Simple nav for now
                            >
                                <div>
                                    <div className="mb-4">
                                        <span className="inline-block px-3 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-md border border-orange-100">
                                            {article.tag || getLabel(article.category)}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors leading-snug">
                                        {article.title}
                                    </h3>
                                    <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                                        {article.summary || '暂无简介'}
                                    </p>
                                </div>

                                <div className="flex items-center text-gray-400 text-xs gap-3 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-1">
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>文章</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>{article.views || 0} 阅读</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
