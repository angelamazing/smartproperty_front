<template>
  <view class="about-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <button class="back-btn" @click="goBack">←</button>
      <text class="page-title">关于我们</text>
    </view>

    <!-- 内容区域 -->
    <view class="content-container">
      <!-- 应用信息 -->
      <view class="app-info">
        <image class="app-logo" src="/static/images/logo.png" mode="aspectFit" />
        <text class="app-name">智慧物业管理系统</text>
        <text class="app-version">版本 1.0.0</text>
      </view>

      <!-- 应用介绍 -->
      <view class="info-section">
        <text class="section-title">应用介绍</text>
        <text class="section-content">
          智慧物业管理系统是一款专为物业管理公司设计的综合性管理平台，提供报餐管理、球馆预约、人员管理等功能，帮助物业公司提升管理效率，为业主提供更好的服务体验。
        </text>
      </view>

      <!-- 主要功能 -->
      <view class="info-section">
        <text class="section-title">主要功能</text>
        <view class="feature-list">
          <view class="feature-item">
            <text class="feature-icon">🍽️</text>
            <text class="feature-text">日常报餐管理</text>
          </view>
          <view class="feature-item">
            <text class="feature-icon">🏸</text>
            <text class="feature-text">球馆预约系统</text>
          </view>
          <view class="feature-item">
            <text class="feature-icon">👥</text>
            <text class="feature-text">人员信息管理</text>
          </view>
          <view class="feature-item">
            <text class="feature-icon">📊</text>
            <text class="feature-text">数据统计分析</text>
          </view>
        </view>
      </view>

      <!-- 联系方式 -->
      <view class="info-section">
        <text class="section-title">联系我们</text>
        <view class="contact-list">
          <view class="contact-item">
            <text class="contact-label">客服电话：</text>
            <text class="contact-value">XX</text>
          </view>
          <view class="contact-item">
            <text class="contact-label">邮箱地址：</text>
            <text class="contact-value">XX</text>
          </view>
          <view class="contact-item">
            <text class="contact-label">工作时间：</text>
            <text class="contact-value">周一至周五 08:30-17:30</text>
          </view>
        </view>
      </view>

      <!-- 版权信息 -->
      <view class="copyright">
        <text class="copyright-text">© 2024 智慧物业管理系统</text>
        <text class="copyright-text">版权所有，保留一切权利</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'About',
  methods: {
    /**
     * 返回上一页
     */
    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.about-page {
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

/* 应用信息 */
.app-info {
  background: white;
  border-radius: 16rpx;
  padding: 40rpx;
  text-align: center;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.app-logo {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 20rpx;
}

.app-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  display: block;
}

.app-version {
  font-size: 26rpx;
  color: #666;
  background: #f0f0f0;
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}

/* 信息区块 */
.info-section {
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
  margin-bottom: 20rpx;
  display: block;
  padding-bottom: 15rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.section-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.6;
}

/* 功能列表 */
.feature-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.feature-icon {
  font-size: 32rpx;
  width: 60rpx;
  text-align: center;
}

.feature-text {
  font-size: 28rpx;
  color: #333;
}

/* 联系方式 */
.contact-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.contact-item {
  display: flex;
  align-items: center;
}

.contact-label {
  font-size: 28rpx;
  color: #666;
  width: 160rpx;
  flex-shrink: 0;
}

.contact-value {
  font-size: 28rpx;
  color: #333;
}

/* 版权信息 */
.copyright {
  text-align: center;
  padding: 40rpx 0;
}

.copyright-text {
  font-size: 24rpx;
  color: #999;
  line-height: 1.8;
  display: block;
}
</style>
