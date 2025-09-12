<template>
  <view class="video-monitoring-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-content">
        <view class="header-icon">📹</view>
        <view class="header-text">
          <text class="page-title">视频监控</text>
          <text class="page-subtitle">实时监控查看系统</text>
        </view>
      </view>
    </view>

    <!-- 功能说明卡片 -->
    <view class="info-card">
      <view class="info-icon">ℹ️</view>
      <view class="info-content">
        <text class="info-title">功能说明</text>
        <text class="info-desc">此功能正在开发中，敬请期待！</text>
      </view>
    </view>

    <!-- 开发状态卡片 -->
    <view class="status-card">
      <view class="status-header">
        <view class="status-icon">🚧</view>
        <text class="status-title">开发状态</text>
      </view>
      <view class="status-content">
        <view class="status-item">
          <text class="status-label">功能状态：</text>
          <text class="status-value">开发中</text>
        </view>
        <view class="status-item">
          <text class="status-label">预计完成：</text>
          <text class="status-value">待定</text>
        </view>
        <view class="status-item">
          <text class="status-label">功能描述：</text>
          <text class="status-value">实时视频监控查看</text>
        </view>
      </view>
    </view>

    <!-- 功能预览卡片 -->
    <view class="preview-card">
      <view class="preview-header">
        <text class="preview-title">功能预览</text>
      </view>
      <view class="preview-content">
        <view class="preview-item">
          <view class="preview-icon">📺</view>
          <text class="preview-text">实时监控画面</text>
        </view>
        <view class="preview-item">
          <view class="preview-icon">🎥</view>
          <text class="preview-text">录像回放功能</text>
        </view>
        <view class="preview-item">
          <view class="preview-icon">📍</view>
          <text class="preview-text">监控点位管理</text>
        </view>
        <view class="preview-item">
          <view class="preview-icon">⚙️</view>
          <text class="preview-text">监控设置配置</text>
        </view>
      </view>
    </view>

    <!-- 监控点位预览 -->
    <view class="camera-preview">
      <view class="camera-header">
        <text class="camera-title">监控点位预览</text>
      </view>
      <view class="camera-grid">
        <view class="camera-item" v-for="(camera, index) in cameraList" :key="index">
          <view class="camera-placeholder">
            <view class="camera-icon">📹</view>
            <text class="camera-name">{{ camera.name }}</text>
            <text class="camera-status">{{ camera.status }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 返回按钮 -->
    <view class="action-buttons">
      <button class="back-btn" @click="goBack">
        <text class="btn-icon">←</text>
        <text class="btn-text">返回首页</text>
      </button>
    </view>

    <!-- 加载状态 -->
    <view class="loading-container" v-if="isLoading">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'VideoMonitoring',
  data() {
    return {
      isLoading: false,
      cameraList: [
        { name: '大门入口', status: '离线' },
        { name: '停车场', status: '离线' },
        { name: '办公楼大厅', status: '离线' },
        { name: '食堂区域', status: '离线' },
        { name: '会议室', status: '离线' },
        { name: '球馆入口', status: '离线' }
      ]
    }
  },

  onLoad() {
    this.initPage()
  },

  methods: {
    /**
     * 初始化页面
     */
    initPage() {
      console.log('视频监控页面初始化')
      // 这里可以添加页面初始化逻辑
    },

    /**
     * 返回上一页
     */
    goBack() {
      uni.navigateBack({
        delta: 1
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.video-monitoring-container {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20rpx;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 30rpx;
  color: #fff;
}

.header-content {
  display: flex;
  align-items: center;
}

.header-icon {
  font-size: 60rpx;
  margin-right: 30rpx;
}

.header-text {
  flex: 1;
}

.page-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  margin-bottom: 10rpx;
  color: #fff;
}

.page-subtitle {
  font-size: 24rpx;
  opacity: 0.9;
  color: #fff;
}

/* 信息卡片 */
.info-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.info-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.info-content {
  flex: 1;
}

.info-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
}

.info-desc {
  font-size: 24rpx;
  color: #666;
  line-height: 1.5;
}

/* 状态卡片 */
.status-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.status-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.status-icon {
  font-size: 32rpx;
  margin-right: 15rpx;
}

.status-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.status-content {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  font-size: 24rpx;
  color: #666;
}

.status-value {
  font-size: 24rpx;
  color: #333;
  font-weight: 500;
}

/* 预览卡片 */
.preview-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.preview-header {
  margin-bottom: 20rpx;
}

.preview-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.preview-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.preview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
  transition: all 0.3s ease;
}

.preview-item:active {
  transform: scale(0.98);
  background: #e9ecef;
}

.preview-icon {
  font-size: 40rpx;
  margin-bottom: 10rpx;
}

.preview-text {
  font-size: 22rpx;
  color: #666;
  text-align: center;
}

/* 监控点位预览 */
.camera-preview {
  background: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.camera-header {
  margin-bottom: 20rpx;
}

.camera-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
}

.camera-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}

.camera-item {
  background: #f8f9fa;
  border-radius: 16rpx;
  padding: 20rpx;
  text-align: center;
  transition: all 0.3s ease;
}

.camera-item:active {
  transform: scale(0.98);
  background: #e9ecef;
}

.camera-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.camera-icon {
  font-size: 40rpx;
  margin-bottom: 10rpx;
  opacity: 0.6;
}

.camera-name {
  font-size: 24rpx;
  color: #333;
  margin-bottom: 5rpx;
  font-weight: 500;
}

.camera-status {
  font-size: 20rpx;
  color: #ff6b6b;
  padding: 4rpx 12rpx;
  background: #ffe0e0;
  border-radius: 12rpx;
}

/* 操作按钮 */
.action-buttons {
  padding: 20rpx 0;
}

.back-btn {
  width: 100%;
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: #fff;
  border: none;
  border-radius: 16rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 600;
  transition: all 0.3s ease;
}

.back-btn:active {
  transform: scale(0.98);
  opacity: 0.9;
}

.btn-icon {
  font-size: 32rpx;
  margin-right: 15rpx;
}

.btn-text {
  font-size: 28rpx;
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
  border-top: 4rpx solid #f093fb;
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

/* 响应式适配 */
@media (max-width: 750rpx) {
  .page-header {
    padding: 30rpx 20rpx;
  }
  
  .header-icon {
    font-size: 50rpx;
    margin-right: 20rpx;
  }
  
  .page-title {
    font-size: 32rpx;
  }
  
  .page-subtitle {
    font-size: 22rpx;
  }
  
  .info-card,
  .status-card,
  .preview-card,
  .camera-preview {
    padding: 24rpx;
  }
  
  .preview-content,
  .camera-grid {
    grid-template-columns: 1fr;
    gap: 15rpx;
  }
}
</style>
