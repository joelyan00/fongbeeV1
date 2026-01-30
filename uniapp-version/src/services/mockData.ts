export const MOCK_BANNERS = [
    {
        id: 1,
        image_url: '',
        gradient: 'linear-gradient(135deg, #3D8E63 0%, #1f4d36 100%)',
        prefix: '多伦多',
        highlight: '开荒保洁',
        suffix: '8折起',
        cta: '预约保洁',
        badge: '优服佳',
        link_type: 'service',
        link_value: 'cleaning'
    },
    {
        id: 2,
        image_url: '',
        gradient: 'linear-gradient(135deg, #4A90E2 0%, #0056b3 100%)',
        prefix: '专业',
        highlight: '地毯清洗',
        suffix: '首单减$20',
        cta: '立即查看',
        badge: '限时优惠',
        link_type: 'service',
        link_value: 'carpet'
    }
];

export const MOCK_CATEGORIES_STANDARD = [
    { id: '1', name: '日常保洁', icon: 'droplet' },
    { id: '2', name: '深度清洁', icon: 'sparkles' },
    { id: '3', name: '搬家服务', icon: 'truck' },
    { id: '4', name: '地毯清洗', icon: 'disc' },
    { id: '5', name: '维修安装', icon: 'tool' },
    { id: '6', name: '园艺除草', icon: 'sprout' },
    { id: '7', name: '接送机', icon: 'car' },
    { id: '8', name: '更多服务', icon: 'grid' }
];

export const MOCK_CATEGORIES_CUSTOM = [
    { id: 'c1', name: '全屋定制', icon: 'home' },
    { id: 'c2', name: '商业装修', icon: 'building' },
    { id: 'c3', name: '庭院设计', icon: 'sprout' },
    { id: 'c4', name: '旧房翻新', icon: 'hammer' }
];

export const MOCK_HOT_SERVICES = [
    {
        id: "h1",
        name: "标准入住保洁",
        price: 150,
        priceUnit: "起",
        description: "全屋深度清洁，拎包入住标准",
        cover_image: "",
        icon: "home"
    },
    {
        id: "h2",
        name: "强力地毯清洗",
        price: 80,
        priceUnit: "房间",
        description: "高温蒸汽杀菌，去除顽固污渍",
        cover_image: "",
        icon: "disc"
    }
];

export const MOCK_ARTICLES = [
    {
        id: 1,
        title: "多伦多搬家避坑指南",
        slug: "moving-guide",
        summary: "搬家前必看的注意事项，教你如何选择靠谱搬家公司...",
        cover_image: "",
        views: 1250,
        created_at: "2023-10-01"
    },
    {
        id: 2,
        title: "秋冬房屋保养清单",
        slug: "home-maintenance",
        summary: "为了让您的房子安全过冬，这些检查必不可少...",
        cover_image: "",
        views: 890,
        created_at: "2023-10-15"
    }
];

export const MOCK_FORM_TEMPLATES = [
    {
        id: "ft1",
        name: "房屋维修",
        icon: "tool",
        description: "各类房屋维修服务",
        form_schema: {}
    },
    {
        id: "ft2",
        name: "家电清洗",
        icon: "disc",
        description: "专业家电拆洗",
        form_schema: {}
    }
];
