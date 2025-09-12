<template>
  <view class="register-redirect-container">
    <view class="redirect-message">
      <text class="redirect-title">页面重定向中...</text>
      <text class="redirect-desc">正在跳转到报餐页面</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'DiningRegister',
  
  onLoad(options) {
    console.log('register页面接收到参数:', options)
    
    // 立即重定向到dining页面，保持所有参数
    const params = {}
    if (options.mealType) params.mealType = options.mealType
    if (options.date) params.date = options.date
    
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&')
    const redirectUrl = queryString 
      ? `/pages/dining/dining?${queryString}`
      : '/pages/dining/dining'
    
    console.log('重定向到:', redirectUrl)
    
    // 使用switchTab重定向到tabbar页面
    uni.switchTab({
      url: redirectUrl,
      fail: (err) => {
        console.error('重定向失败:', err)
        // 如果带参数的重定向失败，尝试不带参数的重定向
        uni.switchTab({
          url: '/pages/dining/dining',
          fail: (err2) => {
            console.error('switchTab也失败:', err2)
            uni.showToast({
              title: '页面跳转失败',
              icon: 'none'
            })
          }
        })
      }
    })
  }
}
</script>

<style scoped>
.register-redirect-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f8f9fa;
  padding: 40rpx;
}

.redirect-message {
  text-align: center;
  background: white;
  padding: 60rpx 40rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.redirect-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.redirect-desc {
  display: block;
  font-size: 28rpx;
  color: #666;
}
</style>
