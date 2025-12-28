<template>
  <view class="px-4 pb-4 mt-2 md-px-8">
    <!-- Section Header -->
    <view class="flex items-center justify-between mb-2">
      <view class="flex items-center gap-2">
          <view class="w-1 h-5 bg-emerald-600 rounded-full"></view>
          <text class="text-xl font-bold text-gray-900">热门定制服务</text>
          <text v-if="isVancouver()" class="text-xs bg-emerald-100 text-emerald-700 px-1-5 py-0-5 rounded">温哥华</text>
      </view>
      
      <!-- View All Button triggers Navigation -->
      <view 
          class="flex items-center gap-1 active-opacity-60 cursor-pointer md-hidden"
          @click="emit('viewAll')"
      >
        <text class="text-lg text-gray-500">查看全部</text>
        <text class="text-lg leading-none text-gray-500">›</text>
      </view>
    </view>

    <!-- List Grid: Single col on mobile, 2 cols on md -->
    <view class="flex flex-col gap-3 md-grid md-grid-cols-2">
      <view v-for="item in displayedListings" :key="item.id">
        
        <!-- Custom Request Card (6th Item) -->
        <view 
            v-if="item.isCustomRequest"
            class="bg-emerald-50 rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-custom border border-emerald-100 gap-3 min-h-140"
        >
            <text class="text-xl font-bold text-emerald-800 leading-relaxed px-4">
                {{ item.title }}
            </text>
            <button class="bg-emerald-600 text-white rounded-full px-6 py-2-5 flex flex-row items-center gap-2 text-lg font-bold shadow-sm active-scale-95 transition-transform hover-bg-emerald-700">
                <text style="font-size: 16px;">➕</text>
                <text>发布定制服务</text>
            </button>
        </view>

        <!-- Standard Listing Card -->
        <view 
            v-else
            class="bg-white rounded-xl p-3 flex gap-3 shadow-custom border border-gray-100 active-bg-gray-50 transition-colors cursor-pointer hover-shadow-md"
        >
            <!-- Image -->
            <view class="w-28 h-28 shrink-0 rounded-lg overflow-hidden bg-gray-100 relative">
               <image :src="item.image" mode="aspectFill" class="w-full h-full transition-transform duration-500 hover-scale-105" />
               <view class="absolute top-0 left-0 bg-black-5 inset-0"></view>
            </view>
            
            <!-- Details -->
            <view class="flex-1 flex flex-col justify-between py-0_5 min-w-0">
               <view>
                   <text class="font-bold text-gray-900 text-lg line-clamp-2 leading-snug mb-1 block">{{ item.title }}</text>
                   <text v-if="item.specs" class="text-sm text-gray-500 mb-1-5 block">{{ item.specs }}</text>
                   <view class="flex flex-row flex-wrap gap-1 mb-1">
                      <text v-for="(tag, idx) in item.tags" :key="idx" class="text-xs text-gray-600 bg-gray-50 px-1_5 py-0_5 rounded border border-gray-200">
                        {{ tag }}
                      </text>
                   </view>
               </view>
               
               <view class="flex flex-row items-end justify-between mt-1">
                   <view class="flex flex-row items-center gap-1 text-gray-400 max-w-[60%]">
                       <text class="shrink-0" style="font-size: 12px;">📍</text>
                      <text class="text-xs truncate block">{{ item.location }}</text>
                   </view>
                   <text class="text-emerald-600 font-bold text-xl shrink-0">{{ item.price }}</text>
               </view>
            </view>
        </view>
      
      </view>
    </view>

    <!-- Toggle Button at the bottom triggers Navigation -->
    <view class="mt-3 flex justify-center">
       <button 
          @click="emit('viewAll')"
          class="text-lg text-gray-500 flex flex-row items-center gap-1 bg-white px-6 py-2 rounded-full shadow-sm border border-gray-100 active-scale-95 hover-bg-gray-50"
      >
          <text>查看全部</text>
           <text style="font-size: 16px;">›</text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface ListingItem {
  id: string;
  title: string;
  price: string;
  image: string;
  tags: string[];
  location: string;
  specs?: string;
  isCustomRequest?: boolean; 
}

const props = defineProps({
  category: {
    type: String,
    required: true
  },
  currentLocation: {
    type: String,
    default: '多伦多'
  }
});

const emit = defineEmits(['viewAll']);

const isVancouver = () => {
  const vanAreas = ['温哥华', 'Vancouver', 'Richmond', '列治文', 'Burnaby', '本拿比', 'Surrey', '素里', 'Coquitlam', '高贵林', 'West Van', '西温'];
  return vanAreas.some(area => props.currentLocation.includes(area));
};

const getListings = (cat: string): ListingItem[] => {
  const isVan = isVancouver();
  let data: ListingItem[] = [];

    // 房产交易服务 (Real Estate)
    if (cat.includes('房产') || cat.includes('房屋')) {
      if (isVan) {
        data = [
          {
            id: 'v-h1',
            title: 'Richmond 核心区 独立屋 近天车站',
            price: '$2,180,000',
            image: 'https://images.unsplash.com/photo-1600596542815-e32cb718d204?auto=format&fit=crop&w=300&q=80',
            tags: ['学区房', '生活便利', '平地'],
            location: 'No.3 Road, Richmond',
            specs: '5 Bed • 4 Bath • 3200 sqft'
          },
          {
            id: 'v-h2',
            title: 'Burnaby Metrotown 高层海景公寓',
            price: '$920,000',
            image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=300&q=80',
            tags: ['天车站', '购物中心', '无敌景色'],
            location: 'Metrotown, Burnaby',
            specs: '2 Bed • 2 Bath • 850 sqft'
          },
          {
            id: 'v-h3',
            title: 'West Van 西温 豪宅 坐北朝南',
            price: '$4,500,000',
            image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=300&q=80',
            tags: ['私家泳池', '全海景', '隐私好'],
            location: 'British Properties',
            specs: '5 Bed • 6 Bath • 5000 sqft'
          },
          {
             id: 'v-h4',
             title: 'Vancouver West 温西学区房',
             price: '$3,680,000',
             image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=300&q=80',
             tags: ['UBC商圈', '名校网', '全新翻建'],
             location: 'Dunbar, Vancouver',
             specs: '4 Bed • 5 Bath'
          },
          {
             id: 'v-h5',
             title: 'Downtown Yaletown 顶层复式',
             price: '$1,280,000',
             image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=300&q=80',
             tags: ['高端社区', '海景'],
             location: 'Yaletown',
             specs: '2 Bed • 2 Bath'
          },
          {
             id: 'v-h6',
             title: 'Surrey Central 投资盘',
             price: '$550,000',
             image: 'https://images.unsplash.com/photo-1484154218962-a1c002085d2f?auto=format&fit=crop&w=300&q=80',
             tags: ['高租售比', '近大学'],
             location: 'Surrey Central',
             specs: '1 Bed • 1 Bath'
          }
        ];
      } else {
        // Default Toronto Data
        data = [
          {
            id: 'h1',
            title: 'Markham 独立屋 4卧3卫 双车库 精装修',
            price: '$1,450,000',
            image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=300&q=80',
            tags: ['学区房', '近超市', '精装修'],
            location: 'Unionville, Markham',
            specs: '4 Bed • 3 Bath • 2500 sqft'
          },
          {
            id: 'h2',
            title: 'North York 豪华公寓 2+1 户型 地铁直达',
            price: '$880,000',
            image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=300&q=80',
            tags: ['地铁沿线', '包车位', '高层视野'],
            location: 'Yonge & Sheppard',
            specs: '2 Bed • 2 Bath • 900 sqft'
          },
          {
            id: 'h3',
            title: 'Richmond Hill 联排别墅 无管理费',
            price: '$1,120,000',
            image: 'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=300&q=80',
            tags: ['公园旁', '新装修', '采光好'],
            location: 'Jefferson, RH',
            specs: '3 Bed • 4 Bath • 1800 sqft'
          },
          {
             id: 'h4',
             title: 'Scarborough 投资好房 占地大',
             price: '$980,000',
             image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=300&q=80',
             tags: ['翻建潜力', '分门出入'],
             location: 'Agincourt, Scarborough',
             specs: '3+2 Bed • 2 Bath'
          },
          {
             id: 'h5',
             title: 'Downtown Toronto湖景公寓',
             price: '$750,000',
             image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=300&q=80',
             tags: ['CN Tower景', '步行上班'],
             location: 'CityPlace',
             specs: '1+1 Bed • 1 Bath'
          },
          {
             id: 'h6',
             title: 'Oakville 湖滨豪宅',
             price: '$3,200,000',
             image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=300&q=80',
             tags: ['私家码头', '顶级校区'],
             location: 'Eastlake, Oakville',
             specs: '4 Bed • 5 Bath'
          }
        ];
      }
    } else if (cat.includes('汽车') || cat.includes('车')) {
      // 二手汽车交易 (Used Cars)
      if (isVan) {
        data = [
           {
            id: 'v-c1',
            title: '2023 Tesla Model Y Long Range',
            price: '$58,000',
            image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=300&q=80',
            tags: ['本地车', '主要代步', '几乎全新'],
            location: 'Richmond',
            specs: '8,000 km • AWD'
          },
          {
            id: 'v-c2',
            title: '2018 Mercedes-Benz GLE 400',
            price: '$42,500',
            image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=300&q=80',
            tags: ['家庭用车', '保养记录全'],
            location: 'Burnaby',
            specs: '75,000 km • AWD'
          },
          {
            id: 'v-c3',
            title: '2022 Toyota Tacoma TRD Off-Road',
            price: '$49,900',
            image: 'https://images.unsplash.com/photo-1513366853604-5f4921df0994?auto=format&fit=crop&w=300&q=80',
            tags: ['越野配置', '雪胎', '无事故'],
            location: 'Coquitlam',
            specs: '32,000 km • 4x4'
          },
          {
             id: 'v-c4',
             title: '2021 BMW X3 xDrive30i',
             price: '$46,000',
             image: 'https://images.unsplash.com/photo-1556189250-72ba954522cd?auto=format&fit=crop&w=300&q=80',
             tags: ['女士一手', '低公里'],
             location: 'Vancouver West',
             specs: '28,000 km'
          },
          {
             id: 'v-c5',
             title: '2019 Honda CR-V Touring',
             price: '$31,000',
             image: 'https://images.unsplash.com/photo-1621007947382-bb3c3968e3eb?auto=format&fit=crop&w=300&q=80',
             tags: ['省油', '空间大'],
             location: 'Surrey',
             specs: '55,000 km'
          }
        ];
      } else {
        // Default Toronto Data
        data = [
          {
            id: 'c1',
            title: '2021 Toyota RAV4 XLE AWD 白色',
            price: '$28,500',
            image: 'https://images.unsplash.com/photo-1621007947382-bb3c3968e3eb?auto=format&fit=crop&w=300&q=80',
            tags: ['无事故', '一手车主', '低公里数'],
            location: 'Scarborough',
            specs: '35,000 km • Automatic'
          },
          {
            id: 'c2',
            title: '2019 Honda Civic Sport 运动版',
            price: '$19,800',
            image: 'https://images.unsplash.com/photo-1590362835206-34a362c3d330?auto=format&fit=crop&w=300&q=80',
            tags: ['代步首选', '省油', '定期保养'],
            location: 'Markham',
            specs: '62,000 km • CVT'
          },
          {
            id: 'c3',
            title: '2022 Tesla Model 3 Long Range',
            price: '$45,000',
            image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=300&q=80',
            tags: ['电动车', '政府补贴', '自动驾驶'],
            location: 'Vaughan',
            specs: '15,000 km • AWD'
          },
          {
             id: 'c4',
             title: '2020 BMW X5 xDrive40i',
             price: '$58,000',
             image: 'https://images.unsplash.com/photo-1556189250-72ba954522cd?auto=format&fit=crop&w=300&q=80',
             tags: ['豪华SUV', '全景天窗', 'M运动包'],
             location: 'North York',
             specs: '48,000 km • AWD'
          },
          {
             id: 'c5',
             title: '2016 Lexus RX350 F-Sport',
             price: '$33,500',
             image: 'https://images.unsplash.com/photo-1581578731117-104f8a338e2d?auto=format&fit=crop&w=300&q=80',
             tags: ['耐用', '保值', '舒适'],
             location: 'Etobicoke',
             specs: '98,000 km'
          }
        ];
      }
    } else {
      // Generic
      data = [
        {
          id: 'g1',
          title: `${cat} - ${isVan ? '大温' : 'GTA'} 优选专业团队`,
          price: '免费估价',
          image: 'https://images.unsplash.com/photo-1581578731117-104f8a338e2d?auto=format&fit=crop&w=300&q=80',
          tags: ['持牌技师', '正规发票', '售后质保'],
          location: isVan ? 'Vancouver / Richmond' : 'GTA 全区服务',
          specs: '好评率 99% • 快速上门'
        },
        {
          id: 'g2',
          title: `${cat} - 资深专家服务`,
          price: '价格透明',
          image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=300&q=80',
          tags: ['20年经验', '本地口碑'],
          location: isVan ? 'Burnaby / Coquitlam' : 'Downtown / Midtown',
          specs: '即时预约 • 无隐形消费'
        },
        {
          id: 'g3',
          title: `${cat} - 社区推荐商家`,
          price: '优惠促销中',
          image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=300&q=80',
          tags: ['邻里推荐', '准时守信'],
          location: isVan ? 'Surrey / White Rock' : 'Markham / Richmond Hill',
          specs: '周末不加价'
        },
        {
          id: 'g4',
          title: `${cat} - 金牌服务商`,
          price: '满意付费',
          image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=300&q=80',
          tags: ['专业认证', '高效'],
          location: '全城覆盖',
          specs: '24小时待命'
        },
        {
          id: 'g5',
          title: `${cat} - 经济实惠之选`,
          price: '性价比高',
          image: 'https://images.unsplash.com/photo-1513366853604-5f4921df0994?auto=format&fit=crop&w=300&q=80',
          tags: ['学生优惠', '快速响应'],
          location: '周边地区',
          specs: '简单快捷'
        },
        {
            id: 'g6',
            title: `${cat} - 优质服务商`,
            price: '服务周到',
            image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=300&q=80',
            tags: ['好评如潮'],
            location: '多伦多',
            specs: '专业可靠'
        }
      ];
    }
  return data;
};

const displayedListings = computed(() => {
  const allListings = getListings(props.category);
  const customRequestItem: ListingItem = {
    id: 'custom-req',
    title: '如果你没有找到合适的服务，让优服佳为你量身定做',
    price: '定制服务',
    image: '',
    tags: [],
    location: '',
    isCustomRequest: true
  };
  return [...allListings.slice(0, 5), customRequestItem];
});
</script>

<style scoped>
/* Common Utility Replacements */
.flex { display: flex; }
.flex-row { flex-direction: row; }
.flex-col { flex-direction: column; }
.flex-wrap { flex-wrap: wrap; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }

.block { display: block; }
.w-full { width: 100%; }
.h-full { height: 100%; }

.text-gray-900 { color: #111827; }
.text-gray-500 { color: #6b7280; }
.text-gray-600 { color: #4b5563; }
.text-gray-400 { color: #9ca3af; }
.text-emerald-800 { color: #065f46; }
.text-emerald-700 { color: #047857; }
.text-emerald-600 { color: #059669; }
.text-white { color: #ffffff; }

.bg-white { background-color: #ffffff; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-gray-50 { background-color: #f9fafb; }
.bg-emerald-600 { background-color: #059669; }
.bg-emerald-100 { background-color: #d1fae5; }
.bg-emerald-50 { background-color: #ecfdf5; }

.text-xl { font-size: 20px; }
.text-lg { font-size: 18px; }
.text-base { font-size: 16px; }
.text-sm { font-size: 14px; }
.text-xs { font-size: 12px; }
.font-bold { font-weight: 700; }

.p-3 { padding: 12px; }
.p-5 { padding: 20px; }
.px-4 { padding-left: 16px; padding-right: 16px; }
.py-0-5 { padding-top: 2px; padding-bottom: 2px; }
.py-2 { padding-top: 8px; padding-bottom: 8px; }
.py-2-5 { padding-top: 10px; padding-bottom: 10px; }
.px-1-5 { padding-left: 6px; padding-right: 6px; }
.px-6 { padding-left: 24px; padding-right: 24px; }
.mb-1 { margin-bottom: 4px; }
.mb-1-5 { margin-bottom: 6px; }
.mb-2 { margin-bottom: 8px; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.gap-1 { gap: 4px; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }

.rounded-xl { border-radius: 12px; }
.rounded-lg { border-radius: 8px; }
.rounded-full { border-radius: 9999px; }
.rounded { border-radius: 4px; }

.border { border-width: 1px; }
.border-gray-100 { border-color: #f3f4f6; }
.border-gray-200 { border-color: #e5e7eb; }
.border-emerald-100 { border-color: #d1fae5; }

.shadow-custom { box-shadow: 0 2px 8px rgba(0,0,0,0.02); }
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }

.relative { position: relative; }
.absolute { position: absolute; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.bg-black-5 { background-color: rgba(0,0,0,0.05); }

.object-cover { object-fit: cover; }
.shrink-0 { flex-shrink: 0; }
.flex-1 { flex: 1; }
.min-w-0 { min-width: 0; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.line-clamp-2 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
}

.w-28 { width: 112px; }
.h-28 { height: 112px; }
.w-1 { width: 4px; }
.h-5 { height: 20px; }
.min-h-140 { min-height: 140px; }
</style>
