<template>
  <view class="help-center-page">
    <!-- 页面头部 -->
    <view class="page-header">
      <button class="back-btn" @click="goBack">←</button>
      <text class="page-title">帮助中心</text>
    </view>

    <!-- 内容区域 -->
    <view class="content-container">
      <!-- 搜索框 -->
      <view class="search-section">
        <view class="search-box">
          <text class="search-icon">🔍</text>
          <input 
            class="search-input"
            v-model="searchKeyword"
            placeholder="搜索帮助内容..."
            @input="onSearch"
          />
        </view>
      </view>

      <!-- 常见问题 -->
      <view class="faq-section">
        <text class="section-title">常见问题</text>
        
        <view class="faq-list">
          <view 
            v-for="(faq, index) in filteredFaqs" 
            :key="index"
            class="faq-item"
            @click="toggleFaq(index)"
          >
            <view class="faq-header">
              <text class="faq-question">{{ faq.question }}</text>
              <text class="faq-arrow" :class="{ expanded: faq.expanded }">▼</text>
            </view>
            <view v-if="faq.expanded" class="faq-answer">
              <text>{{ faq.answer }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 使用指南 -->
      <view class="guide-section">
        <text class="section-title">使用指南</text>
        
        <view class="guide-list">
          <view class="guide-item">
            <text class="guide-icon">🍽️</text>
            <view class="guide-content">
              <text class="guide-title">如何报餐？</text>
              <text class="guide-desc">进入报餐页面，选择日期和餐次，点击菜品即可完成报餐</text>
            </view>
          </view>
          
          <view class="guide-item">
            <text class="guide-icon">🏸</text>
            <view class="guide-content">
              <text class="guide-title">如何预约球馆？</text>
              <text class="guide-desc">进入预约页面，选择球馆和时间段，确认预约信息即可</text>
            </view>
          </view>
          
          <view class="guide-item">
            <text class="guide-icon">👤</text>
            <view class="guide-content">
              <text class="guide-title">如何修改个人信息？</text>
              <text class="guide-desc">进入个人中心，点击个人信息，即可查看和修改个人资料</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 联系客服 -->
      <view class="contact-section">
        <text class="section-title">联系客服</text>
        <view class="contact-info">
          <text class="contact-text">如果以上内容无法解决您的问题，请联系客服：</text>
          <view class="contact-buttons">
            <button class="contact-btn phone" @click="callService">📞 电话客服</button>
            <button class="contact-btn online" @click="onlineService">💬 在线客服</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'HelpCenter',
  data() {
    return {
      searchKeyword: '',
      faqs: [
        {
          question: '忘记密码怎么办？',
          answer: '您可以通过手机号验证码重置密码，或者联系管理员重置密码。',
          expanded: false
        },
        {
          question: '如何修改手机号？',
          answer: '请联系管理员修改手机号，或使用原手机号验证后修改。',
          expanded: false
        },
        {
          question: '报餐后可以取消吗？',
          answer: '报餐截止时间前可以取消，超过截止时间无法取消。',
          expanded: false
        },
        {
          question: '球馆预约可以提前多久？',
          answer: '球馆可以提前7天预约，预约成功后请按时到场。',
          expanded: false
        },
        {
          question: '如何查看历史记录？',
          answer: '在个人中心可以查看报餐历史、预约历史等记录。',
          expanded: false
        }
      ]
    }
  },
  computed: {
    filteredFaqs() {
      if (!this.searchKeyword) {
        return this.faqs
      }
      return this.faqs.filter(faq => 
        faq.question.includes(this.searchKeyword) || 
        faq.answer.includes(this.searchKeyword)
      )
    }
  },
  methods: {
    /**
     * 切换FAQ展开状态
     */
    toggleFaq(index) {
      this.faqs[index].expanded = !this.faqs[index].expanded
    },

    /**
     * 搜索处理
     */
    onSearch() {
      // 搜索逻辑已在computed中处理
    },

    /**
     * 电话客服
     */
    callService() {
      uni.makePhoneCall({
        phoneNumber: '400-123-4567'
      })
    },

    /**
     * 在线客服
     */
    onlineService() {
      uni.showToast({
        title: '在线客服功能开发中',
        icon: 'none'
      })
    },

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
.help-center-page {
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

/* 搜索区域 */
.search-section {
  margin-bottom: 30rpx;
}

.search-box {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 24rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.search-icon {
  font-size: 32rpx;
  margin-right: 20rpx;
  color: #999;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  border: none;
  outline: none;
}

/* FAQ区域 */
.faq-section {
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
  margin-bottom: 30rpx;
  display: block;
  padding-bottom: 15rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.faq-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.faq-item {
  border: 2rpx solid #f0f0f0;
  border-radius: 12rpx;
  overflow: hidden;
  transition: all 0.3s ease;
}

.faq-item:hover {
  border-color: #667eea;
}

.faq-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  cursor: pointer;
}

.faq-question {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.faq-arrow {
  font-size: 24rpx;
  color: #999;
  transition: transform 0.3s ease;
}

.faq-arrow.expanded {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 20rpx;
  background: white;
  border-top: 1rpx solid #f0f0f0;
}

.faq-answer text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}

/* 使用指南 */
.guide-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.guide-list {
  display: flex;
  flex-direction: column;
  gap: 25rpx;
}

.guide-item {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
}

.guide-icon {
  font-size: 40rpx;
  width: 60rpx;
  text-align: center;
  flex-shrink: 0;
}

.guide-content {
  flex: 1;
}

.guide-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.guide-desc {
  font-size: 26rpx;
  color: #666;
  line-height: 1.5;
}

/* 联系客服 */
.contact-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.contact-info {
  text-align: center;
}

.contact-text {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 30rpx;
  display: block;
}

.contact-buttons {
  display: flex;
  gap: 20rpx;
  justify-content: center;
}

.contact-btn {
  padding: 20rpx 40rpx;
  border: none;
  border-radius: 24rpx;
  font-size: 26rpx;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.contact-btn.phone {
  background: #52c41a;
  color: white;
}

.contact-btn.online {
  background: #1890ff;
  color: white;
}

.contact-btn:hover {
  transform: translateY(-2rpx);
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.2);
}
</style>
