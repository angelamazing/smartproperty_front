<template>
  <view class="test-container">
    <view class="page-header">
      <text class="page-title">iOS日期格式兼容性测试</text>
    </view>

    <view class="test-section">
      <text class="section-title">测试用例</text>
      
      <view class="test-item" v-for="(testCase, index) in testCases" :key="index">
        <view class="test-input">
          <text class="label">输入:</text>
          <text class="value">{{ testCase.input }}</text>
        </view>
        <view class="test-output">
          <text class="label">输出:</text>
          <text class="value" :class="{ 'error': testCase.error }">{{ testCase.output }}</text>
        </view>
        <view class="test-status" :class="{ 'success': testCase.success, 'error': testCase.error }">
          <text>{{ testCase.status }}</text>
        </view>
      </view>
    </view>

    <view class="test-section">
      <text class="section-title">iOS不兼容格式测试</text>
      
      <view class="test-item" v-for="(testCase, index) in iosTestCases" :key="index">
        <view class="test-input">
          <text class="label">输入:</text>
          <text class="value">{{ testCase.input }}</text>
        </view>
        <view class="test-output">
          <text class="label">输出:</text>
          <text class="value" :class="{ 'error': testCase.error }">{{ testCase.output }}</text>
        </view>
        <view class="test-status" :class="{ 'success': testCase.success, 'error': testCase.error }">
          <text>{{ testCase.status }}</text>
        </view>
      </view>
    </view>

    <view class="test-section">
      <text class="section-title">运行测试</text>
      <button class="test-btn" @click="runTests">运行所有测试</button>
      <button class="test-btn" @click="clearResults">清除结果</button>
    </view>
  </view>
</template>

<script>
import TimeUtils from '@/utils/timeUtils.js'

export default {
  name: 'TestIOSDateFix',
  data() {
    return {
      testCases: [
        {
          input: '2024-01-15T10:30:00.000Z',
          output: '',
          status: '',
          success: false,
          error: false
        },
        {
          input: '2024-01-15 10:30:00',
          output: '',
          status: '',
          success: false,
          error: false
        },
        {
          input: '2024-01-15',
          output: '',
          status: '',
          success: false,
          error: false
        }
      ],
      iosTestCases: [
        {
          input: '9/12/2025, 2:02:03 PM',
          output: '',
          status: '',
          success: false,
          error: false
        },
        {
          input: '9/12/2025, 8:19:32 AM',
          output: '',
          status: '',
          success: false,
          error: false
        },
        {
          input: '12/25/2024, 11:30 AM',
          output: '',
          status: '',
          success: false,
          error: false
        },
        {
          input: '1/1/2025, 12:00 PM',
          output: '',
          status: '',
          success: false,
          error: false
        },
        {
          input: '1/1/2025, 12:00 AM',
          output: '',
          status: '',
          success: false,
          error: false
        },
        {
          input: '3/15/2024, 3:45 PM',
          output: '',
          status: '',
          success: false,
          error: false
        }
      ]
    }
  },
  onLoad() {
    this.runTests()
  },
  methods: {
    runTests() {
      // 测试标准格式
      this.testCases.forEach(testCase => {
        try {
          const parsed = TimeUtils.parseTime(testCase.input)
          if (parsed && parsed.isValid()) {
            testCase.output = parsed.format('YYYY-MM-DD HH:mm:ss')
            testCase.status = '✓ 解析成功'
            testCase.success = true
            testCase.error = false
          } else {
            testCase.output = '解析失败'
            testCase.status = '✗ 解析失败'
            testCase.success = false
            testCase.error = true
          }
        } catch (error) {
          testCase.output = `错误: ${error.message}`
          testCase.status = '✗ 解析错误'
          testCase.success = false
          testCase.error = true
        }
      })

      // 测试iOS不兼容格式
      this.iosTestCases.forEach(testCase => {
        try {
          const parsed = TimeUtils.parseTime(testCase.input)
          if (parsed && parsed.isValid()) {
            testCase.output = parsed.format('YYYY-MM-DD HH:mm:ss')
            testCase.status = '✓ 解析成功'
            testCase.success = true
            testCase.error = false
          } else {
            testCase.output = '解析失败'
            testCase.status = '✗ 解析失败'
            testCase.success = false
            testCase.error = true
          }
        } catch (error) {
          testCase.output = `错误: ${error.message}`
          testCase.status = '✗ 解析错误'
          testCase.success = false
          testCase.error = true
        }
      })
    },
    
    clearResults() {
      [...this.testCases, ...this.iosTestCases].forEach(testCase => {
        testCase.output = ''
        testCase.status = ''
        testCase.success = false
        testCase.error = false
      })
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
  border: 2rpx solid #e9ecef;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.test-input,
.test-output {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.label {
  font-size: 24rpx;
  color: #666;
  margin-right: 16rpx;
  min-width: 80rpx;
}

.value {
  font-size: 26rpx;
  color: #333;
  flex: 1;
  
  &.error {
    color: #dc3545;
  }
}

.test-status {
  font-size: 24rpx;
  font-weight: 500;
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  text-align: center;
  
  &.success {
    background: #d4edda;
    color: #155724;
  }
  
  &.error {
    background: #f8d7da;
    color: #721c24;
  }
}

.test-btn {
  padding: 20rpx 40rpx;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  margin-right: 20rpx;
  margin-bottom: 20rpx;
  
  &:active {
    background: #0056b3;
  }
}
</style>
