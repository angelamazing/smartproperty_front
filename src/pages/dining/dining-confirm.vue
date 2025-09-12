<template>
  <view class="dining-confirm-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">用餐确认</text>
      <text class="page-subtitle">{{ currentDate }}</text>
    </view>

    <!-- 登录状态检查 -->
    <view class="login-section" v-if="!isLoggedIn">
      <view class="login-prompt">
        <text class="prompt-icon">🔐</text>
        <text class="prompt-title">请先登录以确认用餐</text>
        <text class="prompt-desc">使用微信授权登录，快速确认就餐</text>
      </view>
      
      <button 
        class="login-btn" 
        @click="wechatLogin"
        :disabled="loading"
        :loading="loading"
      >
        <text class="btn-icon">💬</text>
        <text>{{ loading ? '登录中...' : '微信登录' }}</text>
      </button>
    </view>

    <!-- 已登录状态 - 显示今日餐次 -->
    <view class="logged-in-section" v-if="isLoggedIn">
      <!-- 用户信息 -->
      <view class="user-info">
        <image class="avatar" :src="userInfo.avatarUrl || '/static/person.png'" />
        <view class="user-details">
          <text class="user-name">{{ userInfo.nickName || userInfo.name || '用户' }}</text>
          <text class="user-phone">{{ userInfo.phoneNumber || '未绑定手机号' }}</text>
        </view>
      </view>

      <!-- 今日餐次列表 -->
      <view class="meals-section">
        <text class="section-title">今日餐次</text>
        
        <!-- 餐次卡片 -->
        <view 
          v-for="meal in todayMeals" 
          :key="meal.mealType"
          class="meal-card"
          :class="{ 
            'can-confirm': meal.canConfirm,
            'confirmed': meal.status === 'dined',
            'disabled': !meal.canConfirm && meal.status !== 'dined'
          }"
        >
          <view class="meal-header">
            <view class="meal-info">
              <text class="meal-icon">{{ meal.icon }}</text>
              <text class="meal-name">{{ meal.name }}</text>
            </view>
            <view class="meal-status" :class="meal.statusClass">
              <text class="status-text">{{ meal.statusText }}</text>
            </view>
          </view>
          
          <view class="meal-details">
            <view class="detail-row">
              <text class="detail-label">就餐时间：</text>
              <text class="detail-value">{{ meal.timeRange }}</text>
            </view>
            <view class="detail-row" v-if="meal.orderTime">
              <text class="detail-label">报餐时间：</text>
              <text class="detail-value">{{ meal.orderTime }}</text>
            </view>
            <view class="detail-row" v-if="meal.diningTime">
              <text class="detail-label">确认时间：</text>
              <text class="detail-value">{{ meal.diningTime }}</text>
            </view>
          </view>
          
          <view class="meal-actions">
            <button 
              v-if="meal.canConfirm"
              @click="confirmMeal(meal)"
              :disabled="confirming"
              class="confirm-btn"
            >
              <text class="btn-icon">✓</text>
              <text>{{ confirming ? '确认中...' : '确认就餐' }}</text>
            </button>
            
            <view v-else-if="meal.status !== 'dined'" class="time-hint">
              <text class="hint-icon">⏰</text>
              <text class="hint-text">{{ meal.timeHint }}</text>
            </view>
            
            <view v-else class="confirmed-info">
              <text class="confirmed-icon">✅</text>
              <text class="confirmed-text">已确认就餐</text>
            </view>
          </view>
        </view>

        <!-- 无餐次提示 -->
        <view v-if="todayMeals.length === 0 && !loading" class="no-meals">
          <text class="no-meals-icon">🍽️</text>
          <text class="no-meals-title">今日暂无报餐记录</text>
          <text class="no-meals-desc">请先进行报餐，然后在此确认就餐</text>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view class="loading-overlay" v-if="loading">
      <view class="loading-content">
        <text class="loading-icon">⏳</text>
        <text class="loading-text">{{ loadingText }}</text>
      </view>
    </view>

    <!-- 错误提示 -->
    <view class="error-message" v-if="error">
      <text class="error-icon">⚠️</text>
      <text class="error-text">{{ error }}</text>
      <button class="retry-btn" @click="retryLoad">重试</button>
    </view>
  </view>
</template>

<script>
import DiningApi from '@/utils/diningApi.js'
import TimeUtils from '@/utils/timeUtils.js'
import ErrorHandler from '@/utils/errorHandler.js'

export default {
  name: 'DiningConfirm',
  data() {
    return {
      userInfo: null,
      isLoggedIn: false,
      todayMeals: [],
      loading: false,
      confirming: false,
      loadingText: '加载中...',
      error: null
    }
  },

  computed: {
    currentDate() {
      return TimeUtils.formatDate(TimeUtils.getCurrentBeijingTime())
    }
  },

  onLoad(options) {
    console.log('页面加载，参数:', options)
    this.checkLoginStatus()
  },

  onShow() {
    this.checkLoginStatus()
  },

  methods: {
    /**
     * 检查登录状态
     */
    checkLoginStatus() {
      try {
        const token = uni.getStorageSync('userToken')
        const userInfo = uni.getStorageSync('userInfo')
        
        console.log('检查登录状态:', { token: !!token, userInfo: !!userInfo })
        
        if (token && userInfo) {
          this.isLoggedIn = true
          this.userInfo = userInfo
          this.loadTodayMeals()
        } else {
          this.isLoggedIn = false
          this.userInfo = null
        }
      } catch (error) {
        console.error('检查登录状态失败:', error)
        this.isLoggedIn = false
        this.userInfo = null
      }
    },

    /**
     * 加载今日餐次
     */
    async loadTodayMeals() {
      try {
        this.loading = true
        this.loadingText = '加载餐次信息...'
        this.error = null
        
        const response = await DiningApi.getTodayMeals()
        
        if (response.success && response.data) {
          this.todayMeals = this.processMealsData(response.data)
        } else {
          this.todayMeals = []
        }
      } catch (error) {
        console.error('加载今日餐次失败:', error)
        const handledError = await ErrorHandler.handleAndShowError(error, {
          context: { action: 'loadTodayMeals' },
          showDialog: false
        })
        this.error = ErrorHandler.getUserFriendlyMessage(ErrorHandler.handleDiningError(error))
        this.todayMeals = []
      } finally {
        this.loading = false
      }
    },

    /**
     * 处理餐次数据
     */
    processMealsData(mealsData) {
      if (!Array.isArray(mealsData)) {
        return []
      }

      return mealsData.map(meal => {
        const mealInfo = TimeUtils.getMealInfo(meal.mealType)
        const timeCheck = TimeUtils.checkMealTime(meal.mealType)
        
        return {
          ...meal,
          name: mealInfo.name,
          icon: mealInfo.icon,
          order: mealInfo.order,
          canConfirm: timeCheck.valid && meal.diningStatus === 'ordered',
          timeHint: timeCheck.message,
          timeRange: timeCheck.timeRange,
          statusClass: this.getStatusClass(meal.diningStatus),
          statusText: this.getStatusText(meal.diningStatus),
          orderTime: meal.createTime ? TimeUtils.formatForDisplay(meal.createTime) : null,
          diningTime: meal.actualDiningTime 
            ? TimeUtils.formatTime(meal.actualDiningTime, 'HH:mm')
            : null
        }
      }).sort((a, b) => a.order - b.order)
    },

    /**
     * 确认就餐
     */
    async confirmMeal(meal) {
      try {
        // 二次确认
        const confirmed = await this.showConfirmDialog(
          '确认就餐',
          `确定要确认${meal.name}就餐吗？确认后无法撤销。`
        )
        
        if (!confirmed) return
        
        this.confirming = true
        
        const response = await DiningApi.confirmDining(meal.orderId)
        
        if (response.success) {
          // 更新本地状态
          const mealIndex = this.todayMeals.findIndex(m => m.orderId === meal.orderId)
          if (mealIndex !== -1) {
            this.todayMeals[mealIndex].status = 'dined'
            this.todayMeals[mealIndex].diningTime = TimeUtils.formatTime(response.data.actualDiningTime, 'HH:mm')
            this.todayMeals[mealIndex].canConfirm = false
            this.todayMeals[mealIndex].statusClass = 'confirmed'
            this.todayMeals[mealIndex].statusText = '已就餐'
          }
          
          uni.showToast({
            title: '确认就餐成功',
            icon: 'success',
            duration: 2000
          })
        } else {
          // 保留完整的错误信息，包括服务器返回的详细错误
          const errorMessage = response.message || '确认失败'
          const errorDetails = response.details || response.data || {}
          
          // 创建包含详细信息的错误对象
          const error = new Error(errorMessage)
          error.details = errorDetails
          error.response = response
          error.mealInfo = {
            orderId: meal.orderId,
            mealType: meal.mealType,
            mealName: meal.name
          }
          
          throw error
        }
        
      } catch (error) {
        console.error('确认就餐失败:', error)
        this.handleConfirmError(error, meal)
      } finally {
        this.confirming = false
      }
    },

    /**
     * 处理确认错误
     */
    async handleConfirmError(error, meal) {
      // 添加餐次信息到错误对象中，以便ErrorHandler能够构建更详细的错误信息
      if (error.mealInfo) {
        error.details = {
          ...error.details,
          mealType: meal.mealType,
          mealName: meal.name,
          orderId: meal.orderId
        }
      }
      
      const diningError = ErrorHandler.handleDiningError(error)
      
      // 记录错误日志，包含更多上下文信息
      ErrorHandler.logError(diningError, { 
        action: 'confirmMeal', 
        mealId: meal.orderId,
        mealType: meal.mealType,
        mealName: meal.name,
        errorDetails: error.details,
        response: error.response
      })
      
      // 根据错误类型更新餐次状态
      if (diningError.type === 'ALREADY_CONFIRMED') {
        meal.status = 'dined'
        meal.canConfirm = false
        meal.statusClass = 'confirmed'
        meal.statusText = '已就餐'
      } else if (diningError.type === 'ORDER_CANCELLED') {
        meal.status = 'cancelled'
        meal.canConfirm = false
        meal.statusClass = 'cancelled'
        meal.statusText = '已取消'
      }
      
      // 显示用户友好的错误信息
      ErrorHandler.showErrorToast(diningError)
    },

    /**
     * 微信登录
     */
    async wechatLogin() {
      try {
        this.loading = true
        this.loadingText = '正在登录...'
        
        console.log('开始微信登录')
        
        // 获取微信授权码
        const loginResult = await this.wxLogin()
        console.log('微信登录结果:', loginResult)
        
        // 获取用户信息
        const userInfoResult = await this.getUserProfile()
        console.log('用户信息结果:', userInfoResult)
        
        // 调用后端登录接口
        const response = await uni.request({
          url: `${DiningApi.baseURL}/api/auth/wechat-login`,
          method: 'POST',
          data: { 
            code: loginResult.code, 
            encryptedData: userInfoResult.encryptedData, 
            iv: userInfoResult.iv 
          }
        })
        
        console.log('后端登录响应:', response.data)
        const result = response.data
        
        if (result.success) {
          // 保存用户信息
          uni.setStorageSync('userToken', result.data.token)
          uni.setStorageSync('userInfo', result.data.userInfo)
          
          this.isLoggedIn = true
          this.userInfo = result.data.userInfo
          
          uni.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1500
          })
          
          // 登录成功后加载餐次信息
          setTimeout(() => {
            this.loadTodayMeals()
          }, 1500)
        } else {
          throw new Error(result.message || '登录失败')
        }
      } catch (error) {
        console.error('微信登录失败:', error)
        await ErrorHandler.handleAndShowError(error, {
          context: { action: 'wechatLogin' },
          showDialog: false
        })
      } finally {
        this.loading = false
      }
    },

    /**
     * 微信登录
     */
    wxLogin() {
      return new Promise((resolve, reject) => {
        uni.login({
          success: resolve,
          fail: reject
        })
      })
    },

    /**
     * 获取用户信息
     */
    getUserProfile() {
      return new Promise((resolve, reject) => {
        uni.getUserProfile({
          desc: '用于确认用餐身份',
          success: resolve,
          fail: reject
        })
      })
    },

    /**
     * 显示确认对话框
     */
    showConfirmDialog(title, content) {
      return new Promise((resolve) => {
        uni.showModal({
          title,
          content,
          success: (res) => {
            resolve(res.confirm)
          },
          fail: () => {
            resolve(false)
          }
        })
      })
    },

    /**
     * 获取状态样式类
     */
    getStatusClass(status) {
      const statusClasses = {
        'ordered': 'status-ordered',
        'dined': 'status-confirmed',
        'cancelled': 'status-cancelled'
      }
      return statusClasses[status] || 'status-unknown'
    },

    /**
     * 获取状态文本
     */
    getStatusText(status) {
      const statusTexts = {
        'ordered': '已报餐',
        'dined': '已就餐',
        'cancelled': '已取消'
      }
      return statusTexts[status] || '未知'
    },

    /**
     * 重试加载
     */
    retryLoad() {
      this.error = null
      if (this.isLoggedIn) {
        this.loadTodayMeals()
      } else {
        this.checkLoginStatus()
      }
    }
  }
}
</script>

<style scoped>
.dining-confirm-container {
  padding: 40rpx;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 60rpx;
}

.page-title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.page-subtitle {
  font-size: 28rpx;
  color: #666;
  display: block;
}

/* 登录部分 */
.login-section {
  text-align: center;
  padding: 80rpx 40rpx;
  background: white;
  border-radius: 20rpx;
  margin-bottom: 40rpx;
}

.login-prompt {
  margin-bottom: 60rpx;
}

.prompt-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 20rpx;
}

.prompt-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 15rpx;
}

.prompt-desc {
  font-size: 28rpx;
  color: #666;
  display: block;
}

.login-btn {
  width: 400rpx;
  height: 88rpx;
  background-color: #07c160;
  color: white;
  border-radius: 44rpx;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.login-btn:disabled {
  background-color: #ccc;
}

/* 已登录部分 */
.logged-in-section {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
}

.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
  padding-bottom: 40rpx;
  border-bottom: 1rpx solid #eee;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  margin-right: 20rpx;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
  display: block;
  margin-bottom: 8rpx;
}

.user-phone {
  font-size: 26rpx;
  color: #666;
  display: block;
}

/* 餐次部分 */
.meals-section {
  margin-top: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 30rpx;
}

.meal-card {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-left: 6rpx solid #ddd;
  transition: all 0.3s ease;
}

.meal-card.can-confirm {
  border-left-color: #52c41a;
  background: #f6ffed;
}

.meal-card.confirmed {
  border-left-color: #1890ff;
  background: #e6f7ff;
}

.meal-card.disabled {
  opacity: 0.6;
  border-left-color: #d9d9d9;
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.meal-info {
  display: flex;
  align-items: center;
}

.meal-icon {
  font-size: 32rpx;
  margin-right: 15rpx;
}

.meal-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.meal-status {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.status-ordered {
  background: #fff7e6;
  color: #d46b08;
}

.status-confirmed {
  background: #f6ffed;
  color: #52c41a;
}

.status-cancelled {
  background: #fff2f0;
  color: #ff4d4f;
}

.meal-details {
  margin-bottom: 20rpx;
}

.detail-row {
  display: flex;
  margin-bottom: 10rpx;
}

.detail-label {
  font-size: 26rpx;
  color: #666;
  width: 160rpx;
}

.detail-value {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  flex: 1;
}

.meal-actions {
  text-align: center;
}

.confirm-btn {
  width: 100%;
  height: 80rpx;
  background-color: #52c41a;
  color: white;
  border-radius: 40rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.confirm-btn:disabled {
  background-color: #d9d9d9;
}

.time-hint {
  color: #ff7875;
  font-size: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

.confirmed-info {
  color: #52c41a;
  font-size: 26rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
}

/* 无餐次提示 */
.no-meals {
  text-align: center;
  padding: 80rpx 40rpx;
  color: #999;
}

.no-meals-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 20rpx;
}

.no-meals-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #666;
  display: block;
  margin-bottom: 15rpx;
}

.no-meals-desc {
  font-size: 26rpx;
  color: #999;
  display: block;
}

/* 加载状态 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  background: white;
  padding: 60rpx;
  border-radius: 20rpx;
  text-align: center;
}

.loading-icon {
  font-size: 60rpx;
  display: block;
  margin-bottom: 20rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #333;
}

/* 错误提示 */
.error-message {
  background: #fff2f0;
  color: #ff4d4f;
  padding: 30rpx;
  border-radius: 16rpx;
  margin: 20rpx 0;
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.error-icon {
  font-size: 32rpx;
}

.error-text {
  font-size: 26rpx;
  flex: 1;
}

.retry-btn {
  background: #ff4d4f;
  color: white;
  border: none;
  padding: 15rpx 30rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}
</style>