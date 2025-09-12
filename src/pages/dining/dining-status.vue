<template>
  <view class="dining-status-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">就餐状态</text>
      <view class="date-selector" @click="showDatePicker = true">
        <text class="date-text">{{ selectedDate }}</text>
        <text class="iconfont">📅</text>
      </view>
    </view>

    <!-- 用户信息卡片 -->
    <view class="user-info-card" v-if="diningStatus">
      <view class="user-avatar">
        <UserAvatar :user="userInfo" size="medium" />
      </view>
      <view class="user-details">
        <text class="user-name">{{ diningStatus.userName || userInfo?.nickName || '用户' }}</text>
        <text class="user-dept">{{ diningStatus.department || userInfo?.department || '未设置部门' }}</text>
      </view>
    </view>

    <!-- 状态说明 -->
    <view class="status-help">
      <view class="help-title">
        <text>状态说明</text>
      </view>
      <view class="help-content">
        <view class="help-item">
          <view class="status-dot ordered"></view>
          <text>已报餐：已提交报餐申请，等待确认就餐</text>
        </view>
        <view class="help-item">
          <view class="status-dot dined"></view>
          <text>已就餐：已确认就餐，完成整个流程</text>
        </view>
        <view class="help-item">
          <view class="status-dot cancelled"></view>
          <text>已取消：报餐申请已被取消</text>
        </view>
        <view class="help-item">
          <view class="status-dot unregistered"></view>
          <text>未报餐：尚未提交报餐申请</text>
        </view>
      </view>
    </view>

    <!-- 餐次状态卡片 -->
    <view class="meal-status-grid">
      <view 
        v-for="meal in mealTypes" 
        :key="meal.type" 
        class="meal-card"
        :class="getMealCardClass(meal)"
      >
        <view class="meal-header">
          <text class="meal-name">{{ meal.name }}</text>
          <view class="meal-status-badge" :class="getStatusBadgeClass(meal)">
            <text>{{ getStatusText(meal) }}</text>
          </view>
        </view>
        
        <view class="meal-details" v-if="meal.status && meal.status.isRegistered">
          <view class="meal-info" v-if="meal.status.registerTime">
            <text class="info-label">报餐时间:</text>
            <text class="info-value">{{ formatRegisterTime(meal.status.registerTime) }}</text>
          </view>
          
          <view class="meal-info" v-if="meal.status.actualDiningTime">
            <text class="info-label">就餐时间:</text>
            <text class="info-value">{{ formatDiningTime(meal.status.actualDiningTime) }}</text>
          </view>
          
          <view class="meal-info" v-if="meal.status.remark">
            <text class="info-label">备注:</text>
            <text class="info-value">{{ meal.status.remark }}</text>
          </view>
        </view>

        <!-- 操作按钮 -->
        <view class="meal-actions">
          <!-- 确认就餐按钮：diningStatus为"ordered"时显示 -->
          <button 
            v-if="meal.status && meal.status.diningStatus === 'ordered'"
            class="action-btn confirm-btn"
            @click="confirmDining(meal.status.orderId)"
            :disabled="isProcessing"
          >
            {{ isProcessing ? '确认中...' : '确认就餐' }}
          </button>
          
          <!-- 去报餐按钮：未报餐时显示 -->
          <button 
            v-if="!meal.status || !meal.status.isRegistered"
            class="action-btn register-btn"
            @click="goToRegister(meal.type)"
          >
            去报餐
          </button>
          
          <!-- 已确认就餐状态：diningStatus为"dined"时显示 -->
          <view 
            v-if="meal.status && meal.status.diningStatus === 'dined'"
            class="confirmed-status"
          >
            <text class="status-text">✓ 已确认就餐</text>
            <text class="dining-time" v-if="meal.status.actualDiningTime">
              {{ formatTimeForDisplay(meal.status.actualDiningTime) }}
            </text>
          </view>
          
          <!-- 已取消状态 -->
          <view 
            v-if="meal.status && meal.status.diningStatus === 'cancelled'"
            class="cancelled-status"
          >
            <text class="status-text">✗ 已取消</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 今日统计 -->
    <view class="today-stats" v-if="diningStatus && diningStatus.summary">
      <view class="stats-title">
        <text>今日统计</text>
      </view>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-number">{{ diningStatus.summary.totalRegistered || 0 }}</text>
          <text class="stat-label">总报餐数</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ diningStatus.summary.totalConfirmed || 0 }}</text>
          <text class="stat-label">已确认</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ diningStatus.summary.pendingConfirmation || 0 }}</text>
          <text class="stat-label">待确认</text>
        </view>
        <view class="stat-item">
          <text class="stat-number">{{ diningStatus.summary.unregisteredCount || 0 }}</text>
          <text class="stat-label">未报餐</text>
        </view>
      </view>
    </view>

    <!-- 日期选择器 -->
    <uni-popup ref="datePickerPopup" type="bottom" :mask-click="true">
      <view class="date-picker-popup">
        <view class="popup-header">
          <text class="popup-title">选择日期</text>
          <button class="close-btn" @click="showDatePicker = false">×</button>
        </view>
        <picker 
          mode="date" 
          :value="selectedDate" 
          @change="onDateChange"
          :start="getMinDate()"
          :end="getMaxDate()"
        >
          <view class="picker-display">
            <text>{{ selectedDate }}</text>
          </view>
        </picker>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import UserAvatar from '@/components/UserAvatar.vue'
import api from '@/utils/api.js'
import TimeUtils from '@/utils/timeUtils.js'
import navigationMixin from '@/mixins/navigationMixin.js'
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: 'DiningStatus',
  mixins: [navigationMixin, timeMixin],
  components: {
    UserAvatar
  },
  data() {
    return {
      selectedDate: '',
      diningStatus: null,
      userInfo: null,
      isProcessing: false,
      showDatePicker: false,
      mealTypes: [
        { 
          type: 'breakfast', 
          name: '早餐',
          status: null
        },
        { 
          type: 'lunch', 
          name: '午餐',
          status: null
        },
        { 
          type: 'dinner', 
          name: '晚餐',
          status: null
        }
      ]
    }
  },
  onLoad() {
    this.initPage()
  },
  onShow() {
    this.loadDiningStatus()
  },
  methods: {
    // 初始化页面
    initPage() {
      // 设置默认日期为今天（使用TimeUtils确保iOS兼容性）
      this.selectedDate = this.$getCurrentDate()
      
      // 获取用户信息
      this.loadUserInfo()
      
      // 加载就餐状态
      this.loadDiningStatus()
    },

    // 加载用户信息
    async loadUserInfo() {
      try {
        const userInfo = uni.getStorageSync('userInfo')
        if (userInfo) {
          this.userInfo = userInfo
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },

    // 加载就餐状态
    async loadDiningStatus() {
      try {
        uni.showLoading({ title: '加载中...' })
        
        const response = await api.diningConfirmation.getStatus(this.selectedDate)
        
        if (response.success) {
          this.diningStatus = response.data
          this.updateMealStatus()
          console.log('就餐状态数据:', this.diningStatus)
          
          // 调试时间数据
          if (this.diningStatus) {
            const mealData = this.diningStatus.mealConfirmationStatus || this.diningStatus
            Object.keys(mealData).forEach(mealType => {
              if (mealData[mealType] && typeof mealData[mealType] === 'object') {
                const meal = mealData[mealType]
                console.log(`${mealType} 时间数据:`, {
                  // 原始UTC时间
                  registerTimeUTC: meal.registerTime,
                  actualDiningTimeUTC: meal.actualDiningTime,
                  
                  // 转换后的中国时间
                  registerTimeChina: TimeUtils.getBeijingTime(meal.registerTime),
                  actualDiningTimeChina: TimeUtils.getBeijingTime(meal.actualDiningTime),
                  
                  // 格式化显示
                  formattedRegisterTime: TimeUtils.formatForDisplay(meal.registerTime),
                  formattedDiningTime: TimeUtils.formatForDisplay(meal.actualDiningTime),
                  
                  // 完整时间格式
                  fullRegisterTime: TimeUtils.formatTime(meal.registerTime, 'full'),
                  fullDiningTime: TimeUtils.formatTime(meal.actualDiningTime, 'full')
                })
              }
            })
          }
        } else {
          uni.showToast({
            title: response.message || '获取就餐状态失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('获取就餐状态失败:', error)
        uni.showToast({
          title: '获取就餐状态失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    },

    // 更新餐次状态显示
    updateMealStatus() {
      // 重置所有餐次状态
      this.mealTypes.forEach(meal => {
        meal.status = {
          isRegistered: false,
          orderId: null,
          status: null,
          diningStatus: null,
          statusText: '未报餐',
          confirmationText: '未确认',
          actualDiningTime: null,
          registerTime: null,
          remark: null
        }
      })

      // 如果有就餐状态数据，更新对应的餐次状态
      if (this.diningStatus) {
        // 处理不同的数据结构
        const mealData = this.diningStatus.mealConfirmationStatus || this.diningStatus
        
        this.mealTypes.forEach(meal => {
          const status = mealData[meal.type]
          if (status) {
            meal.status = {
              isRegistered: status.isRegistered || false,
              orderId: status.orderId || null,
              status: status.status || null,
              diningStatus: status.diningStatus || null,
              statusText: status.statusText || '未报餐',
              confirmationText: status.confirmationText || '未确认',
              actualDiningTime: status.actualDiningTime || null,
              registerTime: status.registerTime || null,
              remark: status.remark || null
            }
            
            console.log(`${meal.name} 状态更新:`, meal.status)
          }
        })
      }
    },

    // 获取餐次卡片样式类
    getMealCardClass(meal) {
      if (!meal.status || !meal.status.isRegistered) {
        return 'unregistered'
      }
      
      switch (meal.status.diningStatus) {
        case 'dined':
          return 'confirmed'
        case 'ordered':
          return 'pending'
        case 'cancelled':
          return 'cancelled'
        default:
          return 'unregistered'
      }
    },

    // 获取状态徽章样式类
    getStatusBadgeClass(meal) {
      if (!meal.status || !meal.status.isRegistered) {
        return 'unregistered'
      }
      
      return meal.status.diningStatus || 'unregistered'
    },

    // 获取状态文本
    getStatusText(meal) {
      if (!meal.status || !meal.status.isRegistered) {
        return '未报餐'
      }
      
      return meal.status.confirmationText || meal.status.statusText || '未确认'
    },

    // 确认就餐
    async confirmDining(orderId) {
      if (!orderId) {
        uni.showToast({
          title: '订单ID无效',
          icon: 'none'
        })
        return
      }

      try {
        this.isProcessing = true
        uni.showLoading({ title: '确认中...' })

        const response = await api.diningConfirmation.manualConfirm(orderId)
        
        console.log('确认就餐响应:', response)
        
        if (response.success) {
          uni.showToast({
            title: '确认就餐成功',
            icon: 'success'
          })
          
          // 重新加载状态
          await this.loadDiningStatus()
        } else {
          uni.showToast({
            title: response.message || '确认就餐失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('确认就餐失败:', error)
        uni.showToast({
          title: '确认就餐失败',
          icon: 'none'
        })
      } finally {
        this.isProcessing = false
        uni.hideLoading()
      }
    },

    // 去报餐
    goToRegister(mealType) {
      // 使用智能导航函数，自动判断页面类型
      this.$smartNavigate(`/pages/dining/dining?mealType=${mealType}&date=${this.selectedDate}`)
    },

    // 日期变化处理
    onDateChange(e) {
      this.selectedDate = e.detail.value
      this.showDatePicker = false
      this.loadDiningStatus()
    },

    // 获取最小日期（今天）
    getMinDate() {
      return this.$getCurrentDate()
    },

    // 获取最大日期（30天后）
    getMaxDate() {
      return this.$getNextDay(this.$getCurrentDate(), 30)
    },

    // 格式化时间
    formatTime(timeString, format = 'short') {
      return TimeUtils.formatTime(timeString, format)
    },

    // 格式化时间用于显示（智能选择格式）
    formatTimeForDisplay(timeString) {
      return TimeUtils.formatForDisplay(timeString)
    },

    // 格式化报餐时间（UTC转北京时间）
    formatRegisterTime(utcTimeString) {
      return TimeUtils.formatRegisterTime(utcTimeString)
    },

    // 格式化就餐时间（UTC转北京时间）
    formatDiningTime(utcTimeString) {
      return TimeUtils.formatDiningTime(utcTimeString)
    },

    // 格式化相对时间
    formatRelativeTime(timeString) {
      return TimeUtils.formatTime(timeString, 'relative')
    },

    // 格式化完整时间
    formatFullTime(timeString) {
      return TimeUtils.formatTime(timeString, 'full')
    }
  }
}
</script>

<style lang="scss" scoped>
.dining-status-container {
  padding: 30rpx;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.page-title {
  font-size: 48rpx;
  font-weight: 600;
  color: #333;
}

.date-selector {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 16rpx 24rpx;
  background: white;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.date-text {
  font-size: 28rpx;
  color: #333;
}

.iconfont {
  font-size: 24rpx;
}

.user-info-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 30rpx;
  background: white;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.user-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.user-dept {
  font-size: 24rpx;
  color: #666;
}

.status-help {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.help-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.help-content {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.help-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  font-size: 26rpx;
  color: #666;
}

.status-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  
  &.ordered {
    background: #ffa500;
  }
  
  &.dined {
    background: #28a745;
  }
  
  &.cancelled {
    background: #dc3545;
  }
  
  &.unregistered {
    background: #6c757d;
  }
}

.meal-status-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.meal-card {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &.confirmed {
    border-left: 8rpx solid #28a745;
  }
  
  &.pending {
    border-left: 8rpx solid #ffa500;
  }
  
  &.cancelled {
    border-left: 8rpx solid #dc3545;
  }
  
  &.unregistered {
    border-left: 8rpx solid #6c757d;
  }
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.meal-name {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.meal-status-badge {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
  
  &.dined {
    background: #d4edda;
    color: #155724;
  }
  
  &.ordered {
    background: #fff3cd;
    color: #856404;
  }
  
  &.cancelled {
    background: #f8d7da;
    color: #721c24;
  }
  
  &.unregistered {
    background: #e2e3e5;
    color: #383d41;
  }
}

.meal-details {
  margin-bottom: 20rpx;
}

.meal-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.info-label {
  font-size: 24rpx;
  color: #666;
}

.info-value {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

.meal-actions {
  display: flex;
  justify-content: center;
}

.action-btn {
  padding: 20rpx 40rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
  transition: all 0.3s ease;
  
  &.confirm-btn {
    background: #28a745;
    color: white;
    
    &:active {
      background: #218838;
    }
    
    &:disabled {
      background: #6c757d;
      opacity: 0.6;
    }
  }
  
  &.register-btn {
    background: #007bff;
    color: white;
    
    &:active {
      background: #0056b3;
    }
  }
}

.confirmed-status,
.cancelled-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 20rpx;
  border-radius: 12rpx;
}

.confirmed-status {
  background: #d4edda;
  color: #155724;
}

.cancelled-status {
  background: #f8d7da;
  color: #721c24;
}

.status-text {
  font-size: 28rpx;
  font-weight: 500;
}

.dining-time {
  font-size: 22rpx;
  opacity: 0.8;
}

.today-stats {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.stats-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.stat-item {
  text-align: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.stat-number {
  font-size: 48rpx;
  font-weight: 700;
  color: #007bff;
  display: block;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #666;
}

.date-picker-popup {
  background: white;
  border-radius: 20rpx 20rpx 0 0;
  padding: 30rpx;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #e9ecef;
}

.popup-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  background: #f8f9fa;
  border: none;
  border-radius: 50%;
  font-size: 32rpx;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.picker-display {
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  text-align: center;
  font-size: 28rpx;
  color: #333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dining-status-container {
    padding: 20rpx;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16rpx;
  }
  
  .stat-number {
    font-size: 40rpx;
  }
}
</style>