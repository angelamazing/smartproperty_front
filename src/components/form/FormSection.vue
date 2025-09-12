<template>
  <view class="form-section">
    <text class="section-title">{{ title }}</text>
    <view class="section-content">
      <slot />
    </view>
  </view>
</template>

<script>
export default {
  name: 'FormSection',
  props: {
    title: {
      type: String,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>
.form-section {
  margin-bottom: 20rpx;
  padding: 16rpx;
  background: #ffffff;
  border-radius: 12rpx;
  border: 1rpx solid #f0f0f0;
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 12rpx;
  padding-bottom: 8rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
</style>
