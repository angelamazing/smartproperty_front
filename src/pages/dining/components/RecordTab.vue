<template>
  <view class="record-tab">
    <!-- 查询卡片 -->
    <view class="query-card">
      <!-- 日期选择区域 -->
      <view class="date-section">
        <text class="section-label">查询日期</text>
        
        <!-- 时间段查询 -->
        <view class="date-range-container">
          <picker mode="date" :value="recordFilter.startDate" @change="onStartDateChange">
            <view class="date-picker-content">
              <text class="date-icon">📅</text>
              <view class="date-info">
                <text class="date-label">开始日期</text>
                <text class="date-value">{{ recordFilter.startDate || '请选择开始日期' }}</text>
              </view>
              <text class="date-arrow">▼</text>
            </view>
          </picker>
          
          <view class="date-separator">
            <view class="separator-line"></view>
            <text class="separator-text">至</text>
            <view class="separator-line"></view>
          </view>
          
          <picker mode="date" :value="recordFilter.endDate" @change="onEndDateChange">
            <view class="date-picker-content">
              <text class="date-icon">📅</text>
              <view class="date-info">
                <text class="date-label">结束日期</text>
                <text class="date-value">{{ recordFilter.endDate || '请选择结束日期' }}</text>
              </view>
              <text class="date-arrow">▼</text>
            </view>
          </picker>
        </view>
      </view>

      <!-- 状态筛选区域 -->
      <view class="status-section">
        <text class="section-label">状态筛选</text>
        <view class="status-filter-container">
          <view class="status-picker">
            <picker :value="statusIndex" :range="statusOptions" @change="onStatusChange">
              <view class="status-picker-content">
                <text class="status-icon">📋</text>
                <view class="status-info">
                  <text class="status-label">选择状态</text>
                  <text class="status-value">{{ recordFilter.status }}</text>
                </view>
                <text class="status-arrow">▼</text>
              </view>
            </picker>
          </view>
          <view class="reset-btn" @click="resetRecordFilters">
            <text class="reset-icon">🔄</text>
            <text class="reset-text">重置</text>
          </view>
        </view>
      </view>

      <!-- 个人状态查询区域 -->
      <view class="personal-status-section">
        <button class="personal-status-btn" @click="loadPersonalStatus">
          <view class="btn-icon-container">
            <text class="btn-icon">👤</text>
          </view>
          <view class="btn-content">
            <text class="btn-title">查看个人报餐状态</text>
            <text class="btn-desc">查看指定日期的个人报餐详情</text>
          </view>
          <text class="btn-arrow">▶</text>
        </button>
      </view>

      <!-- 查询结果统计 -->
      <view class="query-stats" v-if="diningRecords.length > 0">
        <text class="stats-icon">📊</text>
        <view class="stats-content">
          <text class="stats-text">共找到 {{ diningRecords.length }} 条记录</text>
          <text class="stats-desc">{{ getQueryDescription() }}</text>
        </view>
      </view>
    </view>

    <!-- 记录列表 -->
    <view class="record-list" v-if="diningRecords.length > 0">
      <view
        class="record-item"
        v-for="record in diningRecords"
        :key="record._id"
        @click="viewRecordDetail(record)"
      >
        <view class="record-header">
          <text class="record-date">{{ formatDate(record.date) }}</text>
          <text class="record-status" :class="getStatusClass(record.status)">
            {{ record.status }}
          </text>
        </view>
        
        <view class="record-content">
          <view class="record-info">
            <text class="record-type">🍽️ {{ record.mealType }}</text>
            <text class="record-count">👥 {{ record.memberCount }}人</text>
          </view>
          
          <view class="record-members" v-if="record.members && record.members.length > 0">
            <text class="members-text">{{ record.members.join('、') }}</text>
          </view>
          
          <view class="record-time">
            <text class="time-label">⏰ 提交时间: {{ $formatTime(record.createdAt) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state-card" v-else-if="!isLoading">
      <view class="empty-illustration">
        <text class="empty-icon">📋</text>
        <view class="empty-decoration">
          <view class="decoration-dot"></view>
          <view class="decoration-dot"></view>
          <view class="decoration-dot"></view>
        </view>
      </view>
      
      <view class="empty-content">
        <text class="empty-title">暂无报餐记录</text>
        <text class="empty-desc">当前筛选条件下没有找到报餐记录，请尝试调整筛选条件或选择其他日期范围</text>
      </view>
      
      <view class="empty-actions">
        <button class="primary-action-btn" @click="resetRecordFilters">
          <text class="btn-text">重置筛选</text>
        </button>
        <button class="secondary-action-btn" @click="switchToOrderTab">
          <text class="btn-text">去报餐</text>
        </button>
      </view>
    </view>

    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMoreRecords">
      <button class="load-more-btn" @click="loadMoreRecords" :loading="isLoadingMore">
        {{ isLoadingMore ? '加载中...' : '加载更多' }}
      </button>
    </view>
    
    <!-- 底部安全区域 -->
    <view class="bottom-safe-area"></view>
  </view>
</template>

<script>
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: 'RecordTab',
  mixins: [timeMixin],
  props: {
    diningRecords: {
      type: Array,
      default: () => []
    },
    recordFilter: {
      type: Object,
      required: true
    },
    hasMoreRecords: {
      type: Boolean,
      default: false
    },
    isLoadingMore: {
      type: Boolean,
      default: false
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      statusOptions: ['全部', '待确认', '已确认', '已完成', '已取消']
    }
  },
  computed: {
    statusIndex() {
      return this.statusOptions.findIndex(status => status === this.recordFilter.status)
    }
  },
  methods: {

    onStartDateChange(e) {
      this.$emit('start-date-change', e.detail.value)
    },

    onEndDateChange(e) {
      this.$emit('end-date-change', e.detail.value)
    },

    onStatusChange(e) {
      this.$emit('status-change', this.statusOptions[e.detail.value])
    },

    resetRecordFilters() {
      this.$emit('reset-filters')
    },

    loadPersonalStatus() {
      this.$emit('load-personal-status')
    },

    loadMoreRecords() {
      this.$emit('load-more-records')
    },

    viewRecordDetail(record) {
      this.$emit('view-record-detail', record)
    },

    switchToOrderTab() {
      this.$emit('switch-to-order-tab')
    },

    getQueryDescription() {
      return `查询范围: ${this.recordFilter.startDate} 至 ${this.recordFilter.endDate}`
    },

    getStatusClass(status) {
      const statusMap = {
        '待确认': 'status-pending',
        '已确认': 'status-confirmed',
        '已完成': 'status-completed',
        '已取消': 'status-cancelled'
      }
      return statusMap[status] || 'status-pending'
    },

    formatDate(dateString) {
      if (!dateString) return ''
      try {
        // 使用TimeUtils确保iOS兼容性
        return this.$formatDate(dateString)
      } catch (error) {
        console.error('日期格式化错误:', error)
        return ''
      }
    },

    formatTime(dateString) {
      if (!dateString) return ''
      try {
        // 使用TimeUtils确保iOS兼容性
        return this.$formatDateTime(dateString)
      } catch (error) {
        console.error('时间格式化错误:', error)
        return ''
      }
    }
  }
}
</script>

<style scoped>
.record-tab {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20rpx;
}

.query-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid rgba(102, 126, 234, 0.1);
  position: relative;
  overflow: hidden;
}


.date-section {
  margin-bottom: 24rpx;
}

.date-picker-container,
.date-range-container {
  margin-top: 16rpx;
}

.date-picker-content {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 16rpx;
  transition: all 0.3s ease;
}

.date-picker-content:active {
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.1);
}

.date-icon {
  font-size: 28rpx;
  margin-right: 16rpx;
  color: #667eea;
}

.date-info {
  flex: 1;
}

.date-label {
  display: block;
  font-size: 20rpx;
  color: #666;
  margin-bottom: 2rpx;
}

.date-value {
  display: block;
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

.date-arrow {
  font-size: 28rpx;
  color: #999;
  font-weight: 300;
}

.date-separator {
  display: flex;
  align-items: center;
  margin: 12rpx 0;
  gap: 16rpx;
}

.separator-line {
  flex: 1;
  height: 2rpx;
  background: linear-gradient(90deg, transparent 0%, #e9ecef 50%, transparent 100%);
}

.separator-text {
  font-size: 24rpx;
  color: #999;
  font-weight: 500;
  padding: 0 20rpx;
}

.status-section {
  margin-bottom: 24rpx;
}

.status-filter-container {
  display: flex;
  gap: 16rpx;
  margin-top: 16rpx;
}

.status-picker {
  flex: 1;
}

.status-picker-content {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 16rpx;
  transition: all 0.3s ease;
}

.status-picker-content:active {
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.1);
}

.status-icon {
  font-size: 28rpx;
  margin-right: 16rpx;
  color: #667eea;
}

.status-info {
  flex: 1;
}

.status-label {
  display: block;
  font-size: 20rpx;
  color: #666;
  margin-bottom: 2rpx;
}

.status-value {
  display: block;
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

.status-arrow {
  font-size: 28rpx;
  color: #999;
  font-weight: 300;
}

.reset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 16rpx 12rpx;
  min-width: 100rpx;
  transition: all 0.3s ease;
}

.reset-btn:active {
  border-color: #667eea;
  background: #f8f9fa;
  transform: scale(0.98);
}

.reset-icon {
  font-size: 24rpx;
  margin-bottom: 6rpx;
  color: #667eea;
}

.reset-text {
  font-size: 20rpx;
  color: #333;
  font-weight: 500;
}

.personal-status-section {
  margin-bottom: 20rpx;
}

.personal-status-btn {
  display: flex;
  align-items: center;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 16rpx;
  padding: 24rpx 20rpx;
  box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.personal-status-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.4);
}

.btn-icon-container {
  width: 60rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.btn-icon {
  font-size: 28rpx;
  color: #fff;
}

.btn-content {
  flex: 1;
}

.btn-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4rpx;
}

.btn-desc {
  display: block;
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.8);
}

.btn-arrow {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 300;
}

.query-stats {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12rpx;
  padding: 16rpx;
  border: 1rpx solid rgba(102, 126, 234, 0.1);
}

.stats-icon {
  font-size: 28rpx;
  margin-right: 16rpx;
  color: #667eea;
}

.stats-content {
  flex: 1;
}

.stats-text {
  display: block;
  font-size: 24rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 2rpx;
}

.stats-desc {
  display: block;
  font-size: 20rpx;
  color: #666;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.record-item:active {
  transform: translateY(-2rpx);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.12);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
  padding-bottom: 12rpx;
  border-bottom: 2rpx solid #f8f9fa;
}

.record-date {
  font-size: 26rpx;
  font-weight: 700;
  color: #333;
  position: relative;
}

.record-date::before {
  content: '📅';
  margin-right: 8rpx;
  font-size: 24rpx;
}

.record-status {
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  font-size: 20rpx;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1rpx;
}

.status-pending {
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
  color: #d63031;
}

.status-confirmed {
  background: linear-gradient(135deg, #a8e6cf 0%, #7fcdcd 100%);
  color: #00b894;
}

.status-completed {
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  color: #fff;
}

.status-cancelled {
  background: linear-gradient(135deg, #fd79a8 0%, #e84393 100%);
  color: #fff;
}

.record-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.record-info {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.record-type {
  display: flex;
  align-items: center;
  font-size: 22rpx;
  color: #333;
  font-weight: 500;
}

.record-type::before {
  content: '🍽️';
  margin-right: 6rpx;
  font-size: 20rpx;
}

.record-count {
  display: flex;
  align-items: center;
  font-size: 22rpx;
  color: #667eea;
  font-weight: 700;
  background: rgba(102, 126, 234, 0.1);
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
}

.record-count::before {
  content: '👥';
  margin-right: 6rpx;
  font-size: 20rpx;
}

.record-members {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12rpx;
  padding: 12rpx;
  border: 1rpx solid rgba(102, 126, 234, 0.1);
}

.members-text {
  font-size: 22rpx;
  color: #333;
  line-height: 1.5;
  font-weight: 500;
}

.record-time {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 10rpx 12rpx;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8rpx;
  border: 1rpx solid rgba(102, 126, 234, 0.1);
}

.time-label {
  font-size: 20rpx;
  color: #666;
  font-weight: 500;
}

.time-label::before {
  content: '⏰';
  margin-right: 6rpx;
  font-size: 18rpx;
}

.empty-state-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 60rpx 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 6rpx 24rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid rgba(102, 126, 234, 0.1);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.empty-illustration {
  position: relative;
  margin-bottom: 30rpx;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 16rpx;
  opacity: 0.8;
  position: relative;
  z-index: 1;
}

.empty-decoration {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
}

.decoration-dot {
  position: absolute;
  width: 8rpx;
  height: 8rpx;
  background: #667eea;
  border-radius: 50%;
  opacity: 0.3;
  animation: float 3s ease-in-out infinite;
}

.decoration-dot:nth-child(1) {
  top: -20rpx;
  left: -30rpx;
  animation-delay: 0s;
}

.decoration-dot:nth-child(2) {
  top: 10rpx;
  right: -20rpx;
  animation-delay: 1s;
}

.decoration-dot:nth-child(3) {
  bottom: -10rpx;
  left: -10rpx;
  animation-delay: 2s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); opacity: 0.3; }
  50% { transform: translateY(-10rpx); opacity: 0.6; }
}

.empty-content {
  margin-bottom: 40rpx;
}

.empty-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.empty-desc {
  display: block;
  font-size: 22rpx;
  color: #666;
  line-height: 1.5;
  max-width: 500rpx;
  margin: 0 auto;
}

.empty-actions {
  display: flex;
  gap: 16rpx;
  justify-content: center;
  flex-wrap: wrap;
}

.primary-action-btn,
.secondary-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18rpx 32rpx;
  border-radius: 16rpx;
  font-size: 24rpx;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  position: relative;
  overflow: hidden;
}

.primary-action-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.3);
}

.primary-action-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 4rpx 16rpx rgba(102, 126, 234, 0.4);
}

.secondary-action-btn {
  background: #fff;
  color: #667eea;
  border: 2rpx solid #667eea;
}

.secondary-action-btn:active {
  background: #f8f9fa;
  transform: translateY(2rpx);
}

.btn-text {
  font-size: 24rpx;
  font-weight: 600;
}

.load-more {
  text-align: center;
  padding: 40rpx 20rpx;
}

.load-more-btn {
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  padding: 20rpx 40rpx;
  font-size: 26rpx;
  color: #666;
  transition: all 0.3s ease;
}

.load-more-btn:active {
  background: #e9ecef;
  transform: scale(0.98);
}

.bottom-safe-area {
  height: 40rpx;
  background: transparent;
}
</style>
