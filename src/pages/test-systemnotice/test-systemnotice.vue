<template>
  <view class="test-container">
    <view class="test-header">
      <text class="test-title">SystemNotice组件测试</text>
      <text class="test-desc">测试微信小程序CSS兼容性修复</text>
    </view>
    
    <!-- 普通信息公告 -->
    <SystemNotice 
      :notice="infoNotice"
      :showNotice="true"
      :closable="true"
      :refreshable="true"
      :showFooter="true"
      @close="handleClose"
      @refresh="handleRefresh"
      @view-details="handleViewDetails"
    />
    
    <!-- 警告公告 -->
    <SystemNotice 
      :notice="warningNotice"
      :showNotice="true"
      :closable="true"
      :refreshable="true"
      :showFooter="true"
      @close="handleClose"
      @refresh="handleRefresh"
      @view-details="handleViewDetails"
    />
    
    <!-- 高优先级错误公告 -->
    <SystemNotice 
      :notice="errorNotice"
      :showNotice="true"
      :closable="true"
      :refreshable="true"
      :showFooter="true"
      @close="handleClose"
      @refresh="handleRefresh"
      @view-details="handleViewDetails"
    />
    
    <!-- 置顶公告 -->
    <SystemNotice 
      :notice="stickyNotice"
      :showNotice="true"
      :closable="true"
      :refreshable="true"
      :showFooter="true"
      @close="handleClose"
      @refresh="handleRefresh"
      @view-details="handleViewDetails"
    />
    
    <!-- 最高优先级紧急公告 -->
    <SystemNotice 
      :notice="urgentNotice"
      :showNotice="true"
      :closable="true"
      :refreshable="true"
      :showFooter="true"
      @close="handleClose"
      @refresh="handleRefresh"
      @view-details="handleViewDetails"
    />
    
    <view class="test-controls">
      <button class="test-btn" @click="toggleAllNotices">
        {{ showAllNotices ? '隐藏所有公告' : '显示所有公告' }}
      </button>
      <button class="test-btn" @click="refreshAllNotices">
        刷新所有公告
      </button>
    </view>
    
    <view class="test-log">
      <text class="log-title">操作日志：</text>
      <view class="log-item" v-for="(log, index) in logs" :key="index">
        <text class="log-text">{{ log }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import SystemNotice from '@/components/SystemNotice.vue'

export default {
  name: 'TestSystemNotice',
  components: {
    SystemNotice
  },
  data() {
    return {
      showAllNotices: true,
      logs: [],
      infoNotice: {
        id: 1,
        title: '系统维护通知',
        content: '系统将于今晚23:00-次日01:00进行例行维护，期间部分功能可能暂停使用。',
        type: 'info',
        priority: 2,
        time: new Date().toISOString(),
        isSticky: false
      },
      warningNotice: {
        id: 2,
        title: '网络连接异常',
        content: '检测到您的网络连接不稳定，可能影响数据同步，请检查网络设置。',
        type: 'warning',
        priority: 3,
        time: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        isSticky: false
      },
      errorNotice: {
        id: 3,
        title: '数据同步失败',
        content: '无法同步最新数据，请检查网络连接后重试。如问题持续存在，请联系客服。',
        type: 'error',
        priority: 4,
        time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        isSticky: false
      },
      stickyNotice: {
        id: 4,
        title: '重要功能更新',
        content: '新版本已发布，增加了扫码点餐功能，提升用餐体验。请及时更新应用。',
        type: 'success',
        priority: 3,
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isSticky: true
      },
      urgentNotice: {
        id: 5,
        title: '紧急安全警告',
        content: '发现安全漏洞，请立即更新到最新版本！旧版本存在数据泄露风险。',
        type: 'error',
        priority: 5,
        time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        isSticky: true
      }
    }
  },
  methods: {
    handleClose(notice) {
      this.addLog(`关闭公告: ${notice?.title || '未知公告'}`)
    },
    
    handleRefresh(notice) {
      this.addLog(`刷新公告: ${notice?.title || '未知公告'}`)
      // 模拟刷新，更新时间
      if (notice) {
        notice.time = new Date().toISOString()
      }
    },
    
    handleViewDetails(notice) {
      this.addLog(`查看详情: ${notice?.title || '未知公告'}`)
      uni.showModal({
        title: '公告详情',
        content: `标题: ${notice.title}\n内容: ${notice.content}\n类型: ${notice.type}\n优先级: ${notice.priority}`,
        showCancel: false
      })
    },
    
    toggleAllNotices() {
      this.showAllNotices = !this.showAllNotices
      this.addLog(`${this.showAllNotices ? '显示' : '隐藏'}所有公告`)
    },
    
    refreshAllNotices() {
      const now = new Date().toISOString()
      this.infoNotice.time = now
      this.warningNotice.time = now
      this.errorNotice.time = now
      this.stickyNotice.time = now
      this.urgentNotice.time = now
      this.addLog('刷新所有公告时间')
    },
    
    addLog(message) {
      const timestamp = new Date().toLocaleTimeString()
      this.logs.unshift(`[${timestamp}] ${message}`)
      if (this.logs.length > 10) {
        this.logs.pop()
      }
    }
  },
  
  onLoad() {
    this.addLog('SystemNotice测试页面加载完成')
    this.addLog('测试CSS兼容性修复：移除属性选择器、伪元素、媒体查询')
  }
}
</script>

<style scoped>
.test-container {
  padding: 32rpx;
  background: #f5f5f5;
  min-height: 100vh;
}

.test-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.test-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 16rpx;
}

.test-desc {
  display: block;
  font-size: 28rpx;
  color: #64748b;
  margin-bottom: 32rpx;
}

.test-controls {
  display: flex;
  justify-content: center;
  gap: 24rpx;
  margin: 40rpx 0;
}

.test-btn {
  padding: 16rpx 32rpx;
  background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
  color: white;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.3);
  transition: all 0.2s ease;
}

.test-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(0, 122, 255, 0.2);
}

.test-log {
  margin-top: 40rpx;
  padding: 24rpx;
  background: white;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.log-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 20rpx;
}

.log-item {
  padding: 12rpx 0;
  border-bottom: 1rpx solid #e5e7eb;
}

.log-item:last-child {
  border-bottom: none;
}

.log-text {
  font-size: 26rpx;
  color: #374151;
  line-height: 1.5;
}
</style>
