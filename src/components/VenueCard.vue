<template>
  <view class="venue-card" :class="{ 'venue-card--loading': loading }">
    <!-- 场地图片 -->
    <view class="venue-card__image" v-if="venue.image">
      <image 
        :src="venue.image" 
        class="venue-image" 
        mode="aspectFill"
        @error="onImageError"
      />
      <view class="venue-card__status" :class="getStatusClass(venue.status)">
        <text>{{ getStatusText(venue.status) }}</text>
      </view>
    </view>

    <!-- 场地信息 -->
    <view class="venue-card__content">
      <view class="venue-card__header">
        <text class="venue-card__name">{{ venue.name }}</text>
        <view class="venue-card__type">
          <text class="type-icon">{{ getTypeIcon(venue.type) }}</text>
          <text class="type-text">{{ getTypeText(venue.type) }}</text>
        </view>
      </view>

      <view class="venue-card__details">
        <view class="detail-item">
          <text class="detail-label">容纳人数</text>
          <text class="detail-value">{{ venue.capacity }}人</text>
        </view>
        <view class="detail-item">
          <text class="detail-label">价格</text>
          <text class="detail-value price">¥{{ venue.price }}/小时</text>
        </view>
        <view class="detail-item" v-if="venue.location">
          <text class="detail-label">位置</text>
          <text class="detail-value">{{ venue.location }}</text>
        </view>
      </view>

      <view class="venue-card__description" v-if="venue.description">
        <text class="description-text">{{ venue.description }}</text>
      </view>

      <!-- 时间段展示 -->
      <view class="venue-card__time-slots" v-if="showTimeSlots && venue.timeSlots">
        <text class="slots-title">可预约时段</text>
        <view class="slots-grid">
          <view 
            class="time-slot" 
            v-for="slot in venue.timeSlots.slice(0, 6)" 
            :key="slot.id"
            :class="getSlotClass(slot)"
            @click="selectTimeSlot(slot)"
          >
            <text class="slot-time">{{ slot.startTime }}-{{ slot.endTime }}</text>
            <text class="slot-status">{{ getSlotStatusText(slot.status) }}</text>
          </view>
          <view 
            v-if="venue.timeSlots.length > 6" 
            class="time-slot more-slots"
            @click="viewAllSlots"
          >
            <text class="more-text">+{{ venue.timeSlots.length - 6 }}个时段</text>
          </view>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="venue-card__actions">
        <button 
          class="action-btn secondary" 
          @click="viewDetail"
        >
          查看详情
        </button>
        <button 
          class="action-btn primary" 
          @click="makeReservation"
          :disabled="!hasAvailableSlots"
        >
          立即预约
        </button>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="venue-card__loading">
      <view class="loading-spinner"></view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'VenueCard',
  props: {
    venue: {
      type: Object,
      required: true,
      default: () => ({})
    },
    showTimeSlots: {
      type: Boolean,
      default: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    hasAvailableSlots() {
      if (!this.venue.timeSlots) return false
      return this.venue.timeSlots.some(slot => slot.status === 'available')
    }
  },

  methods: {
    /**
     * 获取场地状态样式类
     */
    getStatusClass(status) {
      return `status-${status}`
    },

    /**
     * 获取场地状态文本
     */
    getStatusText(status) {
      const statusMap = {
        'open': '开放',
        'closed': '关闭',
        'maintenance': '维护中'
      }
      return statusMap[status] || '未知状态'
    },

    /**
     * 获取场地类型文本
     */
    getTypeText(type) {
      const typeMap = {
        'badminton': '羽毛球',
        'pingpong': '乒乓球',
        'basketball': '篮球',
        'meeting': '会议室',
        'other': '其他'
      }
      return typeMap[type] || '未知类型'
    },

    /**
     * 获取场地类型图标
     */
    getTypeIcon(type) {
      const iconMap = {
        'badminton': '🏸',
        'pingpong': '🏓',
        'basketball': '🏀',
        'meeting': '🏢',
        'other': '⚽'
      }
      return iconMap[type] || '🏟️'
    },

    /**
     * 获取时间段样式类
     */
    getSlotClass(slot) {
      return `slot-${slot.status}`
    },

    /**
     * 获取时间段状态文本
     */
    getSlotStatusText(status) {
      const statusMap = {
        'available': '可预约',
        'reserved': '已预约',
        'maintenance': '维护中'
      }
      return statusMap[status] || '未知状态'
    },

    /**
     * 选择时间段
     */
    selectTimeSlot(slot) {
      if (slot.status === 'available') {
        this.$emit('select-time-slot', slot)
      }
    },

    /**
     * 查看详情
     */
    viewDetail() {
      this.$emit('view-detail', this.venue)
    },

    /**
     * 立即预约
     */
    makeReservation() {
      this.$emit('make-reservation', this.venue)
    },

    /**
     * 查看所有时间段
     */
    viewAllSlots() {
      this.$emit('view-all-slots', this.venue)
    },

    /**
     * 图片加载错误
     */
    onImageError() {
      this.$emit('image-error', this.venue)
    }
  }
}
</script>

<style lang="scss" scoped>
.venue-card {
  background: linear-gradient(135deg, #fff 0%, #fafbff 100%);
  border-radius: 25rpx;
  overflow: hidden;
  box-shadow: 0 8rpx 35rpx rgba(0, 0, 0, 0.12);
  border: 1rpx solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
  position: relative;
  margin-bottom: 25rpx;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4rpx;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    border-radius: 25rpx 25rpx 0 0;
  }

  &:active {
    transform: translateY(-2rpx);
    box-shadow: 0 12rpx 45rpx rgba(0, 0, 0, 0.18);
  }

  &--loading {
    opacity: 0.7;
    pointer-events: none;
  }
}

/* 场地图片 */
.venue-card__image {
  position: relative;
  height: 200rpx;
  overflow: hidden;
}

.venue-image {
  width: 100%;
  height: 100%;
  background: #f8f9fa;
}

.venue-card__status {
  position: absolute;
  top: 15rpx;
  right: 15rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 20rpx;
  font-weight: 600;
  color: white;
}

.status-open {
  background: #27ae60;
}

.status-closed {
  background: #e74c3c;
}

.status-maintenance {
  background: #f39c12;
}

/* 场地内容 */
.venue-card__content {
  padding: 30rpx;
}

.venue-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.venue-card__name {
  font-size: 32rpx;
  font-weight: 700;
  color: #2c3e50;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  flex: 1;
  margin-right: 20rpx;
}

.venue-card__type {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
}

.type-icon {
  font-size: 24rpx;
  margin-right: 6rpx;
}

.type-text {
  font-size: 20rpx;
  color: #666;
}

/* 场地详情 */
.venue-card__details {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 24rpx;
  color: #666;
}

.detail-value {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;

  &.price {
    color: #e74c3c;
    font-weight: bold;
  }
}

/* 场地描述 */
.venue-card__description {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16rpx;
  padding: 20rpx;
  border-left: 4rpx solid #667eea;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  margin-bottom: 20rpx;
}

.description-text {
  font-size: 24rpx;
  color: #495057;
  line-height: 1.5;
}

/* 时间段 */
.venue-card__time-slots {
  margin-bottom: 25rpx;
}

.slots-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 15rpx;
}

.slots-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12rpx;
}

.time-slot {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 16rpx;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;

  &.available {
    border-color: #28a745;
    background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
    cursor: pointer;
  }

  &.available:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 15rpx rgba(40, 167, 69, 0.3);
  }

  &.reserved {
    border-color: #dc3545;
    background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
    opacity: 0.7;
  }

  &.maintenance {
    border-color: #ffc107;
    background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
    opacity: 0.8;
  }

  &.more-slots {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: transparent;
  }

  &.more-slots:active {
    transform: scale(0.98);
  }
}

.slot-time {
  display: block;
  font-size: 20rpx;
  color: #333;
  margin-bottom: 6rpx;
  font-weight: 500;
}

.slot-status {
  font-size: 18rpx;
  color: #666;
}

.more-text {
  font-size: 18rpx;
  color: white;
  font-weight: 600;
}

/* 操作按钮 */
.venue-card__actions {
  display: flex;
  gap: 15rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border: none;
  border-radius: 16rpx;
  font-size: 24rpx;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;

  &.secondary {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    color: #495057;
    border: 2rpx solid #dee2e6;
  }

  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: 2rpx solid transparent;
  }

  &.primary:disabled {
    background: linear-gradient(135deg, #ccc 0%, #999 100%);
    color: #666;
    opacity: 0.6;
  }

  &:active {
    transform: scale(0.98);
  }
}

/* 加载状态 */
.venue-card__loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 3rpx solid #f3f3f3;
  border-top: 3rpx solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media screen and (max-width: 600rpx) {
  .slots-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10rpx;
  }
  
  .venue-card__actions {
    flex-direction: column;
  }
  
  .action-btn {
    height: 70rpx;
    font-size: 22rpx;
  }
}
</style>
