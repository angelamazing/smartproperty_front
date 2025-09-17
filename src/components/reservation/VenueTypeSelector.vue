<template>
  <view class="venue-type-selector">
    <text class="section-title">场地类型</text>
    <scroll-view 
      class="venue-type-scroll" 
      scroll-x="true" 
      :show-scrollbar="false"
      :scroll-left="scrollLeft"
    >
      <view class="venue-type-container">
        <view 
          class="type-card" 
          :class="{ 
            active: selectedType === type.value,
            loading: isLoading
          }"
          v-for="type in venueTypes" 
          :key="type.value"
          @click="handleTypeSelect(type.value)"
        >
          <view class="type-icon">{{ getVenueTypeIcon(type.value) }}</view>
          <text class="type-text">{{ type.label }}</text>
          <text v-if="type.count !== undefined" class="type-count">{{ type.count }}</text>
          <view v-if="isLoading" class="loading-indicator">
            <text class="loading-text">...</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { computed, ref, watch } from 'vue'

export default {
  name: 'VenueTypeSelector',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    venueTypes: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'change'],
  setup(props, { emit }) {
    const selectedType = ref(props.modelValue)
    const scrollLeft = ref(0)
    
    // 监听外部值变化
    watch(() => props.modelValue, (newValue) => {
      selectedType.value = newValue
    })
    
    // 处理类型选择
    const handleTypeSelect = (typeValue) => {
      if (props.isLoading) return
      
      selectedType.value = typeValue
      emit('update:modelValue', typeValue)
      emit('change', typeValue)
      
      // 滚动到选中项
      scrollToSelectedType(typeValue)
    }
    
    // 滚动到选中项
    const scrollToSelectedType = (typeValue) => {
      const index = props.venueTypes.findIndex(type => type.value === typeValue)
      if (index !== -1) {
        // 计算滚动位置（每个卡片宽度 + 间距）
        const cardWidth = 120 // 卡片宽度
        const gap = 16 // 间距
        scrollLeft.value = index * (cardWidth + gap)
      }
    }
    
    // 获取场地类型图标
    const getVenueTypeIcon = (type) => {
      const iconMap = {
        'basketball': '🏀',
        'football': '⚽',
        'tennis': '🎾',
        'badminton': '🏸',
        'table_tennis': '🏓',
        'volleyball': '🏐',
        'gym': '💪',
        'swimming': '🏊',
        'dance': '💃',
        'yoga': '🧘',
        'other': '🏟️'
      }
      return iconMap[type] || '🏟️'
    }
    
    return {
      selectedType,
      scrollLeft,
      handleTypeSelect,
      getVenueTypeIcon
    }
  }
}
</script>

<style scoped>
.venue-type-selector {
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.venue-type-scroll {
  white-space: nowrap;
}

.venue-type-container {
  display: flex;
  gap: 16rpx;
  padding: 0 20rpx;
}

.type-card {
  flex-shrink: 0;
  width: 120rpx;
  height: 120rpx;
  background: #fff;
  border-radius: 16rpx;
  border: 2rpx solid #e9ecef;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
}

.type-card:active {
  transform: scale(0.95);
}

.type-card.active {
  background: #007bff;
  border-color: #007bff;
  color: #fff;
}

.type-card.loading {
  opacity: 0.6;
  cursor: not-allowed;
}

.type-icon {
  font-size: 32rpx;
  margin-bottom: 8rpx;
}

.type-text {
  font-size: 24rpx;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
}

.type-count {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background: #ff4757;
  color: #fff;
  font-size: 20rpx;
  padding: 4rpx 8rpx;
  border-radius: 12rpx;
  min-width: 24rpx;
  text-align: center;
}

.loading-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.loading-text {
  font-size: 24rpx;
  color: #666;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
