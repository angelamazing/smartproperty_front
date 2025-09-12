<template>
  <view class="bottom-nav">
    <view class="nav-item" @click="goToPage('/pages/index/index')">
      <view class="nav-icon" :class="{ active: currentPage === '/pages/index/index' }">
        <image 
          :src="currentPage === '/pages/index/index' ? '/static/icons/home-active.svg' : '/static/icons/home.svg'" 
          mode="aspectFit"
          class="icon-image"
        />
      </view>
      <text class="nav-text" :class="{ active: currentPage === '/pages/index/index' }">首页</text>
    </view>
    
    <view class="nav-item" @click="goToPage('/pages/dining/dining')">
      <view class="nav-icon" :class="{ active: currentPage === '/pages/dining/dining' }">
        <image 
          :src="currentPage === '/pages/dining/dining' ? '/static/icons/dining-active.svg' : '/static/icons/dining.svg'" 
          mode="aspectFit"
          class="icon-image"
        />
      </view>
      <text class="nav-text" :class="{ active: currentPage === '/pages/dining/dining' }">报餐</text>
    </view>
    
    <view class="nav-item" @click="goToPage('/pages/reservation/reservation')">
      <view class="nav-icon" :class="{ active: currentPage === '/pages/reservation/reservation' }">
        <image 
          :src="currentPage === '/pages/reservation/reservation' ? '/static/icons/reservation-active.svg' : '/static/icons/reservation.svg'" 
          mode="aspectFit"
          class="icon-image"
        />
      </view>
      <text class="nav-text" :class="{ active: currentPage === '/pages/reservation/reservation' }">预约</text>
    </view>
    
    <view class="nav-item" @click="goToPage('/pages/profile/profile')">
      <view class="nav-icon" :class="{ active: currentPage === '/pages/profile/profile' }">
        <image 
          :src="currentPage === '/pages/profile/profile' ? '/static/icons/profile-active.svg' : '/static/icons/profile.svg'" 
          mode="aspectFit"
          class="icon-image"
        />
      </view>
      <text class="nav-text" :class="{ active: currentPage === '/pages/profile/profile' }">我的</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'BottomNav',
  props: {
    currentPage: {
      type: String,
      default: ''
    }
  },
  methods: {
    goToPage(url) {
      if (url === this.currentPage) return
      
      // 判断是TabBar页面还是普通页面
      const tabBarPages = [
        '/pages/index/index',
        '/pages/dining/dining', 
        '/pages/reservation/reservation',
        '/pages/profile/profile'
      ]
      
      if (tabBarPages.includes(url)) {
        uni.switchTab({ url })
      } else {
        uni.switchtab({ url })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background: #ffffff;
  border-top: 1rpx solid #e9ecef;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-item:active {
  transform: scale(0.95);
}

.nav-icon {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 6rpx;
  transition: all 0.3s ease;
}

.nav-icon.active {
  transform: scale(1.1);
}

.icon-image {
  width: 100%;
  height: 100%;
}

.nav-text {
  font-size: 28rpx;
  color: #999999;
  font-weight: 400;
  transition: all 0.3s ease;
}

.nav-text.active {
  color: #667eea;
  font-weight: 500;
}

/* 响应式适配 */
@media (max-width: 750rpx) {
  .bottom-nav {
    height: 120rpx;
  }
  
  .nav-icon {
    width: 56rpx;
    height: 56rpx;
    margin-bottom: 6rpx;
  }
  
  .nav-text {
    font-size: 28rpx;
  }
}
</style>
