import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, User, Phone, MessageSquare, Image as ImageIcon, Send, ChevronRight } from 'lucide-react';
import { submissionsApi, getUserInfo } from '../services/api';

// Helper functions for masking
const maskAddress = (addr: string) => {
    if (!addr) return addr;
    // Hide room/unit number: "静安区 中凯城市之光 1201室" → "静安区 中凯城市之光 ****"
    return addr.replace(/\d+[室号栋单元楼层]?[a-zA-Z]?$/, '****');
};

const maskPhone = (phone: string, canView: boolean) => {
    if (canView && phone) return phone;
    return 'XXX-XXXX-XXXX';
};

const maskName = (name: string) => {
    if (!name) return name;
    return name.charAt(0) + '**';
};

interface Message {
    id: string;
    sender: 'user' | 'provider';
    senderName: string;
    content: string;
    time: string;
}

export default function SubmissionDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const userInfo = getUserInfo();

    const [submission, setSubmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showMessageInput, setShowMessageInput] = useState(false);
    const [messageText, setMessageText] = useState('');

    // Mock messages - in real app, fetch from API
    const [messages] = useState<Message[]>([
        { id: '1', sender: 'user', senderName: '客户', content: '已经好不容易，可以现在看一看吗', time: '2025/06/27 17:40' },
        { id: '2', sender: 'provider', senderName: '服务员', content: '稍后会联系您的，请耐心等待一会儿', time: '2025/06/27 17:40' },
    ]);

    // Check if deposit is paid (determines if contact info is visible)
    const depositPaid = submission?.deposit_paid || false;

    useEffect(() => {
        fetchSubmission();
    }, [id]);

    const fetchSubmission = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await submissionsApi.getById(id);
            setSubmission(res.submission);
        } catch (error) {
            console.error('Failed to fetch submission:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = () => {
        if (!messageText.trim()) return;
        // TODO: Implement actual message sending API
        console.log('Sending message:', messageText);
        setMessageText('');
        setShowMessageInput(false);
    };

    const handleQuote = () => {
        // TODO: Open quote modal or navigate to quote page
        console.log('Opening quote dialog for submission:', id);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
        );
    }

    if (!submission) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 text-lg mb-4">订单不存在或已被删除</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600"
                    >
                        返回
                    </button>
                </div>
            </div>
        );
    }

    // Extract form data
    const formData = submission.form_data || {};
    const photos = formData.photos || formData.images || [];
    const address = formData.address || formData.from_address || formData.service_address || '';
    const contactName = formData.contact_name || formData.name || '';
    const contactPhone = formData.phone || formData.contact_phone || '';

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-xl font-bold text-cyan-600">LOGO</span>
                        <span className="text-gray-500">语言: 中文</span>
                        <span className="text-gray-500">帮助中心</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-600">首页</span>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                {userInfo?.name?.charAt(0) || 'm'}
                            </div>
                            <span className="text-gray-700">{userInfo?.name || 'mark yan'}</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6">
                {/* Left Sidebar */}
                <aside className="w-48 shrink-0 hidden lg:block">
                    <nav className="bg-white rounded-lg shadow-sm">
                        {[
                            '营业额统计', '任务大厅', '标准服务管理', '标服服务订单管理',
                            '定制服务报价记录', '定制服务订单管理', '收件箱', '交易记录',
                            '等级与订阅机制', '收到的评论', '已开具发票', '合同管理',
                            '账户信息', '修改密码', '收款方式'
                        ].map((item, i) => (
                            <div
                                key={i}
                                className={`px-4 py-3 text-sm cursor-pointer hover:bg-gray-50 ${i === 1 ? 'text-cyan-600 bg-cyan-50 font-medium' : 'text-gray-600'}`}
                            >
                                {item}
                            </div>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {/* Project Details Card */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        {/* Header Bar */}
                        <div className="bg-cyan-500 text-white px-6 py-4">
                            <h1 className="text-lg font-bold">项目详细</h1>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Project Title */}
                            <h2 className="text-xl font-bold text-gray-900 mb-4">
                                {formData.title || submission.form_templates?.name || '定制服务项目'}
                            </h2>

                            {/* Basic Info */}
                            <div className="space-y-2 text-sm text-gray-600 mb-6">
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} className="text-gray-400" />
                                    <span>项目所在位置：</span>
                                    <span className="text-gray-800">{maskAddress(address) || 'XXXXXXXXXXXXXX'}</span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <User size={16} className="text-gray-400" />
                                        <span>发布人：</span>
                                        <span className="text-gray-800">{maskName(contactName) || '王**'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-400" />
                                        <span>发布时间：</span>
                                        <span className="text-gray-800">
                                            {submission.created_at ? new Date(submission.created_at).toLocaleString('zh-CN') : '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Requirements */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">客户需求：</span>
                                    {formData.description || formData.items_desc || formData.requirements ||
                                        '搬家、每周打扫、每次日一次出清服务、4个月室...'}
                                </div>
                            </div>

                            {/* Photos Section */}
                            {photos.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                        <ImageIcon size={16} />
                                        用户上传图片
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {photos.map((photo: string, i: number) => (
                                            <div key={i} className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                                                <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Project Content - Q&A Format */}
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-sm font-medium text-gray-700 mb-4">项目内容</h3>
                                <div className="space-y-4">
                                    {Object.entries(formData).filter(([key]) =>
                                        !['photos', 'images', 'phone', 'contact_phone', 'contact_name', 'name', 'title', 'description'].includes(key)
                                    ).map(([key, value], i) => (
                                        <div key={i} className="text-sm">
                                            <div className="text-gray-500 mb-1">{key}?</div>
                                            <div className="text-pink-500">{String(value)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* My Quote Records */}
                    <div className="bg-white rounded-lg shadow-sm mt-6 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-700">我的报价记录</h3>
                            <button className="text-sm text-cyan-600 hover:underline flex items-center gap-1">
                                查看已有10位服务商报价
                                <ChevronRight size={16} />
                            </button>
                        </div>
                        <div className="text-gray-400 text-sm py-4 text-center border border-dashed border-gray-200 rounded-lg">
                            暂无报价
                        </div>
                    </div>

                    {/* Communication Records */}
                    <div className="bg-white rounded-lg shadow-sm mt-6 p-6">
                        <h3 className="text-sm font-medium text-gray-700 mb-4">沟通记录</h3>
                        <div className="space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className="flex items-start gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${msg.sender === 'user' ? 'bg-gray-400' : 'bg-cyan-500'
                                        }`}>
                                        {msg.sender === 'user' ? '客' : '服'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-gray-800">{msg.senderName}</span>
                                            <span className="text-xs text-gray-400">{msg.time}</span>
                                        </div>
                                        <p className="text-sm text-gray-600">{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Message Input */}
                        {showMessageInput ? (
                            <div className="mt-4 flex gap-2">
                                <input
                                    type="text"
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    placeholder="输入留言内容..."
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500 outline-none"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 flex items-center gap-2"
                                >
                                    <Send size={16} />
                                    发送
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowMessageInput(true)}
                                className="mt-4 w-full py-3 border border-cyan-500 text-cyan-600 rounded-lg hover:bg-cyan-50 flex items-center justify-center gap-2"
                            >
                                <MessageSquare size={18} />
                                给用户留言
                            </button>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-center gap-4">
                        <button
                            onClick={handleQuote}
                            className="px-8 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 font-medium shadow-sm"
                        >
                            我要报价
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-8 py-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium"
                        >
                            返回
                        </button>
                    </div>
                </main>

                {/* Right Sidebar */}
                <aside className="w-64 shrink-0 hidden xl:block space-y-4">
                    {/* User Card */}
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                        <div className="w-20 h-20 bg-pink-500 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-3xl font-bold">
                            {contactName?.charAt(0) || 'm'}
                        </div>
                        <h3 className="font-bold text-gray-800">{maskName(contactName) || 'mark yan'}</h3>
                        <div className="mt-4 text-left space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">手机号码：</span>
                                <span className="text-gray-400">-</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">邮箱：</span>
                                <span className="text-gray-600 truncate max-w-[120px]">
                                    {submission.user_email || 'xxx@gmail.com'}
                                </span>
                            </div>
                        </div>
                        <button className="mt-4 text-cyan-600 text-sm hover:underline">
                            退出登录
                        </button>
                    </div>

                    {/* Help Center */}
                    <div className="bg-pink-500 rounded-lg shadow-sm p-6 text-white">
                        <h3 className="font-bold mb-2 flex items-center gap-2">
                            <span className="text-lg">?</span>
                            帮助中心
                        </h3>
                        <p className="text-pink-100 text-sm mb-4">
                            如您有相关问题咨询，请联系客服服务
                        </p>
                        <div className="bg-white/20 rounded-lg py-2 px-4 text-center">
                            <Phone size={16} className="inline mr-2" />
                            {maskPhone(contactPhone, depositPaid)}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
