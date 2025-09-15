<template>
  <view class="test-container">
    <view class="page-header">
      <text class="page-title">iOS 日期兼容性测试</text>
    </view>

    <view class="test-section">
      <view class="section-title">🍎 iOS 兼容性测试结果</view>
      
      <view class="test-grid">
        <view 
          v-for="(test, index) in testResults" 
          :key="index"
          class="test-item"
          :class="{ 'success': test.success, 'error': !test.success }"
        >
          <view class="test-header">
            <text class="test-name">{{ test.name }}</text>
            <text class="test-status">{{ test.success ? '✅' : '❌' }}</text>
          </view>
          
          <view class="test-input">
            <text class="label">输入:</text>
            <text class="value">{{ test.input }}</text>
          </view>
          
          <view class="test-output">
            <text class="label">结果:</text>
            <text class="value">{{ test.output }}</text>
          </view>
          
          <view v-if="test.error" class="test-error">
            <text class="label">错误:</text>
            <text class="value error-text">{{ test.error }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="test-section">
      <view class="section-title">🧪 实时测试</view>
      
      <view class="input-section">
        <input 
          v-model="customInput"
          class="test-input-field"
          placeholder="输入日期字符串进行测试"
        />
        <button @click="testCustomInput" class="test-btn">测试</button>
      </view>
      
      <view v-if="customResult" class="custom-result">
        <view class="result-item">
          <text class="label">原生 new Date():</text>
          <text class="value" :class="{ 'error-text': customResult.native.error }">
            {{ customResult.native.result || customResult.native.error }}
          </text>
        </view>
        
        <view class="result-item">
          <text class="label">iOS 兼容方法:</text>
          <text class="value" :class="{ 'error-text': customResult.compatible.error }">
            {{ customResult.compatible.result || customResult.compatible.error }}
          </text>
        </view>
      </view>
    </view>

    <view class="test-section">
      <view class="section-title">📋 修复说明</view>
      
      <view class="info-list">
        <view class="info-item">
          <text class="info-title">✅ 支持的格式:</text>
          <text class="info-content">
            • yyyy/MM/dd (如: 2025/01/15)
            • yyyy/MM/dd HH:mm:ss (如: 2025/01/15 10:30:00)
            • yyyy-MM-dd (如: 2025-01-15)
            • yyyy-MM-ddTHH:mm:ss (如: 2025-01-15T10:30:00)
            • yyyy-MM-ddTHH:mm:ss.sssZ (如: 2025-01-15T10:30:00.000Z)
          </text>
        </view>
        
        <view class="info-item">
          <text class="info-title">❌ 不支持的格式:</text>
          <text class="info-content">
            • M/d/yyyy, h:mm:ss AM/PM (如: 9/12/2025, 2:02:03 PM)
            • dd/MM/yyyy (如: 15/01/2025)
            • MM.dd.yyyy (如: 01.15.2025)
            • 中文格式 (如: 2025年1月15日)
          </text>
        </view>
        
        <view class="info-item">
          <text class="info-title">🔧 解决方案:</text>
          <text class="info-content">
            项目已集成 iOS 兼容的日期处理工具，自动转换不兼容格式。
            建议使用 $createDate() 方法替代 new Date()。
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: 'TestIOSCompatibility',
  mixins: [timeMixin],
  data() {
    return {
      customInput: '',
      customResult: null,
      testResults: []
    }
  },
  onLoad() {
    this.runTests()
  },
  methods: {
    // 运行所有测试
    runTests() {
      const problematicFormats = [
        { name: 'US 格式带时间', input: '9/12/2025, 2:02:03 PM' },
        { name: 'US 格式不带秒', input: '9/12/2025, 2:02 PM' },
        { name: 'US 格式仅日期', input: '9/12/2025' },
        { name: '点分隔符', input: '2025.01.15' },
        { name: '中文格式', input: '2025年1月15日' },
        { name: 'DD/MM/YYYY', input: '15/01/2025' },
        { name: '短年份', input: '25/01/15' },
        { name: '无效格式', input: 'invalid date' }
      ]
      
      const compatibleFormats = [
        { name: 'ISO 格式', input: '2025-01-15T10:30:00.000Z' },
        { name: 'YYYY-MM-DD', input: '2025-01-15' },
        { name: 'YYYY/MM/DD', input: '2025/01/15' },
        { name: 'YYYY/MM/DD HH:mm:ss', input: '2025/01/15 10:30:00' }
      ]
      
      this.testResults = []
      
      // 测试有问题的格式
      problematicFormats.forEach(format => {
        const result = this.testDateFormat(format.input)
        this.testResults.push({
          name: format.name,
          input: format.input,
          success: result.success,
          output: result.output,
          error: result.error
        })
      })
      
      // 测试兼容的格式
      compatibleFormats.forEach(format => {
        const result = this.testDateFormat(format.input)
        this.testResults.push({
          name: format.name,
          input: format.input,
          success: result.success,
          output: result.output,
          error: result.error
        })
      })
    },
    
    // 测试单个日期格式
    testDateFormat(dateString) {
      try {
        // 使用我们的 iOS 兼容方法
        const compatibleDate = this.$createDate(dateString)
        
        if (compatibleDate && !isNaN(compatibleDate.getTime())) {
          return {
            success: true,
            output: this.$formatDate(compatibleDate, 'YYYY-MM-DD HH:mm:ss')
          }
        } else {
          return {
            success: false,
            error: '无法解析日期'
          }
        }
      } catch (error) {
        return {
          success: false,
          error: error.message
        }
      }
    },
    
    // 测试自定义输入
    testCustomInput() {
      if (!this.customInput.trim()) {
        uni.showToast({
          title: '请输入日期字符串',
          icon: 'none'
        })
        return
      }
      
      const input = this.customInput.trim()
      
      // 测试原生方法
      let nativeResult = {}
      try {
        const nativeDate = new Date(input)
        if (isNaN(nativeDate.getTime())) {
          nativeResult = { error: 'Invalid Date' }
        } else {
          nativeResult = { result: nativeDate.toString() }
        }
      } catch (error) {
        nativeResult = { error: error.message }
      }
      
      // 测试兼容方法
      let compatibleResult = {}
      try {
        const compatibleDate = this.$createDate(input)
        if (compatibleDate && !isNaN(compatibleDate.getTime())) {
          compatibleResult = { result: compatibleDate.toString() }
        } else {
          compatibleResult = { error: '无法解析日期' }
        }
      } catch (error) {
        compatibleResult = { error: error.message }
      }
      
      this.customResult = {
        native: nativeResult,
        compatible: compatibleResult
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

.test-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.test-item {
  padding: 20rpx;
  border-radius: 12rpx;
  border: 2rpx solid #e0e0e0;
  
  &.success {
    border-color: #28a745;
    background: #f8fff9;
  }
  
  &.error {
    border-color: #dc3545;
    background: #fffafa;
  }
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.test-name {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.test-status {
  font-size: 32rpx;
}

.test-input,
.test-output,
.test-error {
  display: flex;
  margin-bottom: 8rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.label {
  font-size: 24rpx;
  color: #666;
  width: 120rpx;
  flex-shrink: 0;
}

.value {
  font-size: 24rpx;
  color: #333;
  flex: 1;
  word-break: break-all;
}

.error-text {
  color: #dc3545;
}

.input-section {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.test-input-field {
  flex: 1;
  padding: 20rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.test-btn {
  padding: 20rpx 30rpx;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.custom-result {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.result-item {
  display: flex;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.info-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
}

.info-content {
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  white-space: pre-line;
}
</style>
