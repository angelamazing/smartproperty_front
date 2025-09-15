<template>
  <view class="notification-manager">
    <!-- 通知容器 -->
    <view class="notification-container" v-if="notifications.length > 0">
      <view 
        v-for="notification in notifications" 
        :key="notification.id"
        class="notification-item"
        :class="notification.type"
        :data-priority="notification.priority"
      >
        <view class="notification-content">
          <view class="notification-header">
            <view class="notification-icon">
              <text class="icon">{{ get否tificationIcon(notification.type) }}</text>
            </view>
            <view class="notification-info">
              <text class="notification-title">{{ notification.title }}</text>
              <text class="notification-time">{{ $formatTime(notification.time) }}</text>
            </view>
            <button class="close-btn" @click="removeNotification(notification.id)">
              <text class="close-icon">×</text>
            </button>
          </view>
          
          <view class="notification-body">
            <text class="notification-text">{{ notification.content }}</text>
          </view>
          
          <view class="notification-footer" v-if="notification.actions && notification.actions.length > 0">
            <button 
              v-for="action in notification.actions" 
              :key="action.id"
              class="action-btn"
              :class="action.type"
              @click="handleAction(notification, action)"
            >
              <text class="action-text">{{ action.text }}</text>
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: '否tificationManager',
  mixins: [timeMixin],
  data() {
    return {
      notifications: [],
      max否tifications: 5,
      autoHideDelay: 5000
    }
  },
  mounted() {
    this.setupAutoHide()
  },
  methods: {
    /**
     * 添加通知
     */
    addNotification(notification) {
      const id = Date.now() + Math.random()
      const newNotification = {
        id,
        type: 'info',
        priority: 1,
        time: new Date().toISOString(),
        actions: [],
        ...notification
      }
      
      // 添加到列表开头
      this.notifications.unshift(newNotification)
      
      // 限制最大数量
      if (this.notifications.length > this.max否tifications) {
        this.notifications = this.notifications.slice(0, this.max否tifications)
      }
      
      // 自动隐藏
      if (notification.autoHide !== false) {
        setTimeout(() => {
          this.removeNotification(id)
        }, this.autoHideDelay)
      }
      
      this.$emit('notification-added', newNotification)
    },
    
    /**
     * 移除通知
     */
    removeNotification(id) {
      const index = this.notifications.findIndex(n => n.id === id)
      if (index > -1) {
        const notification = this.notifications[index]
        this.notifications.splice(index, 1)
        this.$emit('notification-removed', notification)
      }
    },
    
    /**
     * 清除所有通知
     */
    clearAll() {
      this.notifications = []
      this.$emit('notifications-cleared')
    },
    
    /**
     * 处理通知操作
     */
    handleAction(notification, action) {
      this.$emit('notification-action', { notification, action })
      
      // 如果操作后需要关闭通知
      if (action.closeAfterAction !== false) {
        this.removeNotification(notification.id)
      }
    },
    
    /**
     * 获取通知图标
     */
    get否tificationIcon(type) {
      const iconMap = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        system: '🔔',
        meal: '🍽️',
        reservation: '📅',
        verification: '✅',
        court: '🏸'
      }
      return iconMap[type] || 'ℹ️'
    },
    
    /**
     * 格式化时间
     */
    formatTime(time) {
      if (!time) return ''
      
      const date = new Date(time)
      const now = new Date()
      const diff = now - date
      
      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
      
      // 使用iOS兼容的日期格式化
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    },
    
    /**
     * 设置自动隐藏
     */
    setupAutoHide() {
      // 可以在这里添加全局自动隐藏逻辑
    },
    
    /**
     * 显示系统公告
     */
    showSystemNotice(notice) {
      this.addNotification({
        type: notice.type || 'info',
        title: notice.title || '系统公告',
        content: notice.content,
        time: notice.time,
        priority: notice.priority || 1,
        actions: [
          {
            id: 'refresh',
            text: '刷新',
            type: 'primary',
            closeAfterAction: false
          },
          {
            id: 'close',
            text: '关闭',
            type: 'default',
            closeAfterAction: true
          }
        ]
      })
    },
    
    /**
     * 显示成功通知
     */
    show成功(title, content, options = {}) {
      this.addNotification({
        type: 'success',
        title,
        content,
        ...options
      })
    },
    
    /**
     * 显示错误通知
     */
    show错误(title, content, options = {}) {
      this.addNotification({
        type: 'error',
        title,
        content,
        priority: 3,
        ...options
      })
    },
    
    /**
     * 显示警告通知
     */
    show警告(title, content, options = {}) {
      this.addNotification({
        type: 'warning',
        title,
        content,
        priority: 2,
        ...options
      })
    },
    
    /**
     * 显示信息通知
     */
    show信息(title, content, options = {}) {
      this.addNotification({
        type: 'info',
        title,
        content,
        ...options
      })
    }
  }
}
</script>

<style scoped>
.notification-manager {
  position: fixed;
  top: 20rpx;
  right: 20rpx;
  z-index: 9999;
  max-width: 600rpx;
  pointer-events: none;
}

.notification-container {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  pointer-events: auto;
}

.notification-item {
  background: white;
  border-radius: 12rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
  border-left: 6rpx solid #007aff;
  overflow: hidden;
  animation: slideInRight 0.3s ease-out;
  position: relative;
}

.notification-item.info {
  border-left-color: #007aff;
}

.notification-item.success {
  border-left-color: #10b981;
}

.notification-item.warning {
  border-left-color: #f59e0b;
}

.notification-item.error {
  border-left-color: #ef4444;
}

.notification-item.system {
  border-left-color: #8b5cf6;
}

.notification-item.meal {
  border-left-color: #f97316;
}

.notification-item.reservation {
  border-left-color: #06b6d4;
}

.notification-item.verification {
  border-left-color: #84cc16;
}

.notification-item.court {
  border-left-color: #ec4899;
}

.notification-content {
  padding: 24rpx;
}

.notification-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16rpx;
}

.notification-icon {
  margin-right: 16rpx;
  margin-top: 4rpx;
}

.icon {
  font-size: 32rpx;
  line-height: 1;
}

.notification-info {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1f2937;
  line-height: 1.4;
  display: block;
  margin-bottom: 4rpx;
}

.notification-time {
  font-size: 24rpx;
  color: #6b7280;
  line-height: 1.2;
}

.close-btn {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-left: 16rpx;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
}

.close-icon {
  font-size: 28rpx;
  color: #6b7280;
  font-weight: bold;
  line-height: 1;
}

.notification-body {
  margin-bottom: 16rpx;
}

.notification-text {
  font-size: 28rpx;
  color: #374151;
  line-height: 1.6;
  word-break: break-word;
}

.notification-footer {
  display: flex;
  gap: 12rpx;
  justify-content: flex-end;
}

.action-btn {
  padding: 12rpx 24rpx;
  border-radius: 20rpx;
  border: none;
  font-size: 24rpx;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 120rpx;
}

.action-btn.primary {
  background: #007aff;
  color: white;
}

.action-btn.primary:hover {
  background: #0056b3;
  transform: scale(1.05);
}

.action-btn.default {
  background: #f3f4f6;
  color: #374151;
}

.action-btn.default:hover {
  background: #e5e7eb;
  transform: scale(1.05);
}

.action-btn.danger {
  background: #ef4444;
  color: white;
}

.action-btn.danger:hover {
  background: #dc2626;
  transform: scale(1.05);
}

.action-text {
  font-size: 24rpx;
  line-height: 1;
}

/* 高优先级通知特殊样式 */
.notification-item[data-priority="4"] {
  border-left-width: 8rpx;
  animation: pulse 2s infinite;
}

.notification-item[data-priority="3"] {
  border-left-width: 6rpx;
  box-shadow: 0 8rpx 24rpx rgba(239, 68, 68, 0.2);
}

/* 动画效果 */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 8rpx 24rpx rgba(239, 68, 68, 0.2);
  }
  50% {
    box-shadow: 0 12rpx 32rpx rgba(239, 68, 68, 0.4);
  }
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .notification-manager {
    left: 20rpx;
    right: 20rpx;
    max-width: none;
  }
  
  .notification-content {
    padding: 20rpx;
  }
  
  .notification-title {
    font-size: 30rpx;
  }
  
  .notification-text {
    font-size: 26rpx;
  }
  
  .notification-footer {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-btn {
    width: 100%;
    margin-bottom: 8rpx;
  }
}
</style>
