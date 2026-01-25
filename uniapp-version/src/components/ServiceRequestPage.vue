<template>
  <view class="min-h-screen bg-white flex flex-col items-stretch">
    <!-- 1. Header with Back Button (Fixed) -->
    <view class="bg-gray-50 px-4 py-3 flex flex-row items-center justify-between sticky top-0 z-30 pt-custom border-b border-gray-100">
      <view @click="handleBack" class="p-2 -ml-2 rounded-full active-bg-gray-200 transition-colors">
        <AppIcon name="chevron-left" :size="28" class="text-gray-900"/>
      </view>
      <text class="text-lg font-bold text-gray-900">
         创建项目
      </text>
      <view class="flex flex-row gap-2">
         <view class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
             <text class="text-gray-600 font-bold text-xs">•••</text>
         </view>
      </view>
    </view>

    <!-- Progress Bar (Numbered Steps) -->
    <view class="bg-gray-50 pt-8 pb-4 px-8">
        <view class="flex flex-row items-start justify-between relative z-10">
            <!-- Connecting Line Background -->
            <!-- Adjusted top to align with center of 40px circle (20px) -->
            <view class="absolute top-5 left-4 right-4 h-0.5 bg-gray-200 -z-10"></view>
            <!-- Progress Line (Colored) - Optional: could calculate width based on step -->
            
            <view 
                v-for="(step, idx) in template?.steps" 
                :key="idx" 
                class="flex flex-col items-center gap-3 bg-gray-50 px-2"
                :class="{'opacity-60': idx > currentStep}"
            >
                <view 
                    class="flex-shrink-0 flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 shadow-sm"
                    style="width: 40px; height: 40px; min-width: 40px; count: 1; border-radius: 50%;"
                    :class="idx <= currentStep ? 'bg-emerald-600 border-emerald-600 text-white shadow-emerald-200' : 'bg-white border-gray-300 text-gray-400'"
                >
                    <AppIcon v-if="idx < currentStep" name="check" :size="16" class="text-white" />
                    <text v-else>{{ idx + 1 }}</text>
                </view>
                <text 
                    class="text-xs font-bold tracking-wide"
                    :class="idx <= currentStep ? 'text-gray-900' : 'text-gray-400'"
                >
                    {{ idx === 0 ? '创建项目' : (idx === 1 ? '选择地址' : '发布') }}
                </text>
            </view>
        </view>
        
        <!-- Helper Text -->
        <view class="flex flex-col items-center py-6 mt-2">
            <text class="text-gray-500 text-sm font-medium text-center leading-relaxed">
                请回答相应的问题
            </text>
            <text class="text-gray-400 text-sm text-center leading-relaxed mt-1">
                为您找到合适的服务商
            </text>
        </view>
    </view>

    <!-- Loading -->
    <view v-if="!template" class="flex-1 flex items-center justify-center">
        <text class="text-gray-400">加载中...</text>
    </view>

    <!-- 2. Wizard Content -->
    <scroll-view v-else scroll-y class="flex-1 box-border bg-gray-50">
        <view class="px-4 pb-40">
            
            <!-- Card Container -->
            <view class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-slide-up">
                
                <!-- Step Title & Description -->
                <view class="mb-10 relative">
                    <text class="text-xl font-bold text-gray-900 block mb-1">
                        {{ currentStepData.title }}
                    </text>
                    <text v-if="currentStepData.description" class="text-sm text-gray-500 block mb-2">
                        {{ currentStepData.description }}
                    </text>
                     <!-- Accent Line -->
                    <view class="w-full h-1 bg-emerald-500 rounded-full"></view>
                </view>

                <!-- Fields -->
                <view class="space-y-5">
                    <view 
                        v-for="field in currentStepData.fields" 
                        :key="field.key"
                    >
                        <view 
                            v-if="['text', 'number', 'date', 'time', 'phone'].includes(field.type)"
                            class="flex flex-col gap-2 mb-2"
                        >
                            <!-- Input Row (Label + Input) -->
                            <view class="flex flex-row items-center gap-3">
                                <!-- Label -->
                                <view class="flex flex-row items-center gap-1.5 flex-shrink-0" style="min-width: 80px;">
                                    <text class="text-base font-bold text-gray-800">{{ field.label }}</text>
                                    <text v-if="!field.required" class="text-xs text-gray-400">(可选)</text>
                                </view>
                                
                                <!-- Text Input -->
                                <input 
                                    v-if="field.type === 'text'"
                                    type="text"
                                    :placeholder="field.placeholder || '请输入'"
                                    class="flex-1 h-11 bg-gray-50 rounded-xl px-4 text-base text-gray-900 border border-transparent focus-border-emerald-500 focus-bg-white transition-all placeholder-gray-400 box-border"
                                    v-model="formData[field.key]"
                                    @blur="onFieldBlur(field)"
                                />

                                <!-- Number Input -->
                                <input 
                                    v-if="field.type === 'number'"
                                    type="number"
                                    :placeholder="field.placeholder || '请输入'"
                                    class="flex-1 h-11 bg-gray-50 rounded-xl px-4 text-base text-gray-900 border border-transparent focus-border-emerald-500 focus-bg-white transition-all placeholder-gray-400 box-border"
                                    v-model="formData[field.key]"
                                />
                                
                                <!-- Date/Time/Phone inputs logic remains similar if they were here, 
                                     but standard text/number covers most. 
                                     If original code had date/time here, we keep them inside this row. 
                                     Assuming original code structure follows. -->
                                     
                                <!-- Phone Input -->
                                <input 
                                    v-if="field.type === 'phone'"
                                    type="tel"
                                    :placeholder="field.placeholder || '请输入手机号'"
                                    class="flex-1 h-11 bg-gray-50 rounded-xl px-4 text-base text-gray-900 border border-transparent focus-border-emerald-500 focus-bg-white transition-all placeholder-gray-400 box-border"
                                    v-model="formData[field.key]"
                                />
    
                                <!-- Time Input -->
                                <view 
                                    v-if="field.type === 'time'"
                                    class="flex-1 h-11 bg-gray-50 rounded-xl px-4 flex flex-row items-center justify-between border border-transparent active-border-emerald-500 active-bg-white transition-all box-border"
                                    @click="openTimeModal(field.key)"
                                >
                                    <text :class="formData[field.key] ? 'text-gray-900 font-medium' : 'text-gray-400'">
                                        {{ formData[field.key] || field.placeholder || '选择时间' }}
                                    </text>
                                    <AppIcon name="clock" :size="18" class="text-emerald-600"/>
                                </view>
    
                                <!-- Date Picker (Inline) -->
                                <view 
                                    v-if="field.type === 'date'"
                                    class="flex-1 h-11 bg-gray-50 rounded-xl px-4 flex flex-row items-center justify-between border border-transparent active-border-emerald-500 active-bg-white transition-all box-border"
                                    @click="openDateModal(field.key)"
                                >
                                    <text :class="formData[field.key] ? 'text-gray-900 font-medium' : 'text-gray-400'">
                                        {{ formData[field.key] || field.placeholder || '选择日期' }}
                                    </text>
                                    <AppIcon name="calendar" :size="18" class="text-emerald-600"/>
                                </view>
                            </view>
                            

                        </view>

                        <!-- Stacked Layout for complex inputs -->
                        <view v-else class="flex flex-col">
                            <view class="relative">
                                
                                <!-- Field Label (for non-image/address types) -->
                                <view 
                                    class="flex flex-row items-center gap-2 mb-2" 
                                    v-if="!['image', 'address'].includes(field.type)"
                                >
                                    <view class="w-1 h-3.5 rounded-full bg-emerald-500"></view>
                                    <text class="text-base font-bold text-gray-800">{{ field.label }}</text>
                                    <text v-if="!field.required" class="text-xs text-gray-400">(可选)</text>
                                </view>

                            <!-- Select -->
                            <view 
                                v-for="currField in [field]"
                                :key="currField.key"
                            >
                                <view 
                                    v-if="currField.type === 'select' && currField.options"
                                    class="w-full h-12 bg-gray-50 rounded-xl px-4 flex flex-row items-center justify-between border border-transparent active-border-emerald-500 active-bg-white transition-all box-border"
                                    @click="openSelectModal(currField.key, currField.options!)"
                                >
                                     <text :class="formData[currField.key] ? 'text-gray-900 font-medium' : 'text-gray-400'">
                                         {{ getSelectedLabel(currField) || field.placeholder || '请选择' }}
                                     </text>
                                     <AppIcon name="chevron-down" :size="20" class="text-gray-400"/>
                                 </view>
                            </view>

                            <!-- Radio Group -->
                            <view v-if="field.type === 'radio'" class="flex flex-col gap-2">
                                <view 
                                    v-for="(opt, idx) in field.options" 
                                    :key="idx"
                                    class="flex flex-row items-center gap-3 py-5 px-3 rounded-lg border transition-all"
                                    :class="formData[field.key] === opt.value ? 'bg-emerald-600 border-emerald-600' : 'bg-gray-100 border-transparent'"
                                    @click="formData[field.key] = opt.value"
                                >
                                    <view class="w-5 h-5 rounded-full border flex items-center justify-center"
                                        :class="formData[field.key] === opt.value ? 'border-white bg-white' : 'border-gray-300 bg-white'"
                                    >
                                        <view v-if="formData[field.key] === opt.value" class="w-2.5 h-2.5 rounded-full bg-emerald-600"></view>
                                    </view>
                                    <text class="text-base font-medium" :class="formData[field.key] === opt.value ? 'text-white' : 'text-gray-900'">{{ opt.label }}</text>
                                </view>
                            </view>

                            <!-- Checkbox Group -->
                            <view v-if="field.type === 'checkbox'" class="flex flex-col gap-2">
                                <view 
                                    v-for="(opt, idx) in field.options" 
                                    :key="idx"
                                    class="flex flex-row items-center gap-3 py-5 px-3 rounded-lg border transition-all"
                                    :class="(formData[field.key] || []).includes(opt.value) ? 'bg-emerald-600 border-emerald-600' : 'bg-gray-100 border-transparent'"
                                    @click="toggleCheckbox(field.key, opt.value)"
                                >
                                    <view class="w-5 h-5 rounded border flex items-center justify-center"
                                        :class="(formData[field.key] || []).includes(opt.value) ? 'border-white bg-white' : 'border-gray-300 bg-white'"
                                    >
                                        <AppIcon v-if="(formData[field.key] || []).includes(opt.value)" name="check" :size="14" class="text-emerald-600"/>
                                    </view>
                                    <text class="text-base font-medium" :class="(formData[field.key] || []).includes(opt.value) ? 'text-white' : 'text-gray-900'">{{ opt.label }}</text>
                                </view>
                            </view>

                            <!-- Textarea -->
                            <textarea 
                                v-if="field.type === 'textarea'"
                                :placeholder="field.placeholder || '请输入' + field.label"
                                class="w-full h-32 bg-gray-50 rounded-xl p-4 text-base text-gray-900 border border-transparent focus-border-emerald-500 focus-bg-white transition-all placeholder-gray-400 box-border"
                                v-model="formData[field.key]"
                                :maxlength="-1" 
                            />

                            <!-- Image Upload -->
                            <view v-if="field.type === 'image'" class="image-upload-container">
                                <!-- Image Label -->
                                <view class="flex flex-row items-center gap-2 mb-3">
                                    <view class="w-1 h-4 rounded-full bg-emerald-500"></view>
                                    <text class="text-sm font-bold text-gray-700">{{ field.label }}</text>
                                    <text v-if="!field.required" class="text-xs text-gray-400">(可选)</text>
                                </view>
                                
                                <!-- Image Grid -->
                                <view class="image-grid">
                                    <!-- Uploaded Images -->
                                    <view 
                                        v-for="(img, imgIdx) in getImages(field.key)" 
                                        :key="imgIdx"
                                        class="image-item"
                                    >
                                        <image 
                                            :src="img" 
                                            mode="aspectFill" 
                                            class="uploaded-image"
                                            @click="previewImage(formData[field.key], imgIdx)"
                                        />
                                        <view 
                                            class="image-delete-btn"
                                            @click.stop="deleteImage(field.key, imgIdx)"
                                        >
                                            <AppIcon name="x" :size="12" class="text-white"/>
                                        </view>
                                    </view>
                                    
                                    <!-- Add Image Button -->
                                    <view 
                                        v-if="(formData[field.key] || []).length < 9"
                                        class="image-add-btn"
                                        @click="chooseImage(field.key)"
                                    >
                                        <AppIcon name="plus" :size="24" class="text-gray-400"/>
                                        <text class="text-xs text-gray-400 mt-1">添加图片</text>
                                    </view>
                                </view>
                                
                                <!-- Helper Text -->
                                <text class="text-xs text-gray-400 mt-2 block">最多可上传9张图片</text>
                            </view>

                            <!-- Address Input (Separated Fields Style) -->
                            <view v-if="field.type === 'address'">
                                 <!-- Address Section Label -->
                                 <view class="flex flex-row items-center gap-2 mb-3">
                                     <view class="w-1 h-4 rounded-full" :class="field.key === 'from_address' ? 'bg-blue-500' : 'bg-emerald-500'"></view>
                                     <text class="text-sm font-bold text-gray-700">{{ field.label }}</text>
                                 </view>
                                 <!-- Street -->
                                 <view class="relative z-20" style="margin-bottom: 12px;">
                                     <input 
                                        type="text"
                                        placeholder="街道名及门牌号"
                                        class="w-full h-12 px-4 rounded-xl text-base text-gray-900 placeholder-gray-400 bg-gray-50 border border-transparent focus-bg-white focus-border-emerald-500 transition-colors box-border"
                                        :value="formData[field.key]?.street"
                                        @input="(e: any) => handleStreetInput(field.key, e.detail.value)"
                                        @focus="currentFocusField = field.key"
                                    />
                                    <!-- Suggestions -->
                                    <view 
                                        v-if="currentFocusField === field.key && addressSuggestions.length > 0"
                                        class="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-60"
                                    >
                                        <scroll-view scroll-y class="max-h-60">
                                            <view 
                                                v-for="(addr, i) in addressSuggestions" 
                                                :key="i"
                                                class="px-4 py-3 border-b border-gray-50 last-border-0 active-bg-gray-50 flex flex-row items-center gap-3"
                                                @click.stop="selectAddressSuggestion(field.key, addr)"
                                            >
                                                <view class="p-1.5 bg-gray-100 rounded-full flex-shrink-0">
                                                    <AppIcon name="map-pin" :size="16" class="text-gray-500"/>
                                                </view>
                                                <view class="flex-1 min-w-0">
                                                    <text class="text-gray-900 text-sm font-bold block truncate">{{ addr.street }}</text>
                                                    <text class="text-gray-500 text-xs block truncate">{{ addr.city }}, {{ addr.province }} {{ addr.postalCode }}</text>
                                                </view>
                                            </view>
                                        </scroll-view>
                                    </view>
                                </view>
                                
                                <!-- City & Province -->
                                <view class="flex flex-row gap-4" style="margin-bottom: 12px;">
                                    <input 
                                        type="text"
                                        placeholder="城市"
                                        class="flex-1 h-12 px-4 rounded-xl text-base text-gray-900 placeholder-gray-400 bg-gray-50 border border-transparent focus-bg-white focus-border-emerald-500 transition-colors box-border"
                                        :value="formData[field.key]?.city"
                                        @input="(e: any) => updateAddress(field.key, 'city', e.detail.value)"
                                    />
                                    <input 
                                        type="text"
                                        placeholder="省份"
                                        class="flex-1 h-12 px-4 rounded-xl text-base text-gray-900 placeholder-gray-400 bg-gray-50 border border-transparent focus-bg-white focus-border-emerald-500 transition-colors box-border"
                                        :value="formData[field.key]?.province"
                                        @input="(e: any) => updateAddress(field.key, 'province', e.detail.value)"
                                    />
                                </view>

                                <!-- Postal Code -->
                                <input 
                                    type="text"
                                    placeholder="邮政编码"
                                    class="w-full h-12 px-4 rounded-xl text-base text-gray-900 placeholder-gray-400 bg-gray-50 border border-transparent focus-bg-white focus-border-emerald-500 transition-colors box-border"
                                    :value="formData[field.key]?.postalCode"
                                    @input="(e: any) => updateAddress(field.key, 'postalCode', e.detail.value)"
                                />
                            </view>

                            </view>
                        </view>
                    </view>

                    <!-- Publish Options (Last Step Only) -->
                    <view v-if="currentStep === (template?.steps.length || 0) - 1" class="mt-8 animate-fade-in">
                        <text class="text-base font-bold text-gray-900 mb-4 block">发布方式</text>
                        <view class="flex flex-col gap-3">
                            <view 
                                class="p-4 rounded-xl border flex flex-row items-center justify-between transition-all"
                                :class="publishType === 'specific' ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-200'"
                                @click="publishType = 'specific'"
                            >
                                <view class="flex flex-row items-center gap-3">
                                    <view class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                        <AppIcon name="user" :size="20" class="text-emerald-600"/>
                                    </view>
                                    <view>
                                        <text class="text-base font-bold text-gray-900 block">指定服务商</text>
                                        <text class="text-xs text-gray-500">发送给特定的服务商报价</text>
                                    </view>
                                </view>
                                <view 
                                    class="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center transition-colors"
                                    :class="publishType === 'specific' ? 'border-emerald-600 bg-emerald-600' : 'bg-white'"
                                >
                                    <AppIcon v-if="publishType === 'specific'" name="check" :size="12" class="text-white"/>
                                </view>
                            </view>

                            <view 
                                class="p-4 rounded-xl border flex flex-row items-center justify-between transition-all"
                                :class="publishType === 'lobby' ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-200'"
                                @click="publishType = 'lobby'"
                            >
                                <view class="flex flex-row items-center gap-3">
                                    <view class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                        <AppIcon name="grid" :size="20" class="text-emerald-600"/>
                                    </view>
                                    <view>
                                        <text class="text-base font-bold text-gray-900 block">发布到大厅</text>
                                        <text class="text-xs text-gray-500">同时也允许其他服务商报价</text>
                                    </view>
                                </view>
                                <view 
                                    class="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center transition-colors"
                                    :class="publishType === 'lobby' ? 'border-emerald-600 bg-emerald-600' : 'bg-white'"
                                >
                                    <AppIcon v-if="publishType === 'lobby'" name="check" :size="12" class="text-white"/>
                                </view>
                            </view>

                            <view 
                                class="p-4 rounded-xl border flex flex-row items-center justify-between transition-all"
                                :class="publishType === 'both' ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-gray-200'"
                                @click="publishType = 'both'"
                            >
                                <view class="flex flex-row items-center gap-3">
                                    <view class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                                        <AppIcon name="star" :size="20" class="text-emerald-600"/>
                                    </view>
                                    <view>
                                        <text class="text-base font-bold text-gray-900 block">两个都需要</text>
                                        <text class="text-xs text-gray-500">发布到大厅并邀请指定服务商</text>
                                    </view>
                                </view>
                                <view 
                                    class="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center transition-colors"
                                    :class="publishType === 'both' ? 'border-emerald-600 bg-emerald-600' : 'bg-white'"
                                >
                                    <AppIcon v-if="publishType === 'both'" name="check" :size="12" class="text-white"/>
                                </view>
                            </view>
                        </view>
                    </view>

                </view>
            </view>
        </view>
    </scroll-view>

    <!-- 3. Footer Actions (Floating) -->
    <view class="fixed bottom-0 left-0 right-0 px-6 pt-4 pb-footer bg-white border-t border-gray-100 z-30 shadow-lg">
        <button 
           class="w-full bg-emerald-600 text-white font-bold text-lg h-12 rounded-full flex items-center justify-center active-bg-emerald-700 shadow-lg shadow-emerald-200"
           @click="handleNextOrFinish"
        >
            {{ currentStep < (template?.steps.length || 0) - 1 ? '下一步' : (
                publishType === 'specific' ? '邀请服务商' : 
                publishType === 'lobby' ? '发布需求' : 
                '发布并邀请'
            ) }}
        </button>
    </view>

    <!-- Custom Select Modal (Mobile Bottom Sheet) -->
    <view 
        v-if="showSelectModal" 
        class="fixed inset-0 z-50 flex items-end justify-center"
        @touchmove.stop.prevent=""
    >
        <!-- Backdrop with explicit click handler -->
        <view 
            class="absolute inset-0 bg-black-40 backdrop-blur-sm transition-opacity"
            @click="closeSelectModal"
        ></view>
        
        <view class="bg-gray-50 w-full rounded-t-3xl overflow-hidden relative z-10 animate-slide-up pb-safe flex flex-col" style="max-height: 80vh;">
            
            <!-- Header with Handle -->
            <view class="bg-white pt-3 pb-4 rounded-t-3xl border-b border-gray-100 flex-shrink-0 z-20">
                 <view class="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3"></view>
                 <text class="text-center text-lg font-bold text-gray-900 block">请选择</text>
                 <view 
                    @click="closeSelectModal" 
                    class="absolute right-4 top-4 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center active-bg-gray-100"
                >
                     <AppIcon name="x" :size="18" class="text-gray-400"/>
                </view>
            </view>
            
            <!-- Scrollable Content -->
            <scroll-view scroll-y class="flex-1 w-full p-4" style="min-height: 200px;">
                 <view class="flex flex-col gap-3 pb-4">
                     <view 
                        v-for="(option, idx) in currentSelectOptions" 
                        :key="idx"
                        class="bg-white p-4 rounded-2xl flex flex-row items-center justify-between active-scale-98 transition-all shadow-sm border"
                        :class="formData[currentSelectKey] === option.value ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-transparent'"
                        @click="confirmSelect(option.value)"
                    >
                        <text 
                            class="text-base font-medium transition-colors"
                            :class="formData[currentSelectKey] === option.value ? 'text-emerald-700 font-bold' : 'text-gray-700'"
                        >
                            {{ option.label }}
                        </text>
                        
                        <view v-if="formData[currentSelectKey] === option.value" class="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center animate-scale-in">
                            <AppIcon name="check" :size="14" class="text-white"/>
                        </view>
                        <view v-else class="w-5 h-5 rounded-full border-2 border-gray-200"></view>
                     </view>
                 </view>
            </scroll-view>
            
            <!-- Footer Cancel Button -->
            <view class="p-4 bg-white border-t border-gray-100 flex-shrink-0">
                <button 
                    class="w-full h-12 rounded-full bg-gray-100 text-gray-600 font-bold text-base flex items-center justify-center active-bg-gray-200 after:border-none" 
                    @click="closeSelectModal"
                >
                    取消
                </button>
            </view>
        </view>
    </view>

    <!-- Custom Date Modal (Calendar) -->
    <view v-if="showDateModal" class="fixed inset-0 z-50 flex items-center justify-center px-8" @click.self="closeDateModal">
        <view class="absolute inset-0 bg-black-60 backdrop-blur-sm shadow-2xl transition-opacity"></view>
        
        <view class="bg-white w-full max-w-sm rounded-2xl overflow-hidden relative z-10 animate-scale-in shadow-2xl pb-4">
             <!-- Header (Padding-based for robust whitespace) -->
             <view class="border-b border-gray-100 flex flex-row items-center justify-between px-4 bg-gray-50-50 pt-16 pb-2">
                <view class="w-10 "></view> <!-- Left Spacer -->
                <text class="text-lg font-bold text-gray-900 ">选择日期</text>
                <view @click="closeDateModal" class="w-10 h-10 rounded-full active-bg-gray-200 flex items-center justify-center mr-4">
                     <AppIcon name="x" :size="20" class="text-gray-500"/>
                </view>
            </view>

            <!-- Calendar Header -->
            <view class="px-4 pt-4 pb-2 flex flex-row items-center justify-between">
                 <view @click="changeMonth(-1)" class="p-2 rounded-full active-bg-gray-100">
                     <AppIcon name="chevron-left" :size="20" class="text-gray-600"/>
                 </view>
                 <text class="text-base font-bold text-gray-900">{{ calendarYear }}年 {{ calendarMonth + 1 }}月</text>
                 <view @click="changeMonth(1)" class="p-2 rounded-full active-bg-gray-100">
                     <AppIcon name="chevron-right" :size="20" class="text-gray-600"/>
                 </view>
            </view>

             <!-- Week Days -->
            <view class="grid grid-cols-7 mb-2 px-2">
                <text v-for="day in ['日','一','二','三','四','五','六']" :key="day" class="text-center text-xs text-gray-400 py-1">{{ day }}</text>
            </view>

            <!-- Days Grid -->
            <view class="grid grid-cols-7 px-2 gap-y-1">
                <view 
                    v-for="(day, idx) in calendarDays" 
                    :key="idx" 
                    class="aspect-square flex items-center justify-center relative rounded-full"
                    :class="{
                        'opacity-0': day === 0,
                        'bg-emerald-600 text-white shadow-md shadow-emerald-200': isSelectedDate(day),
                        'active-bg-emerald-50 text-gray-900': day !== 0 && !isSelectedDate(day)
                    }"
                    @click="day !== 0 && confirmDate(day)"
                >
                    <text :class="isSelectedDate(day) ? 'text-white font-bold' : 'text-sm'">{{ day || '' }}</text>
                    <view v-if="isToday(day)" class="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-500"></view>
                </view>
            </view>

    </view>
    </view>

    <!-- Custom Time Modal (Picker View) -->
    <view v-if="showTimeModal" class="fixed inset-0 z-50 flex items-center justify-center px-8" @click.self="closeTimeModal">
         <view class="absolute inset-0 bg-black-60 backdrop-blur-sm transition-opacity"></view>
         
         <view class="bg-white w-full max-w-sm rounded-2xl overflow-hidden relative z-10 animate-scale-in shadow-2xl">
             <view class="flex flex-row items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <text class="text-gray-500 text-base p-2" @click="closeTimeModal">取消</text>
                <text class="text-base font-bold text-gray-900">选择时间</text>
                <text class="text-emerald-600 font-bold text-base p-2" @click="confirmTime">确定</text>
            </view>
            
            <picker-view 
                indicator-style="height: 50px;" 
                style="width: 100%; height: 200px;" 
                :value="timePickerValue" 
                @change="bindTimeChange"
            >
                <picker-view-column>
                    <view v-for="(item, index) in hours" :key="index" class="flex items-center justify-center text-lg font-medium">{{item}}</view>
                </picker-view-column>
                <picker-view-column>
                    <view v-for="(item, index) in minutes" :key="index" class="flex items-center justify-center text-lg font-medium">{{item}}</view>
                </picker-view-column>
            </picker-view>
         </view>
    </view>
  
    <!-- Provider Phone Input Modal -->
    <view 
        v-if="showProviderInputModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @touchmove.stop.prevent=""
    >
        <view 
            class="absolute inset-0 bg-black-40 backdrop-blur-sm transition-opacity" 
            @click="showProviderInputModal = false"
        ></view>
        <view class="relative bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl animate-scale-in" @click.stop="">
            <text class="text-xl font-bold text-gray-900 mb-6 block text-center">输入服务商手机号</text>
            
            <input 
                type="number"
                placeholder="请输入对方手机号码"
                class="w-full h-12 bg-gray-50 rounded-xl px-4 text-base text-gray-900 border border-transparent focus-border-emerald-500 focus-bg-white transition-all placeholder-gray-400 box-border mb-6"
                v-model="providerPhone"
                focus
            />

            <view class="flex flex-row gap-4">
                <button 
                    class="flex-1 h-11 bg-gray-100 text-gray-700 font-bold rounded-xl flex items-center justify-center active-bg-gray-200"
                    @click="showProviderInputModal = false"
                >
                    取消
                </button>
                <button 
                    class="flex-1 h-11 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center active-bg-emerald-700 shadow-lg shadow-emerald-200"
                    @click="handlePhoneSubmit"
                >
                    下一步
                </button>
            </view>
        </view>
    </view>

    <!-- Confirmation Modal -->
    <view 
        v-if="showConfirmationModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @touchmove.stop.prevent=""
    >
        <view 
            class="absolute inset-0 bg-black-40 backdrop-blur-sm transition-opacity" 
            @click="showConfirmationModal = false"
        ></view>
        <view class="relative bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl animate-scale-in" @click.stop="">
            <view class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <AppIcon name="message" :size="24" class="text-emerald-600"/>
            </view>
            <text class="text-xl font-bold text-gray-900 mb-2 block text-center">确认发送邀请</text>
            <text class="text-sm text-gray-500 mb-6 block text-center px-4">
                我们将通过短信将以下定制需求信息发送给服务商，请确认。
            </text>
            
            <view class="bg-gray-50 rounded-xl p-4 mb-6 space-y-3">
                <view class="flex flex-row justify-between">
                    <text class="text-gray-500 text-sm">服务类型</text>
                    <text class="text-gray-900 text-sm font-bold">{{ template?.name }}</text>
                </view>
                 <view class="flex flex-row justify-between">
                    <text class="text-gray-500 text-sm">接收号码</text>
                    <text class="text-emerald-600 text-sm font-bold">{{ providerPhone }}</text>
                </view>
                 <view v-if="formData.move_date" class="flex flex-row justify-between">
                    <text class="text-gray-500 text-sm">服务时间</text>
                    <text class="text-gray-900 text-sm font-bold">{{ formData.move_date }}</text>
                </view>
                <view v-if="formData.from_address" class="flex flex-col gap-1">
                    <text class="text-gray-500 text-sm">出发地址</text>
                    <text class="text-gray-900 text-sm font-bold truncate">{{ typeof formData.from_address === 'object' ? formData.from_address.street : formData.from_address }}</text>
                </view>
            </view>

            <view class="flex flex-row gap-4">
                <button 
                    class="flex-1 h-11 bg-gray-100 text-gray-700 font-bold rounded-xl flex items-center justify-center active-bg-gray-200"
                    @click="showConfirmationModal = false"
                >
                    返回修改
                </button>
                <button 
                    class="flex-1 h-11 bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center active-bg-emerald-700 shadow-lg shadow-emerald-200"
                    @click="confirmAndSend"
                >
                    确认发送
                </button>
            </view>
        </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { formTemplatesApi, submissionsApi, providersApi } from '@/services/api';
import type { ServiceTemplate } from '@/services/mockFormTemplates';

// Props
const props = defineProps<{ 
    serviceId: string;
    editOrder?: any;
    templateData?: ServiceTemplate; // Optional pre-loaded template data
    isLoggedIn?: boolean;
    userPhone?: string;
}>();
const emit = defineEmits(['back', 'publish', 'invite', 'request-login', 'request-phone']);

const isEditMode = computed(() => !!props.editOrder);

// State
const template = ref<ServiceTemplate | null>(null);
const loading = ref(false);
const formData = ref<Record<string, any>>({});
const currentStep = ref(0);
const publishType = ref<'specific' | 'lobby' | 'both'>('lobby'); // Default to lobby
const today = new Date();

// SMS Invite Flow State
const showProviderInputModal = ref(false);
const showConfirmationModal = ref(false);
const providerPhone = ref('');
// New States for check
const isCheckingPhone = ref(false);
const providerCheckResult = ref<any>(null); // { registered: boolean, user: ... }
const showInviteMessage = ref(false); // To show "will send invite" UI

// Helper to update address object (nested)
const updateAddress = (key: string, field: string, value: string) => {
    if (!formData.value[key]) {
        formData.value[key] = {};
    }
    formData.value[key][field] = value;
};

// State for Flight Info Preview (Removed)
// const currentFlightInfo = ref<any>(null);

// --- Auto-Fill Logic (Removed) ---
const onFieldBlur = (field: any) => {
    // Auto-fill disabled as per user request. Users fill manually.
};

// --- Image Upload Logic ---
const getImages = (key: string): string[] => {
    const val = formData.value[key];
    return Array.isArray(val) ? val : [];
};

const chooseImage = (key: string) => {
    const currentImages = formData.value[key] || [];
    const remainingSlots = 9 - currentImages.length;
    
    if (remainingSlots <= 0) {
        uni.showToast({ title: '最多只能上传9张图片', icon: 'none' });
        return;
    }
    
    uni.chooseImage({
        count: remainingSlots,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
            const newImages = [...currentImages, ...res.tempFilePaths];
            formData.value[key] = newImages;
        },
        fail: (err) => {
            // User cancelled or error
            if (err.errMsg && !err.errMsg.includes('cancel')) {
                uni.showToast({ title: '选择图片失败', icon: 'none' });
            }
        }
    });
};

const deleteImage = (key: string, index: number) => {
    const images = formData.value[key] || [];
    images.splice(index, 1);
    formData.value[key] = [...images]; // Trigger reactivity
};

const previewImage = (images: string[], current: number) => {
    uni.previewImage({
        urls: images,
        current: current
    });
};

// --- Address Autocomplete Logic (Google Maps) ---
const addressSuggestions = ref<any[]>([]);
const currentFocusField = ref<string | null>(null);
let autocompleteService: any = null;
let placesService: any = null;

// Platform detection - check if running in browser with window object
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

// Load template from API or Props
const loadTemplate = async () => {
    loading.value = true;
    try {
        if (props.templateData) {
            console.log('Using pre-loaded template data');
            template.value = props.templateData;
            loading.value = false;
            return;
        }

        // Try to fetch all published templates and find the one matching serviceId
        const response = await formTemplatesApi.getPublished();
        const templates = response.templates || [];
        
        // Find by id or name
        let found = templates.find((t: any) => t.id === props.serviceId || t.name === props.serviceId);
        
        if (found) {
            console.log('Template found:', found.name);
            template.value = {
                id: found.id,
                name: found.name,
                steps: found.steps || []
            };
            if (!template.value.steps || template.value.steps.length === 0) {
                console.warn('Template found but has NO steps!');
            }
        } else {
            console.error('Template not found for id:', props.serviceId, 'in list of', templates.length, 'templates');
            uni.showToast({ title: '表单模板不存在: ' + props.serviceId, icon: 'none' });
            setTimeout(() => emit('back'), 1500);
        }
    } catch (error: any) {
        console.error('Failed to load template:', error);
        uni.showToast({ title: '加载失败，请重试', icon: 'none' });
        setTimeout(() => emit('back'), 1500);
    } finally {
        loading.value = false;
    }
};

// Initialize on Mount
onMounted(() => {
    console.log('ServiceRequestPage: onMounted triggered', props.serviceId);
    uni.showToast({ title: '表单已挂载: ' + props.serviceId, icon: 'none' });
    // Load form template from API
    loadTemplate();

    // If in edit mode, initialize form data from existing order
    if (props.editOrder && props.editOrder.form_data) {
        const rawData: Record<string, any> = {};
        for (const key in props.editOrder.form_data) {
            const item = props.editOrder.form_data[key];
            // Extract the actual value from our "rich" format if it exists
            if (item && typeof item === 'object' && item._is_rich) {
                rawData[key] = item.value;
            } else {
                rawData[key] = item;
            }
        }
        formData.value = rawData;
        
        // Restore other edit-related fields if they were in form_data
        if (rawData.invitePhone) {
            providerPhone.value = rawData.invitePhone;
        }
        if (rawData.publishType) {
            publishType.value = rawData.publishType;
        }
    }
    
    // Only initialize Google services in browser environment (H5)
    if (!isBrowser) {
        console.log('Not in browser environment, skipping Google Maps initialization');
        return;
    }
    
    // Wait for Google script to be ready if it's async, or check immediately
    const checkGoogle = setInterval(() => {
        if ((window as any).google && (window as any).google.maps) {
            clearInterval(checkGoogle);
            initGoogleServices();
        }
    }, 500);
    
    // Stop checking after 10 seconds to avoid infinite loop
    setTimeout(() => {
        clearInterval(checkGoogle);
        if (!autocompleteService) {
            console.log('Google Maps not loaded, using fallback mode');
        }
    }, 10000);
});

const initGoogleServices = () => {
    if (!isBrowser) return;
    try {
        autocompleteService = new (window as any).google.maps.places.AutocompleteService();
        placesService = new (window as any).google.maps.places.PlacesService(document.createElement('div'));
        console.log('Google Maps Services Initialized');
    } catch (e) {
        console.error('Google Maps Init Failed', e);
    }
}

const handleStreetInput = (key: string, value: string) => {
    // 1. Update local state
    updateAddress(key, 'street', value);
    currentFocusField.value = key;

    // 2. Clear if empty or short
    if (!value || value.length < 3) {
        addressSuggestions.value = [];
        return;
    }

    // 3. Call Google Autocomplete (only in browser with Google available)
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
                    description: p.description, 
                    secondary: p.structured_formatting.secondary_text
                }));
            } else {
                addressSuggestions.value = [];
            }
        });
    }
    // In Mini Program environment, users type addresses manually
};

const selectAddressSuggestion = (key: string, suggestion: any) => {
    if (!isBrowser || !placesService || !(window as any).google) return;

    placesService.getDetails({
        placeId: suggestion.place_id,
        fields: ['address_components', 'formatted_address']
    }, (place: any, status: any) => {
        if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && place) {
            const components = place.address_components;
            
            // Helper to extract component
            const getComp = (type: string) => components.find((c: any) => c.types.includes(type))?.long_name || '';
            const getShortComp = (type: string) => components.find((c: any) => c.types.includes(type))?.short_name || '';

            const streetNum = getComp('street_number');
            const route = getComp('route'); // Street name
            const city = getComp('locality') || getComp('sublocality_level_1') || getComp('administrative_area_level_2'); // Better City Fallbacks
            const province = getShortComp('administrative_area_level_1'); // 'ON'
            const postalCode = getComp('postal_code');

            // Update Form - Combine Street Num + Name
            updateAddress(key, 'street', streetNum ? `${streetNum} ${route}` : route); // e.g. "228 Terraview Crescent"
            updateAddress(key, 'city', city);
            updateAddress(key, 'province', province);
            updateAddress(key, 'postalCode', postalCode);

            // Clear UI
            addressSuggestions.value = [];
            currentFocusField.value = null;
        }
    });
};

// Custom Select Modal State
const showSelectModal = ref(false);
const currentSelectKey = ref('');
const currentSelectOptions = ref<any[]>([]);

const openSelectModal = (key: string, options: any[]) => {
    currentSelectKey.value = key;
    currentSelectOptions.value = options;
    showSelectModal.value = true;
};

const closeSelectModal = () => {
    showSelectModal.value = false;
};

const confirmSelect = (value: any) => {
    formData.value[currentSelectKey.value] = value;
    closeSelectModal();
};

const toggleCheckbox = (key: string, val: string) => {
    if (!Array.isArray(formData.value[key])) {
        formData.value[key] = [];
    }
    const arr = formData.value[key];
    const idx = arr.indexOf(val);
    if (idx > -1) arr.splice(idx, 1);
    else arr.push(val);
};

// Custom Date Modal State
const showDateModal = ref(false);
const currentDateKey = ref('');
const calendarYear = ref(today.getFullYear());
const calendarMonth = ref(today.getMonth()); // 0-indexed
const calendarDays = ref<number[]>([]);

const openDateModal = (key: string) => {
    currentDateKey.value = key;
    // Reset calendar to current month/year if no date is selected for this field,
    // or to the selected date's month/year if one exists.
    if (formData.value[key]) {
        const [y, m] = formData.value[key].split('-').map(Number);
        calendarYear.value = y;
        calendarMonth.value = m - 1; // Adjust to 0-indexed month
    } else {
        calendarYear.value = today.getFullYear();
        calendarMonth.value = today.getMonth();
    }
    generateCalendar(calendarYear.value, calendarMonth.value);
    showDateModal.value = true;
};

const closeDateModal = () => {
    showDateModal.value = false;
};

// Time picker using custom modal
const showTimeModal = ref(false);
const currentTimeKey = ref('');
const timePickerValue = ref([0, 0]); // Indices for [Hours, Minutes]
const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const minutes = ['00', '15', '30', '45'];

const openTimeModal = (key: string) => {
    currentTimeKey.value = key;
    const currentVal = formData.value[key];
    if (currentVal) {
        const [h, m] = currentVal.split(':');
        const hIndex = hours.findIndex(item => item === h);
        const mIndex = minutes.findIndex(item => item === m);
        timePickerValue.value = [Math.max(0, hIndex), Math.max(0, mIndex)];
    } else {
        const now = new Date();
        const currentHour = String(now.getHours()).padStart(2, '0');
        const hIndex = hours.findIndex(item => item === currentHour);
        timePickerValue.value = [Math.max(0, hIndex), 0];
    }
    showTimeModal.value = true;
};

const closeTimeModal = () => {
    showTimeModal.value = false;
};

const bindTimeChange = (e: any) => {
    timePickerValue.value = e.detail.value;
};

const confirmTime = () => {
    const [hIdx, mIdx] = timePickerValue.value;
    const h = hours[hIdx];
    const m = minutes[mIdx];
    formData.value[currentTimeKey.value] = `${h}:${m}`;
    closeTimeModal();
};

const generateCalendar = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days: number[] = [];
    // Padding for empty days
    for (let i = 0; i < firstDay; i++) {
        days.push(0);
    }
    // Days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }
    calendarDays.value = days;
};

const changeMonth = (delta: number) => {
    let newMonth = calendarMonth.value + delta;
    let newYear = calendarYear.value;
    
    if (newMonth > 11) {
        newMonth = 0;
        newYear++;
    } else if (newMonth < 0) {
        newMonth = 11;
        newYear--;
    }
    
    calendarMonth.value = newMonth;
    calendarYear.value = newYear;
    generateCalendar(newYear, newMonth);
};

const confirmDate = (day: number) => {
    const monthStr = (calendarMonth.value + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const fullDate = `${calendarYear.value}-${monthStr}-${dayStr}`;
    
    formData.value[currentDateKey.value] = fullDate;
    closeDateModal();
};

const isSelectedDate = (day: number) => {
    if (!formData.value[currentDateKey.value]) return false;
    const [y, m, d] = formData.value[currentDateKey.value].split('-').map(Number);
    return y === calendarYear.value && m === calendarMonth.value + 1 && d === day;
};

const isToday = (day: number) => {
    return today.getDate() === day && today.getMonth() === calendarMonth.value && today.getFullYear() === calendarYear.value;
};


const handleNextOrFinish = () => {
    if (currentStep.value < (template.value?.steps.length || 0) - 1) {
        nextStep();
    } else {
        handleFinalAction();
    }
};

const handleNext = () => {
    // Deprecated in favor of handleNextOrFinish for unified button, but kept if needed by other logical parts not shown
    nextStep();
}

const currentStepData = computed(() => {
    if (!template.value) return { title: '', description: '', fields: [] };
    return template.value.steps[currentStep.value];
});

const handleBack = () => {
    if (currentStep.value > 0) {
        currentStep.value--;
    } else {
        emit('back'); // Go back to Service List
    }
};

const nextStep = () => {
    // Validate
    const currentFields = currentStepData.value.fields;
    for (const field of currentFields) {
        if (field.required && !formData.value[field.key]) {
            uni.showToast({ title: '请完善信息', icon: 'none' }); 
            // Better UX: Shake input or red border (omitted for brevity)
            return;
        }
    }
    
    if (template.value && currentStep.value < template.value.steps.length - 1) {
        currentStep.value++;
    }
};

const getSelectedLabel = (field: any) => {
    const val = formData.value[field.key];
    if (!val) return '';
    const opt = field.options.find((o: any) => o.value === val);
    return opt ? opt.label : val;
};

const getRichFormData = () => {
    const richData: Record<string, any> = {};
    const rawData = formData.value;
    
    // Flatten all fields from template to look up labels
    const allFields = template.value?.steps.flatMap(s => s.fields) || [];
    
    // Process all keys in raw data
    for (const key in rawData) {
        const value = rawData[key];
        // Find definition
        const fieldDef = allFields.find(f => f.key === key);
        
        if (fieldDef) {
             // For options/select, try to find the human readable label for the value
             let displayValue = value;
             if (fieldDef.options) {
                 const opt = fieldDef.options.find((o: any) => o.value === value);
                 if (opt) displayValue = opt.label;
             }
             
             richData[key] = {
                 _is_rich: true, // Marker
                 value: value,
                 displayValue: displayValue, // Store readable value (e.g. "Deep Clean" instead of "deep")
                 label: fieldDef.label,
                 type: fieldDef.type
             };
        } else {
            // Keep as is for unknown keys
            richData[key] = value;
        }
    }
    
    return richData;
}

const handlePublish = async (withInvite = false) => {
    // Validate last step...
    const currentFields = currentStepData.value.fields;
    for (const field of currentFields) {
        if (field.required && !formData.value[field.key]) {
             uni.showToast({ title: '请完善信息', icon: 'none' });
             return;
        }
    }

    // Enrich Data with Labels
    const richFormData = getRichFormData();
    console.log(isEditMode.value ? "Updating:" : "Publishing:", richFormData);

    // 0. Check Login & Phone
    if (!props.isLoggedIn) {
        emit('request-login');
        return;
    }
    if (!props.userPhone && !isEditMode.value) {
        emit('request-phone');
        return;
    }

    uni.showLoading({ title: isEditMode.value ? '保存中...' : '发布中...' });
    
    try {
        let res;
        if (isEditMode.value) {
            res = await submissionsApi.update(props.editOrder.id, {
                formData: richFormData
            });
        } else {
            res = await submissionsApi.create({
                templateId: props.serviceId,
                formData: richFormData
            });
        }

        uni.hideLoading();
        uni.showToast({ title: isEditMode.value ? '已修改' : '已发布', icon: 'success' });
        
        setTimeout(() => {
            emit('publish', res.submission);
            if (!isEditMode.value && withInvite) {
                // Wait a bit then trigger invite or show extra toast
                setTimeout(() => {
                    handleInvite();
                }, 500);
            }
        }, 1500);
    } catch (error: any) {
        uni.hideLoading();
        uni.showToast({ title: (isEditMode.value ? '修改失败: ' : '发布失败: ') + (error.data?.error || error.message), icon: 'none' });
    }
};

const handleInvite = () => {
   uni.setClipboardData({
        data: `Hi，我有一个【${template.value?.name}】需求想请您报价，详情：https://youfujia.com/request/${props.serviceId}`,
        success: () => {
            uni.showToast({ title: '邀请链接已复制', icon: 'none' });
        }
    });
};

const handleFinalAction = () => {
    // Validate current step fields roughly before action
    const currentFields = currentStepData.value.fields;
    for (const field of currentFields) {
        if (field.required && !formData.value[field.key]) {
             uni.showToast({ title: '请完善信息', icon: 'none' });
             return;
        }
    }

    if (publishType.value === 'specific' || publishType.value === 'both') {
        // Open Phone Interaction Modal Flow
        showProviderInputModal.value = true;
    } else {
        // Just Lobby
        handlePublish();
    }
};

// Consolidated Phone Check & Submit
const checkProviderPhone = async () => {
    if (!providerPhone.value || providerPhone.value.length < 10) return; // Basic length check
    
    isCheckingPhone.value = true;
    try {
         const res = await providersApi.checkPhone(providerPhone.value);
         providerCheckResult.value = res;
         showInviteMessage.value = !res.registered;
    } catch (e) {
        console.error(e);
    } finally {
        isCheckingPhone.value = false;
    }
};

const handlePhoneSubmit = async () => {
    if (!providerPhone.value || providerPhone.value.length < 3) {
        uni.showToast({ title: '请输入有效的手机号', icon: 'none' });
        return;
    }

    // Ensure we checked at least once if user didn't blur
    if (!providerCheckResult.value) {
        await checkProviderPhone();
    }

    showProviderInputModal.value = false;
    showConfirmationModal.value = true;
};

const confirmAndSend = async () => {
    showConfirmationModal.value = false;
    // 0. Check Login & Phone
    if (!props.isLoggedIn) {
        emit('request-login');
        return;
    }
    if (!props.userPhone && !isEditMode.value) {
        emit('request-phone');
        return;
    }

    uni.showLoading({ title: '发送中...' });
    
    try {
        const richFormData = getRichFormData();
        const finalData = { 
            ...richFormData, 
            invitePhone: providerPhone.value,
            publishType: publishType.value
        };

        // 1. Create Submission Order
        let res;
        if (isEditMode.value) {
            res = await submissionsApi.update(props.editOrder.id, {
                formData: finalData
            });
        } else {
            res = await submissionsApi.create({
                templateId: props.serviceId,
                formData: finalData
            });
        }

        // 2. If user is NOT registered, send SMS Invite
        // 2. If user is NOT registered, send SMS Invite
        if (providerCheckResult.value && !providerCheckResult.value.registered) {
             const serviceName = template.value?.name || '服务';
             
             // Extract displayable details
             const userName = richFormData.contact_name || '客户';
             // Date: Try common keys
             const serviceDate = richFormData.service_date || richFormData.move_date || richFormData.date || '';
             // Address: handle object or string
             let serviceAddress = '';
             const addr = richFormData.address || richFormData.from_address || richFormData.to_address;
             if (addr) {
                 serviceAddress = typeof addr === 'object' ? (addr.street || addr.formatted_address || '') : addr;
             }

             // Map field IDs back to semantic keys (e.g. field_123 -> move_date)
             const semanticData: Record<string, any> = {};
             // Copy known keys first
             Object.assign(semanticData, richFormData);
             
             // Iterate through template steps and fields to find mapping
             if (template.value && template.value.steps) {
                 const allFields = template.value.steps.flatMap(s => s.fields || []);
                 
                 // Iterate over the actual data we have
                 Object.keys(richFormData).forEach(dataKey => {
                     // dataKey is likely 'field_176...' or a semantic key
                     const field = allFields.find(f => f.key === dataKey || (f as any).id === dataKey);
                     
                     if (field) {
                         // Extract the displayable value
                         const valObj = richFormData[dataKey];
                         let displayVal = valObj;
                         if (valObj && typeof valObj === 'object' && valObj.value !== undefined) {
                              displayVal = valObj.value; // Get raw value
                              // Prefer displayValue if available (e.g. for encoded options)
                              if (valObj.displayValue) displayVal = valObj.displayValue; 
                         }
                         
                         // Handle Address Object Special Case
                         if (displayVal && typeof displayVal === 'object' && (displayVal.street || displayVal.formatted_address)) {
                             displayVal = displayVal.street || displayVal.formatted_address;
                         }

                         // 1. Explicit Key Mapping
                         if (field.key && !field.key.startsWith('field_')) {
                             semanticData[field.key] = displayVal;
                         }

                         // 2. Label-based Smart Mapping
                         const label = field.label || '';
                         if (label.includes('日期') || label.includes('时间') || label.includes('Date')) {
                             semanticData['move_date'] = displayVal;
                             semanticData['service_date'] = displayVal;
                         }
                         if (label.includes('出发') || label.includes('从') || label === '地址' || label === 'Address') {
                             semanticData['from_address'] = displayVal;
                             semanticData['address'] = displayVal;
                         }
                         if (label.includes('目的') || label.includes('到')) {
                             semanticData['to_address'] = displayVal;
                         }
                         if (label.includes('联系人') || label.includes('姓名') || label.includes('Name')) {
                             semanticData['contact_name'] = displayVal;
                             semanticData['userName'] = displayVal;
                         }
                         if (label.includes('物品') || label.includes('描述') || label.includes('Description')) {
                             semanticData['items_desc'] = displayVal;
                         }
                     }
                 });
             }

             await providersApi.sendInvite(providerPhone.value, serviceName, {
                 userName,
                 serviceDate,
                 serviceAddress,
                 ...semanticData
             });
             uni.showToast({ title: '订单已创建并发送短信邀请', icon: 'none', duration: 3000 });
        } else {
             uni.showToast({ title: '订单已发送给指定服务商', icon: 'success' });
        }

        uni.hideLoading();
        
        setTimeout(() => {
             emit('publish', res.submission);
        }, 2000);

    } catch (error: any) {
        uni.hideLoading();
        uni.showToast({ title: '操作失败: ' + (error.data?.error || error.message), icon: 'none' });
    }
};

defineExpose({
    handlePublish
});
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.bg-white { background-color: #ffffff; }
.bg-gray-50 { background-color: #f8fafc; } /* Lighter gray */
.bg-gray-50-50 { background-color: rgba(248, 250, 252, 0.5); } /* 50% opacity */
.bg-gray-100 { background-color: #f1f5f9; }
.bg-emerald-600 { background-color: #059669; }
.bg-emerald-700 { background-color: #047857; }
.bg-emerald-500 { background-color: #10b981; }
.bg-blue-500 { background-color: #3b82f6; }
.bg-emerald-50 { background-color: #ecfdf5; }
.bg-black-60 { background-color: rgba(0, 0, 0, 0.6); }
.bg-black-40 { background-color: rgba(0, 0, 0, 0.4); }

.text-gray-900 { color: #0f172a; }
.text-gray-800 { color: #1e293b; }
.text-gray-700 { color: #334155; }
.text-gray-600 { color: #475569; }
.text-gray-500 { color: #64748b; }
.text-gray-400 { color: #94a3b8; }
.text-white { color: #ffffff; }
.text-red-500 { color: #ef4444; }
.text-emerald-600 { color: #059669; }
.text-emerald-700 { color: #047857; }

.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }
.font-medium { font-weight: 500; }
.leading-tight { line-height: 1.25; }
.leading-relaxed { line-height: 1.625; }

.text-xs { font-size: 12px; }
.text-sm { font-size: 14px; }
.text-base { font-size: 16px; }
.text-lg { font-size: 18px; }
.text-2xl { font-size: 24px; }
.text-center { text-align: center; }

.border { border-width: 1px; }
.border-b { border-bottom-width: 1px; }
.border-t { border-top-width: 1px; }
.border-transparent { border-color: transparent; }
.border-gray-50 { border-color: #f8fafc; }
.border-gray-100 { border-color: #f1f5f9; }
.border-emerald-600 { border-color: #059669; }

.rounded-full { border-radius: 9999px; }
.rounded-xl { border-radius: 12px; }
.rounded-2xl { border-radius: 16px; }

.w-full { width: 100%; }
.h-12 { height: 48px; } 
.w-20 { width: 80px; }
.h-1 { height: 4px; }
.h-full { height: 100%; }
.h-32 { height: 128px; }
.w-1 { width: 4px; }
.h-4 { height: 16px; }
.mb-3 { margin-bottom: 12px; }
.gap-2 { gap: 8px; }
.max-w-sm { max-width: 24rem; }
.max-h-300px { max-height: 300px; }

.pt-custom { padding-top: env(safe-area-inset-top); }
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
.pb-footer { padding-bottom: calc(80px + env(safe-area-inset-bottom)); }
.pb-32 { padding-bottom: 128px; }
.pt-4 { padding-top: 16px; }
.pb-2 { padding-bottom: 8px; }
.pb-4 { padding-bottom: 16px; }
.px-5 { padding-left: 20px; padding-right: 20px; }
.py-4 { padding-top: 16px; padding-bottom: 16px; }
.px-8 { padding-left: 32px; padding-right: 32px; }
.px-2 { padding-left: 8px; padding-right: 8px; }
.py-1 { padding-top: 4px; padding-bottom: 4px; }
.p-4 { padding: 16px; }
.p-2 { padding: 8px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.p-6 { padding: 24px; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.bottom-1 { bottom: 4px; }

.fixed { position: fixed; }
.absolute { position: absolute; }
.sticky { position: sticky; }
.relative { position: relative; }
.top-0 { top: 0; }
.bottom-0 { bottom: 0; }
.left-0 { left: 0; }
.right-0 { right: 0; }
.z-30 { z-index: 30; }
.z-50 { z-index: 50; }
.z-10 { z-index: 10; }

.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
.shadow-2xl { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.backdrop-blur-sm { backdrop-filter: blur(4px); }

.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.flex-1 { flex: 1; }
.gap-4 { gap: 16px; }
.space-y-3 > view + view { margin-top: 12px; }
.space-y-5 > view + view { margin-top: 20px; }
.space-y-6 > view + view { margin-top: 24px; }
.px-6 { padding-left: 24px; padding-right: 24px; }
.box-border { box-sizing: border-box; }
.overflow-hidden { overflow: hidden; }

/* Grid */
.grid { display: grid; }
.grid-cols-7 { grid-template-columns: repeat(7, minmax(0, 1fr)); }
.gap-y-1 { row-gap: 4px; }
.aspect-square { aspect-ratio: 1 / 1; }

.transition-all { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.active-bg-emerald-700:active { background-color: #047857; }
.active-bg-emerald-50:active { background-color: #ecfdf5; }
.active-bg-gray-200:active { background-color: #e2e8f0; }
.active-bg-gray-100:active { background-color: #f1f5f9; }

/* Animations */
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
.animate-slide-up { animation: slideUp 0.4s ease-out; }
.animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
@keyframes slideUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes scaleIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
}

/* Image Upload Styles */
.image-upload-container {
    width: 100%;
}

.image-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
}

.image-item {
    position: relative;
    aspect-ratio: 1 / 1;
    border-radius: 12px;
    overflow: hidden;
    background-color: #f1f5f9;
}

.uploaded-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.image-delete-btn {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 20px;
    height: 20px;
    background-color: rgba(0, 0, 0, 0.6);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
}

.image-delete-btn:active {
    background-color: rgba(239, 68, 68, 0.9);
}

.image-add-btn {
    aspect-ratio: 1 / 1;
    border-radius: 12px;
    border: 2px dashed #d1d5db;
    background-color: #f8fafc;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
}

.image-add-btn:active {
    border-color: #10b981;
    background-color: #ecfdf5;
}

.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.block { display: block; }
.pb-40 { padding-bottom: 160px; }
</style>
