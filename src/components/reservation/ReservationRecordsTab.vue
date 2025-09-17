<template>
  <view class="reservation-records-tab">
    <!-- 筛选器 -->
    <view class="filter-bar">
      <picker
        mode="selector"
        :range="statusOptions"
        :value="statusIndex"
        @change="handleStatusChange"
        class="status-picker"
      >
        <view class="picker-display">
          <text class="picker-text">{{ selectedStatus }}</text>
          <text class="picker-icon">🔽</text>
        </view>
      </picker>
    </view>
    
    <!-- 预约记录列表 -->
    <view class="records-list" v-if="reservations.length > 0">
      <view
        v-for="record in reservations"
        :key="record._id"
        class="record-item"
        @click="handleRecordClick(record)"
      >
        <view class="record-header">
          <text class="venue-name">{{ record.venueName }}</text>
          <view class="status-badge" :class="getStatusClass(record.status)">
            <text class="status-text">{{ getStatusText(record.status) }}</text>
          </view>
        </view>
        
        <view class="record-details">
          <view class="detail-row">
            <text class="detail-label">预约日期</text>
            <text class="detail-value">{{ formatDate(record.reservationDate) }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">预约时间</text>
            <text class="detail-value">{{ record.startTime }}-{{ record.endTime }}</text>
          </view>
          <view class="detail-row">
            <text class="detail-label">预约人</text>
            <text class="detail-value">{{ record.userName }}</text>
          </view>
          <view class="detail-row" v-if="record.phoneNumber">
            <text class="detail-label">联系电话</text>
            <text class="detail-value">{{ record.phoneNumber }}</text>
          </view>
        </view>
        
        <view class="record-actions" v-if="canCancel(record)">
          <button 
            class="action-btn cancel" 
            @click.stop="handleCancel(record)"
            :disabled="isCancelling"
          >
            <text class="btn-text">取消预约</text>
          </button>
        </view>
      </view>
    </view>
    
    <!-- 空状态 -->
    <view v-else-if="!isLoading" class="empty-state">
      <text class="empty-icon">📋</text>
      <text class="empty-title">暂无预约记录</text>
      <text class="empty-desc">您还没有任何预约记录</text>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-state">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载记录中...</text>
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
import { ref, computed } from 'vue'
import { useDateFormatter } from '@/composables/useDateFormatter'

export default {
  name: 'ReservationRecordsTab',
  props: {
    reservations: {
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
    },
    isCancelling: {
      type: Boolean,
      default: false
    }
  },
  emits: ['status-change', 'record-click', 'cancel', 'retry'],
  setup(props, { emit }) {
    const { formatDisplayDate } = useDateFormatter()
    
    // 状态选项
    const statusOptions = ['全部', '待确认', '已确认', '已取消', '已完成']
    const statusIndex = ref(0)
    
    // 选中的状态
    const selectedStatus = computed(() => {
      return statusOptions[statusIndex.value]
    })
    
    // 处理状态变化
    const handleStatusChange = (event) => {
      statusIndex.value = event.detail.value
      const status = statusIndex.value === 0 ? '' : statusOptions[statusIndex.value]
      emit('status-change', status)
    }
    
    // 格式化日期
    const formatDate = (dateStr) => {
      return formatDisplayDate(dateStr)
    }
    
    // 获取状态样式类
    const getStatusClass = (status) => {
      const statusMap = {
        'pending': 'status-pending',
        'confirmed': 'status-confirmed',
        'cancelled': 'status-cancelled',
        'completed': 'status-completed'
      }
      return statusMap[status] || 'status-unknown'
    }
    
    // 获取状态文本
    const getStatusText = (status) => {
      const statusMap = {
        'pending': '待确认',
        'confirmed': '已确认',
        'cancelled': '已取消',
        'completed': '已完成'
      }
      return statusMap[status] || '未知'
    }
    
    // 是否可以取消
    const canCancel = (record) => {
      return record.status === 'confirmed'
    }
    
    // 处理记录点击
    const handleRecordClick = (record) => {
      emit('record-click', record)
    }
    
    // 处理取消预约
    const handleCancel = (record) => {
      if (props.isCancelling) return
      
      uni.showModal({
        title: '确认取消',
        content: '确定要取消这个预约吗？',
        success: (res) => {
          if (res.confirm) {
            emit('cancel', record)
          }
        }
      })
    }
    
    // 处理重试
    const handleRetry = () => {
      emit('retry')
    }
    
    return {
      statusOptions,
      statusIndex,
      selectedStatus,
      handleStatusChange,
      formatDate,
      getStatusClass,
      getStatusText,
      canCancel,
      handleRecordClick,
      handleCancel,
      handleRetry
    }
  }
}
</script>

<style scoped>
.reservation-records-tab {
  padding: 20rpx;
}

.filter-bar {
  margin-bottom: 20rpx;
}

.status-picker {
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.picker-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.picker-text {
  font-size: 28rpx;
  color: #333;
}

.picker-icon {
  font-size: 24rpx;
  color: #666;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.record-item:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.venue-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.status-badge {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-confirmed {
  background: #d4edda;
  color: #155724;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.status-completed {
  background: #d1ecf1;
  color: #0c5460;
}

.status-unknown {
  background: #e2e3e5;
  color: #6c757d;
}

.record-details {
  margin-bottom: 20rpx;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-size: 26rpx;
  color: #666;
}

.detail-value {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

.record-actions {
  display: flex;
  justify-content: flex-end;
}

.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
  border: none;
  font-size: 26rpx;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-btn.cancel {
  background: #dc3545;
  color: #fff;
}

.action-btn.cancel:not(:disabled):active {
  background: #c82333;
  transform: scale(0.98);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-text {
  color: inherit;
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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
