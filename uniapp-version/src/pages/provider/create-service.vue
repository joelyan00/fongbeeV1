<template>
  <view class="min-h-screen bg-gray-900 flex flex-col">
    <!-- Header -->
    <view class="bg-gray-800 px-4 py-3 flex flex-row items-center justify-between border-b border-gray-700 pt-custom">
      <view @click="handleBack" class="w-8 h-8 flex items-center justify-center">
        <AppIcon name="chevron-left" :size="24" color="#ffffff"/>
      </view>
      <text class="text-lg font-bold text-white">Create Standard Service</text>
      <view class="w-8"></view>
    </view>

    <!-- Category Badge -->
    <view class="px-4 py-3 bg-gray-800/50 border-b border-gray-700">
      <view class="flex flex-row items-center gap-2">
        <text class="text-gray-400 text-sm">Category:</text>
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
          <text class="text-teal-400 text-xs font-bold uppercase">Basic Information</text>
        </view>

        <!-- Service Title -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">Service Title <text class="text-red-400">*</text></text>
          <input 
            v-model="form.title"
            class="w-full bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
            placeholder="e.g., Professional Home Cleaning Service"
            maxlength="50"
          />
          <text class="text-gray-500 text-xs mt-2 block">{{ form.title.length }}/50</text>
        </view>

        <!-- Service Description -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">Service Description <text class="text-red-400">*</text></text>
          <textarea 
            v-model="form.description"
            class="w-full bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
            placeholder="Describe your service in detail, including what's included"
            :maxlength="500"
            style="height: 120px;"
          />
          <text class="text-gray-500 text-xs mt-2 block">{{ form.description.length }}/500</text>
        </view>

        <!-- ===== PRICING SECTION ===== -->
        <view class="bg-gray-800/50 rounded-lg px-3 py-2">
          <text class="text-teal-400 text-xs font-bold uppercase">Pricing</text>
        </view>

        <!-- Base Price -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">Base Price <text class="text-red-400">*</text></text>
          <view class="flex flex-row items-center gap-2">
            <text class="text-gray-400 text-lg">$</text>
            <input 
              v-model="form.price"
              type="digit"
              class="flex-1 bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
              placeholder="Enter price"
            />
            <text class="text-gray-500 text-sm">CAD</text>
          </view>
        </view>

        <!-- Price Unit -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-3 block">Price Unit <text class="text-red-400">*</text></text>
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

        <!-- Additional Rate (for base fee + overtime model) -->
        <view v-if="form.priceUnit === 'base_plus_hourly'" class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">Additional Hourly Rate</text>
          <view class="flex flex-row items-center gap-2">
            <text class="text-gray-400 text-lg">$</text>
            <input 
              v-model="form.additionalRate"
              type="digit"
              class="flex-1 bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
              placeholder="Rate after first hour"
            />
            <text class="text-gray-500 text-sm">/hr</text>
          </view>
          <text class="text-gray-500 text-xs mt-2 block">Base price covers first hour, this rate applies after</text>
        </view>

        <!-- Tax Setting -->
        <view class="bg-gray-800 rounded-xl p-4">
          <view class="flex flex-row items-center justify-between">
            <view class="flex-1">
              <text class="text-white font-medium block">Price includes HST/GST</text>
              <text class="text-gray-500 text-xs mt-1 block">Toggle on if your price already includes tax</text>
            </view>
            <switch :checked="form.taxIncluded" @change="form.taxIncluded = $event.detail.value" color="#0d9488"/>
          </view>
        </view>

        <!-- ===== SCOPE & INCLUSIONS ===== -->
        <view class="bg-gray-800/50 rounded-lg px-3 py-2">
          <text class="text-teal-400 text-xs font-bold uppercase">Scope & Inclusions</text>
        </view>

        <!-- What's Included -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">What's Included</text>
          <textarea 
            v-model="form.inclusions"
            class="w-full bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
            placeholder="List what's included in your service:&#10;• Dusting all surfaces&#10;• Vacuuming floors&#10;• Bathroom cleaning"
            style="height: 100px;"
          />
        </view>

        <!-- What's NOT Included -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">What's NOT Included</text>
          <textarea 
            v-model="form.exclusions"
            class="w-full bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
            placeholder="List exclusions:&#10;• Materials/parts (charged separately)&#10;• Window exterior cleaning"
            style="height: 80px;"
          />
        </view>

        <!-- Materials -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-3 block">Materials & Supplies</text>
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

        <!-- Extra Fees -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">Additional Fees</text>
          <textarea 
            v-model="form.extraFees"
            class="w-full bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
            placeholder="List any additional fees:&#10;• Parking fees in downtown areas&#10;• Travel fee for locations >20km"
            style="height: 80px;"
          />
        </view>

        <!-- ===== SERVICE DETAILS ===== -->
        <view class="bg-gray-800/50 rounded-lg px-3 py-2">
          <text class="text-teal-400 text-xs font-bold uppercase">Service Details</text>
        </view>

        <!-- Service Duration -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">Estimated Duration</text>
          <view class="flex flex-row items-center gap-2">
            <input 
              v-model="form.duration"
              type="number"
              class="flex-1 bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
              placeholder="e.g., 2"
            />
            <view class="bg-gray-700 px-4 py-3 rounded-lg">
              <text class="text-gray-400 text-sm">hours</text>
            </view>
          </view>
        </view>

        <!-- Service Area -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">Service Area</text>
          <input 
            v-model="form.serviceArea"
            class="w-full bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
            placeholder="e.g., Greater Toronto Area, North York, Markham"
          />
          <text class="text-gray-500 text-xs mt-2 block">Enter cities, regions, or postal code prefixes (e.g., M4K, L6P)</text>
        </view>

        <!-- Advance Booking -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">Advance Booking Required</text>
          <view class="flex flex-row items-center gap-2">
            <input 
              v-model="form.advanceBooking"
              type="number"
              class="flex-1 bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
              placeholder="e.g., 24"
            />
            <view class="bg-gray-700 px-4 py-3 rounded-lg">
              <text class="text-gray-400 text-sm">hours</text>
            </view>
          </view>
          <text class="text-gray-500 text-xs mt-2 block">How much notice do you need before a booking?</text>
        </view>

        <!-- Client Requirements -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">Client Requirements</text>
          <textarea 
            v-model="form.clientRequirements"
            class="w-full bg-gray-700 text-white rounded-lg px-3 py-3 text-sm"
            placeholder="What must the client provide?&#10;• Access to water and electricity&#10;• Someone must be present&#10;• Clear workspace area"
            style="height: 80px;"
          />
        </view>

        <!-- ===== POLICIES ===== -->
        <view class="bg-gray-800/50 rounded-lg px-3 py-2">
          <text class="text-teal-400 text-xs font-bold uppercase">Policies</text>
        </view>

        <!-- Cancellation Policy -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-3 block">Cancellation Policy</text>
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

        <!-- Insurance/License -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-3 block">Credentials</text>
          <view class="flex flex-col gap-3">
            <view class="flex flex-row items-center justify-between">
              <text class="text-gray-300 text-sm">Licensed Professional</text>
              <switch :checked="form.isLicensed" @change="form.isLicensed = $event.detail.value" color="#0d9488"/>
            </view>
            <view class="flex flex-row items-center justify-between">
              <text class="text-gray-300 text-sm">Liability Insurance</text>
              <switch :checked="form.hasInsurance" @change="form.hasInsurance = $event.detail.value" color="#0d9488"/>
            </view>
          </view>
          <text class="text-gray-500 text-xs mt-3 block">Clients value licensed and insured service providers</text>
        </view>

        <!-- ===== ADD-ONS ===== -->
        <view class="bg-gray-800/50 rounded-lg px-3 py-2">
          <text class="text-teal-400 text-xs font-bold uppercase">Add-On Services (Optional)</text>
        </view>

        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">Available Add-Ons</text>
          <text class="text-gray-500 text-xs mb-3 block">Offer additional services to increase your earnings</text>
          
          <view class="flex flex-col gap-2">
            <view 
              v-for="(addon, idx) in form.addOns"
              :key="idx"
              class="flex flex-row items-center gap-2 bg-gray-700 rounded-lg p-3"
            >
              <input 
                v-model="addon.name"
                class="flex-1 bg-gray-600 text-white rounded px-2 py-2 text-sm"
                placeholder="Add-on name"
              />
              <text class="text-gray-400">$</text>
              <input 
                v-model="addon.price"
                type="digit"
                class="w-20 bg-gray-600 text-white rounded px-2 py-2 text-sm"
                placeholder="Price"
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
            <text class="text-teal-400 text-sm">Add New Add-On</text>
          </view>
        </view>

        <!-- ===== MEDIA ===== -->
        <view class="bg-gray-800/50 rounded-lg px-3 py-2">
          <text class="text-teal-400 text-xs font-bold uppercase">Media</text>
        </view>

        <!-- Service Images -->
        <view class="bg-gray-800 rounded-xl p-4">
          <text class="text-white font-medium mb-2 block">Service Images</text>
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
          <text class="text-gray-500 text-xs mt-2 block">Upload up to 5 images showcasing your work</text>
        </view>

        <!-- Spacer for footer -->
        <view class="h-4"></view>
      </view>
    </scroll-view>

    <!-- Footer -->
    <view class="bg-gray-800 border-t border-gray-700 px-4 py-4 pb-safe flex flex-row gap-3">
      <view 
        @click="saveDraft"
        class="flex-1 h-12 rounded-xl border border-gray-600 flex items-center justify-center"
      >
        <text class="text-gray-300 font-medium">Save Draft</text>
      </view>
      <view 
        @click="submitForReview"
        :class="['flex-1 h-12 rounded-xl flex items-center justify-center',
          canSubmit ? 'bg-teal-600 active:bg-teal-700' : 'bg-gray-600']"
      >
        <text class="text-white font-bold">{{ submitting ? 'Submitting...' : 'Submit for Review' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import AppIcon from '@/components/Icons.vue';
import { providersApi } from '@/services/api';

const categoryName = ref('');
const categoryId = ref('');
const submitting = ref(false);

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
  serviceArea: '',
  advanceBooking: '24',
  clientRequirements: '',
  cancellationPolicy: 'flexible',
  isLicensed: false,
  hasInsurance: false,
  addOns: [] as { name: string; price: string }[],
  images: [] as string[],
});

const priceUnits = [
  { value: 'per_service', label: 'Per Service' },
  { value: 'per_hour', label: 'Per Hour' },
  { value: 'per_sqft', label: 'Per Sq.Ft.' },
  { value: 'per_unit', label: 'Per Unit' },
  { value: 'per_room', label: 'Per Room' },
  { value: 'base_plus_hourly', label: 'Base + Hourly' },
];

const materialsOptions = [
  { value: 'included', label: 'All materials/supplies included in price' },
  { value: 'client_provides', label: 'Client provides materials' },
  { value: 'charged_separately', label: 'Materials charged separately' },
];

const cancellationPolicies = [
  { value: 'flexible', label: 'Flexible', description: 'Full refund up to 24 hours before service' },
  { value: 'moderate', label: 'Moderate', description: 'Full refund up to 48 hours before service' },
  { value: 'strict', label: 'Strict', description: 'Full refund up to 7 days before service' },
  { value: 'non_refundable', label: 'Non-Refundable', description: 'No refunds after booking' },
];

const canSubmit = computed(() => {
  return form.value.title.trim() && 
         form.value.description.trim() && 
         form.value.price && 
         !submitting.value;
});

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as any;
  const options = currentPage.$page?.options || currentPage.options || {};
  
  categoryName.value = decodeURIComponent(options.category || '');
  categoryId.value = options.categoryId || '';
});

const handleBack = () => {
  uni.navigateBack();
};

const addAddOn = () => {
  form.value.addOns.push({ name: '', price: '' });
};

const removeAddOn = (idx: number) => {
  form.value.addOns.splice(idx, 1);
};

const uploadImage = () => {
  if (form.value.images.length >= 5) {
    return uni.showToast({ title: 'Maximum 5 images allowed', icon: 'none' });
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

const saveDraft = async () => {
  if (!form.value.title.trim()) {
    return uni.showToast({ title: 'Please enter a service title', icon: 'none' });
  }
  
  try {
    uni.showToast({ title: 'Draft saved', icon: 'success' });
  } catch (e: any) {
    uni.showToast({ title: e.message || 'Save failed', icon: 'none' });
  }
};

const submitForReview = async () => {
  if (!canSubmit.value) {
    return uni.showToast({ title: 'Please fill in required fields', icon: 'none' });
  }
  
  submitting.value = true;
  try {
    // Filter out empty add-ons
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
      serviceArea: form.value.serviceArea,
      advanceBooking: form.value.advanceBooking ? parseInt(form.value.advanceBooking) : 24,
      clientRequirements: form.value.clientRequirements,
      cancellationPolicy: form.value.cancellationPolicy,
      isLicensed: form.value.isLicensed,
      hasInsurance: form.value.hasInsurance,
      addOns: validAddOns,
      images: form.value.images,
    });
    
    uni.showToast({ title: 'Service submitted for review', icon: 'success' });
    
    setTimeout(() => {
      uni.navigateBack({ delta: 2 });
    }, 1500);
  } catch (e: any) {
    uni.showToast({ title: e.message || 'Submission failed', icon: 'none' });
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.min-h-screen { min-height: 100vh; }
.pt-custom { padding-top: env(safe-area-inset-top); }
.pb-safe { padding-bottom: env(safe-area-inset-bottom); }

.bg-gray-900 { background-color: #111827; }
.bg-gray-800 { background-color: #1f2937; }
.bg-gray-700 { background-color: #374151; }
.bg-gray-600 { background-color: #4b5563; }
.bg-teal-600 { background-color: #0d9488; }
.border-gray-700 { border-color: #374151; }
.border-gray-600 { border-color: #4b5563; }
.border-teal-500 { border-color: #14b8a6; }
.border-teal-600 { border-color: #0d9488; }
.text-white { color: #ffffff; }
.text-gray-300 { color: #d1d5db; }
.text-gray-400 { color: #9ca3af; }
.text-gray-500 { color: #6b7280; }
.text-teal-400 { color: #2dd4bf; }
.text-red-400 { color: #f87171; }
</style>
