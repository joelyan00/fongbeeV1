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

        <view class="form-item categories-read-only">
          <view class="form-label-row">
            <text class="form-label">服务类别</text>
            <view class="apply-link" @click="goBackToDashboard">
              <text class="apply-link-text">申请新服务</text>
              <AppIcon name="chevron-right" :size="12" color="#10b981" />
            </view>
          </view>
          <view class="tags-container no-border">
            <view v-if="selectedCategories.length === 0" class="placeholder-tag">
              <text class="placeholder-text italic">暂无开通的服务</text>
            </view>
            <view v-else class="selected-tags">
              <view v-for="cat in selectedCategories" :key="cat" class="tag approved">
                <text class="tag-text">{{ cat }}</text>
              </view>
            </view>
          </view>
          <text class="field-hint">服务类别需通过后台审核。如需更改或添加，请前往工作台“申请新服务”。</text>
        </view>

        <view class="form-item">
          <text class="form-label">服务城市</text>
          <view class="tags-container">
            <view v-if="selectedCities.length === 0" class="placeholder-tag disabled">
              <text class="placeholder-text">暂无已开通的城市</text>
            </view>
            <view v-else class="selected-tags">
              <view v-for="city in selectedCities" :key="city" class="tag approved">
                <text class="tag-text">{{ city }}</text>
              </view>
            </view>
          </view>
          <text class="field-hint">服务城市需通过后台审核。如需更改或添加，请通过“申请新服务”。</text>
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

        <!-- Portfolio/Photos Content -->
        <view class="form-item portfolio-section">
          <text class="form-label">业务内容/照片 (最多9张)</text>
          <view class="portfolio-grid">
            <view v-for="(img, index) in providerData.portfolio" :key="index" class="portfolio-item">
              <image :src="img" mode="aspectFill" class="portfolio-image" @click="previewPortfolioPhoto(index)" />
              <view class="delete-photo" @click.stop="removePortfolioPhoto(index)">
                <AppIcon name="x" :size="12" color="#ffffff" />
              </view>
            </view>
            <view v-if="providerData.portfolio.length < 9" class="upload-trigger" @click="choosePortfolioPhotos">
              <AppIcon name="plus" :size="24" color="#4b5563" />
              <text class="upload-text">添加照片</text>
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
    portfolio: [] as string[]
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
