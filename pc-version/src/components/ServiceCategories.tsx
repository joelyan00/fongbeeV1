import {
    SprayCan, Wrench, Droplets, Baby, Truck, Car, Dog,
    MoreHorizontal, ArrowUpRight
} from 'lucide-react';

export default function ServiceCategories() {
    const categories = [
        { name: "家庭保洁", icon: SprayCan, desc: "日常保洁 / 开荒 / 擦窗", color: "bg-blue-50 text-blue-600" },
        { name: "维修安装", icon: Wrench, desc: "水电 / 家电 / 家具安装", color: "bg-orange-50 text-orange-600" },
        { name: "管道疏通", icon: Droplets, desc: "马桶 / 下水道 / 浴缸", color: "bg-cyan-50 text-cyan-600" },
        { name: "保姆月嫂", icon: Baby, desc: "育儿嫂 / 陪护 / 钟点工", color: "bg-pink-50 text-pink-600" },
        { name: "搬家拉货", icon: Truck, desc: "居民搬家 / 公司搬迁", color: "bg-purple-50 text-purple-600" },
        { name: "上门洗车", icon: Car, desc: "内饰清洗 / 打蜡", color: "bg-indigo-50 text-indigo-600" },
        { name: "宠物服务", icon: Dog, desc: "洗澡 / 遛狗 / 寄养", color: "bg-yellow-50 text-yellow-600" },
        { name: "更多服务", icon: MoreHorizontal, desc: "美容 / 推拿 / 鲜花", color: "bg-gray-50 text-gray-600" },
    ];

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-block px-3 py-1 rounded-full bg-secondary-50 text-secondary-600 text-xs font-bold tracking-wider uppercase mb-3">
                        Our Services
                    </div>
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">全方位的家庭服务</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">精选优质服务商，覆盖生活方方面面，为您提供一站式解决方案</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((cat, idx) => (
                        <div
                            key={idx}
                            className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border border-gray-100 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <ArrowUpRight className="w-5 h-5 text-gray-300" />
                            </div>

                            <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                <cat.icon className="w-7 h-7" strokeWidth={1.5} />
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                                {cat.name}
                            </h3>
                            <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                {cat.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
