<template>
  <view style="min-height: 100vh; background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%); padding-bottom: 40px;">
    <!-- Header -->
    <!-- Global Navbar -->
    <GlobalNavbar 
      title="账户信息" 
      background-color="#ffffff"
      title-color="#111827"
      icon-color="#111827"
      :show-back="true"
      :fixed="true"
      @back="goBack"
    />

    <!-- SECTION 1: Personal Information -->
    <view style="padding: 16px; margin-top: 20px;">
      <text style="font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 12px; display: block; margin-left: 4px;">个人信息</text>
      
      <!-- Avatar Section -->
      <view @click="uploadAvatar" style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 24px;">
        <view style="width: 80px; height: 80px; border-radius: 50%; background: #064e3b; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; border: 2px solid #10b981; position: relative;">
          <image v-if="avatarUrl" :src="avatarUrl" style="width: 100%; height: 100%; border-radius: 50%;" mode="aspectFill" />
          <text v-else style="font-size: 32px; font-weight: 700; color: #10b981;">{{ formData.name ? formData.name.charAt(0).toUpperCase() : 'U' }}</text>
          <view style="position: absolute; bottom: 0; right: 0; background: #10b981; padding: 4px; border-radius: 50%; border: 2px solid #0f172a;">
             <AppIcon name="camera" :size="12" color="#ffffff" />
          </view>
        </view>
        <text style="font-size: 13px; color: #9ca3af;">点击更换头像</text>
      </view>

      <!-- Form Section -->
      <view style="background: #1f2937; border-radius: 20px; border: 1px solid #374151; overflow: hidden;">
        <!-- Name -->
        <view style="padding: 16px; border-bottom: 1px solid #374151; display: flex; align-items: center; justify-content: space-between;">
          <text style="font-size: 14px; color: #9ca3af; width: 80px;">姓名</text>
          <input 
            style="flex: 1; text-align: right; font-size: 14px; color: #ffffff;" 
            v-model="formData.name" 
            placeholder="请输入姓名" 
            placeholder-class="input-placeholder" 
            placeholder-style="color: #6b7280"
          />
        </view>
        
        <!-- Phone -->
        <view @click="toChangeContact('phone')" style="padding: 16px; border-bottom: 1px solid #374151; display: flex; align-items: center; justify-content: space-between;">
            <text style="font-size: 14px; color: #9ca3af; width: 80px;">手机号码</text>
            <view style="display: flex; align-items: center; gap: 4px;">
              <text style="font-size: 14px; color: #e5e7eb;">{{ userInfo.phone || '未绑定' }}</text>
              <AppIcon name="chevron-right" :size="16" color="#6b7280" />
            </view>
        </view>

        <!-- Email -->
        <view @click="toChangeContact('email')" style="padding: 16px; border-bottom: 1px solid #374151; display: flex; align-items: center; justify-content: space-between;">
            <text style="font-size: 14px; color: #9ca3af; width: 80px;">邮箱</text>
            <view style="display: flex; align-items: center; gap: 4px;">
              <text style="font-size: 14px; color: #e5e7eb;">{{ userInfo.email || '未绑定' }}</text>
              <AppIcon name="chevron-right" :size="16" color="#6b7280" />
            </view>
        </view>

        <!-- Review Points -->
        <view style="padding: 16px; display: flex; flex-direction: column; gap: 8px;">
          <view style="display: flex; align-items: center; justify-content: space-between;">
             <text style="font-size: 14px; color: #9ca3af; width: 100px;">评价奖励积分</text>
             <input 
                style="flex: 1; text-align: right; font-size: 14px; color: #ffffff;" 
                type="number" 
                v-model="formData.review_reward_points" 
                placeholder="0" 
                placeholder-class="input-placeholder"
                placeholder-style="color: #6b7280"
              />
          </view>
          <text style="font-size: 12px; color: #6b7280; text-align: right;">用户评价后获得的积分奖励</text>
        </view>
      </view>

      <view style="margin-top: 24px;">
        <view 
          @click="savePersonalInfo" 
          :style="{
             background: savingPersonal ? '#374151' : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
             borderRadius: '100px',
             padding: '12px',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center'
          }"
        >
          <text style="font-size: 16px; font-weight: 600; color: #ffffff;">{{ savingPersonal ? '保存中...' : '保存个人信息' }}</text>
        </view>
      </view>
    </view>

    <!-- Divider -->
    <view style="height: 8px; background: rgba(31, 41, 55, 0.5); margin: 0;"></view>

    <!-- SECTION 2: Provider Profile -->
    <view style="padding: 16px; padding-bottom: 40px;">
      <text style="font-size: 16px; font-weight: 700; color: #ffffff; margin-bottom: 12px; display: block; margin-left: 4px;">服务商资料</text>

      <view style="background: #1f2937; border-radius: 20px; border: 1px solid #374151; overflow: hidden;">
        <!-- Company Name -->
        <view style="padding: 16px; border-bottom: 1px solid #374151;">
          <text style="font-size: 14px; color: #9ca3af; margin-bottom: 8px; display: block;">公司名称</text>
          <input 
             style="font-size: 14px; color: #ffffff; width: 100%;" 
             v-model="providerData.company_name" 
             placeholder="请输入公司名称" 
             placeholder-class="input-placeholder"
             placeholder-style="color: #6b7280"
          />
        </view>

        <!-- Company Description -->
        <view style="padding: 16px; border-bottom: 1px solid #374151;">
          <text style="font-size: 14px; color: #9ca3af; margin-bottom: 8px; display: block;">公司描述</text>
          <textarea 
            style="width: 100%; height: 80px; font-size: 14px; color: #ffffff; line-height: 1.5;" 
            v-model="providerData.description" 
            placeholder="简要描述您的公司和服务..." 
            placeholder-class="input-placeholder"
            placeholder-style="color: #6b7280"
            :maxlength="500"
          />
          <text style="font-size: 12px; color: #6b7280; text-align: right; display: block; margin-top: 4px;">{{ providerData.description?.length || 0 }}/500</text>
        </view>

        <!-- Service Categories -->
        <view style="padding: 16px; border-bottom: 1px solid #374151;">
          <view style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <text style="font-size: 14px; color: #9ca3af;">服务类别</text>
            <view @click="goBackToDashboard" style="display: flex; align-items: center; gap: 4px;">
              <text style="font-size: 12px; color: #10b981;">申请新服务</text>
              <AppIcon name="chevron-right" :size="12" color="#10b981" />
            </view>
          </view>
          
          <view style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
            <view v-if="selectedCategories.length === 0" style="padding: 6px 12px; background: rgba(107, 114, 128, 0.1); border-radius: 6px;">
              <text style="font-size: 12px; color: #6b7280; font-style: italic;">暂无开通的服务</text>
            </view>
            <view v-else v-for="cat in selectedCategories" :key="cat" style="padding: 6px 12px; background: rgba(16, 185, 129, 0.15); border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.2);">
               <text style="font-size: 12px; color: #10b981;">{{ cat }}</text>
            </view>
          </view>
          <text style="font-size: 11px; color: #6b7280; line-height: 1.4;">服务类别需通过后台审核。如需更改或添加，请前往工作台“申请新服务”。</text>
        </view>

        <!-- Service Cities -->
        <view style="padding: 16px; border-bottom: 1px solid #374151;">
          <text style="font-size: 14px; color: #9ca3af; margin-bottom: 12px; display: block;">服务城市</text>
          <view style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px;">
            <view v-if="selectedCities.length === 0" style="padding: 6px 12px; background: rgba(107, 114, 128, 0.1); border-radius: 6px;">
              <text style="font-size: 12px; color: #6b7280; font-style: italic;">暂无已开通的城市</text>
            </view>
            <view v-else v-for="city in selectedCities" :key="city" style="padding: 6px 12px; background: rgba(16, 185, 129, 0.15); border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.2);">
               <text style="font-size: 12px; color: #10b981;">{{ city }}</text>
            </view>
          </view>
          <text style="font-size: 11px; color: #6b7280; line-height: 1.4;">服务城市需通过后台审核。如需更改或添加，请通过“申请新服务”。</text>
        </view>

        <!-- Experience -->
        <view style="padding: 16px; border-bottom: 1px solid #374151; display: flex; align-items: center; justify-content: space-between;">
          <text style="font-size: 14px; color: #9ca3af;">从业年限</text>
          <input 
            style="flex: 1; text-align: right; font-size: 14px; color: #ffffff;" 
            type="number" 
            v-model="providerData.years_experience" 
            placeholder="请输入从业年限" 
            placeholder-class="input-placeholder"
            placeholder-style="color: #6b7280" 
          />
        </view>

        <!-- Languages -->
        <!-- Languages -->
        <view @click="showLanguagePicker = true" style="padding: 16px; border-bottom: 1px solid #374151; display: flex; align-items: center; justify-content: space-between;">
          <text style="font-size: 14px; color: #9ca3af; width: 80px;">语言能力</text>
          <view style="flex: 1; display: flex; align-items: center; justify-content: flex-end; gap: 8px;">
            <view style="display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px;">
              <view v-if="selectedLanguages.length === 0">
                <text style="font-size: 14px; color: #6b7280;">请选择</text>
              </view>
              <view v-else v-for="lang in selectedLanguages" :key="lang" style="padding: 4px 10px; background: rgba(139, 92, 246, 0.15); border-radius: 6px; border: 1px solid rgba(139, 92, 246, 0.2);">
                <text style="font-size: 12px; color: #a78bfa;">{{ lang }}</text>
              </view>
            </view>
            <AppIcon name="chevron-right" :size="16" color="#6b7280" />
          </view>
        </view>

        <!-- Portfolio/Photos Content -->
        <view style="padding: 16px; border-bottom: 1px solid #374151;">
          <text style="font-size: 14px; color: #9ca3af; margin-bottom: 12px; display: block;">业务内容/照片 (最多9张)</text>
          <view style="display: flex; flex-wrap: wrap; gap: 8px;">
            <view v-for="(img, index) in providerData.portfolio" :key="index" style="position: relative; width: 80px; height: 80px; border-radius: 8px; overflow: hidden;">
              <image :src="img" mode="aspectFill" style="width: 100%; height: 100%;" @click="previewPortfolioPhoto(index)" />
              <view @click.stop="removePortfolioPhoto(index)" style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.5); padding: 4px; border-radius: 50%;">
                <AppIcon name="x" :size="10" color="#ffffff" />
              </view>
            </view>
            <view v-if="providerData.portfolio.length < 9" @click="choosePortfolioPhotos" style="width: 80px; height: 80px; background: rgba(75, 85, 99, 0.2); border: 1px dashed #4b5563; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
              <AppIcon name="plus" :size="24" color="#6b7280" />
              <text style="font-size: 10px; color: #6b7280; margin-top: 4px;">添加照片</text>
            </view>
          </view>
        </view>

        <!-- Driver License -->
        <view style="padding: 16px; border-bottom: 1px solid #374151; display: flex; align-items: center; justify-content: space-between;">
          <text style="font-size: 14px; color: #9ca3af; width: 100px;">驾照号码</text>
          <input 
            style="flex: 1; text-align: right; font-size: 14px; color: #ffffff;" 
            v-model="providerData.driver_license" 
            placeholder="可选" 
            placeholder-class="input-placeholder"
             placeholder-style="color: #6b7280"
          />
        </view>

        <!-- SIN -->
        <view style="padding: 16px; display: flex; align-items: center; justify-content: space-between;">
          <text style="font-size: 14px; color: #9ca3af; width: 100px;">SIN/SSN</text>
          <input 
            style="flex: 1; text-align: right; font-size: 14px; color: #ffffff;" 
            v-model="providerData.sin" 
            placeholder="可选" 
            placeholder-class="input-placeholder"
             placeholder-style="color: #6b7280"
          />
        </view>
      </view>

      <view style="margin-top: 24px;">
        <view 
          @click="saveProviderProfile" 
          :style="{
             background: savingProvider ? '#374151' : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
             borderRadius: '100px',
             padding: '12px',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center'
          }"
        >
          <text style="font-size: 16px; font-weight: 600; color: #ffffff;">{{ savingProvider ? '保存中...' : '保存服务商资料' }}</text>
        </view>
      </view>
    </view>


    <!-- City Picker Modal -->
    <view v-if="showCityPicker" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); z-index: 999; display: flex; align-items: flex-end;" @click="showCityPicker = false">
      <view style="width: 100%; height: 70vh; background: #1f2937; border-top-left-radius: 20px; border-top-right-radius: 20px; display: flex; flex-direction: column;" @click.stop>
        <view style="padding: 16px; text-align: center; border-bottom: 1px solid #374151;">
             <text style="font-size: 16px; font-weight: 700; color: #ffffff;">选择服务城市</text>
        </view>
        
        <!-- Province Tabs -->
        <view style="display: flex; white-space: nowrap; overflow-x: auto; padding: 12px 16px; border-bottom: 1px solid #374151;">
          <view 
            v-for="prov in provinceList" 
            :key="prov.value"
            @click="selectedProvince = prov.value"
            :style="{
               padding: '6px 16px',
               borderRadius: '100px',
               marginRight: '10px',
               background: selectedProvince === prov.value ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
               border: selectedProvince === prov.value ? '1px solid #10b981' : '1px solid #374151'
            }"
          >
            <text :style="{ fontSize: '12px', fontWeight: '500', color: selectedProvince === prov.value ? '#10b981' : '#9ca3af' }">{{ prov.label }}</text>
          </view>
        </view>

        <!-- Cities -->
        <scroll-view scroll-y style="flex: 1; padding: 0 16px;">
          <view 
            v-for="city in availableCities" 
            :key="city" 
            @click="toggleCity(city)"
            style="flex-direction: row; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid #374151; display: flex;"
          >
            <text :style="{ fontSize: '14px', color: selectedCities.includes(city) ? '#10b981' : '#e5e7eb' }">{{ city }}</text>
            <AppIcon v-if="selectedCities.includes(city)" name="check" :size="20" color="#10b981" />
          </view>
        </scroll-view>

        <view style="padding: 16px; border-top: 1px solid #374151; display: flex; gap: 16px;">
          <view @click="showCityPicker = false" style="flex: 1; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 22px; background: #374151;">
             <text style="color: #ffffff; font-size: 14px;">取消</text>
          </view>
          <view @click="showCityPicker = false" style="flex: 1; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 22px; background: #10b981;">
             <text style="color: #ffffff; font-size: 14px; font-weight: 600;">确定</text>
          </view>
        </view>
      </view>
    </view>

    <!-- Language Picker Modal -->
    <view v-if="showLanguagePicker" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); z-index: 999; display: flex; align-items: flex-end;" @click="showLanguagePicker = false">
      <view style="width: 100%; height: 50vh; background: #1f2937; border-top-left-radius: 20px; border-top-right-radius: 20px; display: flex; flex-direction: column;" @click.stop>
        <view style="padding: 16px; text-align: center; border-bottom: 1px solid #374151;">
            <text style="font-size: 16px; font-weight: 700; color: #ffffff;">选择语言能力</text>
        </view>
        <scroll-view scroll-y style="flex: 1; padding: 0 16px;">
          <view 
            v-for="lang in languageOptions" 
            :key="lang" 
            @click="toggleLanguage(lang)"
             style="flex-direction: row; align-items: center; justify-content: space-between; padding: 16px 0; border-bottom: 1px solid #374151; display: flex;"
          >
            <text :style="{ fontSize: '14px', color: selectedLanguages.includes(lang) ? '#10b981' : '#e5e7eb' }">{{ lang }}</text>
            <AppIcon v-if="selectedLanguages.includes(lang)" name="check" :size="20" color="#10b981" />
          </view>
        </scroll-view>
        <view style="padding: 16px; border-top: 1px solid #374151; display: flex; gap: 16px;">
          <view @click="showLanguagePicker = false" style="flex: 1; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 22px; background: #374151;">
             <text style="color: #ffffff; font-size: 14px;">取消</text>
          </view>
          <view @click="showLanguagePicker = false" style="flex: 1; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 22px; background: #10b981;">
             <text style="color: #ffffff; font-size: 14px; font-weight: 600;">确定</text>
          </view>
        </view>
      </view>
    </view>
    <!-- Avatar Cropper Modal -->
    <AvatarCropper 
      :show="showCropper" 
      :image-src="tempAvatarSrc" 
      @confirm="onCropConfirm" 
      @cancel="onCropCancel" 
    />

  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import AppIcon from '@/components/Icons.vue';
import AvatarCropper from '@/components/AvatarCropper.vue';
import { getUserInfo, authApi, setUserInfo, categoriesApi, uploadApi, citiesApi, providersApi } from '@/services/api';

const userInfo = ref<any>({});
const avatarUrl = ref('');
const savingPersonal = ref(false);
const savingProvider = ref(false);

// Cropper State
const showCropper = ref(false);
const tempAvatarSrc = ref('');

// Personal Info Form
const formData = reactive({ 
    name: '',
    review_reward_points: 0
});

// Provider Profile Form
const providerData = reactive({
    company_name: '',
    description: '',
    years_experience: 0,
    portfolio: [] as string[],
    driver_license: '',
    sin: ''
});

// Multi-select states
const selectedCategories = ref<string[]>([]);
const selectedCities = ref<string[]>([]);
const selectedLanguages = ref<string[]>([]);

// Modal states
const showCityPicker = ref(false);
const showLanguagePicker = ref(false);

// Data sources
const categories = ref<string[]>([]);
const languageOptions = ['国语', '粤语', '英语', '法语', '西班牙语'];

const provinceList = ref<{label: string, value: string}[]>([]);

const PROVINCE_MAPPING: Record<string, string> = {
    'British Columbia (BC)': '卑诗 BC',
    'Ontario (ON)': '安省 ON',
    'Alberta (AB)': '阿省 AB',
    'Quebec (QC)': '魁省 QC',
    'Manitoba (MB)': '曼省 MB',
    'Saskatchewan (SK)': '萨省 SK',
    'Nova Scotia (NS)': '新省 NS',
    'New Brunswick (NB)': '纽省 NB',
    'PEI (PE)': '爱德华王子岛',
    'Newfoundland (NL)': '纽芬兰'
};

const provinceToCities = reactive<Record<string, string[]>>({
    'British Columbia (BC)': [],
    'Ontario (ON)': [],
    'Alberta (AB)': [],
    'Quebec (QC)': [],
    'Manitoba (MB)': [],
    'Saskatchewan (SK)': []
});

const selectedProvince = ref('Ontario (ON)');
const availableCities = computed(() => {
    return selectedProvince.value ? (provinceToCities[selectedProvince.value] || []) : [];
});

onMounted(async () => {
    const u = getUserInfo();
    userInfo.value = u || {};
    formData.name = u?.name || '';
    avatarUrl.value = u?.avatar_url || '';
    
    // Fetch approved service categories and cities from applications
    try {
        const appsRes = await providersApi.getServiceTypeApplications();
        if (appsRes && appsRes.applications) {
            const approvedApps = appsRes.applications.filter((app: any) => app.status === 'approved');
            
            // Sync categories
            selectedCategories.value = approvedApps.map((app: any) => app.category);
            
            // Sync cities from extra_data
            const citiesSet = new Set<string>();
            approvedApps.forEach((app: any) => {
                const ed = app.extra_data || {};
                const cityStr = ed.service_city || ed.city || '';
                if (cityStr) {
                    cityStr.split(',').forEach((c: string) => citiesSet.add(c.trim()));
                }
            });
            if (citiesSet.size > 0) {
                selectedCities.value = Array.from(citiesSet);
            }
        }
    } catch (e) {
        console.error('Failed to fetch service applications:', e);
    }

    // Fetch cities
    try {
        const citiesRes = await citiesApi.getActive();
        if (Array.isArray(citiesRes) && citiesRes.length > 0) {
            const provinces = new Set<string>();
            citiesRes.forEach((c: any) => {
                const province = c.province || 'Other';
                provinces.add(province);
                
                if (!provinceToCities[province]) {
                    provinceToCities[province] = [];
                }
                provinceToCities[province].push(c.name);
            });

            // Populate province list for tabs
            provinceList.value = Array.from(provinces).map(p => ({
                label: PROVINCE_MAPPING[p] || p,
                value: p
            })).sort((a, b) => {
                // Keep Ontario first if possible
                if (a.value === 'Ontario (ON)') return -1;
                if (b.value === 'Ontario (ON)') return 1;
                return a.value.localeCompare(b.value);
            });
            
            if (provinceList.value.length > 0 && !provinceList.value.find(p => p.value === selectedProvince.value)) {
                selectedProvince.value = provinceList.value[0].value;
            }
        } else {
            throw new Error('No active cities returned');
        }
    } catch (e) {
        console.error('Failed to fetch cities (using fallback):', e);
        // Fallback hardcoded if API fails
        provinceToCities['British Columbia (BC)'] = ['温哥华', '列治文', '本拿比'];
        provinceToCities['Ontario (ON)'] = ['多伦多', '万锦', '列治文山', '滑铁卢', '渥太华'];
        provinceToCities['Alberta (AB)'] = ['卡尔加里', '埃德蒙顿'];
        provinceToCities['Quebec (QC)'] = ['蒙特利尔'];
    }

    // Fetch provider profile
    try {
        const res = await authApi.getProviderProfile();
        if (res.profile) {
            formData.review_reward_points = res.profile.review_reward_points || 0;
            providerData.company_name = res.profile.company_name || '';
            providerData.description = res.profile.description || '';
            providerData.years_experience = res.profile.years_experience || 0;
            
            if (res.profile.service_categories) {
                // If we want to merge or override, but user said keep it consistent with dashboard
                // For now, applications are the source of truth for "official" categories.
                // We don't overwrite selectedCategories.value here if it was already set by applications
                if (selectedCategories.value.length === 0) {
                    selectedCategories.value = res.profile.service_categories.split(',');
                }
            }
            if (res.profile.service_city) {
                // Only use if not already populated from applications
                if (selectedCities.value.length === 0) {
                    selectedCities.value = res.profile.service_city.split(',');
                }
            }
            if (res.profile.languages) {
                selectedLanguages.value = res.profile.languages.split(',');
            }
            if (res.profile.portfolio) {
                providerData.portfolio = Array.isArray(res.profile.portfolio) ? res.profile.portfolio : [];
            } else if (res.profile.extra_data?.portfolio) {
                providerData.portfolio = Array.isArray(res.profile.extra_data.portfolio) ? res.profile.extra_data.portfolio : [];
            }
        }
    } catch (e) {
        console.error('Failed to fetch provider profile:', e);
    }
});

const goBackToDashboard = () => {
    uni.navigateTo({ url: '/pages/provider/select-services' });
};

const goBack = () => {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
  } else {
    uni.reLaunch({ url: '/pages/index/index?view=provider' });
  }
};

const uploadAvatar = () => {
    uni.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'], // Allow original for better cropping
        sourceType: ['album', 'camera'],
        success: (res) => {
            tempAvatarSrc.value = res.tempFilePaths[0];
            showCropper.value = true;
        }
    });
};

const onCropConfirm = async (croppedPath: string) => {
    showCropper.value = false;
    uni.showLoading({ title: '上传中...' });
    
    try {
        const cloudUrl = await uploadApi.uploadFile(croppedPath);
        avatarUrl.value = cloudUrl;
        uni.hideLoading();
        uni.showToast({ title: '头像已更新预览', icon: 'success' });
    } catch (e: any) {
        uni.hideLoading();
        uni.showToast({ title: e.message || '上传失败', icon: 'none' });
    }
};

const onCropCancel = () => {
    showCropper.value = false;
    tempAvatarSrc.value = '';
};

const savePersonalInfo = async () => {
    if (!formData.name) return uni.showToast({ title: '姓名不能为空', icon: 'none' });
    
    savingPersonal.value = true;
    try {
        const res = await authApi.updateProfile({ 
            name: formData.name,
            avatar: avatarUrl.value
        });
        await authApi.updateProviderProfile({ 
            review_reward_points: Number(formData.review_reward_points) 
        });
        
        setUserInfo(res.user);
        userInfo.value = res.user;
        avatarUrl.value = res.user?.avatar_url || avatarUrl.value;
        uni.showToast({ title: '个人信息已保存', icon: 'success' });
    } catch (e: any) {
        uni.showToast({ title: e.message || '保存失败', icon: 'none' });
    } finally {
        savingPersonal.value = false;
    }
};

const saveProviderProfile = async () => {
    if (!providerData.company_name) {
        return uni.showToast({ title: '公司名称不能为空', icon: 'none' });
    }
    
    savingProvider.value = true;
    try {
        await authApi.updateProviderProfile({
            company_name: providerData.company_name,
            description: providerData.description,
            service_categories: selectedCategories.value.join(','),
            service_city: selectedCities.value.join(','),
            years_experience: Number(providerData.years_experience),
            languages: selectedLanguages.value.join(','),
            portfolio: providerData.portfolio
        });
        
        uni.showToast({ title: '服务商资料已保存', icon: 'success' });
    } catch (e: any) {
        uni.showToast({ title: e.message || '保存失败', icon: 'none' });
    } finally {
        savingProvider.value = false;
    }
};

const toChangeContact = (type: string) => {
    uni.navigateTo({ url: `/pages/provider/change-contact?type=${type}` });
};

const choosePortfolioPhotos = () => {
    uni.chooseImage({
        count: 9 - providerData.portfolio.length,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
            const tempFilePaths = res.tempFilePaths;
            uni.showLoading({ title: '上传中...', mask: true });
            
            try {
                for (const path of tempFilePaths) {
                    const cloudUrl = await uploadApi.uploadFile(path);
                    providerData.portfolio.push(cloudUrl);
                }
                uni.showToast({ title: '图片上传成功', icon: 'success' });
            } catch (e: any) {
                console.error('Portfolio upload failed:', e);
                uni.showToast({ title: e.message || '部分图片上传失败', icon: 'none' });
            } finally {
                uni.hideLoading();
            }
        }
    });
};

const removePortfolioPhoto = (index: number) => {
    uni.showModal({
        title: '删除照片',
        content: '确定要删除这张照片吗？',
        success: (res) => {
            if (res.confirm) {
                providerData.portfolio.splice(index, 1);
            }
        }
    });
};

const previewPortfolioPhoto = (index: number) => {
    uni.previewImage({
        current: providerData.portfolio[index],
        urls: providerData.portfolio
    });
};

const toggleCategory = (cat: string) => {
    const idx = selectedCategories.value.indexOf(cat);
    if (idx > -1) {
        selectedCategories.value.splice(idx, 1);
    } else {
        selectedCategories.value.push(cat);
    }
};

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
</script>

<style scoped>
/* Page Container */
.page-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  /* padding-top handled by GlobalNavbar */
  display: flex;
  flex-direction: column;
}

/* Header styles removed, replaced by GlobalNavbar */

/* Section Container */
.section-container {
  margin: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.section-title.provider {
  color: #8b5cf6;
}

/* Avatar */
.categories-read-only {
  background-color: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 8px;
}

.form-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.apply-link {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: rgba(16, 185, 129, 0.1);
  padding: 4px 10px;
  border-radius: 20px;
}

.apply-link-text {
  font-size: 12px;
  color: #10b981;
  font-weight: 500;
}

.tags-container.no-border {
  border: none;
  padding: 0;
  min-height: auto;
}

.tag.approved {
  background-color: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.tag.approved .tag-text {
  color: #34d399;
}

.field-hint {
  font-size: 11px;
  color: #6b7280;
  margin-top: 10px;
  display: block;
  line-height: 1.4;
}

.avatar-section {
  padding: 30px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.2);
  border: 3px solid rgba(16, 185, 129, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
}

.avatar-text {
  font-size: 40px;
  font-weight: bold;
  color: #10b981;
}

.avatar-hint {
  font-size: 13px;
  color: #10b981;
  font-weight: 500;
}

/* Form */
.form-container {
  background: #1f2937;
  border-radius: 16px;
  border: 1px solid #374151;
  overflow: hidden;
  margin-bottom: 20px;
}

.form-item {
  padding: 16px;
  border-bottom: 1px solid #374151;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.last-item {
  border-bottom: none;
}

.form-label {
  font-size: 13px;
  color: #9ca3af;
  font-weight: 500;
}

.form-input {
  font-size: 16px;
  color: #ffffff;
  background: transparent;
  border: none;
  height: 24px;
  line-height: 24px;
}

.form-textarea {
  font-size: 15px;
  color: #ffffff;
  background: #111827;
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 12px;
  min-height: 100px;
  line-height: 1.5;
}

/* Portfolio Grid */
.portfolio-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 8px;
}

.portfolio-item {
  aspect-ratio: 1;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #111827;
  border: 1px solid #374151;
}

.portfolio-image {
  width: 100%;
  height: 100%;
}

.delete-photo {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.upload-trigger {
  aspect-ratio: 1;
  border: 1px dashed #4b5563;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: rgba(255, 255, 255, 0.05);
}

.upload-text {
  font-size: 11px;
  color: #6b7280;
}

.char-count {
  font-size: 12px;
  color: #6b7280;
  text-align: right;
  margin-top: 4px;
}

.input-with-hint {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.input-hint {
  font-size: 12px;
  color: #6b7280;
}

.placeholder {
  color: #4b5563;
}

.form-row-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.form-val-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.form-value {
  font-size: 15px;
  color: #d1d5db;
}

/* Tags */
.tags-container {
  min-height: 40px;
  display: flex;
  align-items: center;
}

.placeholder-tag {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  width: 100%;
  justify-content: space-between;
}

.placeholder-text {
  font-size: 15px;
  color: #6b7280;
}

.selected-tags {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  flex: 1;
}

.tag {
  background: #10b981;
  padding: 4px 12px;
  border-radius: 12px;
}

.tag-text {
  font-size: 13px;
  color: #ffffff;
  font-weight: 500;
}

/* Save Button */
.save-btn-container {
  margin-top: 10px;
}

.save-btn {
  background: #10b981;
  padding: 14px;
  border-radius: 12px;
  text-align: center;
}

.save-btn.provider {
  background: #8b5cf6;
}

.save-btn.saving {
  opacity: 0.6;
}

.save-text {
  font-size: 16px;
  color: #ffffff;
  font-weight: 600;
}

/* Divider */
.divider {
  height: 8px;
  background: #0f172a;
  margin: 20px 0;
}

/* Modal */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 85%;
  max-height: 70vh;
  background: #1f2937;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #374151;
  display: flex;
  flex-direction: column;
}

.modal-title {
  font-size: 18px;
  font-weight: bold;
  color: #f3f4f6;
  margin-bottom: 16px;
}

.province-tabs {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.province-tab {
  padding: 6px 12px;
  background: #111827;
  border: 1px solid #374151;
  border-radius: 8px;
}

.province-tab.active {
  background: #10b981;
  border-color: #10b981;
}

.province-tab-text {
  font-size: 13px;
  color: #9ca3af;
}

.province-tab.active .province-tab-text {
  color: #ffffff;
  font-weight: 600;
}

.picker-scroll {
  flex: 1;
  max-height: 400px;
}

.picker-item {
  padding: 14px 16px;
  border-bottom: 1px solid #374151;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.picker-item.selected {
  background: rgba(16, 185, 129, 0.1);
}

.picker-text {
  font-size: 15px;
  color: #d1d5db;
}

.picker-item.selected .picker-text {
  color: #10b981;
  font-weight: 600;
}

.modal-footer {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.modal-btn {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
}

.modal-btn.cancel {
  background: #374151;
  color: #d1d5db;
}

.modal-btn.confirm {
  background: #10b981;
  color: #ffffff;
}
</style>
