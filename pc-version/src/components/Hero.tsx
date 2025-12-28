import { ArrowRight, Star, Shield, Clock, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
    return (
        <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
            {/* Background Decor */}
            <div className="absolute top-0 inset-x-0 h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary-50/50 via-gray-50 to-white -z-10" />
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-50/40 to-transparent -z-10 blur-3xl opacity-60" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center lg:text-left"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-8 ring-1 ring-primary-100 shadow-sm">
                            <Star className="w-3.5 h-3.5 fill-primary-600 text-primary-600" />
                            <span>超10万家庭的信赖之选</span>
                        </div>

                        <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6 leading-[1.15]">
                            让优质服务<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">触手可及</span>
                        </h1>

                        <p className="text-lg text-gray-500 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                            优服佳为您连接本地最专业的服务人员。无论是家庭清洁、维修安装，还是生活护理，可以在这里找到值得信赖的帮手。
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <button className="w-full sm:w-auto px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-bold shadow-lg shadow-primary-500/30 hover:shadow-primary-600/40 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 text-lg">
                                发布需求
                                <ArrowRight className="w-5 h-5" />
                            </button>
                            <button className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 rounded-full font-bold border border-gray-200 hover:border-gray-300 transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md text-lg">
                                <Shield className="w-5 h-5 text-primary-600" />
                                服务保障
                            </button>
                        </div>

                        <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-gray-500 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary-500" />
                                实名认证
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary-500" />
                                由您定价
                            </div>
                            <div className="flex items-center gap-2">
                                <Heart className="w-5 h-5 text-primary-500" />
                                售后无忧
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Visual */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative hidden lg:block"
                    >
                        <div className="relative z-10 bg-white rounded-[2.5rem] shadow-2xl p-4 border border-gray-100 rotate-2 hover:rotate-0 transition-all duration-700 ease-out">
                            <img
                                src="https://images.unsplash.com/photo-1581578731117-104f2a41272c?q=80&w=2070&auto=format&fit=crop"
                                alt="Home Services"
                                className="rounded-[2rem] w-full h-[520px] object-cover"
                            />

                            {/* Floating Cards */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="absolute -bottom-8 -left-10 bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-50 flex items-center gap-4"
                            >
                                <div className="w-14 h-14 bg-gradient-to-br from-green-50 to-green-100 rounded-full flex items-center justify-center text-green-600">
                                    <Shield className="w-7 h-7" />
                                </div>
                                <div>
                                    <div className="text-base font-bold text-gray-900">平台担保</div>
                                    <div className="text-sm text-gray-500 font-medium">资金安全托管</div>
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="absolute -top-6 -right-8 bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-50"
                            >
                                <div className="flex items-center gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                                </div>
                                <div className="text-sm font-bold text-gray-700">98% 好评率服务商</div>
                            </motion.div>
                        </div>

                        {/* Decorative Circles */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-100/20 rounded-full blur-[100px] -z-10" />
                    </motion.div>

                </div>
            </div>
        </div>
    );
}
