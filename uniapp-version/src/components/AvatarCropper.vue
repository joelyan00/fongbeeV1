<template>
  <view v-if="show" class="cropper-wrapper" @touchmove.stop.prevent="">
    <view class="cropper-header">
      <view class="btn cancel" @click="emit('cancel')">取消</view>
      <text class="title">裁剪头像</text>
      <view class="btn confirm" @click="handleConfirm">确定</view>
    </view>

    <view class="cropper-content">
      <movable-area class="movable-area" :style="{ width: areaWidth + 'px', height: areaHeight + 'px' }">
        <movable-view
          class="movable-view"
          direction="all"
          :style="{ width: imgWidth + 'px', height: imgHeight + 'px' }"
          :x="x"
          :y="y"
          :scale="true"
          :scale-min="0.5"
          :scale-max="4"
          :scale-value="scale"
          @change="onChange"
          @scale="onScale"
        >
          <image :src="imageSrc" class="source-img" mode="widthFix" @load="onImageLoad"></image>
        </movable-view>
      </movable-area>

      <!-- Overlay Mask with Circle Hole -->
      <view class="cropper-mask" :pointer-events="'none'">
        <view class="mask-top"></view>
        <view class="mask-middle">
          <view class="mask-side"></view>
          <view class="crop-circle-outline" :style="{ width: cropSize + 'px', height: cropSize + 'px' }"></view>
          <view class="mask-side"></view>
        </view>
        <view class="mask-bottom"></view>
      </view>
    </view>

    <!-- Hidden Canvas for cropping -->
    <canvas 
      canvas-id="cropCanvas" 
      class="crop-canvas" 
      :style="{ width: cropSize + 'px', height: cropSize + 'px', position: 'absolute', left: '-9999px', top: '-9999px' }"
    ></canvas>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue';

const props = defineProps<{
  show: boolean;
  imageSrc: string;
}>();

const emit = defineEmits(['cancel', 'confirm']);
const { proxy } = getCurrentInstance() as any;

const areaWidth = ref(0);
const areaHeight = ref(0);
const imgWidth = ref(0);
const imgHeight = ref(0);
const cropSize = ref(280); // Selection size

const x = ref(0);
const y = ref(0);
const scale = ref(1);

const currentX = ref(0);
const currentY = ref(0);
const currentScale = ref(1);

const onImageLoad = (e: any) => {
  const { width, height } = e.detail;
  const ratio = width / height;
  
  // Initial scaling to ensure image covers the crop area
  if (ratio > 1) {
    imgHeight.value = cropSize.value;
    imgWidth.value = imgHeight.value * ratio;
  } else {
    imgWidth.value = cropSize.value;
    imgHeight.value = imgWidth.value / ratio;
  }
  
  // Center image initially
  x.value = (areaWidth.value - imgWidth.value) / 2;
  y.value = (areaHeight.value - imgHeight.value) / 2;
  currentX.value = x.value;
  currentY.value = y.value;
  currentScale.value = 1;
};

const onChange = (e: any) => {
  currentX.value = e.detail.x;
  currentY.value = e.detail.y;
};

const onScale = (e: any) => {
  currentScale.value = e.detail.scale;
  currentX.value = e.detail.x;
  currentY.value = e.detail.y;
};

const handleConfirm = () => {
  uni.showLoading({ title: '处理中...', mask: true });
  
  const ctx = uni.createCanvasContext('cropCanvas', proxy);
  
  const circleLeft = (areaWidth.value - cropSize.value) / 2;
  const circleTop = (areaHeight.value - cropSize.value) / 2;
  
  // The distance from the top-left of the image to the top-left of the crop area
  // Image is scaled by currentScale
  const dx = currentX.value - circleLeft;
  const dy = currentY.value - circleTop;
  const dw = imgWidth.value * currentScale.value;
  const dh = imgHeight.value * currentScale.value;

  ctx.clearRect(0, 0, cropSize.value, cropSize.value);
  ctx.drawImage(props.imageSrc, dx, dy, dw, dh);
  
  ctx.draw(false, () => {
    setTimeout(() => {
      uni.canvasToTempFilePath({
        canvasId: 'cropCanvas',
        destWidth: 400, // Fixed high quality output
        destHeight: 400,
        fileType: 'png',
        quality: 1,
        success: (res) => {
          uni.hideLoading();
          emit('confirm', res.tempFilePath);
        },
        fail: (err) => {
          uni.hideLoading();
          console.error('Canvas to result failed:', err);
          uni.showToast({ title: '裁剪失败', icon: 'none' });
        }
      }, proxy);
    }, 100); // Small delay to ensure draw is complete
  });
};

onMounted(() => {
  const sys = uni.getSystemInfoSync();
  areaWidth.value = sys.windowWidth;
  areaHeight.value = sys.windowHeight - 80;
});
</script>

<style scoped>
.cropper-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 2000;
  background-color: #000;
  display: flex;
  flex-direction: column;
}

.cropper-header {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  padding-top: env(safe-area-inset-top);
  background-color: #111;
  color: #fff;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.btn {
  padding: 8px 16px;
  font-size: 16px;
}

.confirm {
  color: #10b981;
  font-weight: bold;
}

.cropper-content {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.movable-area {
  background-color: #000;
}

.source-img {
  width: 100%;
}

.cropper-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  display: flex;
  flex-direction: column;
  pointer-events: none;
}

.mask-top, .mask-bottom {
  flex: 1;
  background-color: rgba(0, 0, 0, 0.6);
}

.mask-middle {
  display: flex;
  flex-direction: row;
}

.mask-side {
  flex: 1;
  background-color: rgba(0, 0, 0, 0.6);
}

.crop-circle-outline {
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 1000px rgba(0, 0, 0, 0.6);
  pointer-events: none;
  background: transparent;
}
</style>
