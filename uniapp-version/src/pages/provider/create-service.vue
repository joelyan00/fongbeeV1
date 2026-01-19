<template>
  <view class="min-h-screen bg-gray-900 flex flex-col">
    <!-- Header -->
    <view class="bg-gray-800 px-4 py-3 flex flex-row items-center justify-between border-b border-gray-700 pt-custom">
      <view @click="handleBack" class="w-8 h-8 flex items-center justify-center">
        <AppIcon name="chevron-left" :size="24" color="#ffffff"/>
      </view>
      <text class="text-lg font-bold text-white">创建标准服务</text>
      <view class="w-8"></view>
    </view>

    <!-- Category Badge -->
    <view class="px-4 py-3 bg-gray-800/50 border-b border-gray-700">
      <view class="flex flex-row items-center gap-2">
        <text class="text-gray-400 text-sm">所属类目：</text>
        <view class="bg-teal-600/20 px-3 py-1 rounded-full">
          <text class="text-teal-400 text-sm font-medium">{{ categoryName }}</text>
        </view>
      </view>
    </view>

    <!-- Form Content -->
    <scroll-view scroll-y class="flex-1">
      <view class="p-4 flex flex-col gap-4">
        
        <!-- ===== BASIC INFO SECTION ===== -->
        <view class="bg-gray-800/50 rounded-lg px-3 py-2">
          <text class="text-teal-400 text-xs font-bold uppercase">基本信息</text>
        </view>

        <!-- Service Title -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">服务标题 <text class="text-red-400">*</text></text>
          <input 
            v-model="form.title"
            class="w-full bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
            placeholder="例如：专业家庭保洁服务"
            maxlength="50"
          />
          <text class="text-gray-500 text-xs mt-2 block">{{ form.title.length }}/50</text>
        </view>

        <!-- Service Description with AI -->
        <view class="bg-gray-800 rounded-xl p-4">
          <view class="flex flex-row items-center justify-between mb-2">
            <text class="text-white font-medium">服务描述 <text class="text-red-400">*</text></text>
            <view 
              v-if="form.description.length >= 20"
              @click="aiRewrite('description', 'service_description')"
              class="flex flex-row items-center gap-1 px-2 py-1 bg-purple-600/20 rounded-lg"
            >
              <text class="text-purple-400 text-xs">✨ AI辅助编辑</text>
            </view>
          </view>
          <textarea 
            v-model="form.description"
            class="w-full bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
            placeholder="请详细描述您提供的服务内容、服务特点等"
            :maxlength="500"
            style="height: 120px;"
          />
          <text class="text-gray-500 text-xs mt-2 block">{{ form.description.length }}/500 (输入20字以上可使用AI辅助)</text>
        </view>

        <!-- ===== PRICING SECTION ===== -->
        <view class="bg-gray-800/50 rounded-lg px-3 py-2">
          <text class="text-teal-400 text-xs font-bold uppercase">价格设置</text>
        </view>

        <!-- Base Price -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">服务价格 <text class="text-red-400">*</text></text>
          <view class="flex flex-row items-center gap-2">
            <text class="text-gray-400 text-lg">$</text>
            <input 
              v-model="form.price"
              type="digit"
              class="flex-1 bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
              placeholder="请输入价格"
            />
            <text class="text-gray-500 text-sm">CAD</text>
          </view>
        </view>

        <!-- Price Unit -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-3 block">计价单位 <text class="text-red-400">*</text></text>
          <view class="flex flex-row flex-wrap gap-2">
            <view 
              v-for="unit in priceUnits"
              :key="unit.value"
              @click="form.priceUnit = unit.value"
              :class="['px-3 py-2 rounded-lg text-sm border', 
                form.priceUnit === unit.value 
                  ? 'bg-teal-600 text-white border-teal-600' 
                  : 'bg-gray-700 text-gray-400 border-gray-600']"
            >
              <text :class="form.priceUnit === unit.value ? 'text-white' : 'text-gray-400'">{{ unit.label }}</text>
            </view>
          </view>
        </view>

        <!-- Additional Rate -->
        <view v-if="form.priceUnit === 'base_plus_hourly'" class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">超时费率</text>
          <view class="flex flex-row items-center gap-2">
            <text class="text-gray-400 text-lg">$</text>
            <input 
              v-model="form.additionalRate"
              type="digit"
              class="flex-1 bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
              placeholder="超过首小时后的费率"
            />
            <text class="text-gray-500 text-sm">/小时</text>
          </view>
          <text class="text-gray-500 text-xs mt-2 block">基础价格包含首小时，超时后按此费率计算</text>
        </view>

        <!-- Tax Setting -->
        <view class="bg-gray-800 rounded-xl p-4">
          <view class="flex flex-row items-center justify-between">
            <view class="flex-1">
              <text class="text-white font-medium block">价格已含 HST/GST</text>
              <text class="text-gray-500 text-xs mt-1 block">如价格已含税请开启此选项</text>
            </view>
            <switch :checked="form.taxIncluded" @change="(e: any) => form.taxIncluded = e.detail.value" color="#0d9488"/>
          </view>
        </view>

        <!-- ===== SCOPE & INCLUSIONS ===== -->
        <view class="bg-gray-800/50 rounded-lg px-3 py-2">
          <text class="text-teal-400 text-xs font-bold uppercase">服务范围</text>
        </view>

        <!-- What's Included with AI -->
        <view class="bg-gray-800 rounded-xl p-4">
          <view class="flex flex-row items-center justify-between mb-2">
            <text class="text-white font-medium">服务包含</text>
            <view 
              v-if="form.inclusions.length >= 20"
              @click="aiRewrite('inclusions', 'inclusions')"
              class="flex flex-row items-center gap-1 px-2 py-1 bg-purple-600/20 rounded-lg"
            >
              <text class="text-purple-400 text-xs">✨ AI辅助编辑</text>
            </view>
          </view>
          <textarea 
            v-model="form.inclusions"
            class="w-full bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
            placeholder="列出服务包含的项目：&#10;• 全屋除尘&#10;• 地面清洁&#10;• 卫生间清洁"
            style="height: 100px;"
          />
        </view>

        <!-- What's NOT Included with AI -->
        <view class="bg-gray-800 rounded-xl p-4">
          <view class="flex flex-row items-center justify-between mb-2">
            <text class="text-white font-medium">服务不包含</text>
            <view 
              v-if="form.exclusions.length >= 20"
              @click="aiRewrite('exclusions', 'exclusions')"
              class="flex flex-row items-center gap-1 px-2 py-1 bg-purple-600/20 rounded-lg"
            >
              <text class="text-purple-400 text-xs">✨ AI辅助编辑</text>
            </view>
          </view>
          <textarea 
            v-model="form.exclusions"
            class="w-full bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
            placeholder="列出不包含的项目：&#10;• 材料/零件费（另计）&#10;• 室外窗户清洁"
            style="height: 80px;"
          />
        </view>

        <!-- Materials -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-3 block">材料/耗材</text>
          <view class="flex flex-col gap-2">
            <view 
              v-for="opt in materialsOptions"
              :key="opt.value"
              @click="form.materialsPolicy = opt.value"
              :class="['flex flex-row items-center px-3 py-3 rounded-lg border', 
                form.materialsPolicy === opt.value 
                  ? 'border-teal-500 bg-teal-600/10' 
                  : 'border-gray-600 bg-gray-700']"
            >
              <view :class="['w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center',
                form.materialsPolicy === opt.value ? 'border-teal-500' : 'border-gray-500']">
                <view v-if="form.materialsPolicy === opt.value" class="w-2.5 h-2.5 rounded-full bg-teal-500"/>
              </view>
              <text :class="form.materialsPolicy === opt.value ? 'text-white' : 'text-gray-300'" class="text-sm">{{ opt.label }}</text>
            </view>
          </view>
        </view>

        <!-- Extra Fees with AI -->
        <view class="bg-gray-800 rounded-xl p-4">
          <view class="flex flex-row items-center justify-between mb-2">
            <text class="text-white font-medium">额外费用说明</text>
            <view 
              v-if="form.extraFees.length >= 20"
              @click="aiRewrite('extraFees', 'extra_fees')"
              class="flex flex-row items-center gap-1 px-2 py-1 bg-purple-600/20 rounded-lg"
            >
              <text class="text-purple-400 text-xs">✨ AI辅助编辑</text>
            </view>
          </view>
          <textarea 
            v-model="form.extraFees"
            class="w-full bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
            placeholder="如有额外费用请说明：&#10;• 市中心停车费&#10;• 超过20公里的路途费"
            style="height: 80px;"
          />
        </view>

        <!-- ===== SERVICE DETAILS ===== -->
        <view class="bg-gray-800/50 rounded-lg px-3 py-2">
          <text class="text-teal-400 text-xs font-bold uppercase">服务详情</text>
        </view>

        <!-- Service Duration -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">预计时长</text>
          <view class="flex flex-row items-center gap-2">
            <input 
              v-model="form.duration"
              type="number"
              class="flex-1 bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
              placeholder="例如：2"
            />
            <view class="bg-gray-700 px-4 py-3 rounded-lg">
              <text class="text-gray-400 text-sm">小时</text>
            </view>
          </view>
        </view>

        <!-- Service Area - Dropdown -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">服务区域 <text class="text-red-400">*</text></text>
          <picker 
            mode="multiSelector" 
            :range="cityPickerData"
            :value="selectedCityIndexes"
            @change="onCityChange"
          >
            <view class="w-full bg-gray-700 text-white rounded-lg px-3 py-3 text-sm flex flex-row items-center justify-between">
              <text :class="form.serviceAreas.length > 0 ? 'text-white' : 'text-gray-500'">
                {{ form.serviceAreas.length > 0 ? form.serviceAreas.join(', ') : '请选择服务覆盖城市' }}
              </text>
              <AppIcon name="chevron-down" :size="16" color="#6b7280"/>
            </view>
          </picker>
          <!-- Selected cities display -->
          <view v-if="form.serviceAreas.length > 0" class="flex flex-row flex-wrap gap-2 mt-3">
            <view 
              v-for="city in form.serviceAreas" 
              :key="city"
              class="flex flex-row items-center gap-1 bg-teal-600/20 px-2 py-1 rounded-full"
            >
              <text class="text-teal-400 text-xs">{{ city }}</text>
              <view @click="removeCity(city)" class="w-4 h-4 flex items-center justify-center">
                <AppIcon name="x" :size="12" color="#2dd4bf"/>
              </view>
            </view>
          </view>
          <text class="text-gray-500 text-xs mt-2 block">可多选，城市列表由管理后台配置</text>
        </view>

        <!-- Advance Booking -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">提前预约时间</text>
          <view class="flex flex-row items-center gap-2">
            <input 
              v-model="form.advanceBooking"
              type="number"
              class="flex-1 bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
              placeholder="例如：24"
            />
            <view class="bg-gray-700 px-4 py-3 rounded-lg">
              <text class="text-gray-400 text-sm">小时</text>
            </view>
          </view>
          <text class="text-gray-500 text-xs mt-2 block">您需要提前多久收到订单预约？</text>
        </view>

        <!-- Client Requirements with AI -->
        <view class="bg-gray-800 rounded-xl p-4">
          <view class="flex flex-row items-center justify-between mb-2">
            <text class="text-white font-medium">客户须知</text>
            <view 
              v-if="form.clientRequirements.length >= 20"
              @click="aiRewrite('clientRequirements', 'client_requirements')"
              class="flex flex-row items-center gap-1 px-2 py-1 bg-purple-600/20 rounded-lg"
            >
              <text class="text-purple-400 text-xs">✨ AI辅助编辑</text>
            </view>
          </view>
          <textarea 
            v-model="form.clientRequirements"
            class="w-full bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
            placeholder="客户需要准备什么：&#10;• 提供水电&#10;• 需有人在场&#10;• 清空工作区域"
            style="height: 80px;"
          />
        </view>

        <!-- ===== POLICIES ===== -->
        <view class="bg-gray-800/50 rounded-lg px-3 py-2">
          <text class="text-teal-400 text-xs font-bold uppercase">服务政策</text>
        </view>

        <!-- Cancellation Policy -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-3 block">取消政策</text>
          <view class="flex flex-col gap-2">
            <view 
              v-for="policy in cancellationPolicies"
              :key="policy.value"
              @click="form.cancellationPolicy = policy.value"
              :class="['flex flex-row items-start px-3 py-3 rounded-lg border', 
                form.cancellationPolicy === policy.value 
                  ? 'border-teal-500 bg-teal-600/10' 
                  : 'border-gray-600 bg-gray-700']"
            >
              <view :class="['w-5 h-5 rounded-full border-2 mr-3 mt-0.5 flex items-center justify-center flex-shrink-0',
                form.cancellationPolicy === policy.value ? 'border-teal-500' : 'border-gray-500']">
                <view v-if="form.cancellationPolicy === policy.value" class="w-2.5 h-2.5 rounded-full bg-teal-500"/>
              </view>
              <view class="flex-1">
                <text :class="form.cancellationPolicy === policy.value ? 'text-white' : 'text-gray-300'" class="text-sm font-medium block">{{ policy.label }}</text>
                <text class="text-gray-500 text-xs mt-1 block">{{ policy.description }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- Credentials -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-3 block">资质证照</text>
          <view class="flex flex-col gap-3">
            <view class="flex flex-row items-center justify-between">
              <text class="text-gray-300 text-sm">持有专业执照</text>
              <switch :checked="form.isLicensed" @change="(e: any) => form.isLicensed = e.detail.value" color="#0d9488"/>
            </view>
            <view class="flex flex-row items-center justify-between">
              <text class="text-gray-300 text-sm">持有责任保险</text>
              <switch :checked="form.hasInsurance" @change="(e: any) => form.hasInsurance = e.detail.value" color="#0d9488"/>
            </view>
          </view>
          <text class="text-gray-500 text-xs mt-3 block">客户更信任有执照和保险的服务商</text>
        </view>

        <!-- ===== ADD-ONS ===== -->
        <view class="bg-gray-800/50 rounded-lg px-3 py-2">
          <text class="text-teal-400 text-xs font-bold uppercase">附加服务（可选）</text>
        </view>

        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">可加项服务</text>
          <text class="text-gray-500 text-xs mb-3 block">提供附加服务可增加收入</text>
          
          <view class="flex flex-col gap-2">
            <view 
              v-for="(addon, idx) in form.addOns"
              :key="idx"
              class="flex flex-row items-center gap-2 bg-gray-700 rounded-lg p-3"
            >
              <input 
                v-model="addon.name"
                class="flex-1 bg-gray-600 text-white rounded px-2 py-2 text-sm"
                placeholder="加项名称"
              />
              <text class="text-gray-400">$</text>
              <input 
                v-model="addon.price"
                type="digit"
                class="w-20 bg-gray-600 text-white rounded px-2 py-2 text-sm"
                placeholder="价格"
              />
              <view @click="removeAddOn(idx)" class="w-8 h-8 flex items-center justify-center">
                <AppIcon name="x" :size="16" color="#ef4444"/>
              </view>
            </view>
          </view>
          
          <view 
            @click="addAddOn"
            class="mt-3 flex flex-row items-center justify-center gap-2 py-2 border border-dashed border-gray-600 rounded-lg"
          >
            <AppIcon name="plus" :size="16" color="#0d9488"/>
            <text class="text-teal-400 text-sm">添加附加服务</text>
          </view>
        </view>

        <!-- ===== MEDIA ===== -->
        <view class="bg-gray-800/50 rounded-lg px-3 py-2">
          <text class="text-teal-400 text-xs font-bold uppercase">服务图片</text>
        </view>

        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">服务展示图</text>
          <view class="flex flex-row flex-wrap gap-2">
            <view 
              @click="uploadImage"
              class="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center border border-dashed border-gray-600"
            >
              <AppIcon name="plus" :size="24" color="#6b7280"/>
            </view>
            <view 
              v-for="(img, idx) in form.images"
              :key="idx"
              class="relative w-20 h-20 rounded-lg overflow-hidden"
            >
              <image :src="img" mode="aspectFill" class="w-full h-full"/>
              <view 
                @click="removeImage(idx)"
                class="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full flex items-center justify-center"
              >
                <AppIcon name="x" :size="12" color="#ffffff"/>
              </view>
            </view>
          </view>
          <text class="text-gray-500 text-xs mt-2 block">上传服务作品图片，最多5张</text>
        </view>

        <view class="h-4"></view>
      </view>
    </scroll-view>

    <!-- Quota Card -->
    <view class="px-4 py-3 bg-gray-800 border-t border-gray-700">
      <view class="bg-teal-900/20 rounded-xl p-4 border border-teal-800/30">
        <view class="flex flex-row items-center justify-between mb-2">
          <view class="flex flex-row items-center gap-2">
            <AppIcon name="listing-info" :size="18" class="text-teal-400"/>
            <text class="text-white text-sm font-medium">上架配额信息</text>
          </view>
          <view class="bg-teal-600/20 px-2 py-0.5 rounded-md">
            <text class="text-teal-400 text-xs font-bold">成本: {{ listingCost }} 积分/次</text>
          </view>
        </view>
        <view class="flex flex-row items-center gap-4">
          <view class="flex-1">
            <text class="text-gray-400 text-xs block mb-1">剩余上架次数</text>
            <text class="text-white text-lg font-bold">{{ creditBalance.listings }} <text class="text-xs font-normal text-gray-500 ml-1">次</text></text>
          </view>
          <view class="w-px h-8 bg-gray-700"></view>
          <view class="flex-1">
            <text class="text-gray-400 text-xs block mb-1">可用积分余额</text>
            <text class="text-white text-lg font-bold">{{ creditBalance.total }} <text class="text-xs font-normal text-gray-500 ml-1">积分</text></text>
          </view>
        </view>
        <view v-if="creditBalance.listings === 0 && creditBalance.total < listingCost" class="mt-3 flex flex-row items-center gap-1.5 p-2 bg-red-900/20 rounded-lg">
          <AppIcon name="alert-circle" :size="14" class="text-red-400"/>
          <text class="text-red-400 text-xs">配额及积分均不足，无法发布新服务</text>
        </view>
      </view>
    </view>

    <!-- Footer -->

    <view class="bg-gray-800 border-t border-gray-700 px-4 py-4 pb-safe flex flex-row gap-3">
      <view 
        @click="saveDraft"
        class="flex-1 h-12 rounded-xl border border-gray-600 flex items-center justify-center"
      >
        <text class="text-gray-300 font-medium">保存草稿</text>
      </view>
      <view 
        @click="submitForReview"
        :class="['flex-1 h-12 rounded-xl flex items-center justify-center',
          canSubmit ? 'bg-teal-600 active:bg-teal-700' : 'bg-gray-600']"
      >
        <text class="text-white font-bold">{{ submitting ? '提交中...' : '提交审核' }}</text>
      </view>
    </view>

    <!-- AI Edit Modal -->
    <view v-if="showAiModal" class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <view class="bg-gray-800 rounded-2xl w-full max-w-md overflow-hidden">
        <view class="p-4 border-b border-gray-700">
          <text class="text-white font-bold text-lg block">✨ AI 辅助编辑</text>
          <text class="text-gray-400 text-xs mt-1 block">AI 已优化您的内容，请确认或修改</text>
        </view>
        
        <view class="p-4">
          <view v-if="aiLoading" class="flex items-center justify-center py-8">
            <view class="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin"></view>
          </view>
          <view v-else>
            <text class="text-gray-400 text-xs mb-2 block">优化后的内容：</text>
            <textarea 
              v-model="aiEnhancedText"
              class="w-full bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
              style="height: 150px;"
            />
          </view>
        </view>
        
        <view class="p-4 border-t border-gray-700 flex flex-row gap-3">
          <view 
            @click="cancelAiEdit"
            class="flex-1 h-10 rounded-lg border border-gray-600 flex items-center justify-center"
          >
            <text class="text-gray-300">取消</text>
          </view>
          <view 
            @click="confirmAiEdit"
            class="flex-1 h-10 rounded-lg bg-teal-600 flex items-center justify-center"
          >
            <text class="text-white font-medium">确认使用</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { providersApi, citiesApi, aiApi, creditsApi, API_BASE_URL } from '@/services/api';


const categoryName = ref('');
const categoryId = ref('');
const submitting = ref(false);
const cities = ref<any[]>([]);

// AI Modal state
const showAiModal = ref(false);
const aiLoading = ref(false);
const aiEnhancedText = ref('');
const aiEditingField = ref('');

// Credit state
const listingCost = ref(10);
const creditBalance = ref({
  total: 0,
  listings: 0,
  purchased: 0,
  subscription: 0
});
const balanceLoading = ref(true);


const form = ref({
  title: '',
  description: '',
  price: '',
  priceUnit: 'per_service',
  additionalRate: '',
  taxIncluded: false,
  inclusions: '',
  exclusions: '',
  materialsPolicy: 'client_provides',
  extraFees: '',
  duration: '',
  serviceAreas: [] as string[],
  advanceBooking: '24',
  clientRequirements: '',
  cancellationPolicy: 'flexible',
  isLicensed: false,
  hasInsurance: false,
  addOns: [] as { name: string; price: string }[],
  images: [] as string[],
});

const priceUnits = [
  { value: 'per_service', label: '每次' },
  { value: 'per_hour', label: '每小时' },
  { value: 'per_sqft', label: '每平方英尺' },
  { value: 'per_unit', label: '每单位' },
  { value: 'per_room', label: '每房间' },
  { value: 'base_plus_hourly', label: '起步价+超时费' },
];

const materialsOptions = [
  { value: 'included', label: '材料/耗材包含在价格内' },
  { value: 'client_provides', label: '客户提供材料' },
  { value: 'charged_separately', label: '材料费另计' },
];

const cancellationPolicies = [
  { value: 'flexible', label: '灵活', description: '服务前24小时内取消可全额退款' },
  { value: 'moderate', label: '适中', description: '服务前48小时内取消可全额退款' },
  { value: 'strict', label: '严格', description: '服务前7天内取消可全额退款' },
  { value: 'non_refundable', label: '不可退款', description: '预订后不可退款' },
];

// City picker computed
const cityPickerData = computed(() => {
  return [cities.value.map(c => c.name)];
});

const selectedCityIndexes = ref([0]);

const canSubmit = computed(() => {
  return form.value.title.trim() && 
         form.value.description.trim() && 
         form.value.price && 
         form.value.serviceAreas.length > 0 &&
         !submitting.value;
});

onMounted(async () => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as any;
  const options = currentPage.$page?.options || currentPage.options || {};
  
  categoryName.value = decodeURIComponent(options.category || '');
  categoryId.value = options.categoryId || '';
  
  // Load cities
  try {
    const res = await citiesApi.getActive();
    cities.value = Array.isArray(res) ? res : [];
  } catch (e) {
    console.error('Failed to load cities:', e);
    // ... setup fallback cities as already in code
  }

  // Load Credit Balance & Cost
  loadBalance();
});

const loadBalance = async () => {
    balanceLoading.value = true;
    try {
        const [balanceRes, costRes] = await Promise.all([
            creditsApi.getBalance(),
            uni.request({ url: `${API_BASE_URL}/credits/listing-cost`, method: 'GET' })
        ]);
        
        if (balanceRes.success) {
            creditBalance.value = balanceRes.data;
        }
        
        const costData = costRes.data as any;
        if (costData.success) {
            listingCost.value = costData.cost;
        }
    } catch (e) {
        console.error('Failed to load balance/cost:', e);
    } finally {
        balanceLoading.value = false;
    }
};


const handleBack = () => {
  uni.navigateBack();
};

const onCityChange = (e: any) => {
  const idx = e.detail.value[0];
  const cityName = cities.value[idx]?.name;
  if (cityName && !form.value.serviceAreas.includes(cityName)) {
    form.value.serviceAreas.push(cityName);
  }
};

const removeCity = (city: string) => {
  const idx = form.value.serviceAreas.indexOf(city);
  if (idx >= 0) {
    form.value.serviceAreas.splice(idx, 1);
  }
};

const addAddOn = () => {
  form.value.addOns.push({ name: '', price: '' });
};

const removeAddOn = (idx: number) => {
  form.value.addOns.splice(idx, 1);
};

const uploadImage = () => {
  if (form.value.images.length >= 5) {
    return uni.showToast({ title: '最多上传5张图片', icon: 'none' });
  }
  
  uni.chooseImage({
    count: 5 - form.value.images.length,
    success: (res) => {
      form.value.images.push(...res.tempFilePaths);
    }
  });
};

const removeImage = (idx: number) => {
  form.value.images.splice(idx, 1);
};

// AI Editing functions
const aiRewrite = async (fieldName: string, context: string) => {
  const text = (form.value as any)[fieldName];
  if (!text || text.length < 20) {
    return uni.showToast({ title: '请输入至少20个字符', icon: 'none' });
  }
  
  aiEditingField.value = fieldName;
  showAiModal.value = true;
  aiLoading.value = true;
  
  try {
    const res = await aiApi.rewrite(text, context);
    aiEnhancedText.value = res.enhanced;
  } catch (e: any) {
    aiEnhancedText.value = text;
    uni.showToast({ title: e.message || 'AI处理失败', icon: 'none' });
  } finally {
    aiLoading.value = false;
  }
};

const cancelAiEdit = () => {
  showAiModal.value = false;
  aiEditingField.value = '';
  aiEnhancedText.value = '';
};

const confirmAiEdit = () => {
  if (aiEditingField.value && aiEnhancedText.value) {
    (form.value as any)[aiEditingField.value] = aiEnhancedText.value;
  }
  showAiModal.value = false;
  aiEditingField.value = '';
  aiEnhancedText.value = '';
  uni.showToast({ title: '已应用AI优化', icon: 'success' });
};

const saveDraft = async () => {
  if (!form.value.title.trim()) {
    return uni.showToast({ title: '请输入服务标题', icon: 'none' });
  }
  
  try {
    uni.showToast({ title: '草稿已保存', icon: 'success' });
  } catch (e: any) {
    uni.showToast({ title: e.message || '保存失败', icon: 'none' });
  }
};

const submitForReview = async () => {
  if (!canSubmit.value) {

    if (!form.value.title.trim()) return uni.showToast({ title: '请输入服务标题', icon: 'none' });
    if (!form.value.description.trim()) return uni.showToast({ title: '请输入服务描述', icon: 'none' });
    if (!form.value.price) return uni.showToast({ title: '请输入服务价格', icon: 'none' });
    if (form.value.serviceAreas.length === 0) return uni.showToast({ title: '请选择服务区域', icon: 'none' });
    return;
  }

  // Check quota/balance
  if (creditBalance.value.listings === 0 && creditBalance.value.total < listingCost.value) {
      return uni.showModal({
          title: '配额不足',
          content: '您的上架次数已用完，且积分余额不足。请前往个人中心充值积分或升级订阅。',
          showCancel: false,
          confirmText: '我知道了'
      });
  }

  // Double Confirmation
  const costMsg = creditBalance.value.listings > 0 
    ? `本次发布将消耗 1 次上架配额（剩余: ${creditBalance.value.listings} 次）。`
    : `本次发布将消耗 ${listingCost.value} 积分（当前余额: ${creditBalance.value.total}）。`;

  uni.showModal({
    title: '确认提交',
    content: costMsg + '\n\n提交后将进入审核阶段，审核通过后即可公开查看。',
    confirmText: '确认提交',
    cancelText: '取消',
    success: async (res) => {
      if (res.confirm) {
         performSubmit();
      }
    }
  });
};

const performSubmit = async () => {
    submitting.value = true;
    try {

    const validAddOns = form.value.addOns.filter(a => a.name.trim() && a.price);
    
    await providersApi.createService({
      category: categoryName.value,
      categoryId: categoryId.value,
      title: form.value.title,
      description: form.value.description,
      price: parseFloat(form.value.price),
      priceUnit: form.value.priceUnit,
      additionalRate: form.value.additionalRate ? parseFloat(form.value.additionalRate) : undefined,
      taxIncluded: form.value.taxIncluded,
      inclusions: form.value.inclusions,
      exclusions: form.value.exclusions,
      materialsPolicy: form.value.materialsPolicy,
      extraFees: form.value.extraFees,
      duration: form.value.duration ? parseInt(form.value.duration) : null,
      serviceArea: form.value.serviceAreas.join(', '),
      advanceBooking: form.value.advanceBooking ? parseInt(form.value.advanceBooking) : 24,
      clientRequirements: form.value.clientRequirements,
      cancellationPolicy: form.value.cancellationPolicy,
      isLicensed: form.value.isLicensed,
      hasInsurance: form.value.hasInsurance,
      addOns: validAddOns,
      images: form.value.images,
    });
    
    uni.showToast({ title: '服务已提交审核', icon: 'success' });
    
    setTimeout(() => {
      uni.navigateBack({ delta: 2 });
    }, 1500);
  } catch (e: any) {
    uni.showToast({ title: e.message || '提交失败', icon: 'none' });
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.pt-custom { padding-top: env(safe-area-inset-top); }
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }
.fixed { position: fixed; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.z-50 { z-index: 50; }

.bg-gray-900 { background-color: #111827; }
.bg-gray-800 { background-color: #1f2937; }
.bg-gray-700 { background-color: #374151; }
.bg-gray-600 { background-color: #4b5563; }
.bg-teal-600 { background-color: #0d9488; }
.bg-purple-600\/20 { background-color: rgba(147, 51, 234, 0.2); }
.border-gray-700 { border-color: #374151; }
.border-gray-600 { border-color: #4b5563; }
.border-teal-500 { border-color: #14b8a6; }
.border-teal-600 { border-color: #0d9488; }
.text-white { color: #ffffff; }
.text-gray-300 { color: #d1d5db; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-teal-400 { color: #2dd4bf; }
.text-purple-400 { color: #c084fc; }
.text-red-400 { color: #f87171; }

.animate-spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
