<template>
  <view class="min-h-screen bg-gray-50 pt-custom pb-10">
    <view class="bg-white p-4 border-b border-gray-100 flex flex-row items-center mb-4 sticky top-0 z-10">
         <text @click="currentStep === 1 ? $emit('back') : prevStep()" class="mr-4 text-gray-500 text-lg">
             {{ currentStep === 1 ? '取消' : '上一步' }}
         </text>
         <text class="font-bold text-lg flex-1 text-center pr-10">服务商入驻</text>
    </view>

    <!-- Step Indicator -->
    <view class="px-8 py-8 bg-white mb-4 border-b border-gray-50 overflow-hidden">
        <view style="display: flex; flex-direction: row; align-items: center; justify-content: space-between; position: relative; width: 100%;">
            <!-- Line Background -->
            <view style="position: absolute; left: 10%; right: 10%; height: 2px; background-color: #f3f4f6; top: 18px; z-index: 1;"></view>
            
            <!-- Moving Arrow -->
            <view 
                style="position: absolute; top: 6px; z-index: 2; transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: center;"
                :style="{ left: currentStep === 1 ? '16.6%' : currentStep === 2 ? '50%' : '83.3%', transform: 'translateX(-50%)' }"
            >
                <view style="width: 24px; height: 24px; background-color: #10b981; transform: rotate(45deg); border-radius: 4px; border: 4px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);"></view>
            </view>

            <view v-for="s in [1, 2, 3]" :key="s" style="display: flex; flex-direction: column; align-items: center; position: relative; z-index: 3; flex: 1;">
                <view 
                    class="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold transition-all duration-500 border-2"
                    :class="[
                        currentStep > s ? 'bg-emerald-500 border-emerald-500 text-white' : 
                        currentStep === s ? 'bg-white border-emerald-500 text-emerald-600' : 
                        'bg-white border-gray-200 text-gray-400'
                    ]"
                    @click="s < currentStep ? currentStep = s : null"
                >
                    <text v-if="currentStep > s" style="font-weight: bold; font-size: 18px;">✓</text>
                    <text v-else style="font-size: 16px;">{{ s }}</text>
                </view>
                <text 
                    style="font-size: 14px; margin-top: 12px; font-weight: bold; white-space: nowrap;"
                    :style="{ color: currentStep === s ? '#059669' : currentStep > s ? '#10b981' : '#9ca3af' }"
                >
                    {{ s === 1 ? '基本资料' : s === 2 ? '业务范围' : s === 3 ? '资质上传' : '' }}
                </text>
            </view>
        </view>
    </view>

    <view class="px-4">
        <view class="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <!-- Step 1: Identity & Address -->
            <view v-if="currentStep === 1" class="animate-fade-in">
                <view class="flex flex-col items-center mb-8">
                    <text class="text-xl font-bold text-gray-900">基本身份信息</text>
                    <text class="text-gray-500 text-xs mt-2">请填写您的公司或个人基本资料</text>
                </view>

                <view class="form-item">
                    <text class="label">公司/个人名称 <text class="required">*</text></text>
                    <input 
                        v-model="form.company_name" 
                        class="input-box"
                        placeholder="请输入名称"
                    />
                </view>

                <view class="form-item">
                    <text class="label">联系电话 <text class="required">*</text></text>
                    <input 
                        v-model="form.phone" 
                        class="input-box"
                        placeholder="请输入联系电话"
                        type="tel"
                    />
                </view>

                <view class="form-item">
                    <text class="label">电子邮箱 <text class="required">*</text></text>
                    <input 
                        v-model="form.email" 
                        class="input-box"
                        placeholder="请输入电子邮箱"
                        type="email"
                    />
                </view>

                <view class="form-item">
                    <text class="label">公司地址 <text class="required">*</text></text>
                    <view class="address-grid relative">
                        <input 
                            v-model="form.street" 
                            class="address-input full"
                            placeholder="街道名及门牌号"
                            placeholder-class="placeholder"
                            @input="(e: any) => handleStreetInput(e.detail.value)"
                            @focus="showSuggestions = true"
                        />
                        <view 
                            v-if="showSuggestions && addressSuggestions.length > 0"
                            class="absolute top-12 left-0 right-0 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-60"
                        >
                            <scroll-view scroll-y class="max-h-60">
                                <view 
                                    v-for="(addr, i) in addressSuggestions" 
                                    :key="i"
                                    class="px-4 py-3 border-b border-gray-50 last:border-0 active:bg-gray-50 flex flex-row items-center gap-3"
                                    @click="selectAddressSuggestion(addr)"
                                >
                                    <AppIcon name="map-pin" :size="16" class="text-gray-400 flex-shrink-0"/>
                                    <view class="flex-1 min-w-0">
                                        <text class="text-gray-900 text-sm font-bold block truncate">{{ addr.street }}</text>
                                        <text class="text-gray-500 text-xs block truncate">{{ addr.description }}</text>
                                    </view>
                                </view>
                            </scroll-view>
                        </view>

                        <view class="flex flex-row space-x-4 mb-3">
                            <input v-model="form.city" class="address-input half mr-3" placeholder="城市" />
                            <input v-model="form.province" class="address-input half" placeholder="省份" />
                        </view>
                        <input v-model="form.postal_code" class="address-input full" placeholder="邮政编码" />
                    </view>
                </view>
                
                <button class="mt-8 w-full h-12 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center" @click="nextStep">下一步</button>
            </view>

            <!-- Step 2: Service Scope -->
            <view v-if="currentStep === 2" class="animate-fade-in">
                <view class="flex flex-col items-center mb-8">
                    <text class="text-xl font-bold text-gray-900">服务范围设置</text>
                    <text class="text-gray-500 text-xs mt-2">设定您的主营业务及覆盖区域</text>
                </view>

                <view class="form-item mb-8">
                    <text class="label">主营业务 <text class="required">*</text></text>
                    <view class="category-grid">
                        <view 
                            v-for="(cat, idx) in categories" :key="idx"
                            class="category-tag" :class="{ 'active': form.business_scope === cat }"
                            @click="form.business_scope = cat"
                        >
                            <text class="category-text" :class="{ 'active-text': form.business_scope === cat }">{{ cat }}</text>
                        </view>
                    </view>
                </view>

                <view class="form-item mb-10">
                    <view class="mb-4">
                        <text class="label mb-0">服务区域覆盖</text>
                    </view>
                    
                    <!-- Province Selector Tags -->
                    <view class="mb-6">
                        <view class="category-grid">
                            <view 
                                v-for="prov in provinceList" :key="prov.value"
                                class="province-tag" :class="{ 'active': selectedProvince === prov.value }"
                                @click="selectedProvince = prov.value"
                            >
                                <text class="province-text" :class="{ 'active-text': selectedProvince === prov.value }">{{ prov.label }}</text>
                            </view>
                        </view>
                    </view>

                    <view v-if="selectedProvince" class="animate-fade-in mt-4">
                        
                        <view class="category-grid">
                            <view 
                                v-for="(city, idx) in availableCities" :key="idx"
                                class="city-tag" :class="{ 'active': selectedCities.includes(city) }"
                                @click="toggleCity(city)"
                            >
                                <text class="city-text" :class="{ 'active-text': selectedCities.includes(city) }">{{ city }}</text>
                            </view>
                        </view>
                        
                        <view v-if="availableCities.length === 0" class="py-10 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                            <AppIcon name="info" :size="24" class="text-gray-200 mb-2 mx-auto" />
                            <text class="text-xs text-gray-400 italic block">该省份暂无预设城市</text>
                        </view>
                    </view>
                </view>

                <view class="form-item mb-8">
                    <text class="label">服务语言 <text class="required">*</text></text>
                    <view class="category-grid">
                        <view 
                            v-for="(lang, idx) in languageOptions" :key="idx"
                            class="category-tag" :class="{ 'active': selectedLanguages.includes(lang) }"
                            @click="toggleLanguage(lang)"
                        >
                            <text class="category-text" :class="{ 'active-text': selectedLanguages.includes(lang) }">{{ lang }}</text>
                        </view>
                    </view>
                </view>

                <button class="mt-8 w-full h-12 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center" @click="nextStep">下一步</button>
            </view>

            <!-- Step 3: Professional Verification (Dynamic) -->
            <view v-if="currentStep === 3" class="animate-fade-in">
                <view class="flex flex-col items-center mb-8">
                    <text class="text-xl font-bold text-gray-900">资质与材料</text>
                    <text class="text-gray-500 text-xs mt-2">最后一步，完善行业特定的资质证明</text>
                </view>

                <view v-if="regTemplate" class="space-y-6">
                    <view class="bg-emerald-50 p-4 rounded-xl mb-4 border border-emerald-100">
                        <text class="text-sm font-bold text-emerald-800 block mb-1">{{ regTemplate.name }}行业要求</text>
                        <text class="text-xs text-emerald-600">{{ regTemplate.description || '请提供以下资料以完成入驻审核。' }}</text>
                    </view>

                    <view v-for="(step, sIdx) in regTemplate.steps" :key="sIdx" class="space-y-6">
                        <view v-for="(field, fIdx) in step.fields" :key="fIdx" class="form-item">
                            <text class="label">{{ field.label }} <text v-if="field.required" class="required">*</text></text>
                            
                            <input v-if="['text', 'number'].includes(field.type)" v-model="regData[field.key]" class="input-box" :placeholder="field.placeholder || ('请输入' + field.label)" />
                            
                            <textarea v-else-if="field.type === 'textarea'" v-model="regData[field.key]" class="textarea-box" :placeholder="field.placeholder || '请输入详细描述'" />
                            
                            <picker v-else-if="field.type === 'select'" @change="(e: any) => regData[field.key] = field.options[e.detail.value].value" :range="field.options.map((o: any) => o.label)" class="input-box flex items-center">
                                <text :class="regData[field.key] ? 'text-gray-900' : 'text-gray-400'">{{ regData[field.key] ? field.options.find((o: any) => o.value === regData[field.key])?.label : '请选择' }}</text>
                            </picker>

                            <view v-else-if="field.type === 'radio'" class="flex flex-row flex-wrap gap-2">
                                <view v-for="(opt, oIdx) in field.options" :key="oIdx" class="px-4 py-2 rounded-lg border text-sm" :class="regData[field.key] === opt.value ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold' : 'bg-gray-50 border-gray-200'" @click="regData[field.key] = opt.value">
                                    <text>{{ opt.label }}</text>
                                </view>
                            </view>

                            <view v-else-if="field.type === 'image'" class="upload-box" @click="uploadDynamicImage(field.key)">
                                <template v-if="regData[field.key]">
                                    <AppIcon name="check-circle" :size="24" class="text-emerald-600 mb-1"/>
                                    <text class="text-emerald-600 font-bold block">已选择</text>
                                </template>
                                <template v-else>
                                    <AppIcon name="image" :size="24" class="text-gray-400 mb-2" />
                                    <text class="text-gray-400 text-sm">点击上传{{ field.label }}</text>
                                </template>
                            </view>
                        </view>
                    </view>
                </view>

                <view v-else class="py-10 text-center">
                    <AppIcon name="check-circle" :size="48" class="text-emerald-500 opacity-20 mb-4 mx-auto block"/>
                    <text class="text-gray-400 text-sm">该行业暂无特殊资质要求，您可以直接提交申请。</text>
                </view>

                <button class="mt-8 w-full h-12 bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center shadow-lg" @click="submitApply">确认并提交申请</button>
            </view>
        </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, watch, computed } from 'vue';
import { providersApi, setUserInfo, getUserInfo, formTemplatesApi, categoriesApi } from '../services/api';
import AppIcon from './Icons.vue';

const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
let autocompleteService: any = null;
let placesService: any = null;

const addressSuggestions = ref<any[]>([]);
const showSuggestions = ref(false);

onMounted(() => {
    if (!isBrowser) return;

    // Initialize Google Services when script is ready
    const checkGoogle = setInterval(() => {
        if ((window as any).google && (window as any).google.maps) {
            clearInterval(checkGoogle);
            try {
                autocompleteService = new (window as any).google.maps.places.AutocompleteService();
                placesService = new (window as any).google.maps.places.PlacesService(document.createElement('div'));
            } catch (e) {
                console.error('Google Maps Init Failed', e);
            }
        }
    }, 500);
    
    // Safety timeout
    setTimeout(() => clearInterval(checkGoogle), 5000);

    // Pre-fill phone and email from user context AND existing profile if rejected
    const loadProfile = async () => {
        try {
            // Fetch categories from database
            try {
                const catRes = await categoriesApi.getAll();
                // Only show top-level categories (no parent_id)
                categories.value = catRes.categories
                    .filter((c: any) => !c.parent_id && c.is_active)
                    .map((c: any) => c.name);
            } catch (e) {
                console.error('Failed to fetch categories:', e);
                // Fallback to hardcoded
                categories.value = ['搬家服务', '接送服务', '家庭清洁', '日常保洁', '水管维修', '电路维修', '房产交易', '汽车服务'];
            }

            const userInfo = getUserInfo();
            if (userInfo?.phone) form.phone = userInfo.phone;
            if (userInfo?.email) form.email = userInfo.email;

            // Check if there is an existing (rejected) application
            const { profile } = await providersApi.getMyProfile();
            console.log('DEBUG: Loaded Profile:', profile);
            if (profile) {
                // Pre-fill form with existing data
                form.company_name = profile.company_name || '';
                form.phone = profile.service_phone || profile.phone || userInfo?.phone || '';
                console.log('DEBUG: Pre-filled address string:', profile.company_address);
                if (profile.company_address) {
                    const addrStr = profile.company_address;
                    // Try to parse address parts if they were joined by commas
                    const parts = addrStr.split(',').map((p:string) => p.trim());
                    
                    if (parts.length >= 3) {
                         // Heuristic parsing
                         form.street = parts[0];
                         form.city = parts[1];
                         
                         // Handle remaining parts for Province and Postal Code
                         if (parts.length === 3) {
                             // "Street, City, Province Postal"
                             const lastPart = parts[2];
                             const postalMatch = lastPart.match(/([A-Z]\d[A-Z]\s?\d[A-Z]\d)/i);
                             if (postalMatch) {
                                 form.postal_code = postalMatch[0];
                                 form.province = lastPart.replace(postalMatch[0], '').trim();
                             } else {
                                 form.province = lastPart;
                             }
                         } else {
                             // "Street, City, Province, Postal"
                             form.province = parts[2];
                             form.postal_code = parts[3];
                         }
                    } else {
                        // Fallback: Just put everything in street if we can't parse safely
                        // Or try to regex match postal code at end
                        const postalMatch = addrStr.match(/([A-Z]\d[A-Z]\s?\d[A-Z]\d)$/i);
                        if (postalMatch) {
                             form.postal_code = postalMatch[0];
                             form.street = addrStr.replace(postalMatch[0], '').replace(/,$/, '').trim();
                        } else {
                             form.street = addrStr;
                        }
                    }
                }
                form.business_scope = profile.business_scope || '';
                
                if (profile.service_city) {
                    selectedCities.value = profile.service_city.split(',');
                }
                if (profile.languages) {
                    selectedLanguages.value = profile.languages.split(',');
                }
                
                // Extra data for Step 3
                if (profile.extra_data) {
                    Object.assign(regData, profile.extra_data);
                }
                // Also check latest_application for richer extra_data (specific form fields)
                if (profile.latest_application && profile.latest_application.extra_data) {
                    Object.assign(regData, profile.latest_application.extra_data);
                }
            }
        } catch (e) {
            console.log('No existing profile to prefill or fetch failed', e);
        }
    };
    loadProfile();
});

const handleStreetInput = (value: string) => {
    if (!value || value.length < 3) {
        addressSuggestions.value = [];
        return;
    }

    if (isBrowser && autocompleteService && (window as any).google) {
        autocompleteService.getPlacePredictions({
            input: value,
            componentRestrictions: { country: 'ca' },
            types: ['address']
        }, (predictions: any[], status: any) => {
            if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && predictions) {
                addressSuggestions.value = predictions.map(p => ({
                    place_id: p.place_id,
                    street: p.structured_formatting.main_text,
                    description: p.description
                }));
            } else {
                addressSuggestions.value = [];
            }
        });
    }
};

const selectAddressSuggestion = (suggestion: any) => {
    if (!isBrowser || !placesService) return;

    placesService.getDetails({
        placeId: suggestion.place_id,
        fields: ['address_components']
    }, (place: any, status: any) => {
        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place) {
            const comps = place.address_components;
            const getComp = (type: string) => comps.find((c: any) => c.types.includes(type))?.long_name || '';
            const getShortComp = (type: string) => comps.find((c: any) => c.types.includes(type))?.short_name || '';

            form.street = suggestion.street;
            form.city = getComp('locality');
            form.province = getShortComp('administrative_area_level_1');
            form.postal_code = getComp('postal_code');
            
            showSuggestions.value = false;
            addressSuggestions.value = [];
        }
    });
};

const emit = defineEmits(['back', 'success']);

const currentStep = ref(1);

const nextStep = () => {
    if (currentStep.value === 1) {
        if (!form.company_name) return uni.showToast({ title: '请输入公司名称', icon: 'none' });
        if (!form.phone) return uni.showToast({ title: '请输入联系电话', icon: 'none' });
        if (!form.email) return uni.showToast({ title: '请输入电子邮箱', icon: 'none' });
        if (!form.street || !form.city) return uni.showToast({ title: '请完善街道和城市', icon: 'none' });
        currentStep.value = 2;
    } else if (currentStep.value === 2) {
        if (!form.business_scope) return uni.showToast({ title: '请选择主营业务', icon: 'none' });
        if (selectedCities.value.length === 0) return uni.showToast({ title: '请选择城市', icon: 'none' });
        currentStep.value = 3;
    }
};

const prevStep = () => {
    if (currentStep.value > 1) currentStep.value--;
};

const form = reactive({
    company_name: '',
    street: '',
    city: '',
    province: '',
    postal_code: '',
    business_scope: '',
    service_city: '',
    phone: '',
    email: ''
});

const provinceList = [
    { label: '卑诗 BC', value: 'British Columbia (BC)' },
    { label: '安省 ON', value: 'Ontario (ON)' },
    { label: '阿省 AB', value: 'Alberta (AB)' },
    { label: '魁省 QC', value: 'Quebec (QC)' },
    { label: '曼省 MB', value: 'Manitoba (MB)' },
    { label: '萨省 SK', value: 'Saskatchewan (SK)' }
];

const provinceToCities: Record<string, string[]> = {
    'British Columbia (BC)': ['温哥华 (Vancouver)', '列治文 (Richmond)', '本拿比 (Burnaby)', '素里 (Surrey)', '高贵林 (Coquitlam)', '维多利亚 (Victoria)', '基洛纳 (Kelowna)', '纳奈莫 (Nanaimo)', '兰里 (Langley)', '阿伯茨福德 (Abbotsford)'],
    'Ontario (ON)': ['大多伦多地区 (GTA)', '汉密尔顿 (Hamilton)', '渥太华 (Ottawa)', '伦敦 (London)', '温莎 (Windsor)', '滑铁卢 (Waterloo)', '贵湖 (Guelph)', '基奇纳 (Kitchener)', '剑桥 (Cambridge)', '圣凯瑟琳 (St. Catharines)'],
    'Alberta (AB)': ['卡尔加里 (Calgary)', '埃德蒙顿 (Edmonton)', '红鹿市 (Red Deer)', '莱斯布里奇 (Lethbridge)', '麦克默里堡 (Fort McMurray)'],
    'Quebec (QC)': ['蒙特利尔 (Montreal)', '魁北克城 (Quebec City)', '拉瓦尔 (Laval)', '加蒂诺 (Gatineau)', '朗格伊 (Longueuil)'],
    'Manitoba (MB)': ['温尼伯 (Winnipeg)', '布兰登 (Brandon)', '斯坦巴克 (Steinbach)'],
    'Saskatchewan (SK)': ['萨斯卡通 (Saskatoon)', '里贾纳 (Regina)', '阿尔伯特亲王城 (Prince Albert)']
};

const selectedProvince = ref('Ontario (ON)');
const availableCities = computed(() => {
    return selectedProvince.value ? (provinceToCities[selectedProvince.value] || []) : [];
});

// 服务分类列表（从数据库获取）
const categories = ref<string[]>([]);
const languageOptions = ['国语', '粤语', '英语'];

const selectedCities = ref<string[]>([]);
const selectedLanguages = ref<string[]>(['国语']);

// Dynamic Form State
const regTemplate = ref<any>(null);
const regData = reactive<any>({});

// Watch category to load dynamic form
watch(() => form.business_scope, async (newCat) => {
    if (!newCat) {
        regTemplate.value = null;
        return;
    }
    
    try {
        const res = await formTemplatesApi.getPublished('provider_reg', newCat);
        if (res.templates && res.templates.length > 0) {
            regTemplate.value = res.templates[0];
            // Initialize regData
            regTemplate.value.steps.forEach((step: any) => {
                step.fields.forEach((field: any) => {
                    if (!(field.key in regData)) {
                        regData[field.key] = '';
                    }
                });
            });
        } else {
            regTemplate.value = null;
        }
    } catch (e) {
        console.error('Fetch registration template failed:', e);
    }
});

const toggleCity = (city: string) => {
    const idx = selectedCities.value.indexOf(city);
    if (idx > -1) {
        selectedCities.value.splice(idx, 1);
    } else {
        selectedCities.value.push(city);
    }
};

const toggleLanguage = (lang: string) => {
    const idx = selectedLanguages.value.indexOf(lang);
    if (idx > -1) {
        selectedLanguages.value.splice(idx, 1);
    } else {
        selectedLanguages.value.push(lang);
    }
};

const toggleDynamicCheckbox = (key: string, value: string) => {
    if (!Array.isArray(regData[key])) {
        regData[key] = [];
    }
    const idx = regData[key].indexOf(value);
    if (idx > -1) {
        regData[key].splice(idx, 1);
    } else {
        regData[key].push(value);
    }
};

// Compress image using canvas (browser only)
const compressImage = (file: Blob, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
            URL.revokeObjectURL(url);
            
            // Calculate new dimensions
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            
            // Create canvas and draw
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
                reject(new Error('Canvas context not available'));
                return;
            }
            
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to base64
            const base64 = canvas.toDataURL('image/jpeg', quality);
            resolve(base64);
        };
        
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Image load failed'));
        };
        
        img.src = url;
    });
};

const uploadDynamicImage = (key: string) => {
    uni.showActionSheet({
        itemList: ['从相册选择', '拍照'],
        success: (res) => {
            const index = res.tapIndex;
            uni.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: index === 0 ? ['album'] : ['camera'],
                success: async (imageRes) => {
                    const tempFilePath = imageRes.tempFilePaths[0];
                    uni.showLoading({ title: '压缩中...' });

                    if (isBrowser) {
                        try {
                            // In browser environment, compress using canvas
                            const files = imageRes.tempFiles as any[];
                            const file = files && files.length > 0 ? files[0] : null;
                            
                            if (file && file instanceof Blob) {
                                // Compress the image
                                const compressed = await compressImage(file, 800, 0.7);
                                regData[key] = compressed;
                                uni.hideLoading();
                                uni.showToast({ title: '图片已压缩', icon: 'success' });
                            } else {
                                // Fallback: fetch and compress
                                const response = await fetch(tempFilePath);
                                const blob = await response.blob();
                                const compressed = await compressImage(blob, 800, 0.7);
                                regData[key] = compressed;
                                uni.hideLoading();
                                uni.showToast({ title: '图片已压缩', icon: 'success' });
                            }
                        } catch (e) {
                            console.error('Image compress failed', e);
                            // Fallback to original
                            regData[key] = tempFilePath;
                            uni.hideLoading();
                        }
                    } else {
                        // In mobile app context, use uni.compressImage then read to base64
                        uni.compressImage({
                            src: tempFilePath,
                            quality: 70,
                            success: (compressRes) => {
                                const fs = uni.getFileSystemManager();
                                fs.readFile({
                                    filePath: compressRes.tempFilePath,
                                    encoding: 'base64',
                                    success: (readRes) => {
                                        regData[key] = 'data:image/jpeg;base64,' + readRes.data;
                                        uni.hideLoading();
                                        uni.showToast({ title: '图片已压缩', icon: 'success' });
                                    },
                                    fail: (err) => {
                                        console.error('Read file failed', err);
                                        regData[key] = tempFilePath;
                                        uni.hideLoading();
                                    }
                                });
                            },
                            fail: (err) => {
                                console.error('Compress failed', err);
                                // Fallback: read original
                                const fs = uni.getFileSystemManager();
                                fs.readFile({
                                    filePath: tempFilePath,
                                    encoding: 'base64',
                                    success: (readRes) => {
                                        regData[key] = 'data:image/jpeg;base64,' + readRes.data;
                                        uni.hideLoading();
                                    },
                                    fail: () => {
                                        regData[key] = tempFilePath;
                                        uni.hideLoading();
                                    }
                                });
                            }
                        });
                    }
                },
                fail: () => {
                    uni.hideLoading();
                }
            });
        }
    });
};

const submitApply = async () => {
    if (!form.company_name) {
        uni.showToast({ title: '请输入公司名称', icon: 'none' });
        return;
    }
    if (!form.street || !form.city || !form.province || !form.postal_code) {
        uni.showToast({ title: '请填写完整的公司地址', icon: 'none' });
        return;
    }

    const fullAddress = `${form.street}, ${form.city}, ${form.province} ${form.postal_code}`;
    if (!form.business_scope) {
        uni.showToast({ title: '请选择主营业务', icon: 'none' });
        return;
    }
    if (selectedCities.value.length === 0) {
        uni.showToast({ title: '请选择服务城市', icon: 'none' });
        return;
    }
    if (selectedLanguages.value.length === 0) {
        uni.showToast({ title: '请选择服务语言', icon: 'none' });
        return;
    }

    uni.showLoading({ title: '提交中...' });
    try {
        const payload = { 
            ...form, 
            company_address: fullAddress,
            service_city: selectedCities.value.join(','),
            languages: selectedLanguages.value.join(','),
            extra_data: regTemplate.value ? { ...regData } : null
        };
        await providersApi.apply(payload);
        
        // Show Success and Navigate Back
        uni.hideLoading();
        uni.showToast({ title: '申请已提交，请等待审核', icon: 'success' });
        
        setTimeout(() => {
            emit('success');
        }, 1500);

    } catch (error: any) {
        uni.hideLoading();
        console.error('Full Provider Application Error:', error);

        // Even if duplicated, do NOT auto-upgrade role. Just inform user.
        if (error.message?.includes('已提交') || error.message?.includes('重复')) {
             uni.showToast({ title: '您已提交过申请，正在审核中', icon: 'none' });
             setTimeout(() => {
                emit('back'); 
             }, 1500);
        } else {
             uni.showToast({ title: error.message || '提交失败', icon: 'none' });
        }
    }
};
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.pt-custom { padding-top: env(safe-area-inset-top); }
.pb-10 { padding-bottom: 40px; }
.p-4 { padding: 16px; }
.p-6 { padding: 24px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.pr-10 { padding-right: 40px; }
.mr-4 { padding-right: 16px; }
.mb-3 { margin-bottom: 12px; }
.mb-6 { margin-bottom: 24px; }
.mt-2 { margin-top: 8px; }
.mt-8 { margin-top: 32px; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-white { background-color: #ffffff; }
.bg-emerald-100 { background-color: #d1fae5; }
.bg-emerald-600 { background-color: #059669; }
.text-white { color: #ffffff; }
.text-emerald-600 { color: #059669; }
.text-gray-900 { color: #111827; }
.text-gray-700 { color: #374151; }
.text-gray-500 { color: #6b7280; }
.text-gray-400 { color: #9ca3af; }
.text-red-500 { color: #ef4444; }
.text-xl { font-size: 20px; }
.text-lg { font-size: 18px; }
.text-base { font-size: 16px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }
.font-bold { font-weight: 700; }
.text-center { text-align: center; }
.rounded-full { border-radius: 9999px; }
.rounded-2xl { border-radius: 16px; }
.rounded-xl { border-radius: 12px; }
.border-b { border-bottom-width: 1px; }
.border-gray-100 { border-color: #f3f4f6; }
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }

.form-item { margin-bottom: 20px; }
.label { 
    font-size: 14px; 
    font-weight: 800; 
    color: #1f2937; 
    margin-bottom: 12px; 
    display: block; 
}
.mb-0 { margin-bottom: 0 !important; }
.required { color: #ef4444; margin-left: 2px; }

.input-box {
    width: 100%;
    height: 48px;
    background-color: #f9fafb;
    border-radius: 12px;
    padding: 0 16px;
    font-size: 16px;
    border: 1px solid #e5e7eb;
    box-sizing: border-box; /* Important for inputs */
}

.textarea-box {
    width: 100%;
    height: 100px;
    background-color: #f9fafb;
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 16px;
    border: 1px solid #e5e7eb;
    box-sizing: border-box;
}

.upload-box {
    width: 100%;
    height: 120px;
    background-color: #f9fafb;
    border: 2px dashed #d1d5db;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
}

.submit-btn {
    transition: opacity 0.2s;
}
.submit-btn:active {
    opacity: 0.8;
}
.block { display: block; }
.truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Redesigned Address */
.address-grid {
    display: flex;
    flex-direction: column;
}
.address-input {
    background-color: #f8fafc;
    border-radius: 12px;
    height: 52px;
    padding: 0 16px;
    font-size: 15px;
    margin-bottom: 12px;
    border: 1px solid #f1f5f9;
    box-sizing: border-box;
}
.address-input.full { width: 100%; }
.address-input.half { flex: 1; }
.placeholder { color: #94a3b8; }

/* Category Tags Grid */
.category-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}
.province-tag {
    height: 48px;
    background-color: #ffffff;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid #f1f5f9;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0,0,0,0.02);
}
.province-tag.active {
    background-color: #ecfdf5;
    border-color: #10b981;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08);
}
.province-text {
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
}
.province-text.active-text {
    color: #059669;
    font-weight: 800;
}

.city-tag {
    height: 44px;
    background-color: #f8fafc;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid transparent;
    transition: all 0.2s;
}
.city-tag.active {
    background-color: #ffffff;
    border-color: #10b981;
    box-shadow: 0 4px 8px rgba(16, 185, 129, 0.06);
}
.city-text {
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
}
.city-text.active-text {
    color: #059669;
    font-weight: 800;
}

.category-tag {
    height: 48px;
    background-color: #ffffff;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid #f1f5f9;
    transition: all 0.2s;
}
.category-tag.active {
    background-color: #ecfdf5;
    border-color: #10b981;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.08);
}
.category-text {
    font-size: 13px;
    color: #64748b;
    font-weight: 500;
}
.category-text.active-text {
    color: #059669;
    font-weight: 800;
}

.animate-fade-in {
    animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
