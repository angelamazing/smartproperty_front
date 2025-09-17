<template>
  <view class="venue-reservation-tab">
    <!-- 场地列表 -->
    <view class="venue-list" v-if="venues.length > 0">
      <VenueCard
        v-for="venue in venues"
        :key="venue._id"
        :venue="venue"
        :is-loading="isLoading"
        @reserve="handleReserve"
        @view-detail="handleViewDetail"
        @click="handleVenueClick"
      />
    </view>
    
    <!-- 空状态 -->
    <view v-else-if="!isLoading" class="empty-state">
      <text class="empty-icon">🏟️</text>
      <text class="empty-title">暂无可用场地</text>
      <text class="empty-desc">请选择其他日期或场地类型</text>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-state">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载场地中...</text>
    </view>
    
    <!-- 错误状态 -->
    <view v-if="error" class="error-state">
      <text class="error-icon">⚠️</text>
      <text class="error-title">加载失败</text>
      <text class="error-desc">{{ error }}</text>
      <button class="retry-btn" @click="handleRetry">
        <text class="btn-text">重试</text>
      </button>
    </view>
  </view>
</template>

<script>
import { defineComponent } from 'vue'
import VenueCard from './VenueCard.vue'

export default defineComponent({
  name: 'VenueReservationTab',
  components: {
    VenueCard
  },
  props: {
    venues: {
      type: Array,
      default: () => []
    },
    isLoading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: null
    }
  },
  emits: ['reserve', 'view-detail', 'venue-click', 'retry'],
  setup(props, { emit }) {
    // 处理预约
    const handleReserve = (venue) => {
      emit('reserve', venue)
    }
    
    // 处理查看详情
    const handleViewDetail = (venue) => {
      emit('view-detail', venue)
    }
    
    // 处理场地点击
    const handleVenueClick = (venue) => {
      emit('venue-click', venue)
    }
    
    // 处理重试
    const handleRetry = () => {
      emit('retry')
    }
    
    return {
      handleReserve,
      handleViewDetail,
      handleVenueClick,
      handleRetry
    }
  }
})
</script>

<style scoped>
.venue-reservation-tab {
  padding: 20rpx;
}

.venue-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.empty-state,
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  text-align: center;
}

.empty-icon,
.error-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-title,
.error-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
}

.empty-desc,
.error-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 32rpx;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 6rpx solid #f3f3f3;
  border-top: 6rpx solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

.retry-btn {
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  padding: 16rpx 32rpx;
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.3s ease;
}

.retry-btn:active {
  background: #0056b3;
  transform: scale(0.98);
}

.btn-text {
  color: #fff;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
