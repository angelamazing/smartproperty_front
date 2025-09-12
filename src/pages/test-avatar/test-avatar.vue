<template>
  <view class="test-avatar-page">
    <view class="header">
      <text class="title">头像加载测试</text>
    </view>
    
    <view class="test-section">
      <text class="section-title">测试头像URL</text>
      <input 
        v-model="testAvatarUrl" 
        placeholder="输入头像URL进行测试"
        class="url-input"
      />
      <view class="button-group">
        <button @click="testAvatar" class="test-btn">测试头像</button>
        <button @click="checkCurrentUrl" class="check-btn">检查URL</button>
      </view>
    </view>
    
    <view class="avatar-display">
      <text class="section-title">头像显示结果</text>
      <view class="avatar-container">
        <UserAvatar 
          :user="test用户" 
          size="large"
        />
      </view>
      <text class="status-text">状态: {{ avatarStatus }}</text>
    </view>
    
    <view class="test-section">
      <text class="section-title">预设测试URL</text>
      <view class="preset-urls">
        <button 
          v-for="(url, index) in presetUrls" 
          :key="index"
          @click="usePresetUrl(url)"
          class="preset-btn"
        >
          {{ url.name }}
        </button>
      </view>
    </view>
    
    <view class="debug-info">
      <text class="section-title">调试信息</text>
      <text class="debug-text">当前URL: {{ testAvatarUrl }}</text>
      <text class="debug-text">用户数据: {{ JSON.stringify(test用户, null, 2) }}</text>
      <text class="debug-text">URL检查结果: {{ urlCheckResult }}</text>
    </view>
  </view>
</template>

<script>
import UserAvatar from '@/components/UserAvatar.vue'
import { checkImageUrl, formatImageUrl, isValidImageUrl } from '@/utils/imageUtils.js'
import { buildStaticUrl } from '@/utils/apiUtils.js'

export default {
  name: 'TestAvatar',
  components: {    UserAvatar,
  },
  data() {
    return {
      testAvatarUrl: '/uploads/avatars/avatar_1756687222017_hsnganr3o.png',
      test用户: {
        nickName: '测试用户',
        avatarUrl: '/uploads/avatars/avatar_1756687222017_hsnganr3o.png',
        role: 'user'
      },
      avatarStatus: '等待测试',
      urlCheckResult: '',
      presetUrls: [
        {
          name: '本地头像1',
          url: '/uploads/avatars/avatar_1756687222017_hsnganr3o.png'
        },
        {
          name: '本地头像2',
          url: '/uploads/avatars/avatar_1756686939130_kqcsvlrgi.png'
        },
        {
          name: '外部头像',
          url: 'https://via.placeholder.com/200x200/3498db/ffffff?text=Avatar'
        },
        {
          name: '无效URL',
          url: 'http://invalid-url-test.com/avatar.png'
        },
        {
          name: '空URL',
          url: ''
        }
      ]
    }
  },
  methods: {
    async testAvatar() {
      this.avatarStatus = '测试中...'
      this.urlCheckResult = ''
      
      // 构建完整的静态文件URL
      const fullUrl = buildStaticUrl(this.testAvatarUrl)
      console.log('完整URL:', fullUrl)
      
      // 检查URL格式
      const isValid = isValidImageUrl(fullUrl)
      console.log('URL格式检查:', isValid)
      
      if (isValid) {
        // 检查URL是否可访问
        try {
          const isAccessible = await checkImageUrl(fullUrl)
          this.urlCheckResult = `URL格式: 有效, 可访问: ${isAccessible ? '是' : '否'}`
          console.log('URL可访问性检查:', isAccessible)
        } catch (error) {
          this.urlCheckResult = `URL格式: 有效, 可访问: 检查失败 (${error.message})`
          console.error('URL检查失败:', error)
        }
      } else {
        this.urlCheckResult = 'URL格式: 无效'
      }
      
      // 更新测试用户数据
      this.test用户.avatarUrl = this.testAvatarUrl
      
      // 模拟状态更新
      setTimeout(() => {
        this.avatarStatus = '测试完成'
      }, 1000)
    },
    
    async usePresetUrl(preset) {
      this.testAvatarUrl = preset.url
      await this.testAvatar()
    },
    
    async checkCurrentUrl() {
      if (!this.testAvatarUrl) {
        this.urlCheckResult = 'URL为空'
        return
      }
      
      this.urlCheckResult = '检查中...'
      
      try {
        const fullUrl = buildStaticUrl(this.testAvatarUrl)
        const isValid = isValidImageUrl(fullUrl)
        const isAccessible = await checkImageUrl(fullUrl)
        this.urlCheckResult = `格式: ${isValid ? '有效' : '无效'}, 可访问: ${isAccessible ? '是' : '否'}`
      } catch (error) {
        this.urlCheckResult = `检查失败: ${error.message}`
      }
    }
  },
  
  mounted() {
    // 自动测试当前URL
    this.testAvatar()
  }
}
</script>

<style scoped>
.test-avatar-page {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.test-section {
  background: white;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 10rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.url-input {
  width: 100%;
  height: 80rpx;
  border: 2rpx solid #ddd;
  border-radius: 8rpx;
  padding: 0 20rpx;
  margin-bottom: 20rpx;
  font-size: 28rpx;
}

.button-group {
  display: flex;
  gap: 20rpx;
}

.test-btn {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 20rpx 40rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  flex: 1;
}

.check-btn {
  background-color: #67c23a;
  color: white;
  border: none;
  padding: 20rpx 40rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  flex: 1;
}

.avatar-display {
  background: white;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 10rpx;
  text-align: center;
}

.avatar-container {
  display: flex;
  justify-content: center;
  margin: 30rpx 0;
}

.status-text {
  font-size: 24rpx;
  color: #666;
}

.preset-urls {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.preset-btn {
  background-color: #67c23a;
  color: white;
  border: none;
  padding: 15rpx 25rpx;
  border-radius: 6rpx;
  font-size: 24rpx;
}

.debug-info {
  background: white;
  padding: 30rpx;
  border-radius: 10rpx;
}

.debug-text {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
  word-break: break-all;
}
</style>
