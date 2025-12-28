
import React, { useMemo } from 'react';
import { ChevronLeft, Share2, Plus, ArrowRight } from 'lucide-react';

interface CategoryPageProps {
  categoryName: string;
  onBack: () => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ categoryName, onBack }) => {
  
  // Helper to generate data based on category
  const categoryData = useMemo(() => {
    switch (categoryName) {
      case '水管维修':
        return {
          standard: [
            { id: 's1', title: '标准水龙头更换', desc: '包含拆旧换新，不含主材，标准安装服务', price: '$120', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=300&q=80' },
            { id: 's2', title: '马桶疏通服务', desc: '专业设备疏通，不通不收费，清理现场', price: '$150', image: 'https://images.unsplash.com/photo-1584622050111-993a426fbf0a?auto=format&fit=crop&w=300&q=80' },
            { id: 's3', title: '洗碗机安装', desc: '标准嵌入式洗碗机安装，接水接电', price: '$180', image: 'https://images.unsplash.com/photo-1590130638634-b25867a5df71?auto=format&fit=crop&w=300&q=80' },
            { id: 's4', title: '淋浴喷头更换', desc: '包含密封处理，不含喷头主材', price: '$80', image: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=300&q=80' }
          ],
          custom: [
            { id: 1, title: '全屋水管翻新', desc: '老旧铜管/镀锌管更换PEX，杜绝爆管隐患', image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=300&q=80' },
            { id: 2, title: '地下室卫生间加建', desc: '从排污管铺设到洁具安装，一站式服务', image: 'https://images.unsplash.com/photo-1552321988-5f53e0b95d5d?auto=format&fit=crop&w=300&q=80' },
            { id: 3, title: '商业厨房上下水改造', desc: '符合卫生局标准，隔油池安装', image: 'https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=300&q=80' },
            { id: 4, title: '软水机/净水系统定制', desc: '根据水质报告定制全屋净水方案', image: 'https://images.unsplash.com/photo-1521783593447-5702b9bc1258?auto=format&fit=crop&w=300&q=80' }
          ]
        };
      
      case '电路维修':
        return {
          standard: [
            { id: 's1', title: '开关/插座更换', desc: '标准面板更换，包含接线检测', price: '$80', image: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae8?auto=format&fit=crop&w=300&q=80' },
            { id: 's2', title: '吸顶灯/吊灯安装', desc: '层高10尺以内，不含灯具组装', price: '$100', image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&w=300&q=80' },
            { id: 's3', title: '配电箱安全检测', desc: '空气开关测试，线路老化排查', price: '$199', image: 'https://images.unsplash.com/photo-1621905252507-b35a83013669?auto=format&fit=crop&w=300&q=80' },
            { id: 's4', title: '可视门铃安装', desc: '包含变压器电压检测及线路连接', price: '$120', image: 'https://images.unsplash.com/photo-1558002038-109177381792?auto=format&fit=crop&w=300&q=80' }
          ],
          custom: [
            { id: 1, title: '配电箱升级 (100A转200A)', desc: '申请ESA检查，全套升级服务', image: 'https://images.unsplash.com/photo-1544724569-5f546fd6dd2a?auto=format&fit=crop&w=300&q=80' },
            { id: 2, title: '电动车充电桩安装', desc: '特斯拉/通用充电桩布线及安装', image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=300&q=80' },
            { id: 3, title: '全屋智能家居布线', desc: '智能开关，监控，网络中枢定制', image: 'https://images.unsplash.com/photo-1558002038-109177381792?auto=format&fit=crop&w=300&q=80' },
            { id: 4, title: '全屋射灯规划安装', desc: '无主灯设计，开孔布线补漆', image: 'https://images.unsplash.com/photo-1513506003011-3b614491215e?auto=format&fit=crop&w=300&q=80' }
          ]
        };

      case '会计报税':
        return {
          standard: [
            { id: 's1', title: '个人基本税申报', desc: 'T4表申报，无其他复杂收入', price: '$80', image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=300&q=80' },
            { id: 's2', title: '学生报税特惠', desc: '包含学费抵扣申报', price: '$50', image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=300&q=80' },
            { id: 's3', title: '小生意自雇申报', desc: 'Uber/外卖等自雇收入申报', price: '$150', image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=300&q=80' },
            { id: 's4', title: 'HST/GST 申报', desc: '季度/年度销售税申报服务', price: '$100', image: 'https://images.unsplash.com/photo-1554224154-260327c00c41?auto=format&fit=crop&w=300&q=80' }
          ],
          custom: [
            { id: 1, title: '公司注册与税务规划', desc: '联邦/省公司注册，股权架构设计', image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=300&q=80' },
            { id: 2, title: 'CRA 审计协助', desc: '专业会计师协助应对税务局查税', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=300&q=80' },
            { id: 3, title: '海外资产申报方案', desc: 'T1135申报，海外收入合规规划', image: 'https://images.unsplash.com/photo-1526304640152-d4646397de43?auto=format&fit=crop&w=300&q=80' },
            { id: 4, title: '企业年度财务报表', desc: 'Notice to Reader (NTR) 报告', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=300&q=80' }
          ]
        };

      case '网站开发':
        return {
          standard: [
            { id: 's1', title: '企业官网模板搭建', desc: '基于WordPress，5页以内，响应式设计', price: '$500', image: 'https://images.unsplash.com/photo-1467232059381-1033686427cb?auto=format&fit=crop&w=300&q=80' },
            { id: 's2', title: '单页 Landing Page', desc: '高转化率落地页设计，包含表单', price: '$300', image: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=300&q=80' },
            { id: 's3', title: '域名与企业邮箱配置', desc: '专业域名解析，Google/Outlook邮箱设置', price: '$100', image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=300&q=80' },
            { id: 's4', title: '网站故障排查 (小时)', desc: '服务器报错，SSL证书问题修复', price: '$80/h', image: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?auto=format&fit=crop&w=300&q=80' }
          ],
          custom: [
            { id: 1, title: '定制化电商平台开发', desc: 'Shopify/WooCommerce 深度二次开发', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=300&q=80' },
            { id: 2, title: 'iOS & Android App 开发', desc: '原生或React Native跨平台应用开发', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=300&q=80' },
            { id: 3, title: '企业级 SaaS 系统定制', desc: 'CRM，ERP，内部管理系统开发', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=300&q=80' },
            { id: 4, title: 'UI/UX 交互设计升级', desc: '提升用户体验，品牌视觉全面升级', image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=300&q=80' }
          ]
        };

      case '室内维修':
      case '室内装修':
        return {
          standard: [
            { id: 's1', title: '墙面破损修补 (处)', desc: '1平方英尺以内破洞修补及补漆', price: '$150', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=300&q=80' },
            { id: 's2', title: '家具组装 (小时)', desc: 'IKEA/Wayfair 家具专业组装', price: '$60/h', image: 'https://images.unsplash.com/photo-1595846519845-68e298c2edd8?auto=format&fit=crop&w=300&q=80' },
            { id: 's3', title: '窗帘杆/挂画安装', desc: '标准墙面打孔安装，承重加固', price: '$100', image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=300&q=80' },
            { id: 's4', title: '室内门锁更换', desc: '卧室/卫生间球形或把手锁更换', price: '$60', image: 'https://images.unsplash.com/photo-1558002038-109177381792?auto=format&fit=crop&w=300&q=80' }
          ],
          custom: [
            { id: 1, title: '全屋地板升级翻新', desc: '实木/复合地板铺设，旧地板拆除', image: 'https://images.unsplash.com/photo-1581858726768-fd8a641890b0?auto=format&fit=crop&w=300&q=80' },
            { id: 2, title: '地下室精装修', desc: '保温棉，Drywall，地板，隔间全包', image: 'https://images.unsplash.com/photo-1560185009-dddeb820c7b7?auto=format&fit=crop&w=300&q=80' },
            { id: 3, title: '厨房整体改造', desc: '橱柜，台面，防溅墙整体设计施工', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=300&q=80' },
            { id: 4, title: '全屋油漆粉刷', desc: 'Benjamin Moore 环保漆，多色分色', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=300&q=80' }
          ]
        };

      default:
        // Generic Fallback
        return {
          standard: [
            { id: 's1', title: '上门诊断费', desc: '专业师傅上门检查问题，出具方案', price: '$80', image: 'https://images.unsplash.com/photo-1581578731117-104f8a338e2d?auto=format&fit=crop&w=300&q=80' },
            { id: 's2', title: '标准人工服务 (小时)', desc: '适用于一般维修安装类工作', price: '$90/h', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=300&q=80' },
            { id: 's3', title: '紧急维修响应', desc: '下班时间/周末紧急上门', price: '$150', image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=300&q=80' },
            { id: 's4', title: '简单部件更换', desc: '不含配件费，仅收取安装费', price: '$60', image: 'https://images.unsplash.com/photo-1581578731117-104f8a338e2d?auto=format&fit=crop&w=300&q=80' }
          ],
          custom: [
            { id: 1, title: '大型项目定制方案', desc: '免费上门测量估价，出具详细报价单', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=300&q=80' },
            { id: 2, title: '全屋翻新工程', desc: '整体规划，持牌团队，WSIB保险', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=300&q=80' },
            { id: 3, title: '商业空间装修', desc: '办公室，餐厅，零售店面装修', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80' },
            { id: 4, title: '特殊设备安装', desc: '需特定资质的设备安装调试', image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a782?auto=format&fit=crop&w=300&q=80' }
          ]
        };
    }
  }, [categoryName]);

  const { standard: standardServices, custom: customServices } = categoryData;

  return (
    <div className="min-h-screen bg-[#f5f6fa] pb-10">
      {/* Header */}
      <div className="bg-white sticky top-0 z-50 px-4 h-14 flex items-center justify-between shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 active:bg-gray-100 rounded-full">
          <ChevronLeft size={32} strokeWidth={3} className="text-black" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">{categoryName}</h1>
        <button className="p-2 -mr-2 active:bg-gray-100 rounded-full">
          <Share2 size={24} className="text-gray-900" />
        </button>
      </div>

      {/* Green Title Box */}
      <div className="px-4 mt-5">
        <div className="bg-emerald-600 text-white rounded-xl py-5 px-4 shadow-md text-center">
            <h2 className="text-2xl font-extrabold tracking-wide">
                标准服务：省时，省心，省力
            </h2>
        </div>
      </div>

      {/* Standard Fixed-Price Services List */}
      <div className="px-4 mt-4 grid grid-cols-1 gap-4">
        {standardServices.map((service) => (
            <div key={service.id} className="bg-white rounded-xl p-4 flex gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] active:scale-[0.99] transition-transform cursor-pointer border border-gray-100 hover:shadow-md">
                <div className="w-28 h-24 shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                    <img src={service.image} alt={service.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between py-0.5">
                    <div>
                        <h4 className="text-xl font-bold text-gray-900 line-clamp-1">{service.title}</h4>
                        <p className="text-base text-gray-700 mt-1 line-clamp-2 leading-relaxed">{service.desc}</p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-400 text-xs">已售 30+</span>
                        <span className="text-red-500 font-bold text-xl">{service.price}</span>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* Popular Customization Section */}
      <div className="px-4 mt-8">
        <div className="bg-emerald-600 text-white rounded-xl py-5 px-4 shadow-md text-center mb-4">
            <h3 className="text-2xl font-extrabold tracking-wide">
                热门定制，满足您的特殊要求
            </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {customServices.map((service) => (
                <div key={service.id} className="bg-white rounded-xl p-4 flex gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] active:scale-[0.99] transition-transform cursor-pointer border border-gray-100 hover:shadow-md">
                    <div className="w-32 h-24 shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                        <img src={service.image} alt={service.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div>
                            <h4 className="text-lg font-bold text-gray-900 line-clamp-1">{service.title}</h4>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">{service.desc}</p>
                        </div>
                        <div className="flex items-center justify-end mt-1">
                            <span className="text-emerald-600 font-bold text-sm flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                                免费估价 <ArrowRight size={14} />
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* Custom Request Card */}
      <div className="px-4 mt-8">
        <div className="bg-emerald-50 rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-sm border border-emerald-100 gap-5">
            <p className="text-xl font-bold text-emerald-800 leading-relaxed px-2">
                如果你没有找到合适的服务，让优服佳为你量身定做
            </p>
            <button className="bg-emerald-600 text-white rounded-full px-8 py-3 flex items-center gap-2 text-lg font-bold shadow-sm active:scale-95 transition-transform hover:bg-emerald-700">
                <Plus size={20} />
                发布定制服务
            </button>
        </div>
      </div>
       
       <div className="text-center text-gray-400 text-sm mt-8 mb-10">
          - 到底了，没有更多了 -
       </div>
    </div>
  );
};
