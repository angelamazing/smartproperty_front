<template>
  <view class="form-status-hint">
    <!-- 表单验证提示 -->
    <view class="hint-section">
      <view class="hint-header">
        <text class="hint-icon">📋</text>
        <text class="hint-title">填写提示</text>
      </view>
      <view class="hint-content">
        <view class="hint-item">
          <text class="hint-dot">•</text>
          <text class="hint-text">带 * 的字段为必填项</text>
        </view>
        <view class="hint-item">
          <text class="hint-dot">•</text>
          <text class="hint-text">性别、部门、角色可以点击取消选择</text>
        </view>
        <view class="hint-item">
          <text class="hint-dot">•</text>
          <text class="hint-text">初始密码留空将使用手机号后6位</text>
        </view>
      </view>
    </view>
    
    <!-- 验证错误提示 -->
    <view v-if="validation错误s.length > 0" class="error-section">
      <view class="error-header">
        <text class="error-icon">⚠️</text>
        <text class="error-title">请修正以下错误</text>
      </view>
      <view class="error-content">
        <view 
          v-for="(error, index) in validation错误s" 
          :key="index"
          class="error-item"
        >
          <text class="error-dot">•</text>
          <text class="error-text">{{ error }}</text>
        </view>
      </view>
    </view>
    
    <!-- H5环境提示 -->
    <view v-if="isH5" class="h5-notice">
      <text class="notice-icon">💡</text>
      <text class="notice-text">当前在浏览器环境中，使用自定义选择器以获得最佳体验</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'FormStatusHint',
  props: {
    isValid: {
      type: Boolean,
      default: true
    },
    validation错误s: {
      type: Array,
      default: () => []
    },
    isH5: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="scss" scoped>
.form-status-hint {
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.hint-section,
.error-section,
.h5-notice {
  padding: 20rpx;
  border-radius: 12rpx;
  border: 2rpx solid #e9ecef;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.hint-section {
  background: #f8f9fa;
  border-color: #e9ecef;
}

.error-section {
  background: #fff5f5;
  border-color: #fed7d7;
}

.h5-notice {
  background: #f0f8ff;
  border-color: #bee3f8;
}

.hint-header,
.error-header {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-bottom: 15rpx;
  padding-bottom: 10rpx;
  border-bottom: 2rpx solid;
}

.hint-header {
  border-bottom-color: #e9ecef;
}

.error-header {
  border-bottom-color: #fed7d7;
}

.hint-icon {
  font-size: 32rpx;
  color: #667eea;
}

.error-icon {
  font-size: 32rpx;
  color: #e53e3e;
}

.hint-title,
.error-title {
  font-size: 28rpx;
  font-weight: bold;
}

.hint-title {
  color: #333;
}

.error-title {
  color: #c53030;
}

.hint-content,
.error-content {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.hint-item,
.error-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.hint-dot {
  font-size: 24rpx;
  color: #667eea;
}

.error-dot {
  font-size: 24rpx;
  color: #e53e3e;
}

.hint-text {
  font-size: 24rpx;
  color: #666;
  line-height: 1.4;
}

.error-text {
  font-size: 24rpx;
  color: #c53030;
  line-height: 1.4;
}

.notice-icon {
  font-size: 32rpx;
  color: #3182ce;
}

.notice-text {
  font-size: 24rpx;
  color: #4a5568;
  line-height: 1.4;
}
</style>
