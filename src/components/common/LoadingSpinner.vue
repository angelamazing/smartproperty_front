<template>
  <view class="loading-spinner" :class="spinnerClass">
    <view class="spinner-container">
      <!-- 旋转动画 -->
      <view class="spinner-ring" v-if="type === 'ring'">
        <view class="ring"></view>
      </view>
      
      <!-- 脉冲动画 -->
      <view class="spinner-pulse" v-else-if="type === 'pulse'">
        <view class="pulse-dot" v-for="i in 3" :key="i"></view>
      </view>
      
      <!-- 波浪动画 -->
      <view class="spinner-wave" v-else-if="type === 'wave'">
        <view class="wave-bar" v-for="i in 5" :key="i"></view>
      </view>
      
      <!-- 默认旋转 -->
      <view class="spinner-default" v-else>
        <view class="default-circle"></view>
      </view>
    </view>
    
    <!-- 加载文本 -->
    <text v-if="text" class="loading-text" :class="textClass">{{ text }}</text>
  </view>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'LoadingSpinner',
  props: {
    // 加载器类型: ring, pulse, wave, default
    type: {
      type: String,
      default: 'default',
      validator: (value) => ['ring', 'pulse', 'wave', 'default'].includes(value)
    },
    // 尺寸: small, medium, large
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    // 颜色主题: primary, secondary, success, warning, danger
    color: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'success', 'warning', 'danger'].includes(value)
    },
    // 加载文本
    text: {
      type: String,
      default: ''
    },
    // 是否居中显示
    center: {
      type: Boolean,
      default: true
    },
    // 是否覆盖整个容器
    overlay: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    // 计算样式类
    const spinnerClass = computed(() => {
      const classes = []
      
      if (props.center) classes.push('center')
      if (props.overlay) classes.push('overlay')
      classes.push(`size-${props.size}`)
      classes.push(`color-${props.color}`)
      
      return classes.join(' ')
    })
    
    const textClass = computed(() => {
      return `text-${props.size}`
    })
    
    return {
      spinnerClass,
      textClass
    }
  }
}
</script>

<style lang="scss" scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  &.center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  
  &.overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    z-index: 9999;
  }
}

.spinner-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 尺寸样式 */
.size-small {
  .spinner-container {
    width: 40rpx;
    height: 40rpx;
  }
  
  .loading-text {
    font-size: 24rpx;
  }
}

.size-medium {
  .spinner-container {
    width: 60rpx;
    height: 60rpx;
  }
  
  .loading-text {
    font-size: 28rpx;
  }
}

.size-large {
  .spinner-container {
    width: 80rpx;
    height: 80rpx;
  }
  
  .loading-text {
    font-size: 32rpx;
  }
}

/* 颜色主题 */
.color-primary {
  --spinner-color: #667eea;
}

.color-secondary {
  --spinner-color: #6c757d;
}

.color-success {
  --spinner-color: #28a745;
}

.color-warning {
  --spinner-color: #ffc107;
}

.color-danger {
  --spinner-color: #dc3545;
}

/* 默认旋转动画 */
.spinner-default {
  width: 100%;
  height: 100%;
  position: relative;
}

.default-circle {
  width: 100%;
  height: 100%;
  border: 3rpx solid #f3f3f3;
  border-top: 3rpx solid var(--spinner-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 环形动画 */
.spinner-ring {
  width: 100%;
  height: 100%;
  position: relative;
}

.ring {
  width: 100%;
  height: 100%;
  border: 3rpx solid transparent;
  border-top: 3rpx solid var(--spinner-color);
  border-right: 3rpx solid var(--spinner-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 脉冲动画 */
.spinner-pulse {
  display: flex;
  gap: 8rpx;
  align-items: center;
  justify-content: center;
}

.pulse-dot {
  width: 12rpx;
  height: 12rpx;
  background: var(--spinner-color);
  border-radius: 50%;
  animation: pulse 1.4s ease-in-out infinite both;
  
  &:nth-child(1) {
    animation-delay: -0.32s;
  }
  
  &:nth-child(2) {
    animation-delay: -0.16s;
  }
  
  &:nth-child(3) {
    animation-delay: 0s;
  }
}

/* 波浪动画 */
.spinner-wave {
  display: flex;
  gap: 4rpx;
  align-items: center;
  justify-content: center;
}

.wave-bar {
  width: 6rpx;
  height: 100%;
  background: var(--spinner-color);
  border-radius: 3rpx;
  animation: wave 1.2s ease-in-out infinite;
  
  &:nth-child(1) {
    animation-delay: -1.1s;
  }
  
  &:nth-child(2) {
    animation-delay: -1.0s;
  }
  
  &:nth-child(3) {
    animation-delay: -0.9s;
  }
  
  &:nth-child(4) {
    animation-delay: -0.8s;
  }
  
  &:nth-child(5) {
    animation-delay: -0.7s;
  }
}

/* 加载文本 */
.loading-text {
  margin-top: 20rpx;
  color: #666;
  font-weight: 500;
  text-align: center;
}

.text-small {
  font-size: 24rpx;
}

.text-medium {
  font-size: 28rpx;
}

.text-large {
  font-size: 32rpx;
}

/* 动画定义 */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes wave {
  0%, 40%, 100% {
    transform: scaleY(0.4);
    opacity: 0.5;
  }
  20% {
    transform: scaleY(1);
    opacity: 1;
  }
}

/* 响应式设计 */
@media screen and (max-width: 600rpx) {
  .size-large {
    .spinner-container {
      width: 60rpx;
      height: 60rpx;
    }
  }
  
  .size-medium {
    .spinner-container {
      width: 50rpx;
      height: 50rpx;
    }
  }
}
</style>
