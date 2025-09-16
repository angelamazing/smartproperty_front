<template>
  <view class="test-container">
    <view class="page-header">
      <text class="page-title">日期修复测试</text>
    </view>

    <view class="test-section">
      <view class="section-title">🧪 问题日期格式测试</view>
      
      <view class="test-item">
        <text class="test-label">测试格式: "9/2/2025, 12:59:21 AM"</text>
        <button @click="testProblematicDate" class="test-btn">测试</button>
      </view>
      
      <view v-if="testResult" class="test-result">
        <view class="result-item">
          <text class="result-label">原生 new Date() 结果:</text>
          <text class="result-value" :class="{ 'error': testResult.nativeError }">
            {{ testResult.nativeResult || testResult.nativeError }}
          </text>
        </view>
        
        <view class="result-item">
          <text class="result-label">安全方法结果:</text>
          <text class="result-value" :class="{ 'error': testResult.safeError }">
            {{ testResult.safeResult || testResult.safeError }}
          </text>
        </view>
        
        <view class="result-item">
          <text class="result-label">环境信息:</text>
          <text class="result-value">{{ environmentInfo }}</text>
        </view>
      </view>
    </view>

    <view class="test-section">
      <view class="section-title">📊 修复状态</view>
      
      <view class="status-grid">
        <view class="status-item" :class="{ 'active': earlyFixApplied }">
          <text class="status-icon">{{ earlyFixApplied ? '✅' : '❌' }}</text>
          <text class="status-text">早期修复</text>
        </view>
        
        <view class="status-item" :class="{ 'active': isMiniProgramIOS }">
          <text class="status-icon">{{ isMiniProgramIOS ? '🍎' : '🤖' }}</text>
          <text class="status-text">{{ isMiniProgramIOS ? 'iOS 小程序' : '其他环境' }}</text>
        </view>
        
        <view class="status-item" :class="{ 'active': mixinLoaded }">
          <text class="status-icon">{{ mixinLoaded ? '✅' : '❌' }}</text>
          <text class="status-text">Mixin 加载</text>
        </view>
      </view>
    </view>

    <view class="test-section">
      <view class="section-title">🔧 手动测试</view>
      
      <view class="input-section">
        <input 
          v-model="customDateString"
          class="test-input"
          placeholder="输入日期字符串进行测试"
        />
        <button @click="testCustomDate" class="test-btn">测试</button>
      </view>
      
      <view v-if="customResult" class="test-result">
        <view class="result-item">
          <text class="result-label">输入:</text>
          <text class="result-value">{{ customDateString }}</text>
        </view>
        
        <view class="result-item">
          <text class="result-label">结果:</text>
          <text class="result-value" :class="{ 'error': customResult.error }">
            {{ customResult.result || customResult.error }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: 'TestDateFix',
  mixins: [timeMixin],
  data() {
    return {
      testResult: null,
      customResult: null,
      customDateString: '9/2/2025, 12:59:21 AM',
      environmentInfo: '',
      earlyFixApplied: false,
      isMiniProgramIOS: false,
      mixinLoaded: false
    }
  },
  onLoad() {
    this.checkEnvironment()
  },
  methods: {
    // 检查环境信息
    checkEnvironment() {
      // 检查是否为微信小程序 iOS
      this.isMiniProgramIOS = this.$isMiniProgramIOS ? this.$isMiniProgramIOS() : false
      
      // 检查 mixin 是否加载
      this.mixinLoaded = typeof this.$createSafeDate === 'function'
      
      // 检查早期修复是否应用
      try {
        import('@/utils/earlyDateFix.js').then(module => {
          this.earlyFixApplied = module.EARLY_DATE_FIX_APPLIED || false
        })
      } catch (error) {
        this.earlyFixApplied = false
      }
      
      // 获取环境信息
      if (typeof wx !== 'undefined') {
        try {
          // 优先使用新的设备信息API
          if (wx.getDeviceInfo) {
            const deviceInfo = wx.getDeviceInfo()
            this.environmentInfo = `${deviceInfo.platform} ${deviceInfo.system || 'unknown'}`
          } else if (wx.getSystemInfoSync) {
            console.warn('使用已弃用的wx.getSystemInfoSync，建议升级到wx.getDeviceInfo')
            const systemInfo = wx.getSystemInfoSync()
            this.environmentInfo = `${systemInfo.platform} ${systemInfo.system}`
          } else {
            this.environmentInfo = '微信小程序 未知环境'
          }
        } catch (error) {
          this.environmentInfo = '微信小程序'
        }
      } else {
        this.environmentInfo = '浏览器环境'
      }
    },
    
    // 测试有问题的日期格式
    testProblematicDate() {
      const testDateString = "9/2/2025, 12:59:21 AM"
      
      // 测试原生方法
      let nativeResult = null
      let nativeError = null
      try {
        const nativeDate = new Date(testDateString)
        if (isNaN(nativeDate.getTime())) {
          nativeError = 'Invalid Date'
        } else {
          nativeResult = nativeDate.toString()
        }
      } catch (error) {
        nativeError = error.message
      }
      
      // 测试安全方法
      let safeResult = null
      let safeError = null
      try {
        const safeDate = this.$createSafeDate ? this.$createSafeDate(testDateString) : null
        if (!safeDate || isNaN(safeDate.getTime())) {
          safeError = '安全方法创建失败'
        } else {
          safeResult = safeDate.toString()
        }
      } catch (error) {
        safeError = error.message
      }
      
      this.testResult = {
        nativeResult,
        nativeError,
        safeResult,
        safeError
      }
    },
    
    // 测试自定义日期
    testCustomDate() {
      if (!this.customDateString.trim()) {
        uni.showToast({
          title: '请输入日期字符串',
          icon: 'none'
        })
        return
      }
      
      try {
        const testDate = this.$createSafeDate ? 
          this.$createSafeDate(this.customDateString) : 
          new Date(this.customDateString)
          
        if (testDate && !isNaN(testDate.getTime())) {
          this.customResult = {
            result: testDate.toString()
          }
        } else {
          this.customResult = {
            error: 'Invalid Date'
          }
        }
      } catch (error) {
        this.customResult = {
          error: error.message
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.test-container {
  padding: 30rpx;
  background: #f8f9fa;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 30rpx;
}

.page-title {
  font-size: 48rpx;
  font-weight: 600;
  color: #333;
}

.test-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.test-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.test-label {
  font-size: 28rpx;
  color: #666;
  flex: 1;
}

.test-btn {
  padding: 16rpx 24rpx;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 24rpx;
}

.test-result {
  background: #f8f9fa;
  border-radius: 8rpx;
  padding: 20rpx;
  margin-top: 20rpx;
}

.result-item {
  display: flex;
  margin-bottom: 12rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.result-label {
  font-size: 24rpx;
  color: #666;
  width: 140rpx;
  flex-shrink: 0;
}

.result-value {
  font-size: 24rpx;
  color: #333;
  flex: 1;
  word-break: break-all;
  
  &.error {
    color: #dc3545;
  }
}

.status-grid {
  display: flex;
  gap: 20rpx;
}

.status-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 20rpx;
  border-radius: 12rpx;
  background: #f8f9fa;
  border: 2rpx solid #e0e0e0;
  
  &.active {
    background: #e3f2fd;
    border-color: #2196f3;
  }
}

.status-icon {
  font-size: 32rpx;
}

.status-text {
  font-size: 22rpx;
  color: #666;
  text-align: center;
}

.input-section {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.test-input {
  flex: 1;
  padding: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 24rpx;
}
</style>
