<template>
  <view class="qr-history-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <view class="header-left">
        <text class="back-btn" @click="goBack">←</text>
        <text class="page-title">扫码历史记录</text>
      </view>
      <view class="header-actions">
        <text class="refresh-btn" @click="loadHistory">🔄</text>
        <text class="filter-btn" @click="showFilter = true">🔍</text>
      </view>
    </view>

    <!-- 统计概览 -->
    <view class="stats-overview" v-if="statsData">
      <view class="stat-card">
        <text class="stat-number">{{ statsData.totalScans || 0 }}</text>
        <text class="stat-label">总扫码次数</text>
      </view>
      <view class="stat-card">
        <text class="stat-number">{{ statsData.successfulScans || 0 }}</text>
        <text class="stat-label">成功扫码</text>
      </view>
      <view class="stat-card">
        <text class="stat-number">{{ statsData.uniqueDays || 0 }}</text>
        <text class="stat-label">扫码天数</text>
      </view>
    </view>

    <!-- 筛选条件 -->
    <view class="filter-section" v-if="showFilter">
      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">日期范围:</text>
          <picker 
            :value="dateRangeIndex" 
            :range="dateRangeOptions" 
            @change="onDateRangeChange"
          >
            <view class="picker-input">
              {{ dateRangeOptions[dateRangeIndex] }}
              <text class="iconfont">▼</text>
            </view>
          </picker>
        </view>
      </view>
      
      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">餐次:</text>
          <picker 
            :value="mealTypeIndex" 
            :range="mealTypeOptions" 
            @change="onMealTypeChange"
          >
            <view class="picker-input">
              {{ mealTypeOptions[mealTypeIndex] }}
              <text class="iconfont">▼</text>
            </view>
          </picker>
        </view>
        
        <view class="filter-item">
          <text class="filter-label">状态:</text>
          <picker 
            :value="statusIndex" 
            :range="statusOptions" 
            @change="onStatusChange"
          >
            <view class="picker-input">
              {{ statusOptions[statusIndex] }}
              <text class="iconfont">▼</text>
            </view>
          </picker>
        </view>
      </view>
      
      <view class="filter-actions">
        <button class="reset-btn" @click="resetFilters">重置</button>
        <button class="apply-btn" @click="applyFilters">应用</button>
      </view>
    </view>

    <!-- 历史记录列表 -->
    <view class="history-list">
      <view 
        v-for="record in historyRecords" 
        :key="record._id" 
        class="history-item"
        @click="showRecordDetail(record)"
      >
        <view class="record-header">
          <view class="meal-info">
            <text class="meal-type">{{ record.mealTypeName }}</text>
            <text class="record-date">{{ formatDate(record.diningDate) }}</text>
          </view>
          <view class="record-status" :class="record.status">
            <text>{{ record.status === 'success' ? '✓' : '✗' }}</text>
          </view>
        </view>
        
        <view class="record-details">
          <view class="detail-row">
            <text class="detail-label">扫码时间:</text>
            <text class="detail-value">{{ $formatTime(record.scanTime) }}</text>
          </view>
          
          <view class="detail-row" v-if="record.qrCode信息">
            <text class="detail-label">扫码位置:</text>
            <text class="detail-value">{{ record.qrCode信息.location }}</text>
          </view>
          
          <view class="detail-row" v-if="record.qrCode">
            <text class="detail-label">二维码:</text>
            <text class="detail-value qr-code">{{ record.qrCode }}</text>
          </view>
        </view>
        
        <view class="record-message" v-if="record.status === 'failed'">
          <text class="error-message">{{ record.failureReason || '扫码失败' }}</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!loading && historyRecords.length === 0">
      <text class="empty-icon">📱</text>
      <text class="empty-text">暂无扫码记录</text>
      <text class="empty-tip">开始扫码就餐后，记录将显示在这里</text>
    </view>

    <!-- 加载状态 -->
    <view class="loading-state" v-if="loading">
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 记录详情弹窗 -->
    <uni-popup ref="detailPopup" type="center">
      <view class="detail-popup">
        <view class="popup-header">
          <text class="popup-title">扫码记录详情</text>
          <text class="close-btn" @click="closeDetail">×</text>
        </view>
        
        <view class="popup-content" v-if="selectedRecord">
          <view class="detail-section">
            <text class="detail-label">餐次类型:</text>
            <text class="detail-value">{{ selectedRecord.mealTypeName }}</text>
          </view>
          
          <view class="detail-section">
            <text class="detail-label">就餐日期:</text>
            <text class="detail-value">{{ formatDate(selectedRecord.diningDate) }}</text>
          </view>
          
          <view class="detail-section">
            <text class="detail-label">扫码时间:</text>
            <text class="detail-value">{{ $formatTime(selectedRecord.scanTime) }}</text>
          </view>
          
          <view class="detail-section" v-if="selectedRecord.qrCode信息">
            <text class="detail-label">二维码名称:</text>
            <text class="detail-value">{{ selectedRecord.qrCode信息.name }}</text>
          </view>
          
          <view class="detail-section" v-if="selectedRecord.qrCode信息">
            <text class="detail-label">张贴位置:</text>
            <text class="detail-value">{{ selectedRecord.qrCode信息.location }}</text>
          </view>
          
          <view class="detail-section">
            <text class="detail-label">二维码内容:</text>
            <text class="detail-value qr-code-content">{{ selectedRecord.qrCode }}</text>
          </view>
          
          <view class="detail-section">
            <text class="detail-label">扫码状态:</text>
            <text class="detail-value" :class="selectedRecord.status">
              {{ selectedRecord.status === 'success' ? '成功' : '失败' }}
            </text>
          </view>
          
          <view class="detail-section" v-if="selectedRecord.status === 'failed' && selectedRecord.failureReason">
            <text class="detail-label">失败原因:</text>
            <text class="detail-value error-text">{{ selectedRecord.failureReason }}</text>
          </view>
        </view>
        
        <view class="popup-actions">
          <button class="confirm-btn" @click="closeDetail">关闭</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import TimeUtils from '@/utils/timeUtils.js'
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: 'QrScanHistory',
  mixins: [timeMixin],
  data() {
    return {
      historyRecords: [],
      statsData: null,
      loading: false,
      showFilter: false,
      selectedRecord: null,
      
      // 筛选条件
      dateRangeOptions: ['全部', '今天', '最近7天', '最近30天', '最近3个月'],
      dateRangeIndex: 0,
      
      mealTypeOptions: ['全部', '早餐', '午餐', '晚餐'],
      mealTypeIndex: 0,
      
      statusOptions: ['全部', '成功', '失败'],
      statusIndex: 0,
      
      // 当前筛选参数
      currentFilters: {
        startDate: null,
        endDate: null,
        mealType: null,
        status: null,
        limit: 50,
        offset: 0
      }
    }
  },
  onLoad() {
    this.initPage()
  },
  onShow() {
    this.loadHistory()
  },
  onPullDownRefresh() {
    this.refreshData()
  },
  onReachBottom() {
    this.loadMore()
  },
  methods: {
    // 初始化页面
    initPage() {
      this.loadHistory()
    },

    // 加载历史记录
    async loadHistory() {
      try {
        this.loading = true
        
        const params = {
          limit: this.currentFilters.limit,
          offset: this.currentFilters.offset
        }
        
        // 添加筛选条件
        if (this.currentFilters.startDate) {
          params.startDate = this.currentFilters.startDate
        }
        if (this.currentFilters.endDate) {
          params.endDate = this.currentFilters.endDate
        }
        if (this.currentFilters.mealType) {
          params.mealType = this.currentFilters.mealType
        }
        if (this.currentFilters.status) {
          params.status = this.currentFilters.status
        }
        
        const response = await api.qrScan.getHistory(params)
        
        if (response.success) {
          if (this.currentFilters.offset === 0) {
            this.historyRecords = response.data || []
          } else {
            this.historyRecords = [...this.historyRecords, ...(response.data || [])]
          }
          
          // 计算统计数据
          this.calculateStats()
        } else {
          uni.showToast({
            title: response.message || '获取历史记录失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取历史记录失败:', error)
        uni.showToast({
          title: '获取历史记录失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    // 计算统计数据
    calculateStats() {
      if (!this.historyRecords.length) {
        this.statsData = {
          totalScans: 0,
          successfulScans: 0,
          uniqueDays: 0
        }
        return
      }
      
      const totalScans = this.historyRecords.length
      const successfulScans = this.historyRecords.filter(r => r.status === 'success').length
      const uniqueDays = new Set(this.historyRecords.map(r => r.diningDate)).size
      
      this.statsData = {
        totalScans,
        successfulScans,
        uniqueDays
      }
    },

    // 加载更多
    loadMore() {
      if (this.loading) return
      
      this.currentFilters.offset += this.currentFilters.limit
      this.loadHistory()
    },

    // 刷新数据
    refreshData() {
      this.currentFilters.offset = 0
      this.loadHistory()
      uni.stopPullDownRefresh()
    },

    // 日期范围筛选
    onDateRangeChange(e) {
      this.dateRangeIndex = e.detail.value
    },

    // 餐次筛选
    onMealTypeChange(e) {
      this.mealTypeIndex = e.detail.value
    },

    // 状态筛选
    onStatusChange(e) {
      this.statusIndex = e.detail.value
    },

    // 重置筛选条件
    resetFilters() {
      this.dateRangeIndex = 0
      this.mealTypeIndex = 0
      this.statusIndex = 0
      this.showFilter = false
    },

    // 应用筛选条件
    applyFilters() {
      // 设置日期范围，使用TimeUtils确保iOS兼容性
      const now = TimeUtils.getCurrentBeijingTime()
      const today = TimeUtils.getCurrentDate()
      
      switch (this.dateRangeIndex) {
        case 1: // 今天
          this.currentFilters.startDate = today
          this.currentFilters.endDate = today
          break
        case 2: // 最近7天
          this.currentFilters.startDate = TimeUtils.getPreviousDay(today, 7)
          this.currentFilters.endDate = today
          break
        case 3: // 最近30天
          this.currentFilters.startDate = TimeUtils.getPreviousDay(today, 30)
          this.currentFilters.endDate = today
          break
        case 4: // 最近3个月
          this.currentFilters.startDate = TimeUtils.getPreviousDay(today, 90)
          this.currentFilters.endDate = today
          break
        default: // 全部
          this.currentFilters.startDate = null
          this.currentFilters.endDate = null
      }
      
      // 设置餐次筛选
      const mealTypeMap = { 1: 'breakfast', 2: 'lunch', 3: 'dinner' }
      this.currentFilters.mealType = this.mealTypeIndex > 0 ? mealTypeMap[this.mealTypeIndex] : null
      
      // 设置状态筛选
      const statusMap = { 1: 'success', 2: 'failed' }
      this.currentFilters.status = this.statusIndex > 0 ? statusMap[this.statusIndex] : null
      
      // 重置分页
      this.currentFilters.offset = 0
      
      this.showFilter = false
      this.loadHistory()
    },

    // 显示记录详情
    showRecordDetail(record) {
      this.selectedRecord = record
      this.$refs.detailPopup.open()
    },

    // 关闭详情弹窗
    closeDetail() {
      this.selectedRecord = null
      this.$refs.detailPopup.close()
    },

    // 返回上一页
    goBack() {
      uni.navigateBack()
    },

    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return '--'
      
      try {
        // 使用TimeUtils确保UTC时间正确转换为北京时间
        return TimeUtils.formatUTCTime(dateStr, 'date')
      } catch (error) {
        console.error('日期格式化失败:', error, '原始日期:', dateStr)
        return dateStr
      }
    },

    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return '--'
      
      try {
        // 使用统一的 TimeUtils 工具类，确保UTC时间正确转换为北京时间
        return TimeUtils.formatUTCTime(timeStr, 'datetime')
      } catch (error) {
        console.error('时间格式化失败:', error, '原始时间:', timeStr)
        return '--'
      }
    },

    // 格式化扫码时间
    formatScanTime(timeStr) {
      if (!timeStr) return '--'
      
      try {
        return TimeUtils.formatScanTime(timeStr)
      } catch (error) {
        console.error('扫码时间格式化失败:', error, '原始时间:', timeStr)
        return '--'
      }
    },

    // 格式化日期用于API
    formatDateForAPI(date) {
      return date.toISOString().split('T')[0]
    }
  }
}
</script>

<style scoped>
.qr-history-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding: 20rpx;
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.back-btn {
  font-size: 36rpx;
  color: #2196F3;
  padding: 5rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.refresh-btn,
.filter-btn {
  font-size: 28rpx;
  color: #2196F3;
  padding: 10rpx;
}

.stats-overview {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.stat-card {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  text-align: center;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.stat-number {
  font-size: 36rpx;
  font-weight: bold;
  color: #2196F3;
  display: block;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

.filter-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.filter-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.filter-item {
  flex: 1;
  display: flex;
  align-items: center;
}

.filter-label {
  font-size: 28rpx;
  color: #333;
  width: 120rpx;
  margin-right: 10rpx;
}

.picker-input {
  flex: 1;
  padding: 10rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 26rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;
}

.reset-btn,
.apply-btn {
  flex: 1;
  padding: 20rpx;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.reset-btn {
  background: #f0f0f0;
  color: #333;
}

.apply-btn {
  background: #2196F3;
  color: white;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.history-item {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.history-item:active {
  transform: scale(0.98);
}

.record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.meal-info {
  display: flex;
  flex-direction: column;
}

.meal-type {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.record-date {
  font-size: 26rpx;
  color: #666;
}

.record-status {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24rpx;
}

.record-status.success {
  background: #4CAF50;
}

.record-status.failed {
  background: #f44336;
}

.record-details {
  margin-bottom: 15rpx;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
}

.detail-label {
  font-size: 26rpx;
  color: #666;
}

.detail-value {
  font-size: 26rpx;
  color: #333;
}

.qr-code {
  font-family: monospace;
  font-size: 22rpx;
  color: #2196F3;
  word-break: break-all;
}

.record-message {
  padding: 15rpx;
  background: #ffebee;
  border-radius: 8rpx;
  border-left: 4rpx solid #f44336;
}

.error-message {
  font-size: 24rpx;
  color: #f44336;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  color: #ccc;
  display: block;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.empty-tip {
  font-size: 24rpx;
  color: #999;
}

.loading-state {
  text-align: center;
  padding: 100rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

/* 弹窗样式 */
.detail-popup {
  width: 600rpx;
  background: white;
  border-radius: 16rpx;
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  font-size: 40rpx;
  color: #666;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup-content {
  padding: 30rpx;
}

.detail-section {
  margin-bottom: 20rpx;
}

.detail-section .detail-label {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.detail-section .detail-value {
  font-size: 28rpx;
  color: #333;
  display: block;
  word-break: break-all;
}

.qr-code-content {
  font-family: monospace;
  background: #f5f5f5;
  padding: 10rpx;
  border-radius: 6rpx;
  font-size: 24rpx;
}

.error-text {
  color: #f44336;
}

.popup-actions {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1rpx solid #eee;
}

.confirm-btn {
  flex: 1;
  padding: 20rpx;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
}
</style>
