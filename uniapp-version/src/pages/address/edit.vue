<template>
    <view class="min-h-screen bg-white">
      <!-- Header -->
      <view class="header-gradient pt-safe px-4 pb-4">
        <view class="flex flex-row items-center justify-between py-3">
          <view class="w-10 h-10 flex items-center justify-center bg-white-20 rounded-full active:opacity-70" @click="handleBack">
            <AppIcon name="chevron-left" :size="24" :style="{ color: '#ffffff' }" />
          </view>
          <text class="text-white text-lg font-bold">{{ isEdit ? '编辑地址' : '添加新地址' }}</text>
          <view class="w-10"></view>
        </view>
      </view>
  
      <!-- Form -->
      <view class="p-6">
          <view class="form-group">
              <text class="label">联系人</text>
              <input class="input" placeholder="请输入姓名" v-model="form.name" />
          </view>
          <view class="form-group">
              <text class="label">手机号码</text>
              <input class="input" placeholder="请输入手机号码" type="number" v-model="form.phone" />
          </view>
          <view class="form-group">
              <text class="label">街道地址</text>
              <input id="autocomplete-input" class="input" placeholder="街道名，门牌号" v-model="form.address_line1" />
          </view>
          <view class="form-group">
              <text class="label">公寓/单元 (选填)</text>
              <input class="input" placeholder="例如：Unit 101" v-model="form.address_line2" />
          </view>
          <view class="flex flex-row gap-4">
            <view class="form-group flex-1">
                <text class="label">城市</text>
                <input class="input" placeholder="City" v-model="form.city" />
            </view>
            <view class="form-group w-32">
                <text class="label">邮编</text>
                <input class="input" placeholder="Zip" v-model="form.postal_code" />
            </view>
          </view>
          <view class="flex flex-row gap-4">
              <view class="form-group flex-1">
                  <text class="label">省份</text>
                  <input class="input" placeholder="Province/State" v-model="form.state" />
              </view>
              <view class="form-group flex-1">
                  <text class="label">国家</text>
                  <input class="input bg-gray-50 text-gray-500" disabled value="Canada" />
              </view>
          </view>
  
          <view class="flex flex-row items-center gap-3 mt-4" @click="form.is_default = !form.is_default">
              <view class="w-5 h-5 rounded border border-gray-300 flex items-center justify-center" :class="{'bg-emerald-500 border-emerald-500': form.is_default}">
                   <AppIcon name="check" :size="14" color="#fff" v-if="form.is_default" />
              </view>
              <text class="text-gray-700">设为默认地址</text>
          </view>
  
          <button class="save-btn" @click="handleSave">保存</button>
      </view>
    </view>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { onLoad } from '@dcloudio/uni-app';
  import AppIcon from '../../components/Icons.vue';
  import { addressApi, getUserInfo } from '../../services/api';
  
  const isEdit = ref(false);
  const form = ref({
      id: '',
      name: '',
      phone: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'Canada',
      is_default: false
  });
  
  onLoad((options: any) => {
      if (options.data) {
          try {
              const data = JSON.parse(decodeURIComponent(options.data));
              form.value = { ...data };
              isEdit.value = true;
          } catch (e) {
              console.error(e);
          }
      } else {
          // Pre-fill from user info
          const user = getUserInfo();
          if (user) {
              form.value.name = user.name || '';
              form.value.phone = user.phone || '';
          }
      }
  });

  onMounted(() => {
    // Google Autocomplete
    setTimeout(() => {
        let inputElement = document.getElementById('autocomplete-input');
        
        // UniApp H5 wraps input, so we might have got the wrapper. Find the actual input.
        if (inputElement && inputElement.tagName !== 'INPUT') {
            inputElement = inputElement.querySelector('input');
        }

        const input = inputElement as HTMLInputElement;

        if (input && (window as any).google && (window as any).google.maps) {
             const autocomplete = new (window as any).google.maps.places.Autocomplete(input, {
                 types: ['address'],
                 fields: ['address_components', 'geometry'],
             });
             
             // Restore placeholder (Google Maps overwrites it)
             setTimeout(() => {
                 input.setAttribute('placeholder', '街道名，门牌号');
             }, 100);
             
             autocomplete.addListener('place_changed', () => {
                 const place = autocomplete.getPlace();
                 if (!place.address_components) return;

                 let address1 = '';
                 let city = '';
                 let state = '';
                 let zip = '';
                 let country = '';
                 let route = '';
                 let streetNum = '';

                 place.address_components.forEach((component: any) => {
                     const types = component.types;
                     if (types.includes('street_number')) streetNum = component.long_name;
                     if (types.includes('route')) route = component.long_name;
                     if (types.includes('locality')) city = component.long_name;
                     if (types.includes('administrative_area_level_1')) state = component.short_name;
                     if (types.includes('postal_code')) zip = component.long_name;
                     if (types.includes('country')) country = component.long_name;
                 });

                 address1 = `${streetNum} ${route}`.trim();
                 if(!address1 && input.value) address1 = input.value;

                 form.value.address_line1 = address1;
                 form.value.city = city || form.value.city;
                 form.value.state = state || form.value.state;
                 form.value.postal_code = zip || form.value.postal_code;
                 form.value.country = country || 'Canada';
             });
        }
    }, 1000);
  });
  
  const handleBack = () => uni.navigateBack();
  
  const handleSave = async () => {
      if (!form.value.name || !form.value.phone || !form.value.address_line1 || !form.value.city || !form.value.postal_code) {
          uni.showToast({ title: '请填写完整信息', icon: 'none' });
          return;
      }
  
      try {
          uni.showLoading({ title: '保存中' });
          if (isEdit.value) {
            //   delete (form.value as any).updated_at; // cleanup if needed
              await addressApi.update(form.value.id, form.value);
          } else {
              const data = { ...form.value };
              delete (data as any).id;
              await addressApi.create(data);
          }
          uni.hideLoading();
          uni.showToast({ title: '保存成功', icon: 'success' });
          setTimeout(() => uni.navigateBack(), 1500);
      } catch (e) {
          uni.hideLoading();
          console.error(e);
          uni.showToast({ title: '保存失败', icon: 'none' });
      }
  };
  </script>
  
  <style scoped>
  .min-h-screen { min-height: 100vh; }
  .bg-white { background-color: #ffffff; }
  .bg-white-20 { background-color: rgba(255, 255, 255, 0.2); }
  .bg-gray-50 { background-color: #f9fafb; }
  .bg-emerald-500 { background-color: #10b981; }
  
  .text-white { color: #ffffff; }
  .text-gray-700 { color: #374151; }
  .text-gray-500 { color: #6b7280; }
  .text-lg { font-size: 18px; }
  .font-bold { font-weight: 700; }
  
  .header-gradient { background: linear-gradient(180deg, #047857 0%, #059669 100%); }
  
  .pt-safe { padding-top: env(safe-area-inset-top); }
  .pb-safe { padding-bottom: env(safe-area-inset-bottom); }
  
  .w-10 { width: 40px; }
  .h-10 { height: 40px; }
  .w-5 { width: 20px; }
  .h-5 { height: 20px; }
  .w-32 { width: 128px; }
  
  .rounded-full { border-radius: 9999px; }
  .rounded { border-radius: 4px; }
  
  .border { border-width: 1px; }
  .border-gray-300 { border-color: #d1d5db; }
  .border-emerald-500 { border-color: #10b981; }
  
  .p-4 { padding: 16px; }
  .p-6 { padding: 24px; }
  .py-3 { padding-top: 12px; padding-bottom: 16px; }
  .px-4 { padding-left: 16px; padding-right: 16px; }
  .mt-4 { margin-top: 16px; }
  .mb-4 { margin-bottom: 16px; }
  
  .flex { display: flex; }
  .flex-row { flex-direction: row; }
  .flex-col { flex-direction: column; }
  .flex-1 { flex: 1; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .justify-center { justify-content: center; }
  .gap-3 { gap: 12px; }
  .gap-4 { gap: 16px; }
  
  .form-group { margin-bottom: 16px; flex-direction: column; display: flex; }
  .label { font-size: 14px; color: #374151; margin-bottom: 6px; font-weight: 500; }
  .input { 
      height: 48px; border: 1px solid #d1d5db; border-radius: 8px; padding: 0 12px; font-size: 16px; background-color: #fff;
      width: 100%; box-sizing: border-box;
  }
  
  .save-btn {
    width: 100%; height: 50px; background-color: #059669; color: #fff; border-radius: 12px;
    font-size: 16px; font-weight: 600; display: flex; align-items: center; justify-content: center; margin-top: 32px;
  }
  </style>
