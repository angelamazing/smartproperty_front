<template>
  <view class="qr-confirm-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">扫码确认就餐</text>
      <text class="page-subtitle">自动识别餐次并确认就餐</text>
    </view>

    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">{{ loadingText }}</text>
    </view>

    <!-- 结果展示 -->
    <view v-else class="result-container">
      <!-- 成功卡片 -->
      <view v-if="result.type === 'success'" class="result-card success-card">
        <view class="result-icon">
          <text class="icon">✓</text>
        </view>
        <view class="result-content">
          <text class="result-title">确认就餐成功</text>
          <text class="result-message">{{ result.message }}</text>
          <view class="result-details">
            <view class="detail-item">
              <text class="detail-label">餐次：</text>
              <text class="detail-value">{{ result.mealName }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">确认时间：</text>
              <text class="detail-value">{{ result.confirmTime }}</text>
            </view>
            <view class="detail-item" v-if="result.orderId">
              <text class="detail-label">订单号：</text>
              <text class="detail-value">{{ result.orderId }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 失败卡片 -->
      <view v-else-if="result.type === 'error'" class="result-card error-card">
        <view class="result-icon">
          <text class="icon">✗</text>
        </view>
        <view class="result-content">
          <text class="result-title">确认就餐失败</text>
          <text class="result-message">{{ result.message }}</text>
          <view class="result-details" v-if="result.details">
            <view class="detail-item">
              <text class="detail-label">原因：</text>
              <text class="detail-value">{{ result.details }}</text>
            </view>
            <view class="detail-item" v-if="result.suggestion">
              <text class="detail-label">建议：</text>
              <text class="detail-value">{{ result.suggestion }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 时间不在范围内卡片 -->
      <view v-else-if="result.type === 'timeout'" class="result-card warning-card">
        <view class="result-icon">
          <text class="icon">⏰</text>
        </view>
        <view class="result-content">
          <text class="result-title">不在就餐时间内</text>
          <text class="result-message">{{ result.message }}</text>
          <view class="result-details">
            <view class="detail-item">
              <text class="detail-label">当前时间：</text>
              <text class="detail-value">{{ result.currentTime }}</text>
            </view>
            <view class="detail-item">
              <text class="detail-label">就餐时间：</text>
              <text class="detail-value">{{ result.mealTimeRange }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-buttons" v-if="!isLoading">
      <button 
        v-if="result.type === 'error' || result.type === 'timeout'"
        class="action-btn retry-btn"
        @click="retryConfirm"
        :disabled="isRetrying"
      >
        {{ isRetrying ? '重试中...' : '重新确认' }}
      </button>
      
      <button 
        class="action-btn back-btn"
        @click="goBack"
      >
        返回首页
      </button>
    </view>

    <!-- 调试信息（开发环境） -->
    <view v-if="showDebugInfo" class="debug-info">
      <text class="debug-title">调试信息</text>
      <text class="debug-item">当前时间: {{ debugInfo.currentTime }}</text>
      <text class="debug-item">判断餐次: {{ debugInfo.mealType }}</text>
      <text class="debug-item">登录状态: {{ debugInfo.isLoggedIn }}</text>
      <text class="debug-item">用户信息: {{ debugInfo.userInfo }}</text>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import TimeUtils from '@/utils/timeUtils.js'
import auth from '@/utils/auth.js'

export default {
  name: 'QrConfirmDining',
  data() {
    return {
      isLoading: true,
      isRetrying: false,
      loadingText: '正在处理...',
      result: {
        type: null,
        message: '',
        details: '',
        suggestion: '',
        mealName: '',
        confirmTime: '',
        orderId: '',
        currentTime: '',
        mealTimeRange: ''
      },
      debugInfo: {
        currentTime: '',
        mealType: '',
        isLoggedIn: false,
        userInfo: ''
      },
      showDebugInfo: false // 开发环境显示调试信息
    }
  },
  
  onLoad(options) {
    console.log('扫码确认就餐页面加载，参数:', options)
    
    // 显示调试信息（开发环境）
    // #ifdef MP-WEIXIN
    this.showDebugInfo = true
    // #endif
    
    // 开始自动确认流程
    this.startAutoConfirm(options)
  },

  methods: {
    /**
     * 开始自动确认流程
     */
    async startAutoConfirm(options) {
      try {
        this.isLoading = true
        this.loadingText = '检查登录状态...'
        
        // 1. 检查登录状态
        const isLoggedIn = await this.checkLoginStatus()
        if (!isLoggedIn) {
          this.handleNotLoggedIn()
          return
        }

        this.loadingText = '判断当前餐次...'
        
        // 2. 判断当前餐次
        const mealType = this.getCurrentMealType()
        if (!mealType) {
          this.handleTimeOutOfRange()
          return
        }

        this.loadingText = '获取报餐状态...'
        
        // 3. 获取用户报餐状态
        const diningStatus = await this.getDiningStatus()
        if (!diningStatus) {
          this.handleGetStatusError()
          return
        }

        this.loadingText = '确认就餐中...'
        
        // 4. 自动确认就餐
        await this.autoConfirmDining(diningStatus, mealType)
        
      } catch (error) {
        console.error('自动确认就餐失败:', error)
        this.handleError('系统错误', error.message)
      } finally {
        this.isLoading = false
      }
    },

    /**
     * 检查登录状态
     */
    async checkLoginStatus() {
      try {
        const isLoggedIn = auth.isLoggedIn()
        this.debugInfo.isLoggedIn = isLoggedIn
        
        if (isLoggedIn) {
          const userInfo = auth.getUserInfo()
          this.debugInfo.userInfo = userInfo ? userInfo.nickName : '未知用户'
        }
        
        return isLoggedIn
      } catch (error) {
        console.error('检查登录状态失败:', error)
        return false
      }
    },

    /**
     * 处理未登录情况
     */
    handleNotLoggedIn() {
      // 保存当前页面路径，登录后跳转回来
      try {
        uni.setStorageSync('redirectAfterLogin', '/pages/dining/qr-confirm-dining')
        console.log('已保存登录后跳转路径')
      } catch (error) {
        console.error('保存跳转路径失败:', error)
      }
      
      this.result = {
        type: 'error',
        message: '请先登录后再确认就餐',
        details: '检测到您未登录',
        suggestion: '点击重新确认将跳转到登录页面'
      }
    },

    /**
     * 获取当前餐次类型
     */
    getCurrentMealType() {
      const currentTime = TimeUtils.getCurrentTime()
      const mealType = TimeUtils.getCurrentMealType()
      
      this.debugInfo.currentTime = currentTime
      this.debugInfo.mealType = mealType || '无'
      
      return mealType
    },

    /**
     * 处理时间不在就餐范围内
     */
    handleTimeOutOfRange() {
      const currentTime = TimeUtils.getCurrentTime()
      const nextMeal = TimeUtils.getNextMeal()
      
      this.result = {
        type: 'timeout',
        message: `当前时间不在任何餐次的就餐时间内`,
        currentTime: currentTime,
        mealTimeRange: `下次就餐: ${nextMeal.name} (${nextMeal.time})`
      }
    },

    /**
     * 获取就餐状态
     */
    async getDiningStatus() {
      try {
        const today = TimeUtils.getCurrentDate()
        const response = await api.diningConfirmation.getStatus(today)
        
        if (response.success) {
          return response.data
        } else {
          throw new Error(response.message || '获取就餐状态失败')
        }
      } catch (error) {
        console.error('获取就餐状态失败:', error)
        throw error
      }
    },

    /**
     * 处理获取状态错误
     */
    handleGetStatusError() {
      this.result = {
        type: 'error',
        message: '获取报餐状态失败',
        details: '网络连接异常或服务器错误',
        suggestion: '请检查网络连接后重试'
      }
    },

    /**
     * 自动确认就餐
     */
    async autoConfirmDining(diningStatus, mealType) {
      try {
        // 获取对应餐次的状态
        const mealData = diningStatus.mealConfirmationStatus || diningStatus
        const mealStatus = mealData[mealType]
        
        if (!mealStatus || !mealStatus.isRegistered) {
          this.handleNotRegistered(mealType)
          return
        }

        if (mealStatus.diningStatus === 'dined') {
          this.handleAlreadyConfirmed(mealType)
          return
        }

        if (mealStatus.diningStatus === 'cancelled') {
          this.handleOrderCancelled(mealType)
          return
        }

        if (mealStatus.diningStatus !== 'ordered') {
          this.handleInvalidStatus(mealType, mealStatus.diningStatus)
          return
        }

        // 执行确认就餐
        const response = await api.diningConfirmation.manualConfirm(mealStatus.orderId)
        
        if (response.success) {
          this.handleConfirmSuccess(mealType, response.data)
        } else {
          this.handleConfirmError(response.message || '确认就餐失败')
        }
        
      } catch (error) {
        console.error('确认就餐失败:', error)
        this.handleConfirmError(error.message)
      }
    },

    /**
     * 处理未报餐情况
     */
    handleNotRegistered(mealType) {
      const mealInfo = TimeUtils.getMealInfo(mealType)
      this.result = {
        type: 'error',
        message: `您还没有报${mealInfo.name}`,
        details: `当前餐次: ${mealInfo.name}`,
        suggestion: '请先进行报餐，然后再确认就餐'
      }
    },

    /**
     * 处理已确认就餐情况
     */
    handleAlreadyConfirmed(mealType) {
      const mealInfo = TimeUtils.getMealInfo(mealType)
      this.result = {
        type: 'success',
        message: `您已经确认过${mealInfo.name}就餐`,
        mealName: mealInfo.name,
        confirmTime: '已确认',
        orderId: '--'
      }
    },

    /**
     * 处理订单已取消情况
     */
    handleOrderCancelled(mealType) {
      const mealInfo = TimeUtils.getMealInfo(mealType)
      this.result = {
        type: 'error',
        message: `您的${mealInfo.name}订单已被取消`,
        details: `餐次: ${mealInfo.name}`,
        suggestion: '无法确认已取消的订单'
      }
    },

    /**
     * 处理无效状态
     */
    handleInvalidStatus(mealType, status) {
      const mealInfo = TimeUtils.getMealInfo(mealType)
      this.result = {
        type: 'error',
        message: `订单状态异常`,
        details: `餐次: ${mealInfo.name}, 状态: ${status}`,
        suggestion: '请联系管理员处理'
      }
    },

    /**
     * 处理确认成功
     */
    handleConfirmSuccess(mealType, data) {
      const mealInfo = TimeUtils.getMealInfo(mealType)
      this.result = {
        type: 'success',
        message: `确认${mealInfo.name}就餐成功`,
        mealName: mealInfo.name,
        confirmTime: TimeUtils.formatTime(data.actualDiningTime, 'HH:mm:ss'),
        orderId: data.orderId || '--'
      }
    },

    /**
     * 处理确认错误
     */
    handleConfirmError(message) {
      this.result = {
        type: 'error',
        message: '确认就餐失败',
        details: message,
        suggestion: '请重试或联系管理员'
      }
    },

    /**
     * 处理通用错误
     */
    handleError(title, message) {
      this.result = {
        type: 'error',
        message: title,
        details: message,
        suggestion: '请重试或联系管理员'
      }
    },

    /**
     * 重新确认
     */
    async retryConfirm() {
      // 如果是因为未登录导致的错误，跳转到登录页面
      if (this.result.type === 'error' && this.result.details === '检测到您未登录') {
        uni.navigateTo({
          url: '/pages/login/login'
        })
        return
      }
      
      this.isRetrying = true
      try {
        await this.startAutoConfirm({})
      } finally {
        this.isRetrying = false
      }
    },

    /**
     * 返回首页
     */
    goBack() {
      uni.reLaunch({
        url: '/pages/index/index'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.qr-confirm-container {
  padding: 30rpx;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.page-title {
  font-size: 48rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.page-subtitle {
  font-size: 28rpx;
  color: #666;
  display: block;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 6rpx solid #f3f3f3;
  border-top: 6rpx solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 30rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

.result-container {
  margin-bottom: 40rpx;
}

.result-card {
  background: white;
  border-radius: 20rpx;
  padding: 40rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: flex-start;
  gap: 30rpx;
}

.result-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  
  .icon {
    font-size: 40rpx;
    font-weight: bold;
  }
}

.success-card {
  border-left: 8rpx solid #28a745;
  
  .result-icon {
    background: #d4edda;
    color: #155724;
  }
}

.error-card {
  border-left: 8rpx solid #dc3545;
  
  .result-icon {
    background: #f8d7da;
    color: #721c24;
  }
}

.warning-card {
  border-left: 8rpx solid #ffc107;
  
  .result-icon {
    background: #fff3cd;
    color: #856404;
  }
}

.result-content {
  flex: 1;
}

.result-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.result-message {
  font-size: 28rpx;
  color: #666;
  display: block;
  margin-bottom: 24rpx;
  line-height: 1.5;
}

.result-details {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.detail-label {
  font-size: 24rpx;
  color: #999;
  min-width: 120rpx;
}

.detail-value {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 40rpx;
}

.action-btn {
  padding: 24rpx 40rpx;
  border-radius: 12rpx;
  font-size: 32rpx;
  font-weight: 500;
  border: none;
  transition: all 0.3s ease;
  
  &.retry-btn {
    background: #667eea;
    color: white;
    
    &:active {
      background: #5a6fd8;
    }
    
    &:disabled {
      background: #ccc;
      opacity: 0.6;
    }
  }
  
  &.back-btn {
    background: #6c757d;
    color: white;
    
    &:active {
      background: #5a6268;
    }
  }
}

.debug-info {
  margin-top: 40rpx;
  padding: 30rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 2rpx solid #e9ecef;
}

.debug-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #495057;
  display: block;
  margin-bottom: 20rpx;
}

.debug-item {
  font-size: 24rpx;
  color: #6c757d;
  display: block;
  margin-bottom: 8rpx;
  font-family: monospace;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .qr-confirm-container {
    padding: 20rpx;
  }
  
  .result-card {
    padding: 30rpx;
  }
  
  .page-title {
    font-size: 40rpx;
  }
}
</style>
