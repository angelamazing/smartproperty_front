<template>
  <view class="venue-detail-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-content">
        <button class="back-btn" @click="goBack">
          <text class="back-icon">❮</text>
        </button>
        <text class="header-title">场地详情</text>
        <view class="header-placeholder"></view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <!-- 场地详情内容 -->
    <view v-else-if="venueInfo" class="venue-content">
      <!-- 场地图片 -->
      <view class="venue-image-section">
        <image 
          :src="venueInfo.image || '/static/default-venue.png'" 
          class="venue-image" 
          mode="aspectFill"
        />
        <view class="venue-status-badge" :class="getStatusClass(venueInfo.status)">
          <text>{{ getStatusText(venueInfo.status) }}</text>
        </view>
      </view>

      <!-- 场地基本信息 -->
      <view class="venue-info-section">
        <view class="venue-header">
          <text class="venue-name">{{ venueInfo.name }}</text>
          <view class="venue-type">
            <text class="type-icon">{{ getTypeIcon(venueInfo.type) }}</text>
            <text class="type-text">{{ getTypeText(venueInfo.type) }}</text>
          </view>
        </view>

        <view class="venue-description">
          <text class="description-text">{{ venueInfo.description || '暂无描述' }}</text>
        </view>

        <view class="venue-details">
          <view class="detail-item">
            <text class="detail-label">场地编码</text>
            <text class="detail-value">{{ venueInfo.code || '暂无' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">容纳人数</text>
            <text class="detail-value">{{ venueInfo.capacity || 0 }}人</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">每小时价格</text>
            <text class="detail-value price">¥{{ venueInfo.pricePerHour || '0.00' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">开放时间</text>
            <text class="detail-value">{{ venueInfo.openTime || '08:00' }} - {{ venueInfo.closeTime || '22:00' }}</text>
          </view>
          <view class="detail-item">
            <text class="detail-label">位置</text>
            <text class="detail-value">{{ venueInfo.location || '暂无位置信息' }}</text>
          </view>
        </view>

        <!-- 设施特色 -->
        <view v-if="venueInfo.features && venueInfo.features.length > 0" class="features-section">
          <text class="section-title">设施特色</text>
          <view class="features-list">
            <text 
              v-for="feature in venueInfo.features" 
              :key="feature"
              class="feature-tag"
            >
              {{ feature }}
            </text>
          </view>
        </view>

        <!-- 预约统计 -->
        <view class="stats-section">
          <text class="section-title">今日预约统计</text>
          <view class="stats-grid">
            <view class="stat-item">
              <text class="stat-value">{{ todayReservations }}</text>
              <text class="stat-label">已预约</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ availableSlots }}</text>
              <text class="stat-label">可预约</text>
            </view>
            <view class="stat-item">
              <text class="stat-value">{{ totalSlots }}</text>
              <text class="stat-label">总时段</text>
            </view>
          </view>
        </view>

        <!-- 预约规则 -->
        <view class="rules-section">
          <text class="section-title">预约规则</text>
          <view class="rules-list">
            <view class="rule-item">
              <text class="rule-label">最小预约时长</text>
              <text class="rule-value">{{ venueInfo.minBookingHours || 1 }}小时</text>
            </view>
            <view class="rule-item">
              <text class="rule-label">最大预约时长</text>
              <text class="rule-value">{{ venueInfo.maxBookingHours || 4 }}小时</text>
            </view>
            <view class="rule-item">
              <text class="rule-label">是否需要审批</text>
              <text class="rule-value">{{ venueInfo.requireApproval ? '是' : '否' }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 今日时间安排 -->
      <view class="schedule-section">
        <view class="section-header">
          <text class="section-title">今日时间安排</text>
          <picker 
            mode="date" 
            :value="selectedDate" 
            @change="onDateChange"
            class="date-picker"
          >
            <view class="date-picker-btn">
              <text>{{ formatDisplayDate(selectedDate) }}</text>
              <text class="picker-icon">📅</text>
            </view>
          </picker>
        </view>

        <view v-if="timeSlots && timeSlots.length > 0" class="time-slots-grid">
          <view 
            v-for="slot in timeSlots" 
            :key="slot.id"
            class="time-slot-item"
            :class="[getSlotClass(slot), { 'selected': isSlotSelected(slot) }]"
            @click="toggleTimeSlot(slot)"
          >
            <text class="slot-time">{{ slot.startTime }}-{{ slot.endTime }}</text>
            <text class="slot-status">{{ getSlotStatusText(slot.status) }}</text>
            <text v-if="slot.price > 0" class="slot-price">¥{{ slot.price }}</text>
            <text v-if="isSlotSelected(slot)" class="slot-selected">✓</text>
          </view>
        </view>

        <!-- 快速预约提示 -->
        <view v-if="selectedSlots.length > 0" class="quick-reservation">
          <text class="quick-title">已选择 {{ selectedSlots.length }} 个时段</text>
          <text class="quick-time">{{ getSelectedTimeRange() }}</text>
          <text class="quick-price">总价: ¥{{ getTotalPrice() }}</text>
          <button class="quick-btn" @click="quickReservation">快速预约</button>
        </view>

        <view v-else class="empty-slots">
          <text class="empty-text">该日期暂无时间段</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="action-section">
        <button 
          class="action-btn primary" 
          @click="makeReservation"
          :disabled="!hasAvailableSlots"
        >
          立即预约
        </button>
        <button 
          class="action-btn secondary" 
          @click="viewSchedule"
        >
          查看安排表
        </button>
      </view>
    </view>

    <!-- 错误状态 -->
    <view v-else class="error-container">
      <text class="error-icon">⚠️</text>
      <text class="error-text">场地信息加载失败</text>
      <button class="retry-btn" @click="loadVenueDetail">重试</button>
    </view>

    <!-- 预约弹窗 -->
    <view class="reservation-modal" v-if="showReservationModal">
      <view class="modal-mask" @click="closeReservationModal"></view>
      <view class="modal-content">
        <view class="modal-header">
          <text class="modal-title">场地预约</text>
          <button class="close-btn" @click="closeReservationModal">×</button>
        </view>
        
        <view class="modal-body">
          <view class="venue-summary">
            <text class="summary-title">{{ venueInfo.name }}</text>
            <text class="summary-type">{{ getTypeText(venueInfo.type) }}</text>
            <text class="summary-price">¥{{ selectedTimeSlot.price || venueInfo.pricePerHour }}/小时</text>
          </view>

          <view class="reservation-form">
            <view class="form-row">
              <text class="form-label">预约日期</text>
              <text class="form-value">{{ formatDisplayDate(selectedDate) }}</text>
            </view>
            <view class="form-row">
              <text class="form-label">预约时段</text>
              <text class="form-value">{{ selectedTimeSlot.startTime }}-{{ selectedTimeSlot.endTime }}</text>
            </view>
            <view class="form-row">
              <text class="form-label">预约人</text>
              <input 
                class="form-input" 
                v-model="reservationForm.userName" 
                placeholder="请输入预约人姓名"
              />
            </view>
            <view class="form-row">
              <text class="form-label">联系电话</text>
              <input 
                class="form-input" 
                v-model="reservationForm.phoneNumber" 
                placeholder="请输入联系电话"
                type="number"
              />
            </view>
            <view class="form-row">
              <text class="form-label">预约用途</text>
              <textarea 
                class="form-textarea" 
                v-model="reservationForm.purpose" 
                placeholder="请输入预约用途"
                maxlength="100"
              ></textarea>
            </view>
            <view class="form-row">
              <text class="form-label">备注信息</text>
              <textarea 
                class="form-textarea" 
                v-model="reservationForm.remark" 
                placeholder="请输入备注信息（可选）"
                maxlength="200"
              ></textarea>
            </view>
          </view>
        </view>

        <view class="modal-footer">
          <button class="btn-secondary" @click="closeReservationModal">取消</button>
          <button 
            class="btn-primary" 
            @click="submitReservation"
            :disabled="!canSubmitReservation || isSubmitting"
            :loading="isSubmitting"
          >
            {{ isSubmitting ? '提交中...' : '确认预约' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: 'VenueDetail',
  mixins: [timeMixin],
  data() {
    return {
      venueId: '',
      isLoading: true,
      venueInfo: null,
      selectedDate: '',
      timeSlots: [],
      showReservationModal: false,
      selectedTimeSlot: {},
      reservationForm: {
        userName: '',
        phoneNumber: '',
        purpose: '',
        remark: ''
      },
      isSubmitting: false,
      selectedSlots: []
    }
  },

  computed: {
    hasAvailableSlots() {
      return this.timeSlots && this.timeSlots.some(slot => slot.status === 'available')
    },

    canSubmitReservation() {
      return this.reservationForm.userName && 
             this.reservationForm.phoneNumber && 
             this.reservationForm.purpose
    },

    todayReservations() {
      if (!this.timeSlots) return 0
      return this.timeSlots.filter(slot => slot.status === 'reserved').length
    },

    availableSlots() {
      if (!this.timeSlots) return 0
      return this.timeSlots.filter(slot => slot.status === 'available').length
    },

    totalSlots() {
      return this.timeSlots ? this.timeSlots.length : 0
    }
  },

  onLoad(options) {
    if (options.id) {
      this.venueId = options.id
      this.selectedDate = this.$getCurrentDate()
      this.loadVenueDetail()
    } else {
      uni.showToast({
        title: '场地ID不能为空',
        icon: 'error'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  },

  methods: {
    /**
     * 加载场地详情
     */
    async loadVenueDetail() {
      try {
        this.isLoading = true
        
        const result = await api.venue.getDetail(this.venueId)
        
        if (result && result.success) {
          this.venueInfo = result.data
          await this.loadTimeSlots()
        } else {
          throw new Error(result.message || '加载失败')
        }
      } catch (error) {
        console.error('加载场地详情失败:', error)
        uni.showToast({
          title: error.message || '加载失败',
          icon: 'error'
        })
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 加载时间段
     */
    async loadTimeSlots() {
      try {
        const result = await api.venue.getSchedule(this.venueId, this.selectedDate)
        
        if (result && result.success) {
          this.timeSlots = result.data || []
        } else {
          // 如果API失败，使用本地生成的时间段
          this.timeSlots = this.generateTimeSlots(this.venueInfo, this.selectedDate)
        }
      } catch (error) {
        console.error('加载时间段失败:', error)
        // 使用本地生成的时间段作为备选
        this.timeSlots = this.generateTimeSlots(this.venueInfo, this.selectedDate)
      }
    },

    /**
     * 生成时间段
     */
    generateTimeSlots(venue, date) {
      if (!venue || !date) return []
      
      try {
        const slots = []
        const slotDuration = 60 // 1小时一个时间段
        
        // 解析开放时间
        const openTime = this.parseTime(venue.openTime || '08:00:00')
        const closeTime = this.parseTime(venue.closeTime || '22:00:00')
        
        if (!openTime || !closeTime) return []
        
        let currentTime = new Date(openTime)
        const endTime = new Date(closeTime)
        
        while (currentTime < endTime) {
          const slotEndTime = new Date(currentTime.getTime() + slotDuration * 60 * 1000)
          
          // 如果结束时间超过场地关闭时间，则调整
          if (slotEndTime > endTime) {
            break
          }
          
          const slot = {
            id: `${venue._id}_${this.formatTimeForSlot(currentTime)}_${this.formatTimeForSlot(slotEndTime)}`,
            startTime: this.formatTimeForSlot(currentTime),
            endTime: this.formatTimeForSlot(slotEndTime),
            status: 'available', // 默认可用，后续会检查预约状态
            price: venue.pricePerHour || 0
          }
          
          slots.push(slot)
          currentTime = slotEndTime
        }
        
        return slots
      } catch (error) {
        console.error('生成时间段失败:', error)
        return []
      }
    },

    /**
     * 解析时间字符串
     */
    parseTime(timeStr) {
      if (!timeStr) return null
      
      try {
        const [hours, minutes, seconds] = timeStr.split(':').map(Number)
        const today = new Date()
        today.setHours(hours || 0, minutes || 0, seconds || 0, 0)
        return today
      } catch (error) {
        console.error('解析时间失败:', error)
        return null
      }
    },

    /**
     * 格式化时间为时间段格式
     */
    formatTimeForSlot(date) {
      if (!date) return ''
      
      try {
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${hours}:${minutes}`
      } catch (error) {
        console.error('格式化时间失败:', error)
        return ''
      }
    },

    /**
     * 选择时间段
     */
    selectTimeSlot(slot) {
      if (slot.status === 'available') {
        this.selectedTimeSlot = slot
        this.showReservationModal = true
      }
    },

    /**
     * 切换时间段选择
     */
    toggleTimeSlot(slot) {
      if (slot.status !== 'available') return
      
      const index = this.selectedSlots.findIndex(s => s.id === slot.id)
      if (index > -1) {
        this.selectedSlots.splice(index, 1)
      } else {
        this.selectedSlots.push(slot)
      }
    },

    /**
     * 判断时间段是否被选中
     */
    isSlotSelected(slot) {
      return this.selectedSlots.some(s => s.id === slot.id)
    },

    /**
     * 获取选中时间段的时间范围
     */
    getSelectedTimeRange() {
      if (this.selectedSlots.length === 0) return ''
      
      const sortedSlots = this.selectedSlots.sort((a, b) => a.startTime.localeCompare(b.startTime))
      const startTime = sortedSlots[0].startTime
      const endTime = sortedSlots[sortedSlots.length - 1].endTime
      
      return `${startTime} - ${endTime}`
    },

    /**
     * 获取总价格
     */
    getTotalPrice() {
      return this.selectedSlots.reduce((total, slot) => total + (slot.price || 0), 0).toFixed(2)
    },

    /**
     * 快速预约
     */
    quickReservation() {
      if (this.selectedSlots.length === 0) return
      
      // 设置选中的时间段为第一个选中的时间段
      this.selectedTimeSlot = this.selectedSlots[0]
      this.showReservationModal = true
    },

    /**
     * 立即预约
     */
    makeReservation() {
      const availableSlot = this.timeSlots.find(slot => slot.status === 'available')
      if (availableSlot) {
        this.selectTimeSlot(availableSlot)
      } else {
        uni.showToast({
          title: '该日期暂无可用时间段',
          icon: 'none'
        })
      }
    },

    /**
     * 查看安排表
     */
    viewSchedule() {
      uni.navigateTo({
        url: `/pages/reservation/reservation?tab=schedule&venueType=${this.venueInfo.type}`
      })
    },

    /**
     * 关闭预约弹窗
     */
    closeReservationModal() {
      this.showReservationModal = false
      this.selectedTimeSlot = {}
      this.reservationForm = {
        userName: '',
        phoneNumber: '',
        purpose: '',
        remark: ''
      }
    },

    /**
     * 提交预约
     */
    async submitReservation() {
      if (!this.canSubmitReservation) return
      
      try {
        this.isSubmitting = true
        
        const reservationData = {
          venueId: this.venueId,
          date: this.selectedDate,
          startTime: this.selectedTimeSlot.startTime,
          endTime: this.selectedTimeSlot.endTime,
          ...this.reservationForm
        }
        
        const result = await api.venue.submitReservation(reservationData)
        
        if (result && result.success) {
          uni.showToast({
            title: '预约提交成功',
            icon: 'success'
          })
          
          // 关闭弹窗
          this.closeReservationModal()
          
          // 刷新时间段
          await this.loadTimeSlots()
        } else {
          throw new Error(result.message || '提交失败')
        }
      } catch (error) {
        console.error('提交预约失败:', error)
        uni.showToast({
          title: error.message || '提交失败，请重试',
          icon: 'none'
        })
      } finally {
        this.isSubmitting = false
      }
    },

    /**
     * 日期变化
     */
    onDateChange(e) {
      this.selectedDate = e.detail.value
      this.loadTimeSlots()
    },

    /**
     * 返回上一页
     */
    goBack() {
      uni.navigateBack()
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
        'active': '开放',
        'inactive': '关闭',
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
    }
  }
}
</script>

<style lang="scss" scoped>
.venue-detail-container {
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

/* 场地内容 */
.venue-content {
  padding: 0 30rpx 30rpx;
}

/* 场地图片 */
.venue-image-section {
  position: relative;
  margin: -20rpx -30rpx 30rpx;
  height: 400rpx;
  overflow: hidden;
}

.venue-image {
  width: 100%;
  height: 100%;
  background: #f8f9fa;
}

.venue-status-badge {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 600;
  color: white;
}

.status-active {
  background: #27ae60;
}

.status-inactive {
  background: #e74c3c;
}

.status-maintenance {
  background: #f39c12;
}

/* 场地信息 */
.venue-info-section {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.venue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.venue-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  flex: 1;
  margin-right: 20rpx;
}

.venue-type {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  padding: 12rpx 20rpx;
  border-radius: 20rpx;
}

.type-icon {
  font-size: 28rpx;
  margin-right: 8rpx;
}

.type-text {
  font-size: 24rpx;
  color: #666;
}

.venue-description {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  border-left: 4rpx solid #667eea;
}

.description-text {
  font-size: 26rpx;
  color: #495057;
  line-height: 1.5;
}

.venue-details {
  margin-bottom: 30rpx;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
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

.detail-value.price {
  color: #e74c3c;
  font-weight: bold;
}

/* 设施特色 */
.features-section {
  margin-bottom: 30rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.features-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.feature-tag {
  font-size: 22rpx;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  border: 1rpx solid rgba(102, 126, 234, 0.2);
}

/* 预约统计 */
.stats-section {
  margin-bottom: 30rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
}

.stat-item {
  text-align: center;
  padding: 20rpx;
  background: white;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.stat-value {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 22rpx;
  color: #666;
}

/* 预约规则 */
.rules-section {
  margin-bottom: 30rpx;
}

.rules-list {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
}

.rule-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #e9ecef;
}

.rule-item:last-child {
  border-bottom: none;
}

.rule-label {
  font-size: 24rpx;
  color: #666;
}

.rule-value {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

/* 时间安排 */
.schedule-section {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.date-picker {
  flex: 1;
  margin-left: 20rpx;
}

.date-picker-btn {
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 16rpx 20rpx;
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

.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15rpx;
}

.time-slot-item {
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  padding: 20rpx;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.time-slot-item.available {
  border-color: #28a745;
  background: rgba(40, 167, 69, 0.05);
}

.time-slot-item.available:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 15rpx rgba(40, 167, 69, 0.3);
}

.time-slot-item.reserved {
  border-color: #dc3545;
  background: rgba(220, 53, 69, 0.05);
  opacity: 0.7;
}

.time-slot-item.maintenance {
  border-color: #ffc107;
  background: rgba(255, 193, 7, 0.05);
  opacity: 0.8;
}

.time-slot-item.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  box-shadow: 0 4rpx 15rpx rgba(102, 126, 234, 0.3);
}

.time-slot-item.selected .slot-time {
  color: #667eea;
  font-weight: bold;
}

.slot-time {
  display: block;
  font-size: 22rpx;
  color: #333;
  margin-bottom: 8rpx;
  font-weight: 500;
}

.slot-status {
  font-size: 20rpx;
  color: #666;
  margin-bottom: 4rpx;
}

.slot-price {
  font-size: 20rpx;
  color: #e74c3c;
  font-weight: 600;
}

.empty-slots {
  text-align: center;
  padding: 60rpx 20rpx;
  color: #999;
}

.empty-text {
  font-size: 26rpx;
}

/* 快速预约 */
.quick-reservation {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  padding: 25rpx;
  margin-top: 20rpx;
  color: white;
  text-align: center;
}

.quick-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  margin-bottom: 10rpx;
}

.quick-time {
  display: block;
  font-size: 24rpx;
  opacity: 0.9;
  margin-bottom: 8rpx;
}

.quick-price {
  display: block;
  font-size: 26rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.quick-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 12rpx;
  padding: 15rpx 30rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: white;
  transition: all 0.3s ease;
}

.quick-btn:active {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0.98);
}

.slot-selected {
  position: absolute;
  top: 8rpx;
  right: 8rpx;
  width: 24rpx;
  height: 24rpx;
  background: #667eea;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16rpx;
  font-weight: bold;
}

/* 操作按钮 */
.action-section {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.action-btn {
  flex: 1;
  height: 88rpx;
  border: none;
  border-radius: 20rpx;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-btn.primary:disabled {
  background: #ccc;
  color: #666;
  opacity: 0.6;
}

.action-btn.secondary {
  background: white;
  color: #667eea;
  border: 2rpx solid #667eea;
}

.action-btn:active {
  transform: scale(0.98);
}

/* 错误状态 */
.error-container {
  text-align: center;
  padding: 100rpx 40rpx;
}

.error-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  display: block;
}

.error-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 30rpx;
  display: block;
}

.retry-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 12rpx;
  padding: 20rpx 40rpx;
  font-size: 26rpx;
}

/* 预约弹窗 */
.reservation-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
}

.modal-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: white;
  border-radius: 20rpx 20rpx 0 0;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 40rpx;
  color: #999;
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 30rpx;
}

.venue-summary {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 30rpx;
  text-align: center;
}

.summary-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
}

.summary-type {
  display: block;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.summary-price {
  font-size: 26rpx;
  color: #e74c3c;
  font-weight: 600;
}

.reservation-form {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.form-row {
  display: flex;
  align-items: center;
}

.form-label {
  width: 160rpx;
  font-size: 26rpx;
  color: #333;
}

.form-value {
  flex: 1;
  font-size: 26rpx;
  color: #333;
}

.form-input {
  flex: 1;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 26rpx;
  color: #333;
}

.form-textarea {
  flex: 1;
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 26rpx;
  color: #333;
  height: 80rpx;
  resize: none;
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 2rpx solid #f0f0f0;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  height: 88rpx;
  border: none;
  border-radius: 20rpx;
  font-size: 26rpx;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: #f8f9fa;
  color: #495057;
  border: 2rpx solid #dee2e6;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:disabled {
  background: #ccc;
  color: #666;
  opacity: 0.6;
}

.btn-secondary:active,
.btn-primary:active {
  transform: scale(0.98);
}

/* 响应式设计 */
@media screen and (max-width: 600rpx) {
  .time-slots-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-section {
    flex-direction: column;
  }
  
  .venue-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .venue-type {
    margin-top: 10rpx;
  }
}
</style>
