<template>
  <view class="container">
    <view class="header">
      <text class="title">🍎 iOS日期兼容性测试</text>
      <text class="subtitle">测试各种日期格式的iOS兼容性</text>
    </view>

    <view class="test-section">
      <text class="section-title">📋 测试用例</text>
      <view class="test-cases">
        <view 
          v-for="(testCase, index) in testCases" 
          :key="index" 
          class="test-case"
        >
          <text class="test-input">{{ testCase }}</text>
          <view class="test-results">
            <view class="result-item">
              <text class="result-label">原生Date:</text>
              <text :class="['result-value', testCase.results.native.success ? 'success' : 'error']">
                {{ testCase.results.native.text }}
              </text>
            </view>
            <view class="result-item">
              <text class="result-label">iOS兼容:</text>
              <text :class="['result-value', testCase.results.ios.success ? 'success' : 'error']">
                {{ testCase.results.ios.text }}
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="test-section">
      <text class="section-title">🔧 使用方法</text>
      <view class="usage-examples">
        <view class="example">
          <text class="example-title">❌ 错误用法（iOS不兼容）:</text>
          <text class="code">new Date("9/17/2025, 7:27:32 AM")</text>
        </view>
        <view class="example">
          <text class="example-title">✅ 正确用法（iOS兼容）:</text>
          <text class="code">this.$newDate("9/17/2025, 7:27:32 AM")</text>
        </view>
        <view class="example">
          <text class="example-title">✅ 或者使用:</text>
          <text class="code">this.$createDate("9/17/2025, 7:27:32 AM")</text>
        </view>
      </view>
    </view>

    <view class="test-section">
      <text class="section-title">📊 测试统计</text>
      <view class="stats">
        <view class="stat-item">
          <text class="stat-label">总测试用例:</text>
          <text class="stat-value">{{ stats.total }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">原生Date成功:</text>
          <text class="stat-value">{{ stats.nativeSuccess }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">iOS兼容成功:</text>
          <text class="stat-value">{{ stats.iosSuccess }}</text>
        </view>
        <view class="stat-item">
          <text class="stat-label">iOS兼容成功率:</text>
          <text class="stat-value success">{{ stats.iosSuccessRate }}%</text>
        </view>
      </view>
    </view>

    <view class="test-section">
      <text class="section-title">🚀 快速测试</text>
      <view class="quick-test">
        <input 
          v-model="customInput" 
          placeholder="输入日期字符串测试..."
          class="test-input"
        />
        <button @click="testCustomInput" class="test-button">测试</button>
        <view v-if="customResult" class="custom-result">
          <text class="result-label">结果:</text>
          <text :class="['result-value', customResult.success ? 'success' : 'error']">
            {{ customResult.text }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: 'TestIOSDateFix',
  mixins: [timeMixin],
  
  data() {
    return {
      testCases: [
        "9/17/2025, 7:27:32 AM",
        "9/17/2025, 7:27:32 PM", 
        "12/25/2024, 11:59:59 PM",
        "1/1/2025, 12:00:00 AM",
        "2024-12-25",
        "2024-12-25 08:30:00",
        "2024/12/25",
        "2024/12/25 08:30:00",
        "2024-12-25T08:30:00",
        "2024-12-25T08:30:00Z"
      ],
      customInput: '',
      customResult: null,
      stats: {
        total: 0,
        nativeSuccess: 0,
        iosSuccess: 0,
        iosSuccessRate: 0
      }
    }
  },

  onLoad() {
    this.runTests()
  },

  methods: {
    runTests() {
      this.testCases = this.testCases.map(testCase => {
        const results = {
          native: this.testNativeDate(testCase),
          ios: this.testIOSCompatibleDate(testCase)
        }
        
        return {
          input: testCase,
          results: results
        }
      })
      
      this.calculateStats()
    },

    testNativeDate(input) {
      try {
        const date = new Date(input)
        if (isNaN(date.getTime())) {
          return {
            success: false,
            text: '❌ Invalid Date'
          }
        } else {
          return {
            success: true,
            text: `✅ ${date.toISOString()}`
          }
        }
      } catch (error) {
        return {
          success: false,
          text: `❌ Error: ${error.message}`
        }
      }
    },

    testIOSCompatibleDate(input) {
      try {
        const date = this.$newDate(input)
        if (!date || isNaN(date.getTime())) {
          return {
            success: false,
            text: '❌ Invalid Date'
          }
        } else {
          return {
            success: true,
            text: `✅ ${date.toISOString()}`
          }
        }
      } catch (error) {
        return {
          success: false,
          text: `❌ Error: ${error.message}`
        }
      }
    },

    calculateStats() {
      this.stats.total = this.testCases.length
      this.stats.nativeSuccess = this.testCases.filter(tc => tc.results.native.success).length
      this.stats.iosSuccess = this.testCases.filter(tc => tc.results.ios.success).length
      this.stats.iosSuccessRate = ((this.stats.iosSuccess / this.stats.total) * 100).toFixed(1)
    },

    testCustomInput() {
      if (!this.customInput.trim()) {
        uni.showToast({
          title: '请输入日期字符串',
          icon: 'none'
        })
        return
      }

      this.customResult = this.testIOSCompatibleDate(this.customInput)
    }
  }
}
</script>

<style scoped>
.container {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 14px;
  color: #666;
  display: block;
}

.test-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
  display: block;
}

.test-case {
  margin-bottom: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.test-input {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #333;
  margin-bottom: 10px;
  display: block;
  word-break: break-all;
}

.test-results {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.result-label {
  font-size: 12px;
  color: #666;
  min-width: 80px;
}

.result-value {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  flex: 1;
}

.success {
  color: #28a745;
}

.error {
  color: #dc3545;
}

.usage-examples {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.example {
  padding: 15px;
  border-radius: 6px;
  background: #f8f9fa;
}

.example-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
  display: block;
}

.code {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  background: #e9ecef;
  padding: 8px;
  border-radius: 4px;
  display: block;
  word-break: break-all;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.quick-test {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.test-input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.test-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.test-button:active {
  background: #0056b3;
}

.custom-result {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
