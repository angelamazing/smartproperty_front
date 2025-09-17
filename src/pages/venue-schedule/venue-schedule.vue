<template>
  <view class="schedule-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-content">
        <button class="back-btn" @click="goBack">
          <text class="back-icon">❮</text>
        </button>
        <text class="header-title">场地安排表</text>
        <view class="header-placeholder"></view>
      </view>
    </view>

    <!-- 筛选区域 -->
    <view class="filter-section">
      <view class="filter-row">
        <view class="filter-item">
          <text class="filter-label">日期</text>
          <picker 
            mode="date" 
            :value="selectedDate" 
            @change="onDateChange"
            class="date-picker"
          >
            <view class="picker-display">
              <text>{{ formatDisplayDate(selectedDate) }}</text>
              <text class="picker-icon">📅</text>
            </view>
          </picker>
        </view>
        
        <view class="filter-item">
          <text class="filter-label">场地类型</text>
          <picker 
            mode="selector" 
            :range="venueTypeOptions" 
            :value="venueTypeIndex" 
            @change="onVenueTypeChange"
            class="type-picker"
          >
            <view class="picker-display">
              <text>{{ selectedVenueType }}</text>
              <text class="picker-icon">🏟️</text>
            </view>
          </picker>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 安排表内容 -->
    <view v-else-if="scheduleData && scheduleData.length > 0" class="schedule-content">
      <!-- 时间轴表格 -->
      <view class="schedule-table">
        <view class="table-header">
          <view class="time-column">时间</view>
          <view 
            class="venue-column" 
            v-for="venue in venues" 
            :key="venue.id"
            @click="viewVenueDetail(venue)"
          >
            <text class="venue-name">{{ venue.name }}</text>
            <text class="venue-type">{{ getVenueTypeText(venue.type) }}</text>
          </view>
        </view>
        
        <view 
          class="table-row" 
          v-for="timeSlot in scheduleData" 
          :key="timeSlot.id"
        >
          <view class="time-column">
            <text class="time-text">{{ timeSlot.time }}</text>
          </view>
          <view 
            class="venue-column" 
            v-for="venue in venues" 
            :key="venue.id"
            :class="getCellClass(venue, timeSlot)"
            @click="handleCellClick(venue, timeSlot)"
          >
            <text class="cell-text">{{ getCellText(venue, timeSlot) }}</text>
            <text v-if="getCellSubText(venue, timeSlot)" class="cell-sub-text">
              {{ getCellSubText(venue, timeSlot) }}
            </text>
          </view>
        </view>
      </view>

      <!-- 图例说明 -->
      <view class="legend-section">
        <text class="legend-title">图例说明</text>
        <view class="legend-items">
          <view class="legend-item">
            <view class="legend-color available"></view>
            <text class="legend-text">可预约</text>
          </view>
          <view class="legend-item">
            <view class="legend-color reserved"></view>
            <text class="legend-text">已预约</text>
          </view>
          <view class="legend-item">
            <view class="legend-color maintenance"></view>
            <text class="legend-text">维护中</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-container">
      <view class="empty-icon">📅</view>
      <text class="empty-text">该日期暂无场地安排</text>
      <text class="empty-desc">请选择其他日期或场地类型</text>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: 'VenueSchedule',
  mixins: [timeMixin],
  data() {
    return {
      isLoading: false,
      selectedDate: '',
      selectedVenueType: '全部',
      scheduleData: [],
      venues: [],
      venueTypes: []
    }
  },

  computed: {
    venueTypeOptions() {
      return this.venueTypes.map(type => type.label)
    },

    venueTypeIndex() {
      return this.venueTypes.findIndex(type => type.label === this.selectedVenueType)
    }
  },

  onLoad() {
    this.initPage()
  },

  methods: {
    /**
     * 初始化页面
     */
    async initPage() {
      try {
        this.isLoading = true
        
        // 设置默认日期为今天
        this.selectedDate = this.$getCurrentDate()
        
        // 加载数据
        await this.loadInitialData()
      } catch (error) {
        console.error('页面初始化失败:', error)
        uni.showToast({
          title: '页面加载失败',
          icon: 'none'
        })
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 加载初始数据
     */
    async loadInitialData() {
      try {
        const [schedule, types] = await Promise.all([
          this.loadScheduleData(),
          this.loadVenueTypes()
        ])
        
        this.scheduleData = schedule
        this.venueTypes = types
      } catch (error) {
        console.error('加载初始数据失败:', error)
      }
    },

    /**
     * 加载场地类型
     */
    async loadVenueTypes() {
      try {
        const result = await api.venue.getTypes()
        
        if (result && result.success) {
          const types = result.data || []
          return [
            { label: '全部', value: 'all' },
            ...types.map(type => ({
              label: type.label,
              value: type.value,
              count: type.count
            }))
          ]
        }
        return []
      } catch (error) {
        console.error('加载场地类型失败:', error)
        return []
      }
    },

    /**
     * 加载安排表数据
     */
    async loadScheduleData() {
      try {
        const venueType = this.selectedVenueType === '全部' ? '' : this.selectedVenueType
        const result = await api.venue.getScheduleTable(this.selectedDate, venueType)
        
        if (result && result.success) {
          const data = result.data || []
          this.venues = this.extractVenues(data)
          return data
        }
        return []
      } catch (error) {
        console.error('加载安排表失败:', error)
        return []
      }
    },

    /**
     * 从安排表数据中提取场地信息
     */
    extractVenues(scheduleData) {
      if (!scheduleData || scheduleData.length === 0) return []
      
      const firstRow = scheduleData[0]
      if (!firstRow || !firstRow.venues) return []
      
      return firstRow.venues
    },

    /**
     * 获取单元格样式类
     */
    getCellClass(venue, timeSlot) {
      const cellData = this.getCellData(venue, timeSlot)
      if (!cellData) return 'cell-empty'
      
      return `cell-${cellData.status}`
    },

    /**
     * 获取单元格数据
     */
    getCellData(venue, timeSlot) {
      if (!timeSlot.venues) return null
      
      return timeSlot.venues.find(v => v.id === venue.id)
    },

    /**
     * 获取单元格文本
     */
    getCellText(venue, timeSlot) {
      const cellData = this.getCellData(venue, timeSlot)
      if (!cellData) return ''
      
      switch (cellData.status) {
        case 'available':
          return '可预约'
        case 'reserved':
          return cellData.userName || '已预约'
        case 'maintenance':
          return '维护中'
        default:
          return ''
      }
    },

    /**
     * 获取单元格副文本
     */
    getCellSubText(venue, timeSlot) {
      const cellData = this.getCellData(venue, timeSlot)
      if (!cellData) return ''
      
      if (cellData.status === 'reserved' && cellData.purpose) {
        return cellData.purpose
      }
      
      return ''
    },

    /**
     * 处理单元格点击
     */
    handleCellClick(venue, timeSlot) {
      const cellData = this.getCellData(venue, timeSlot)
      
      if (!cellData) return
      
      if (cellData.status === 'available') {
        // 跳转到预约页面
        uni.navigateTo({
          url: `/pages/reservation/reservation?venueId=${venue.id}&date=${this.selectedDate}&timeSlot=${timeSlot.id}`
        })
      } else if (cellData.status === 'reserved') {
        // 显示预约详情
        this.showReservationDetail(cellData)
      }
    },

    /**
     * 显示预约详情
     */
    showReservationDetail(reservationData) {
      uni.showModal({
        title: '预约详情',
        content: `预约人：${reservationData.userName || '未知'}\n用途：${reservationData.purpose || '无'}`,
        showCancel: false,
        confirmText: '确定'
      })
    },

    /**
     * 查看场地详情
     */
    viewVenueDetail(venue) {
      uni.navigateTo({
        url: `/pages/venue-detail/venue-detail?id=${venue.id}`
      })
    },

    /**
     * 获取场地类型文本
     */
    getVenueTypeText(type) {
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
     * 日期变化
     */
    onDateChange(e) {
      this.selectedDate = e.detail.value
      this.loadScheduleData()
    },

    /**
     * 场地类型变化
     */
    onVenueTypeChange(e) {
      this.selectedVenueType = this.venueTypeOptions[e.detail.value]
      this.loadScheduleData()
    },

    /**
     * 格式化显示日期
     */
    formatDisplayDate(dateStr) {
      if (!dateStr) return ''
      
      try {
        const targetDate = this.$createDate(dateStr)
        if (!targetDate || isNaN(targetDate.getTime())) return ''
        
        const today = this.$createSafeDate()
        if (!today || isNaN(today.getTime())) {
          console.warn('无法获取当前日期，使用目标日期格式化')
          return this.formatDateWithWeekday(targetDate)
        }
        
        const tomorrow = this.$createDate(today)
        if (!tomorrow || isNaN(tomorrow.getTime())) {
          console.warn('无法创建明天日期，使用目标日期格式化')
          return this.formatDateWithWeekday(targetDate)
        }
        
        tomorrow.setDate(today.getDate() + 1)
        
        // 判断是否为今天或明天
        if (this.isSameDate(targetDate, today)) {
          return `今天 ${this.formatDateShort(targetDate)}`
        } else if (this.isSameDate(targetDate, tomorrow)) {
          return `明天 ${this.formatDateShort(targetDate)}`
        } else {
          return this.formatDateWithWeekday(targetDate)
        }
      } catch (error) {
        console.error('日期格式化错误:', error)
        return ''
      }
    },

    /**
     * 判断是否为同一天
     */
    isSameDate(date1, date2) {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate()
    },

    /**
     * 格式化短日期
     */
    formatDateShort(date) {
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${month}-${day}`
    },

    /**
     * 格式化带星期的日期
     */
    formatDateWithWeekday(date) {
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const weekday = weekdays[date.getDay()]
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${month}-${day} ${weekday}`
    },

    /**
     * 返回上一页
     */
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.schedule-container {
  min-height: 100vh;
  background: #f8f9fa;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20rpx 30rpx 30rpx;
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.back-btn:active {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(0.95);
}

.back-icon {
  font-size: 24rpx;
  color: white;
  font-weight: bold;
}

.header-title {
  font-size: 32rpx;
  font-weight: 600;
}

.header-placeholder {
  width: 60rpx;
}

/* 筛选区域 */
.filter-section {
  background: white;
  padding: 30rpx;
  margin: 20rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.filter-row {
  display: flex;
  gap: 20rpx;
}

.filter-item {
  flex: 1;
}

.filter-label {
  display: block;
  font-size: 26rpx;
  color: #333;
  margin-bottom: 15rpx;
  font-weight: 600;
}

.picker-display {
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 24rpx;
  color: #333;
}

.picker-icon {
  font-size: 24rpx;
  color: #999;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f3f3f3;
  border-top: 4rpx solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 26rpx;
  color: #666;
}

/* 安排表内容 */
.schedule-content {
  padding: 0 20rpx 20rpx;
}

.schedule-table {
  background: white;
  border-radius: 20rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  margin-bottom: 30rpx;
}

.table-header {
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.time-column {
  flex: 0 0 120rpx;
  padding: 20rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 600;
  border-right: 1rpx solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.venue-column {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  font-size: 22rpx;
  font-weight: 600;
  border-right: 1rpx solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

.venue-column:last-child {
  border-right: none;
}

.venue-column:active {
  background: rgba(255, 255, 255, 0.1);
}

.venue-name {
  display: block;
  font-size: 24rpx;
  margin-bottom: 8rpx;
}

.venue-type {
  display: block;
  font-size: 20rpx;
  opacity: 0.8;
}

.table-row {
  display: flex;
  border-bottom: 1rpx solid #e9ecef;
}

.table-row:last-child {
  border-bottom: none;
}

.table-row .time-column {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
  border-right: 1rpx solid #e9ecef;
}

.time-text {
  font-size: 22rpx;
}

.table-row .venue-column {
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-height: 80rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.table-row .venue-column:active {
  transform: scale(0.98);
}

/* 单元格状态样式 */
.cell-empty {
  background: #f8f9fa;
  color: #999;
}

.cell-available {
  background: rgba(40, 167, 69, 0.1);
  color: #28a745;
  border: 2rpx solid rgba(40, 167, 69, 0.3);
}

.cell-available:active {
  background: rgba(40, 167, 69, 0.2);
}

.cell-reserved {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  border: 2rpx solid rgba(220, 53, 69, 0.3);
}

.cell-maintenance {
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
  border: 2rpx solid rgba(255, 193, 7, 0.3);
}

.cell-text {
  font-size: 20rpx;
  font-weight: 600;
  margin-bottom: 4rpx;
}

.cell-sub-text {
  font-size: 18rpx;
  opacity: 0.8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* 图例说明 */
.legend-section {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.legend-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.legend-items {
  display: flex;
  gap: 30rpx;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.legend-color {
  width: 24rpx;
  height: 24rpx;
  border-radius: 4rpx;
  border: 2rpx solid;
}

.legend-color.available {
  background: rgba(40, 167, 69, 0.1);
  border-color: rgba(40, 167, 69, 0.3);
}

.legend-color.reserved {
  background: rgba(220, 53, 69, 0.1);
  border-color: rgba(220, 53, 69, 0.3);
}

.legend-color.maintenance {
  background: rgba(255, 193, 7, 0.1);
  border-color: rgba(255, 193, 7, 0.3);
}

.legend-text {
  font-size: 24rpx;
  color: #666;
}

/* 空状态 */
.empty-container {
  text-align: center;
  padding: 100rpx 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
  opacity: 0.5;
}

.empty-text {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 15rpx;
}

.empty-desc {
  font-size: 24rpx;
  color: #666;
}

/* 响应式设计 */
@media screen and (max-width: 600rpx) {
  .filter-row {
    flex-direction: column;
    gap: 15rpx;
  }
  
  .legend-items {
    flex-direction: column;
    gap: 15rpx;
  }
  
  .time-column {
    flex: 0 0 100rpx;
    font-size: 20rpx;
  }
  
  .venue-column {
    font-size: 20rpx;
    padding: 15rpx 10rpx;
  }
  
  .venue-name {
    font-size: 20rpx;
  }
  
  .venue-type {
    font-size: 18rpx;
  }
}
</style>
