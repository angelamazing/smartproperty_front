<template>
  <view class="venue-schedule-tab">
    <!-- 筛选器 -->
    <view class="schedule-filters">
      <view class="filter-group">
        <text class="filter-label">选择日期</text>
        <picker
          mode="date"
          :value="selectedDate"
          :start="minDate"
          :end="maxDate"
          @change="handleDateChange"
          class="date-picker"
        >
          <view class="date-display">
            <text class="date-text">{{ formatDisplayDate(selectedDate) }}</text>
            <text class="date-icon">📅</text>
          </view>
        </picker>
      </view>
      
      <view class="filter-group">
        <text class="filter-label">场地类型</text>
        <picker
          :value="selectedVenueTypeIndex"
          :range="venueTypeOptions"
          range-key="label"
          @change="handleVenueTypeChange"
          class="type-picker"
        >
          <view class="type-display">
            <text class="type-text">{{ selectedVenueTypeLabel }}</text>
            <text class="type-icon">🏟️</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 时间轴表格 -->
    <view class="schedule-table" v-if="scheduleData.length > 0">
      <view class="table-header">
        <view class="time-column">时间</view>
        <view 
          v-for="venue in scheduleData" 
          :key="venue._id"
          class="venue-column"
        >
          <text class="venue-name">{{ venue.name }}</text>
          <text class="venue-type">{{ getVenueTypeText(venue.type) }}</text>
        </view>
      </view>
      
      <view class="table-body">
        <view 
          v-for="timeSlot in timeSlots" 
          :key="timeSlot.id"
          class="time-row"
        >
          <view class="time-cell">
            <text class="time-text">{{ timeSlot.time }}</text>
          </view>
          <view 
            v-for="venue in scheduleData" 
            :key="venue._id"
            class="venue-cell"
            :class="getCellClass(venue, timeSlot)"
            @click="handleCellClick(venue, timeSlot)"
          >
            <view v-if="getReservation(venue, timeSlot)" class="reservation-info">
              <text class="reservation-title">{{ getReservation(venue, timeSlot).title }}</text>
              <text class="reservation-user">{{ getReservation(venue, timeSlot).userName }}</text>
            </view>
            <view v-else class="empty-slot">
              <text class="empty-text">可预约</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else-if="!isLoading" class="empty-state">
      <text class="empty-icon">📅</text>
      <text class="empty-title">暂无场地安排</text>
      <text class="empty-desc">请选择其他日期或场地类型</text>
    </view>

    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-state">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载安排表中...</text>
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

    <!-- 图例 -->
    <view class="legend">
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
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { useDateFormatter } from '@/composables/useDateFormatter'

export default {
  name: 'VenueScheduleTab',
  props: {
    isLoading: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    }
  },
  emits: ['date-change', 'venue-type-change', 'cell-click', 'retry'],
  setup(props, { emit }) {
    const { formatDate, getToday, getMinDate, getMaxDate } = useDateFormatter()
    
    // 响应式数据
    const selectedDate = ref(getToday())
    const selectedVenueTypeIndex = ref(0)
    const scheduleData = ref([])
    const reservations = ref([])
    
    // 场地类型选项
    const venueTypeOptions = ref([
      { value: '', label: '全部类型' },
      { value: 'badminton', label: '羽毛球' },
      { value: 'pingpong', label: '乒乓球' },
      { value: 'basketball', label: '篮球' },
      { value: 'meeting', label: '会议室' },
      { value: 'other', label: '其他' }
    ])
    
    // 时间槽位 (8:00-22:00，每小时一个槽位)
    const timeSlots = ref([])
    
    // 计算属性
    const selectedVenueType = computed(() => {
      return venueTypeOptions.value[selectedVenueTypeIndex.value]?.value || ''
    })
    
    const selectedVenueTypeLabel = computed(() => {
      return venueTypeOptions.value[selectedVenueTypeIndex.value]?.label || '全部类型'
    })
    
    const minDate = computed(() => getMinDate())
    const maxDate = computed(() => getMaxDate())
    
    // 生成时间槽位
    const generateTimeSlots = () => {
      const slots = []
      for (let hour = 8; hour < 22; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`
        const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`
        slots.push({
          id: `slot_${hour}`,
          time: startTime,
          startTime,
          endTime,
          hour
        })
      }
      timeSlots.value = slots
    }
    
    // 获取场地类型文本
    const getVenueTypeText = (type) => {
      const typeMap = {
        'badminton': '羽毛球',
        'pingpong': '乒乓球',
        'basketball': '篮球',
        'meeting': '会议室',
        'other': '其他'
      }
      return typeMap[type] || '未知类型'
    }
    
    // 格式化显示日期
    const formatDisplayDate = (dateStr) => {
      if (!dateStr) return ''
      try {
        const date = new Date(dateStr)
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const day = date.getDate().toString().padStart(2, '0')
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        const weekday = weekdays[date.getDay()]
        return `${month}月${day}日 ${weekday}`
      } catch (error) {
        console.error('格式化日期失败:', error)
        return dateStr
      }
    }
    
    // 获取单元格样式类
    const getCellClass = (venue, timeSlot) => {
      const reservation = getReservation(venue, timeSlot)
      if (reservation) {
        return 'reserved'
      }
      if (venue.status === 'maintenance') {
        return 'maintenance'
      }
      return 'available'
    }
    
    // 获取指定场地和时间段的预约信息
    const getReservation = (venue, timeSlot) => {
      return reservations.value.find(reservation => 
        reservation.venueId === venue._id &&
        reservation.reservationDate === selectedDate.value &&
        reservation.startTime === timeSlot.startTime
      )
    }
    
    // 处理日期变化
    const handleDateChange = (e) => {
      selectedDate.value = e.detail.value
      emit('date-change', selectedDate.value)
    }
    
    // 处理场地类型变化
    const handleVenueTypeChange = (e) => {
      selectedVenueTypeIndex.value = e.detail.value
      emit('venue-type-change', selectedVenueType.value)
    }
    
    // 处理单元格点击
    const handleCellClick = (venue, timeSlot) => {
      const reservation = getReservation(venue, timeSlot)
      if (reservation) {
        // 点击已预约的单元格，查看预约详情
        emit('cell-click', { type: 'view', venue, timeSlot, reservation })
      } else if (venue.status !== 'maintenance') {
        // 点击可预约的单元格，创建预约
        emit('cell-click', { type: 'create', venue, timeSlot })
      }
    }
    
    // 处理重试
    const handleRetry = () => {
      emit('retry')
    }
    
    // 设置安排数据
    const setScheduleData = (data) => {
      scheduleData.value = data.venues || []
      reservations.value = data.reservations || []
    }
    
    // 监听日期变化
    watch(selectedDate, () => {
      emit('date-change', selectedDate.value)
    })
    
    // 监听场地类型变化
    watch(selectedVenueType, () => {
      emit('venue-type-change', selectedVenueType.value)
    })
    
    // 组件挂载时生成时间槽位
    onMounted(() => {
      generateTimeSlots()
    })
    
    return {
      // 数据
      selectedDate,
      selectedVenueTypeIndex,
      scheduleData,
      reservations,
      venueTypeOptions,
      timeSlots,
      
      // 计算属性
      selectedVenueType,
      selectedVenueTypeLabel,
      minDate,
      maxDate,
      
      // 方法
      getVenueTypeText,
      formatDisplayDate,
      getCellClass,
      getReservation,
      handleDateChange,
      handleVenueTypeChange,
      handleCellClick,
      handleRetry,
      setScheduleData
    }
  }
}
</script>

<style lang="scss" scoped>
.venue-schedule-tab {
  padding: 20rpx;
  background: #f5f5f5;
  min-height: 100vh;
}

/* 筛选器 */
.schedule-filters {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 30rpx;
}

.filter-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.filter-label {
  font-size: 26rpx;
  color: #333;
  font-weight: 600;
}

.date-picker,
.type-picker {
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
  border: 2rpx solid #e9ecef;
  transition: all 0.3s ease;
}

.date-display,
.type-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-text,
.type-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.date-icon,
.type-icon {
  font-size: 24rpx;
  color: #666;
}

/* 时间轴表格 */
.schedule-table {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  margin-bottom: 20rpx;
}

.table-header {
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
}

.time-column {
  width: 120rpx;
  padding: 20rpx;
  text-align: center;
  font-size: 24rpx;
  border-right: 1rpx solid rgba(255, 255, 255, 0.2);
}

.venue-column {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  border-right: 1rpx solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.venue-name {
  font-size: 24rpx;
  font-weight: 600;
}

.venue-type {
  font-size: 20rpx;
  opacity: 0.8;
}

.table-body {
  max-height: 600rpx;
  overflow-y: auto;
}

.time-row {
  display: flex;
  border-bottom: 1rpx solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
  }
}

.time-cell {
  width: 120rpx;
  padding: 20rpx;
  text-align: center;
  background: #f8f9fa;
  border-right: 1rpx solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
}

.time-text {
  font-size: 24rpx;
  color: #666;
  font-weight: 500;
}

.venue-cell {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  border-right: 1rpx solid #e9ecef;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:last-child {
    border-right: none;
  }
  
  &.available {
    background: #d4edda;
    color: #155724;
    
    &:active {
      background: #c3e6cb;
      transform: scale(0.98);
    }
  }
  
  &.reserved {
    background: #f8d7da;
    color: #721c24;
    cursor: pointer;
    
    &:active {
      background: #f5c6cb;
      transform: scale(0.98);
    }
  }
  
  &.maintenance {
    background: #fff3cd;
    color: #856404;
    cursor: not-allowed;
  }
}

.reservation-info {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
  width: 100%;
}

.reservation-title {
  font-size: 20rpx;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.reservation-user {
  font-size: 18rpx;
  opacity: 0.8;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-slot {
  width: 100%;
}

.empty-text {
  font-size: 20rpx;
  color: #28a745;
  font-weight: 500;
}

/* 图例 */
.legend {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.legend-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 20rpx;
  display: block;
}

.legend-items {
  display: flex;
  gap: 30rpx;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.legend-color {
  width: 24rpx;
  height: 24rpx;
  border-radius: 4rpx;
  
  &.available {
    background: #d4edda;
  }
  
  &.reserved {
    background: #f8d7da;
  }
  
  &.maintenance {
    background: #fff3cd;
  }
}

.legend-text {
  font-size: 24rpx;
  color: #666;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80rpx 40rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  display: block;
}

.empty-title {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
  margin-bottom: 12rpx;
  display: block;
}

.empty-desc {
  font-size: 26rpx;
  color: #666;
  display: block;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 80rpx 40rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f3f3f3;
  border-top: 4rpx solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.error-state {
  text-align: center;
  padding: 80rpx 40rpx;
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.error-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  display: block;
}

.error-title {
  font-size: 32rpx;
  color: #e74c3c;
  font-weight: 600;
  margin-bottom: 12rpx;
  display: block;
}

.error-desc {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 30rpx;
  display: block;
}

.retry-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12rpx;
  padding: 20rpx 40rpx;
  font-size: 28rpx;
  font-weight: 600;
  box-shadow: 0 4rpx 15rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  
  &:active {
    transform: scale(0.98);
  }
}

.btn-text {
  color: white;
}

/* 响应式设计 */
@media screen and (max-width: 600rpx) {
  .schedule-filters {
    flex-direction: column;
    gap: 20rpx;
  }
  
  .legend-items {
    flex-direction: column;
    gap: 20rpx;
  }
  
  .time-column {
    width: 100rpx;
  }
  
  .time-cell {
    width: 100rpx;
  }
}
</style>
