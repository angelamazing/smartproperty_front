<template>
  <view class="notification-settings-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <button class="back-btn" @click="goBack">←</button>
      <text class="page-title">通知设置</text>
    </view>

    <!-- 内容区域 -->
    <view class="content-container">
      <!-- 功能说明 -->
      <view class="info-section">
        <view class="info-card">
          <text class="info-icon">ℹ️</text>
          <view class="info-content">
            <text class="info-title">通知功能说明</text>
            <text class="info-desc">当前系统仅支持系统公告通知，其他通知功能正在开发中。</text>
          </view>
        </view>
      </view>

      <!-- 系统通知 -->
      <view class="settings-section">
        <text class="section-title">系统通知</text>
        
        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-label">系统公告</text>
            <text class="setting-desc">接收系统维护、更新等重要通知</text>
          </view>
          <switch 
            :checked="settings.systemAnnouncement" 
            @change="toggleSetting('systemAnnouncement')"
            color="#667eea"
          />
        </view>
      </view>

      <!-- 开发环境功能 -->
      <view v-if="isDevelopment" class="settings-section">
        <text class="section-title">开发环境功能</text>
        
        <view class="setting-item">
          <view class="setting-info">
            <text class="setting-label">短信验证码</text>
            <text class="setting-desc">开发环境下显示验证码（仅测试用）</text>
          </view>
          <switch 
            :checked="settings.smsVerification" 
            @change="toggleSetting('smsVerification')"
            color="#667eea"
          />
        </view>
      </view>

      <!-- 通知测试 -->
      <view class="test-section">
        <text class="section-title">通知测试</text>
        
        <view class="test-buttons">
          <button class="test-btn success" @click="test成功否tification">
            <text class="test-icon">✅</text>
            <text class="test-text">测试成功通知</text>
          </button>
          
          <button class="test-btn warning" @click="test警告否tification">
            <text class="test-icon">⚠️</text>
            <text class="test-text">测试警告通知</text>
          </button>
          
          <button class="test-btn error" @click="test错误否tification">
            <text class="test-icon">❌</text>
            <text class="test-text">测试错误通知</text>
          </button>
          
          <button class="test-btn info" @click="test信息否tification">
            <text class="test-icon">ℹ️</text>
            <text class="test-text">测试信息通知</text>
          </button>
        </view>
      </view>

      <!-- 功能状态 -->
      <view class="status-section">
        <text class="section-title">功能状态</text>
        
        <view class="status-item">
          <view class="status-info">
            <text class="status-label">系统公告</text>
            <text class="status-desc">✅ 已实现，完全可用</text>
          </view>
          <view class="status-badge success">可用</view>
        </view>

        <view class="status-item">
          <view class="status-info">
            <text class="status-label">短信通知</text>
            <text class="status-desc">⚠️ 仅开发环境可用</text>
          </view>
          <view class="status-badge warning">部分可用</view>
        </view>

        <view class="status-item">
          <view class="status-info">
            <text class="status-label">推送通知</text>
            <text class="status-desc">❌ 未实现</text>
          </view>
          <view class="status-badge disabled">不可用</view>
        </view>

        <view class="status-item">
          <view class="status-info">
            <text class="status-label">邮件通知</text>
            <text class="status-desc">❌ 未实现</text>
          </view>
          <view class="status-badge disabled">不可用</view>
        </view>

        <view class="status-item">
          <view class="status-info">
            <text class="status-label">业务通知</text>
            <text class="status-desc">❌ 未实现</text>
          </view>
          <view class="status-badge disabled">不可用</view>
        </view>
      </view>

      <!-- 通知历史 -->
      <view class="history-section">
        <text class="section-title">通知历史</text>
        
        <view class="history-stats">
          <view class="stat-item">
            <text class="stat-number">{{ notificationStats.total }}</text>
            <text class="stat-label">总通知数</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ notificationStats.today }}</text>
            <text class="stat-label">今日通知</text>
          </view>
          <view class="stat-item">
            <text class="stat-number">{{ notificationStats.unread }}</text>
            <text class="stat-label">未读通知</text>
          </view>
        </view>
        
        <button class="clear-history-btn" @click="clear否tificationHistory">
          <text class="clear-icon">🗑️</text>
          <text class="clear-text">清空通知历史</text>
        </button>
      </view>

      <!-- 保存按钮 -->
      <view class="action-buttons">
        <button class="save-btn" @click="saveSettings" :disabled="saving">
          {{ saving ? '保存中...' : '保存设置' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api'

export default {
  name: '否tificationSettings',
  data() {
    return {
      saving: false,
      isDevelopment: process.env.NODE_ENV === 'development',
      settings: {
        // 系统通知（已实现）
        systemAnnouncement: true,
        
        // 开发环境功能
        smsVerification: true
      },
      notificationStats: {
        total: 0,
        today: 0,
        unread: 0
      }
    }
  },
  onLoad() {
    this.loadSettings()
    this.load否tificationStats()
  },
  methods: {
    /**
     * 加载通知设置
     */
    async loadSettings() {
      try {
        // 由于用户通知设置API未实现，使用本地存储
        const savedSettings = uni.getStorageSync('notificationSettings')
        if (savedSettings) {
          // 优先使用已保存的设置，避免默认值覆盖
          this.settings = { ...savedSettings }
        }
        
        console.log('加载通知设置:', this.settings)
      } catch (error) {
        console.error('加载通知设置失败:', error)
      }
    },

    /**
     * 切换设置开关
     */
    toggleSetting(key) {
      this.settings[key] = !this.settings[key]
      console.log('设置已更改:', key, '=', this.settings[key])
    },

    /**
     * 保存设置
     */
    async saveSettings() {
      this.saving = true
      try {
        console.log('准备保存设置:', this.settings)
        
        // 由于用户通知设置API未实现，保存到本地存储
        uni.setStorageSync('notificationSettings', this.settings)
        
        // 验证保存是否成功
        const savedSettings = uni.getStorageSync('notificationSettings')
        console.log('保存后的设置:', savedSettings)
        
        if (savedSettings && JSON.stringify(savedSettings) === JSON.stringify(this.settings)) {
          this.show成功('设置保存成功')
        } else {
          this.show错误('保存失败，请重试')
        }
        
        this.saving = false
      } catch (error) {
        console.error('保存设置失败:', error)
        this.show错误('保存失败，请重试')
        this.saving = false
      }
    },

    /**
     * 返回上一页
     */
    goBack() {
      uni.navigateBack()
    },

    /**
     * 显示成功提示
     */
    show成功(message) {
      uni.showToast({
        title: message,
        icon: 'success'
      })
    },

    /**
     * 显示错误提示
     */
    show错误(message) {
      uni.showToast({
        title: message,
        icon: 'error'
      })
    },

    /**
     * 加载通知统计
     */
    load否tificationStats() {
      try {
        const stats = uni.getStorageSync('notificationStats') || {
          total: 0,
          today: 0,
          unread: 0
        }
        this.notificationStats = stats
      } catch (error) {
        console.error('加载通知统计失败:', error)
      }
    },

    /**
     * 更新通知统计
     */
    update否tificationStats(type = 'add') {
      try {
        // 使用iOS兼容的日期字符串
        const today = new Date()
        const year = today.getFullYear()
        const month = String(today.getMonth() + 1).padStart(2, '0')
        const day = String(today.getDate()).padStart(2, '0')
        const todayStr = `${year}-${month}-${day}`
        const lastUpdate = uni.getStorageSync('last否tificationUpdate')
        
        if (type === 'add') {
          this.notificationStats.total++
          this.notificationStats.unread++
          
          // 如果是今天第一次更新，重置今日计数
          if (lastUpdate !== todayStr) {
            this.notificationStats.today = 1
          } else {
            this.notificationStats.today++
          }
        } else if (type === 'clear') {
          this.notificationStats = {
            total: 0,
            today: 0,
            unread: 0
          }
        }
        
        uni.setStorageSync('notificationStats', this.notificationStats)
        uni.setStorageSync('last否tificationUpdate', today)
      } catch (error) {
        console.error('更新通知统计失败:', error)
      }
    },

    /**
     * 测试成功通知
     */
    test成功否tification() {
      this.update否tificationStats('add')
      uni.showToast({
        title: '这是一个成功通知测试',
        icon: 'success',
        duration: 3000
      })
    },

    /**
     * 测试警告通知
     */
    test警告否tification() {
      this.update否tificationStats('add')
      uni.showToast({
        title: '这是一个警告通知测试',
        icon: 'none',
        duration: 3000
      })
    },

    /**
     * 测试错误通知
     */
    test错误否tification() {
      this.update否tificationStats('add')
      uni.showToast({
        title: '这是一个错误通知测试',
        icon: 'error',
        duration: 3000
      })
    },

    /**
     * 测试信息通知
     */
    test信息否tification() {
      this.update否tificationStats('add')
      uni.showToast({
        title: '这是一个信息通知测试',
        icon: 'none',
        duration: 3000
      })
    },

    /**
     * 清空通知历史
     */
    clear否tificationHistory() {
      uni.showModal({
        title: '确认清空',
        content: '确定要清空所有通知历史吗？此操作不可恢复。',
        success: (res) => {
          if (res.confirm) {
            this.update否tificationStats('clear')
            uni.showToast({
              title: '通知历史已清空',
              icon: 'success'
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.notification-settings-page {
  min-height: 100vh;
  background: #f8f9fa;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 30rpx 30rpx;
  color: white;
  display: flex;
  align-items: center;
}

.back-btn {
  width: 60rpx;
  height: 60rpx;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 50%;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
}

/* 内容容器 */
.content-container {
  padding: 30rpx;
}

/* 信息卡片 */
.info-section {
  margin-bottom: 20rpx;
}

.info-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  color: white;
}

.info-icon {
  font-size: 40rpx;
  margin-top: 5rpx;
}

.info-content {
  flex: 1;
}

.info-title {
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
  display: block;
}

.info-desc {
  font-size: 24rpx;
  line-height: 1.5;
  opacity: 0.9;
}

/* 设置区块 */
.settings-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 30rpx;
  display: block;
  padding-bottom: 15rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

/* 状态区块 */
.status-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f8f9fa;
}

.status-item:last-child {
  border-bottom: none;
}

.status-info {
  flex: 1;
  margin-right: 20rpx;
}

.status-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 8rpx;
  display: block;
}

.status-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
}

.status-badge {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
  min-width: 80rpx;
  text-align: center;
}

.status-badge.success {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.disabled {
  background: #f3f4f6;
  color: #6b7280;
}

/* 通知测试 */
.test-section {
  margin-bottom: 30rpx;
}

.test-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
  margin-top: 20rpx;
}

.test-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx 16rpx;
  border: none;
  border-radius: 12rpx;
  font-size: 24rpx;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.test-btn.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.test-btn.warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.test-btn.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.test-btn.info {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.test-btn:active {
  transform: scale(0.95);
}

.test-icon {
  font-size: 32rpx;
  margin-bottom: 8rpx;
}

.test-text {
  font-size: 24rpx;
  font-weight: 500;
}

/* 通知历史 */
.history-section {
  margin-bottom: 30rpx;
}

.history-stats {
  display: flex;
  justify-content: space-around;
  margin: 20rpx 0;
  padding: 24rpx;
  background: white;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #667eea;
  line-height: 1;
  margin-bottom: 8rpx;
}

.stat-label {
  font-size: 24rpx;
  color: #6b7280;
}

.clear-history-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 20rpx;
  background: #f3f4f6;
  border: none;
  border-radius: 12rpx;
  color: #6b7280;
  font-size: 28rpx;
  transition: all 0.3s ease;
}

.clear-history-btn:active {
  background: #e5e7eb;
  transform: scale(0.98);
}

.clear-icon {
  font-size: 28rpx;
}

.clear-text {
  font-size: 28rpx;
}

/* 设置项 */
.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f8f9fa;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
  margin-right: 20rpx;
}

.setting-label {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 8rpx;
  display: block;
}

.setting-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
}


/* 操作按钮 */
.action-buttons {
  margin-top: 40rpx;
}

.save-btn {
  width: 100%;
  padding: 24rpx;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 20rpx rgba(102, 126, 234, 0.4);
}

.save-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
