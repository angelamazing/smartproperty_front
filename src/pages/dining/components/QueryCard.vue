<template>
  <view class="query-card">
    <!-- 查询模式选择 -->
    <view class="query-mode-section">
      <text class="section-label">查询模式</text>
      <view class="mode-selector">
        <view
          class="mode-option"
          :class="{ active: queryMode === 'single' }"
          @click="switchQueryMode('single')"
        >
          <text class="mode-icon">📅</text>
          <text class="mode-text">单日查询</text>
        </view>
        <view
          class="mode-option"
          :class="{ active: queryMode === 'range' }"
          @click="switchQueryMode('range')"
        >
          <text class="mode-icon">📊</text>
          <text class="mode-text">时间段查询</text>
        </view>
      </view>
    </view>

    <!-- 日期选择区域 -->
    <view class="date-section">
      <text class="section-label">查询日期</text>
      
      <!-- 单日查询 -->
      <view v-if="queryMode === 'single'" class="date-picker-container">
        <picker mode="date" :value="singleDate" @change="onSingleDateChange">
          <view class="date-picker-content">
            <text class="date-icon">📅</text>
            <view class="date-info">
              <text class="date-label">选择日期</text>
              <text class="date-value">{{ singleDate || '请选择日期' }}</text>
            </view>
            <text class="date-arrow">▼</text>
          </view>
        </picker>
      </view>

      <!-- 时间段查询 -->
      <view v-else class="date-range-container">
        <picker mode="date" :value="startDate" @change="onStartDateChange">
          <view class="date-picker-content">
            <text class="date-icon">📅</text>
            <view class="date-info">
              <text class="date-label">开始日期</text>
              <text class="date-value">{{ startDate || '请选择开始日期' }}</text>
            </view>
            <text class="date-arrow">▼</text>
          </view>
        </picker>
        
        <view class="date-separator">
          <view class="separator-line"></view>
          <text class="separator-text">至</text>
          <view class="separator-line"></view>
        </view>
        
        <picker mode="date" :value="endDate" @change="onEndDateChange">
          <view class="date-picker-content">
            <text class="date-icon">📅</text>
            <view class="date-info">
              <text class="date-label">结束日期</text>
              <text class="date-value">{{ endDate || '请选择结束日期' }}</text>
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
                <text class="status-value">{{ selectedStatus }}</text>
              </view>
              <text class="status-arrow">▼</text>
            </view>
          </picker>
        </view>
        <view class="reset-btn" @click="resetFilters">
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
    <view class="query-stats" v-if="recordCount > 0">
      <text class="stats-icon">📊</text>
      <view class="stats-content">
        <text class="stats-text">共找到 {{ recordCount }} 条记录</text>
        <text class="stats-desc">{{ queryDescription }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'QueryCard',
  props: {
    queryMode: {
      type: String,
      default: 'single'
    },
    singleDate: {
      type: String,
      default: ''
    },
    startDate: {
      type: String,
      default: ''
    },
    endDate: {
      type: String,
      default: ''
    },
    selectedStatus: {
      type: String,
      default: '全部'
    },
    recordCount: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      statusOptions: ['全部', '待确认', '已确认', '已完成', '已取消']
    }
  },
  computed: {
    statusIndex() {
      return this.statusOptions.findIndex(status => status === this.selectedStatus)
    },

    queryDescription() {
      if (this.queryMode === 'single') {
        return `查询日期: ${this.singleDate}`
      } else {
        return `查询范围: ${this.startDate} 至 ${this.endDate}`
      }
    }
  },
  methods: {
    switchQueryMode(mode) {
      this.$emit('switch-query-mode', mode)
    },

    onSingleDateChange(e) {
      this.$emit('single-date-change', e.detail.value)
    },

    onStartDateChange(e) {
      this.$emit('start-date-change', e.detail.value)
    },

    onEndDateChange(e) {
      this.$emit('end-date-change', e.detail.value)
    },

    onStatusChange(e) {
      this.$emit('status-change', this.statusOptions[e.detail.value])
    },

    resetFilters() {
      this.$emit('reset-filters')
    },

    loadPersonalStatus() {
      this.$emit('load-personal-status')
    }
  }
}
</script>

<style scoped>
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

.query-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6rpx;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.query-mode-section {
  margin-bottom: 24rpx;
}

.section-label {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.mode-selector {
  display: flex;
  background: #f8f9fa;
  border-radius: 20rpx;
  padding: 8rpx;
  gap: 8rpx;
}

.mode-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 12rpx;
  border-radius: 12rpx;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.mode-option.active {
  background: #667eea;
  color: #fff;
  transform: translateY(-2rpx);
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.3);
}

.mode-icon {
  font-size: 28rpx;
  margin-bottom: 6rpx;
  position: relative;
  z-index: 1;
}

.mode-text {
  font-size: 22rpx;
  font-weight: 600;
  position: relative;
  z-index: 1;
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
</style>
