<template>
  <view class="history-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">就餐确认历史</text>
      <view class="filter-btn" @click="showFilter = true">
        <text class="iconfont">🔍</text>
      </view>
    </view>

    <!-- 筛选条件 -->
    <view class="filter-bar" v-if="showFilter">
      <view class="filter-item">
        <text class="filter-label">日期范围:</text>
        <view class="date-range">
          <input 
            type="date" 
            v-model="filterParams.startDate" 
            class="date-input"
            @change="onFilterChange"
          />
          <text class="date-separator">至</text>
          <input 
            type="date" 
            v-model="filterParams.endDate" 
            class="date-input"
            @change="onFilterChange"
          />
        </view>
      </view>
      
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
      
      <view class="filter-actions">
        <button class="filter-btn" @click="resetFilter">重置</button>
        <button class="filter-btn primary" @click="applyFilter">应用</button>
      </view>
    </view>

    <!-- 历史记录列表 -->
    <view class="history-list">
      <view 
        v-for="record in historyRecords" 
        :key="record.orderId" 
        class="history-item"
      >
        <view class="record-header">
          <view class="meal-info">
            <text class="meal-type">{{ record.mealTypeName }}</text>
            <text class="dining-date">{{ record.diningDate }}</text>
          </view>
          <view class="status-badge" :class="record.diningStatus">
            <text>{{ record.confirmationText }}</text>
          </view>
        </view>
        
        <view class="record-details">
          <view class="detail-row">
            <text class="detail-label">报餐时间:</text>
            <text class="detail-value">{{ $formatRegisterTime(record.registerTime) }}</text>
          </view>
          
          <view class="detail-row" v-if="record.actualDiningTime">
            <text class="detail-label">就餐时间:</text>
            <text class="detail-value">{{ $formatDiningTime(record.actualDiningTime) }}</text>
          </view>
          
          <view class="detail-row" v-if="record.confirmationType">
            <text class="detail-label">确认方式:</text>
            <text class="detail-value">{{ get确认ationTypeText(record.confirmationType) }}</text>
          </view>
          
          <view class="detail-row" v-if="record.confirmedBy">
            <text class="detail-label">确认人:</text>
            <text class="detail-value">{{ record.confirmedBy }}</text>
          </view>
          
          <view class="detail-row" v-if="record.remark">
            <text class="detail-label">备注:</text>
            <text class="detail-value">{{ record.remark }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore">
      <button 
        class="load-more-btn" 
        @click="loadMore"
        :disabled="loading"
      >
        {{ loading ? '加载中...' : '加载更多' }}
      </button>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="!loading && historyRecords.length === 0">
      <text class="iconfont">📋</text>
      <text class="empty-text">暂无就餐确认记录</text>
      <button class="empty-btn" @click="resetFilter">重新筛选</button>
    </view>

    <!-- 加载状态 -->
    <view class="loading-state" v-if="loading && historyRecords.length === 0">
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import timeMixin from '@/mixins/timeMixin.js'
import { TimeUtils } from '@/utils/timeUtils.js'

export default {
  name: 'Dining确认ationHistory',
  mixins: [timeMixin],
  data() {
    return {
      historyRecords: [],
      loading: false,
      hasMore: true,
      showFilter: false,
      currentPage: 1,
      pageSize: 20,
      
      // 筛选参数
      filterParams: {
        startDate: '',
        endDate: '',
        mealType: '',
        diningStatus: ''
      },
      
      // 筛选选项
      mealTypeOptions: ['全部', '早餐', '午餐', '晚餐'],
      mealTypeIndex: 0,
      
      statusOptions: ['全部', '已报餐', '已就餐', '已取消'],
      statusIndex: 0,
      
      // 餐次类型映射
      mealTypeMap: {
        'breakfast': '早餐',
        'lunch': '午餐',
        'dinner': '晚餐'
      },
      
      // 状态映射
      statusMap: {
        'ordered': '已报餐',
        'dined': '已就餐',
        'cancelled': '已取消'
      }
    }
  },
  onLoad() {
    this.initPage()
  },
  onShow() {
    this.loadHistoryRecords()
  },
  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.loadMore()
    }
  },
  onPullDownRefresh() {
    this.refreshData()
  },
  methods: {
    // 初始化页面
    initPage() {
      // 设置默认日期范围（最近30天），使用TimeUtils确保iOS兼容性
      const today = TimeUtils.getCurrentDate()
      const thirtyDaysAgo = TimeUtils.getPreviousDay(today, 30)
      
      this.filterParams.endDate = today
      this.filterParams.startDate = thirtyDaysAgo
      
      this.loadHistoryRecords()
    },

    // 加载历史记录
    async loadHistoryRecords(refresh = false) {
      if (this.loading) return
      
      try {
        this.loading = true
        
        if (refresh) {
          this.currentPage = 1
          this.historyRecords = []
          this.hasMore = true
        }
        
        const params = {
          page: this.currentPage,
          pageSize: this.pageSize,
          ...this.getFilterParams()
        }
        
        const response = await api.diningConfirmation.getHistory(params)
        
        if (response.success) {
          const newRecords = response.data.records || []
          
          if (refresh) {
            this.historyRecords = newRecords
          } else {
            this.historyRecords = [...this.historyRecords, ...newRecords]
          }
          
          this.hasMore = response.data.hasMore || false
          this.currentPage++
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
        if (refresh) {
          uni.stopPullDownRefresh()
        }
      }
    },

    // 获取筛选参数
    getFilterParams() {
      const params = {}
      
      if (this.filterParams.startDate) {
        params.startDate = this.filterParams.startDate
      }
      
      if (this.filterParams.endDate) {
        params.endDate = this.filterParams.endDate
      }
      
      if (this.mealTypeIndex > 0) {
        const mealType = Object.keys(this.mealTypeMap)[this.mealTypeIndex - 1]
        params.mealType = mealType
      }
      
      if (this.statusIndex > 0) {
        const status = Object.keys(this.statusMap)[this.statusIndex - 1]
        params.diningStatus = status
      }
      
      return params
    },

    // 餐次类型选择
    onMealTypeChange(e) {
      this.mealTypeIndex = e.detail.value
    },

    // 状态选择
    onStatusChange(e) {
      this.statusIndex = e.detail.value
    },

    // 筛选条件变化
    onFilterChange() {
      // 可以在这里添加实时筛选逻辑
    },

    // 应用筛选
    applyFilter() {
      this.showFilter = false
      this.loadHistoryRecords(true)
    },

    // 重置筛选
    resetFilter() {
      this.mealTypeIndex = 0
      this.statusIndex = 0
      this.filterParams.startDate = ''
      this.filterParams.endDate = ''
      this.loadHistoryRecords(true)
    },

    // 加载更多
    loadMore() {
      this.loadHistoryRecords()
    },

    // 刷新数据
    refreshData() {
      this.loadHistoryRecords(true)
    },

    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return '--'
      
      try {
        // 使用TimeUtils格式化时间，确保iOS兼容性
        return TimeUtils.formatUTCTime(timeStr, 'datetime')
      } catch (error) {
        return timeStr
      }
    },

    // 获取确认方式文本
    get确认ationTypeText(type) {
      const typeMap = {
        'manual': '手动确认',
        'qr': '扫码确认',
        'admin': '管理员代确认'
      }
      return typeMap[type] || type
    }
  }
}
</script>

<style scoped>
.history-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 20rpx;
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.filter-btn {
  padding: 10rpx 20rpx;
  background: #f0f0f0;
  border-radius: 20rpx;
  font-size: 28rpx;
}

.filter-bar {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.filter-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.filter-label {
  font-size: 28rpx;
  color: #333;
  width: 140rpx;
}

.date-range {
  display: flex;
  align-items: center;
  flex: 1;
}

.date-input {
  flex: 1;
  padding: 10rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 26rpx;
}

.date-separator {
  margin: 0 10rpx;
  font-size: 26rpx;
  color: #666;
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

.filter-actions .filter-btn {
  flex: 1;
  padding: 20rpx;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
  background: #f0f0f0;
  color: #333;
}

.filter-actions .filter-btn.primary {
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

.dining-date {
  font-size: 26rpx;
  color: #666;
}

.status-badge {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: white;
}

.status-badge.ordered {
  background: #FF9800;
}

.status-badge.dined {
  background: #4CAF50;
}

.status-badge.cancelled {
  background: #f44336;
}

.record-details {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.detail-row {
  display: flex;
  align-items: center;
}

.detail-label {
  font-size: 26rpx;
  color: #666;
  width: 140rpx;
}

.detail-value {
  font-size: 26rpx;
  color: #333;
  flex: 1;
}

.load-more {
  text-align: center;
  margin: 30rpx 0;
}

.load-more-btn {
  padding: 20rpx 40rpx;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.load-more-btn:disabled {
  background: #ccc;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
}

.empty-state .iconfont {
  font-size: 120rpx;
  color: #ccc;
  display: block;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 30rpx;
}

.empty-btn {
  padding: 20rpx 40rpx;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.loading-state {
  text-align: center;
  padding: 100rpx 0;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}
</style>
