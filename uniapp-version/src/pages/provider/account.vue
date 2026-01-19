<template>
  <view class="page-container">
    <!-- Header -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <AppIcon name="chevron-left" :size="24" color="#ffffff"/>
      </view>
      <text class="header-title">账户信息</text>
      <view class="placeholder"></view>
    </view>

    <!-- SECTION 1: Personal Information -->
    <view class="section-container">
      <text class="section-title">个人信息</text>
      
      <!-- Avatar Section -->
      <view class="avatar-section" @click="uploadAvatar">
        <view class="avatar-circle">
          <image v-if="avatarUrl" :src="avatarUrl" class="avatar-image" mode="aspectFill" />
          <text v-else class="avatar-text">{{ formData.name ? formData.name.charAt(0).toUpperCase() : 'U' }}</text>
        </view>
        <text class="avatar-hint">点击更换头像</text>
      </view>

      <!-- Form Section -->
      <view class="form-container">
        <view class="form-item">
          <text class="form-label">姓名</text>
          <input class="form-input" v-model="formData.name" placeholder="请输入姓名" placeholder-class="placeholder" />
        </view>
        
        <view class="form-item" @click="toChangeContact('phone')">
          <view class="form-row-content">
            <text class="form-label">手机号码</text>
            <view class="form-val-row">
              <text class="form-value">{{ userInfo.phone || '未绑定' }}</text>
              <AppIcon name="chevron-right" :size="16" color="#4b5563" />
            </view>
          </view>
        </view>

        <view class="form-item" @click="toChangeContact('email')">
          <view class="form-row-content">
            <text class="form-label">邮箱</text>
            <view class="form-val-row">
              <text class="form-value">{{ userInfo.email || '未绑定' }}</text>
              <AppIcon name="chevron-right" :size="16" color="#4b5563" />
            </view>
          </view>
        </view>

        <view class="form-item last-item">
          <text class="form-label">评价奖励积分</text>
          <view class="input-with-hint">
            <input 
              class="form-input" 
              type="number" 
              v-model="formData.review_reward_points" 
              placeholder="0" 
              placeholder-class="placeholder" 
            />
            <text class="input-hint">用户评价后获得的积分奖励</text>
          </view>
        </view>
      </view>

      <view class="save-btn-container">
        <view class="save-btn" @click="savePersonalInfo" :class="{ 'saving': savingPersonal }">
          <text class="save-text">{{ savingPersonal ? '保存中...' : '保存个人信息' }}</text>
        </view>
      </view>
    </view>

    <!-- Divider -->
    <view class="divider"></view>

    <!-- SECTION 2: Provider Profile -->
    <view class="section-container">
      <text class="section-title provider">服务商资料</text>

      <view class="form-container">
        <view class="form-item">
          <text class="form-label">公司名称</text>
          <input class="form-input" v-model="providerData.company_name" placeholder="请输入公司名称" placeholder-class="placeholder" />
        </view>

        <view class="form-item">
          <text class="form-label">公司描述</text>
          <textarea 
            class="form-textarea" 
            v-model="providerData.description" 
            placeholder="简要描述您的公司和服务..." 
            placeholder-class="placeholder"
            :maxlength="500"
          />
          <text class="char-count">{{ providerData.description?.length || 0 }}/500</text>
        </view>

        <view class="form-item" @click="showCategoryPicker = true">
          <text class="form-label">服务类别</text>
          <view class="tags-container">
            <view v-if="selectedCategories.length === 0" class="placeholder-tag">
              <text class="placeholder-text">点击选择服务类别</text>
              <AppIcon name="chevron-right" :size="16" color="#6b7280" />
            </view>
            <view v-else class="selected-tags">
              <view v-for="cat in selectedCategories" :key="cat" class="tag">
                <text class="tag-text">{{ cat }}</text>
              </view>
              <AppIcon name="chevron-right" :size="16" color="#6b7280" style="margin-left: 8px;" />
            </view>
          </view>
        </view>

        <view class="form-item" @click="showCityPicker = true">
          <text class="form-label">服务城市</text>
          <view class="tags-container">
            <view v-if="selectedCities.length === 0" class="placeholder-tag">
              <text class="placeholder-text">点击选择服务城市</text>
              <AppIcon name="chevron-right" :size="16" color="#6b7280" />
            </view>
            <view v-else class="selected-tags">
              <view v-for="city in selectedCities" :key="city" class="tag">
                <text class="tag-text">{{ city }}</text>
              </view>
              <AppIcon name="chevron-right" :size="16" color="#6b7280" style="margin-left: 8px;" />
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="form-label">从业年限</text>
          <input 
            class="form-input" 
            type="number" 
            v-model="providerData.years_experience" 
            placeholder="请输入从业年限" 
            placeholder-class="placeholder" 
          />
        </view>

        <view class="form-item last-item" @click="showLanguagePicker = true">
          <text class="form-label">语言能力</text>
          <view class="tags-container">
            <view v-if="selectedLanguages.length === 0" class="placeholder-tag">
              <text class="placeholder-text">点击选择语言</text>
              <AppIcon name="chevron-right" :size="16" color="#6b7280" />
            </view>
            <view v-else class="selected-tags">
              <view v-for="lang in selectedLanguages" :key="lang" class="tag">
                <text class="tag-text">{{ lang }}</text>
              </view>
              <AppIcon name="chevron-right" :size="16" color="#6b7280" style="margin-left: 8px;" />
            </view>
          </view>
        </view>
      </view>

      <view class="save-btn-container">
        <view class="save-btn provider" @click="saveProviderProfile" :class="{ 'saving': savingProvider }">
          <text class="save-text">{{ savingProvider ? '保存中...' : '保存服务商资料' }}</text>
        </view>
      </view>
    </view>

    <!-- Category Picker Modal -->
    <view v-if="showCategoryPicker" class="modal-mask" @click="showCategoryPicker = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">选择服务类别</text>
        <scroll-view scroll-y class="picker-scroll">
          <view 
            v-for="cat in categories" 
            :key="cat" 
            class="picker-item"
            :class="{ 'selected': selectedCategories.includes(cat) }"
            @click="toggleCategory(cat)"
          >
            <text class="picker-text">{{ cat }}</text>
            <AppIcon v-if="selectedCategories.includes(cat)" name="check" :size="20" color="#10b981" />
          </view>
        </scroll-view>
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="showCategoryPicker = false">取消</view>
          <view class="modal-btn confirm" @click="showCategoryPicker = false">确定</view>
        </view>
      </view>
    </view>

    <!-- City Picker Modal -->
    <view v-if="showCityPicker" class="modal-mask" @click="showCityPicker = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">选择服务城市</text>
        
        <!-- Province Tabs -->
        <view class="province-tabs">
          <view 
            v-for="prov in provinceList" 
            :key="prov.value"
            class="province-tab"
            :class="{ 'active': selectedProvince === prov.value }"
            @click="selectedProvince = prov.value"
          >
            <text class="province-tab-text">{{ prov.label }}</text>
          </view>
        </view>

        <!-- Cities -->
        <scroll-view scroll-y class="picker-scroll">
          <view 
            v-for="city in availableCities" 
            :key="city" 
            class="picker-item"
            :class="{ 'selected': selectedCities.includes(city) }"
            @click="toggleCity(city)"
          >
            <text class="picker-text">{{ city }}</text>
            <AppIcon v-if="selectedCities.includes(city)" name="check" :size="20" color="#10b981" />
          </view>
        </scroll-view>

        <view class="modal-footer">
          <view class="modal-btn cancel" @click="showCityPicker = false">取消</view>
          <view class="modal-btn confirm" @click="showCityPicker = false">确定</view>
        </view>
      </view>
    </view>

    <!-- Language Picker Modal -->
    <view v-if="showLanguagePicker" class="modal-mask" @click="showLanguagePicker = false">
      <view class="modal-content" @click.stop>
        <text class="modal-title">选择语言能力</text>
        <scroll-view scroll-y class="picker-scroll">
          <view 
            v-for="lang in languageOptions" 
            :key="lang" 
            class="picker-item"
            :class="{ 'selected': selectedLanguages.includes(lang) }"
            @click="toggleLanguage(lang)"
          >
            <text class="picker-text">{{ lang }}</text>
            <AppIcon v-if="selectedLanguages.includes(lang)" name="check" :size="20" color="#10b981" />
          </view>
        </scroll-view>
        <view class="modal-footer">
          <view class="modal-btn cancel" @click="showLanguagePicker = false">取消</view>
          <view class="modal-btn confirm" @click="showLanguagePicker = false">确定</view>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { getUserInfo, authApi, setUserInfo, categoriesApi } from '@/services/api';

const userInfo = ref<any>({});
const avatarUrl = ref('');
const savingPersonal = ref(false);
const savingProvider = ref(false);

// Personal Info Form
const formData = reactive({ 
    name: '',
    review_reward_points: 0
});

// Provider Profile Form
const providerData = reactive({
    company_name: '',
    description: '',
    years_experience: 0
});

// Multi-select states
const selectedCategories = ref<string[]>([]);
const selectedCities = ref<string[]>([]);
const selectedLanguages = ref<string[]>([]);

// Modal states
const showCategoryPicker = ref(false);
const showCityPicker = ref(false);
const showLanguagePicker = ref(false);

// Data sources
const categories = ref<string[]>([]);
const languageOptions = ['国语', '粤语', '英语', '法语', '西班牙语'];

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

onMounted(async () => {
    const u = getUserInfo();
    userInfo.value = u || {};
    formData.name = u?.name || '';
    avatarUrl.value = u?.avatar_url || '';
    
    // Fetch categories
    try {
        const catRes = await categoriesApi.getAll();
        categories.value = catRes.categories
            .filter((c: any) => !c.parent_id && c.is_active)
            .map((c: any) => c.name);
    } catch (e) {
        console.error('Failed to fetch categories:', e);
        categories.value = ['搬家服务', '接送服务', '家庭清洁', '日常保洁', '水管维修', '电路维修', '房产交易', '汽车服务'];
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
                selectedCategories.value = res.profile.service_categories.split(',');
            }
            if (res.profile.service_city) {
                selectedCities.value = res.profile.service_city.split(',');
            }
            if (res.profile.languages) {
                selectedLanguages.value = res.profile.languages.split(',');
            }
        }
    } catch (e) {
        console.error('Failed to fetch provider profile:', e);
    }
});

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
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
            const tempFilePath = res.tempFilePaths[0];
            uni.showLoading({ title: '上传中...' });
            
            try {
                // TODO: Implement avatar upload API
                // For now, just set the local path
                avatarUrl.value = tempFilePath;
                uni.hideLoading();
                uni.showToast({ title: '头像已更新（本地）', icon: 'success' });
            } catch (e: any) {
                uni.hideLoading();
                uni.showToast({ title: e.message || '上传失败', icon: 'none' });
            }
        }
    });
};

const savePersonalInfo = async () => {
    if (!formData.name) return uni.showToast({ title: '姓名不能为空', icon: 'none' });
    
    savingPersonal.value = true;
    try {
        const res = await authApi.updateProfile({ name: formData.name });
        await authApi.updateProviderProfile({ 
            review_reward_points: Number(formData.review_reward_points) 
        });
        
        setUserInfo(res.user);
        userInfo.value = res.user;
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
            languages: selectedLanguages.value.join(',')
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
  padding-top: env(safe-area-inset-top);
  display: flex;
  flex-direction: column;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: #1f2937;
  border-bottom: 1px solid #374151;
}

.back-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
}

.header-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
}

.placeholder {
  width: 40px;
}

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
