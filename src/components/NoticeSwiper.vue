<template>

  <!-- 🚀 备用简单显示方案 -->
  <view class="simple-notice-list" v-if="notices && notices.length > 0 && showNotices && notices.length <= 3" style="margin: 16rpx; background: #fff; border-radius: 16rpx; overflow: hidden; box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);">
    <view class="simple-header" style="display: flex; justify-content: space-between; align-items: center; padding: 20rpx 24rpx; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
      <view style="display: flex; align-items: center; gap: 12rpx;">
        <text style="font-size: 28rpx;">📢</text>
        <text style="font-size: 28rpx; font-weight: 600;">系统公告</text>
        <text style="font-size: 24rpx; opacity: 0.8; background: rgba(255, 255, 255, 0.2); padding: 4rpx 12rpx; border-radius: 12rpx;">({{ notices.length }})</text>
      </view>
      <view class="header-actions" style="display: flex; align-items: center; gap: 8rpx;">
        <button @click="refreshNotices" v-if="refreshable" class="simple-refresh-btn" style="width: 44rpx; height: 44rpx; border-radius: 50%; background: rgba(255, 255, 255, 0.15); border: 1rpx solid rgba(255, 255, 255, 0.2); color: white; font-size: 22rpx; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; backdrop-filter: blur(10rpx);">
          <text>🔄</text>
        </button>
        <button @click="closeNotices" v-if="closable" class="simple-close-btn" style="width: 44rpx; height: 44rpx; border-radius: 50%; background: rgba(255, 255, 255, 0.15); border: 1rpx solid rgba(255, 255, 255, 0.2); color: white; font-size: 22rpx; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; backdrop-filter: blur(10rpx);">
          <text>×</text>
        </button>
      </view>
    </view>
    
    <view v-for="(notice, index) in notices" :key="notice.id || index" style="padding: 24rpx; border-bottom: 1rpx solid #eee;" :style="{ 'border-bottom': index === notices.length - 1 ? 'none' : '1rpx solid #eee' }">
      <view style="display: flex; align-items: flex-start; margin-bottom: 16rpx; gap: 12rpx;">
        <text style="font-size: 28rpx; margin-top: 2rpx;">{{ getNoticeIcon(notice.type) }}</text>
        <view style="flex: 1;">
          <text style="font-size: 28rpx; font-weight: 600; color: #1e40af; display: block; margin-bottom: 6rpx;">{{ notice.title || '无标题' }}</text>
          <text style="font-size: 22rpx; color: #64748b; background: rgba(100, 116, 139, 0.1); padding: 3rpx 10rpx; border-radius: 10rpx;">{{ formatTime(notice.time || notice.createTime || notice.publishTime) }}</text>
        </view>
        <view v-if="notice.priority >= 4" style="background: #ef4444; color: white; padding: 4rpx 12rpx; border-radius: 12rpx; font-size: 20rpx; font-weight: 600;">{{ getPriorityText(notice.priority) }}</view>
      </view>
      <view style="margin-bottom: 16rpx;">
        <text style="font-size: 26rpx; color: #475569; line-height: 1.6;">{{ notice.content || '无内容' }}</text>
      </view>
      <view style="display: flex; justify-content: space-between; align-items: center; padding-top: 16rpx; border-top: 1rpx solid rgba(0, 0, 0, 0.1);">
        <view style="display: flex; align-items: center; gap: 16rpx;">
          <text style="font-size: 24rpx; color: #475569; background: rgba(71, 85, 105, 0.1); padding: 6rpx 16rpx; border-radius: 16rpx;">{{ getTypeText(notice.type) }}</text>
          <text style="font-size: 24rpx; color: #64748b;">{{ index + 1 }} / {{ notices.length }}</text>
        </view>
        <button @click="viewDetails(notice)" class="simple-detail-btn" style="display: flex; align-items: center; gap: 6rpx; padding: 10rpx 18rpx; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%); border: 1rpx solid rgba(16, 185, 129, 0.2); border-radius: 18rpx; font-size: 20rpx; color: #10b981; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden;">
          <text class="detail-icon">👁️</text>
          <text class="detail-text">详情</text>
        </button>
      </view>
    </view>
  </view>

  <!-- 原来的轮播组件 -->
  <view class="notice-swiper-container" v-else-if="notices && notices.length > 0 && showNotices">
    <view class="swiper-header">
      <view class="header-left">
        <text class="header-icon">📢</text>
        <text class="header-title">系统公告</text>
        <text class="notice-count">({{ notices.length }})</text>
      </view>
      <view class="header-right">
        <view class="action-buttons">
          <button class="refresh-btn" @click="refreshNotices" v-if="refreshable" title="刷新公告">
            <text class="refresh-icon">🔄</text>
          </button>
          <button class="close-btn" @click="closeNotices" v-if="closable" title="关闭公告">
            <text class="close-icon">×</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 公告轮播 -->
    <view class="swiper-debug" style="background: #ffeb3b; color: #000; padding: 10rpx; font-size: 24rpx;">
      <text>🔍 Swiper调试: notices.length={{ notices.length }}, currentIndex={{ currentIndex }}</text>
    </view>
    
    <swiper 
      class="notice-swiper"
      :indicator-dots="showIndicators"
      :autoplay="autoplay"
      :interval="autoplayInterval"
      :duration="duration"
      :circular="circular"
      indicator-color="rgba(0, 0, 0, .3)"
      indicator-active-color="#007aff"
      @change="onSwiperChange"
      style="height: 300rpx; background: #f0f0f0;"
    >
      <swiper-item 
        v-for="(notice, index) in notices" 
        :key="notice.id || index"
        class="swiper-item"
        style="height: 100%; display: flex; align-items: center; justify-content: center;"
      >
        <!-- 添加调试信息 -->
        <view style="background: #e3f2fd; color: #000; padding: 20rpx; margin: 10rpx; border-radius: 8rpx; width: 90%;">
          <text style="font-size: 24rpx; color: #666;">🔍 调试: 第{{ index + 1 }}个公告</text>
        </view>
        
        <view class="notice-card" :class="[getNoticeTypeClass(notice), getPriorityClass(notice), getStickyClass(notice)]" style="width: 100%; height: 100%; margin: 10rpx;">
          <view class="notice-header">
            <view class="notice-icon-wrapper">
              <text class="notice-icon">{{ getNoticeIcon(notice.type) }}</text>
            </view>
            <view class="notice-title-wrapper">
              <text class="notice-title">{{ notice.title || '无标题' }}</text>
              <text class="notice-time">{{ formatTime(notice.time || notice.createTime || notice.publishTime) }}</text>
            </view>
            <view class="notice-badges">
              <view class="priority-badge" v-if="notice.priority >= 4" :class="getPriorityBadgeClass(notice.priority)">
                <text class="priority-text">{{ getPriorityText(notice.priority) }}</text>
              </view>
              <view class="sticky-badge" v-if="notice.isSticky">
                <text class="sticky-text">置顶</text>
              </view>
            </view>
          </view>
          
          <view class="notice-content">
            <text class="notice-text">{{ notice.content || '无内容' }}</text>
          </view>
          
          <view class="notice-footer">
            <view class="notice-meta">
              <text class="notice-type">{{ getTypeText(notice.type) }}</text>
              <text class="notice-index">{{ currentIndex + 1 }} / {{ notices.length }}</text>
            </view>
            <view class="notice-actions">
              <button class="action-btn view-btn" @click="viewDetails(notice)">
                <text class="action-icon">👁️</text>
                <text class="action-text">详情</text>
              </button>
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <!-- 自定义指示器 (当公告数量较多时) -->
    <view class="custom-indicators" v-if="notices.length > 1 && !showIndicators">
      <view class="indicator-wrapper">
        <view 
          v-for="(notice, index) in notices" 
          :key="index"
          class="indicator-dot" 
          :class="{ active: currentIndex === index }"
          @click="switchToNotice(index)"
        >
          <text class="dot-number">{{ index + 1 }}</text>
        </view>
      </view>
      <view class="swiper-controls">
        <button class="control-btn" @click="prevNotice" :disabled="currentIndex === 0">
          <text class="control-icon">‹</text>
        </button>
        <button class="control-btn" @click="nextNotice" :disabled="currentIndex === notices.length - 1">
          <text class="control-icon">›</text>
        </button>
      </view>
    </view>
  </view>

  <!-- 🔧 当没有公告时显示的占位内容 -->
  <view class="notice-placeholder" v-else-if="showNotices">
    <view class="placeholder-header">
      <text class="placeholder-icon">📢</text>
      <text class="placeholder-title">系统公告</text>
    </view>
    <view class="placeholder-content">
      <view class="placeholder-icon-wrapper">
        <text class="placeholder-main-icon">📭</text>
      </view>
      <text class="placeholder-text">暂无公告内容</text>
      <text class="placeholder-subtitle">点击下方按钮刷新获取最新公告</text>
      <button class="placeholder-refresh" @click="refreshNotices" v-if="refreshable">
        <text class="refresh-icon">🔄</text>
        <text class="refresh-text">刷新公告</text>
      </button>
    </view>
  </view>
</template>

<script>
import timeMixin from '@/mixins/timeMixin.js'
import { IOSDateFix } from '../utils/iosDateFix.js'
import { TimeUtils } from '../utils/timeUtils.js'

export default {
  name: 'NoticeSwiper',
  mixins: [timeMixin],
  props: {
    notices: {
      type: Array,
      default: () => []
    },
    showNotices: {
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
    autoplay: {
      type: Boolean,
      default: true
    },
    autoplayInterval: {
      type: Number,
      default: 5000
    },
    duration: {
      type: Number,
      default: 500
    },
    circular: {
      type: Boolean,
      default: true
    },
    showIndicators: {
      type: Boolean,
      default: false // 使用自定义指示器
    }
  },
  data() {
    return {
      currentIndex: 0
    }
  },
  watch: {
    notices: {
      handler(newNotices) {
        console.log('🔄 NoticeSwiper - notices变化:', newNotices)
        if (!newNotices || newNotices.length === 0) {
          console.log('⚠️ NoticeSwiper - 公告列表为空')
        }
      },
      immediate: true
    },
    showNotices: {
      handler(newValue) {
        console.log('🔄 NoticeSwiper - showNotices变化:', newValue)
      },
      immediate: true
    }
  },
  methods: {
    /**
     * 关闭公告列表
     */
    closeNotices() {
      this.$emit('close')
    },
    
    /**
     * 刷新公告列表
     */
    refreshNotices() {
      console.log('🔄 NoticeSwiper - 刷新公告')
      this.$emit('refresh')
    },
    
    /**
     * 查看详情
     */
    viewDetails(notice) {
      this.$emit('view-details', notice)
    },
    
    /**
     * Swiper变化事件
     */
    onSwiperChange(e) {
      this.currentIndex = e.detail.current
      this.$emit('change', e.detail.current, this.notices[e.detail.current])
    },
    
    /**
     * 切换到指定公告
     */
    switchToNotice(index) {
      this.currentIndex = index
      // 注意：这里无法直接控制swiper的位置，需要通过其他方式实现
      this.$emit('switch', index)
    },
    
    /**
     * 上一个公告
     */
    prevNotice() {
      if (this.currentIndex > 0) {
        this.switchToNotice(this.currentIndex - 1)
      }
    },
    
    /**
     * 下一个公告
     */
    nextNotice() {
      if (this.currentIndex < this.notices.length - 1) {
        this.switchToNotice(this.currentIndex + 1)
      }
    },
    
    /**
     * 获取公告类型样式类名
     */
    getNoticeTypeClass(notice) {
      return notice.type || 'info'
    },
    
    /**
     * 获取优先级样式类名
     */
    getPriorityClass(notice) {
      if (!notice.priority) return ''
      return `priority-${notice.priority}`
    },
    
    /**
     * 获取置顶样式类名
     */
    getStickyClass(notice) {
      return notice.isSticky ? 'sticky-notice' : ''
    },
    
    /**
     * 获取优先级徽章样式类名
     */
    getPriorityBadgeClass(priority) {
      return `priority-badge-${priority}`
    },
    
    /**
     * 获取公告图标
     */
    getNoticeIcon(type) {
      const iconMap = {
        info: 'ℹ️',
        warning: '⚠️',
        error: '❌',
        success: '✅'
      }
      return iconMap[type] || 'ℹ️'
    },
    
    /**
     * 格式化时间
     */
    formatTime(time) {
      if (!time) return ''
      
      try {
        // 🍎 使用iOS兼容的日期创建
        const date = IOSDateFix.safeCreateDate(time)
        if (!date) return ''
        
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
        return TimeUtils.formatDate(date, 'YYYY-MM-DD HH:mm')
      } catch (error) {
        console.error('时间格式化失败:', error)
        return ''
      }
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
/* DEBUG 样式 */
.debug-info {
  position: relative;
  z-index: 9999;
}

/* 简单显示方案样式 */
.simple-refresh-btn, .simple-close-btn {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.simple-refresh-btn::before, .simple-close-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.simple-refresh-btn:hover::before, .simple-close-btn:hover::before {
  transform: translateX(100%);
}

.simple-refresh-btn:hover, .simple-close-btn:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  border-color: rgba(255, 255, 255, 0.4) !important;
  transform: scale(1.05);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.simple-refresh-btn:active, .simple-close-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.3) !important;
}

.simple-refresh-btn:hover text {
  transform: rotate(180deg);
  transition: transform 0.2s ease;
}

.simple-close-btn:hover text {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

.simple-detail-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.1), transparent);
  transition: left 0.6s;
}

.simple-detail-btn:hover::before {
  left: 100%;
}

.simple-detail-btn:hover {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%) !important;
  border-color: rgba(16, 185, 129, 0.3) !important;
  transform: translateY(-1rpx);
  box-shadow: 0 4rpx 12rpx rgba(16, 185, 129, 0.2);
}

.simple-detail-btn:active {
  transform: translateY(0);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.1) 100%) !important;
}

.simple-detail-btn:hover .detail-icon {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

.simple-detail-btn:hover .detail-text {
  font-weight: 600;
  transition: font-weight 0.2s ease;
}

.notice-swiper-container {
  margin: 16rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

/* 占位内容样式 */
.notice-placeholder {
  margin: 16rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  border: 2rpx dashed #ccc;
}

.placeholder-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 20rpx 24rpx;
  background: linear-gradient(135deg, #f1f3f4 0%, #e8eaed 100%);
  color: #666;
}

.placeholder-icon {
  font-size: 28rpx;
  opacity: 0.6;
}

.placeholder-title {
  font-size: 28rpx;
  font-weight: 600;
  opacity: 0.6;
}

.placeholder-content {
  padding: 40rpx 24rpx;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.placeholder-icon-wrapper {
  margin-bottom: 8rpx;
}

.placeholder-main-icon {
  font-size: 64rpx;
  opacity: 0.6;
  display: block;
}

.placeholder-text {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.placeholder-subtitle {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 24rpx;
  opacity: 0.8;
}

.placeholder-refresh {
  background: linear-gradient(135deg, #007aff 0%, #0056b3 100%);
  color: white;
  padding: 16rpx 32rpx;
  border-radius: 24rpx;
  border: none;
  font-size: 26rpx;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 8rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.placeholder-refresh::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s;
}

.placeholder-refresh:hover::before {
  left: 100%;
}

.placeholder-refresh:hover {
  background: linear-gradient(135deg, #0056b3 0%, #004494 100%);
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 16rpx rgba(0, 122, 255, 0.4);
}

.placeholder-refresh:active {
  transform: translateY(0);
  box-shadow: 0 2rpx 8rpx rgba(0, 122, 255, 0.3);
}

.refresh-icon {
  font-size: 24rpx;
  transition: transform 0.3s ease;
}

.placeholder-refresh:hover .refresh-icon {
  transform: rotate(180deg);
}

.refresh-text {
  font-weight: 500;
}

.swiper-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 24rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.header-icon {
  font-size: 28rpx;
  line-height: 1;
}

.header-title {
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1;
}

.notice-count {
  font-size: 24rpx;
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.2);
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.refresh-btn, .close-btn {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10rpx);
  position: relative;
  overflow: hidden;
}

.refresh-btn::before, .close-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s;
}

.refresh-btn:hover::before, .close-btn:hover::before {
  transform: translateX(100%);
}

.refresh-btn:hover, .close-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.05);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
}

.refresh-btn:active, .close-btn:active {
  transform: scale(0.95);
  background: rgba(255, 255, 255, 0.3);
}

.refresh-icon, .close-icon {
  font-size: 22rpx;
  color: white;
  line-height: 1;
  font-weight: 600;
  transition: transform 0.2s ease;
}

.refresh-btn:hover .refresh-icon {
  transform: rotate(180deg);
}

.close-btn:hover .close-icon {
  transform: scale(1.1);
}

.notice-swiper {
  height: auto;
  min-height: 200rpx;
}

.swiper-item {
  height: auto;
}

.notice-card {
  padding: 24rpx;
  border-left: 6rpx solid #007aff;
  background: #f8f9fa;
  transition: all 0.2s ease;
  min-height: 180rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* 公告类型样式 */
.notice-card.info {
  border-left-color: #007aff;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.notice-card.warning {
  border-left-color: #f59e0b;
  background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
}

.notice-card.error {
  border-left-color: #ef4444;
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
}

.notice-card.success {
  border-left-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
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
  word-break: break-word;
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

.notice-badges {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  align-items: flex-end;
}

.priority-badge {
  padding: 4rpx 12rpx;
  border-radius: 12rpx;
  font-size: 20rpx;
  font-weight: 600;
  color: white;
}

.priority-badge.priority-badge-4 {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.priority-badge.priority-badge-5 {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  animation: pulse 2s infinite;
}

.sticky-badge {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  border-radius: 12rpx;
  padding: 4rpx 12rpx;
}

.sticky-text, .priority-text {
  color: white;
  font-size: 20rpx;
  font-weight: 600;
  line-height: 1;
}

.notice-content {
  flex: 1;
  margin-bottom: 16rpx;
}

.notice-text {
  font-size: 26rpx;
  color: #475569;
  line-height: 1.6;
  word-break: break-word;
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

.notice-index {
  font-size: 24rpx;
  color: #64748b;
  background: rgba(100, 116, 139, 0.1);
  padding: 6rpx 16rpx;
  border-radius: 16rpx;
  font-weight: 500;
}

.notice-actions {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6rpx;
  padding: 8rpx 16rpx;
  background: rgba(16, 185, 129, 0.1);
  border: 1rpx solid rgba(16, 185, 129, 0.2);
  border-radius: 16rpx;
  font-size: 20rpx;
  color: #10b981;
  transition: all 0.2s ease;
  font-weight: 500;
}

.action-btn:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.4);
  transform: translateY(-1rpx);
}

.action-icon {
  font-size: 18rpx;
  line-height: 1;
}

.action-text {
  font-size: 20rpx;
  line-height: 1;
}

.custom-indicators {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 24rpx;
  background: #f8f9fa;
  border-top: 1rpx solid rgba(0, 0, 0, 0.1);
}

.indicator-wrapper {
  display: flex;
  gap: 8rpx;
}

.indicator-dot {
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.indicator-dot.active {
  background: #007aff;
  transform: scale(1.2);
}

.dot-number {
  font-size: 20rpx;
  color: #666;
  font-weight: 600;
  line-height: 1;
}

.indicator-dot.active .dot-number {
  color: white;
}

.swiper-controls {
  display: flex;
  gap: 8rpx;
}

.control-btn {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #007aff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.control-btn:disabled {
  background: rgba(0, 0, 0, 0.1);
  cursor: not-allowed;
}

.control-btn:not(:disabled):hover {
  background: #0056b3;
  transform: scale(1.1);
}

.control-icon {
  font-size: 24rpx;
  color: white;
  font-weight: bold;
  line-height: 1;
}

.control-btn:disabled .control-icon {
  color: #999;
}

/* 动画效果 */
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

/* 置顶公告特殊效果 */
.notice-card.sticky-notice {
  border-left-width: 8rpx;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

/* 高优先级公告特殊效果 */
.notice-card.priority-4,
.notice-card.priority-5 {
  border-left-width: 8rpx;
}

.notice-card.priority-5 {
  border-left-width: 10rpx;
  animation: urgentGlow 2s infinite;
}

@keyframes urgentGlow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8rpx rgba(239, 68, 68, 0);
  }
}
</style>