<template>
  <view class="system-notice" v-if="notice && showNotice">
    <view class="notice-card" :class="noticeTypeClass" :data-priority="notice.priority" :data-sticky="notice.isSticky">
      <view class="notice-header">
        <view class="notice-icon-wrapper">
          <text class="notice-icon">{{ noticeIcon }}</text>
        </view>
        <view class="notice-title-wrapper">
          <text class="notice-title">{{ notice.title }}</text>
          <text class="notice-time">{{ $formatTime(notice.time) }}</text>
        </view>
        <view class="notice-actions">
          <button class="close-btn" @click="closeNotice" v-if="closable" title="关闭公告">
            <text class="close-icon">×</text>
          </button>
        </view>
      </view>
      
      <view class="notice-content">
        <text class="notice-text">{{ notice.content }}</text>
      </view>
      
      <view class="notice-footer" v-if="showFooter">
        <view class="notice-meta">
          <text class="notice-type">{{ getTypeText(notice.type) }}</text>
          <text class="notice-priority" v-if="notice.priority" :data-priority="notice.priority">{{ getPriorityText(notice.priority) }}</text>
        </view>
        <view class="notice-actions-footer">
          <button class="action-btn" @click="refreshNotice" v-if="refreshable" title="刷新公告">
            <text class="action-icon">🔄</text>
            <text class="action-text">刷新</text>
          </button>
          <button class="action-btn view-btn" @click="viewDetails" title="查看详情">
            <text class="action-icon">👁️</text>
            <text class="action-text">详情</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: '    SystemNotice,',
  mixins: [timeMixin],
  props: {
    notice: {
      type: Object,
      default: null
    },
    showNotice: {
      type: Boolean,
      default: true
    },
    closable: {
      type: Boolean,
      default: true
    },
    refreshable: {
      type: Boolean,
      default: true
    },
    showFooter: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    noticeTypeClass() {
      if (!this.notice) return 'info'
      return this.notice.type || 'info'
    },
    noticeIcon() {
      const iconMap = {
        info: 'ℹ️',
        warning: '⚠️',
        error: '❌',
        success: '✅'
      }
      return iconMap[this.noticeTypeClass] || 'ℹ️'
    }
  },
  methods: {
    /**
     * 关闭公告
     */
    closeNotice() {
      this.$emit('close')
    },
    
    /**
     * 刷新公告
     */
    refreshNotice() {
      this.$emit('refresh')
    },
    
    /**
     * 查看详情
     */
    viewDetails() {
      this.$emit('view-details', this.notice)
    },
    
    /**
     * 格式化时间
     */
    formatTime(time) {
      if (!time) return ''
      
      const date = new Date(time)
      const now = new Date()
      const diff = now - date
      
      // 小于1分钟
      if (diff < 60000) {
        return '刚刚'
      }
      
      // 小于1小时
      if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000)
        return `${minutes}分钟前`
      }
      
      // 小于24小时
      if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000)
        return `${hours}小时前`
      }
      
      // 超过24小时，显示具体日期
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().slice(0, 5)
    },
    
    /**
     * 获取类型文本
     */
    getTypeText(type) {
      const typeMap = {
        info: '信息',
        warning: '警告',
        error: '错误',
        success: '成功'
      }
      return typeMap[type] || '信息'
    },
    
    /**
     * 获取优先级文本
     */
    getPriorityText(priority) {
      const priorityMap = {
        1: '低',
        2: '中',
        3: '高',
        4: '紧急',
        5: '最高'
      }
      return priorityMap[priority] || ''
    }
  }
}
</script>

<style scoped>
.system-notice {
  margin: 16rpx;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
}

.notice-card {
  padding: 24rpx;
  border-left: 6rpx solid #007aff;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  position: relative;
  transition: all 0.2s ease;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 122, 255, 0.08);
  margin: 16rpx;
}

.notice-card:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 4rpx 16rpx rgba(0, 122, 255, 0.15);
}

/* 公告类型样式 */
.notice-card.info {
  border-left-color: #007aff;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  box-shadow: 0 4rpx 20rpx rgba(0, 122, 255, 0.1);
}

.notice-card.warning {
  border-left-color: #f59e0b;
  background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
  box-shadow: 0 4rpx 20rpx rgba(245, 158, 11, 0.1);
}

.notice-card.error {
  border-left-color: #ef4444;
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
  box-shadow: 0 4rpx 20rpx rgba(239, 68, 68, 0.1);
}

.notice-card.success {
  border-left-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  box-shadow: 0 4rpx 20rpx rgba(16, 185, 129, 0.1);
}

.notice-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16rpx;
  gap: 12rpx;
}

.notice-icon-wrapper {
  margin-top: 2rpx;
}

.notice-icon {
  font-size: 28rpx;
  line-height: 1;
}

.notice-title-wrapper {
  flex: 1;
  min-width: 0;
}

.notice-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1e40af;
  line-height: 1.3;
  display: block;
  margin-bottom: 6rpx;
}

.notice-time {
  font-size: 22rpx;
  color: #64748b;
  line-height: 1.2;
  background: rgba(100, 116, 139, 0.1);
  padding: 3rpx 10rpx;
  border-radius: 10rpx;
  display: inline-block;
}

.notice-actions {
  margin-left: auto;
}

.close-btn {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
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

.notice-content {
  margin-bottom: 16rpx;
}

.notice-text {
  font-size: 30rpx;
  color: #475569;
  line-height: 1.7;
  word-break: break-word;
  font-weight: 400;
}

.notice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16rpx;
  border-top: 1rpx solid rgba(0, 0, 0, 0.1);
}

.notice-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.notice-type {
  font-size: 24rpx;
  color: #475569;
  background: rgba(71, 85, 105, 0.1);
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  font-weight: 500;
}

.notice-priority {
  font-size: 24rpx;
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  font-weight: 600;
}

/* 不同优先级的颜色 */
.notice-priority[data-priority="1"] {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.notice-priority[data-priority="2"] {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.notice-priority[data-priority="3"] {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.notice-priority[data-priority="4"] {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
}

.notice-priority[data-priority="5"] {
  color: #991b1b;
  background: rgba(153, 27, 27, 0.1);
}

.notice-actions-footer {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  background: rgba(0, 122, 255, 0.1);
  border: 1rpx solid rgba(0, 122, 255, 0.2);
  border-radius: 16rpx;
  font-size: 20rpx;
  color: #007aff;
  transition: all 0.2s ease;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
}

.action-btn:hover {
  background: rgba(0, 122, 255, 0.2);
  border-color: rgba(0, 122, 255, 0.4);
  transform: translateY(-1rpx);
}

.action-btn.view-btn {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.action-btn.view-btn:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.4);
}

.action-icon {
  font-size: 18rpx;
  line-height: 1;
}

.action-text {
  font-size: 20rpx;
  line-height: 1;
}

/* 响应式设计 */
@media (max-width: 750rpx) {
  .notice-card {
    padding: 20rpx;
  }
  
  .notice-title {
    font-size: 30rpx;
  }
  
  .notice-text {
    font-size: 26rpx;
  }
  
  .notice-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12rpx;
  }
  
  .notice-actions-footer {
    width: 100%;
    justify-content: flex-end;
  }
}

/* 动画效果 */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.system-notice {
  animation: slideIn 0.3s ease-out;
}

/* 高优先级公告特殊样式 */
.notice-card[data-priority="4"],
.notice-card[data-priority="5"] {
  border-left-width: 10rpx;
  animation: pulse 2s infinite;
}

/* 最高优先级公告更强烈的动画 */
.notice-card[data-priority="5"] {
  border-left-width: 12rpx;
  animation: urgentPulse 1.5s infinite;
}

/* 置顶公告特殊样式 */
.notice-card[data-sticky="true"] {
  border-left-width: 12rpx;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  box-shadow: 0 6rpx 25rpx rgba(0, 0, 0, 0.15);
  position: relative;
}

.notice-card[data-sticky="true"]::before {
  content: '置顶';
  position: absolute;
  top: 16rpx;
  right: 16rpx;
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
  font-size: 20rpx;
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-weight: 600;
  box-shadow: 0 2rpx 8rpx rgba(139, 92, 246, 0.3);
}

@keyframes urgentPulse {
  0%, 100% {
    box-shadow: 0 4rpx 12rpx rgba(220, 38, 38, 0.3);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 12rpx 24rpx rgba(220, 38, 38, 0.6);
    transform: scale(1.02);
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 4rpx 12rpx rgba(239, 68, 68, 0.2);
  }
  50% {
    box-shadow: 0 8rpx 20rpx rgba(239, 68, 68, 0.4);
  }
}
</style>
