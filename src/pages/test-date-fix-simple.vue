<template>
  <view class="container">
    <view class="header">
      <text class="title">🍎 iOS日期修复测试</text>
      <text class="subtitle">测试 new Date() 在iOS下的兼容性</text>
    </view>

    <view class="test-section">
      <text class="section-title">📋 测试结果</text>
      <view class="test-results">
        <view 
          v-for="(result, index) in testResults" 
          :key="index" 
          class="test-result"
          :class="result.success ? 'success' : 'error'"
        >
          <text class="test-input">{{ result.input }}</text>
          <text class="test-output">{{ result.output }}</text>
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

    <view class="test-section">
      <text class="section-title">📊 统计信息</text>
      <view class="stats">
        <text class="stat-item">总测试: {{ stats.total }}</text>
        <text class="stat-item">成功: {{ stats.success }}</text>
        <text class="stat-item">失败: {{ stats.failed }}</text>
        <text class="stat-item">成功率: {{ stats.successRate }}%</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TestDateFixSimple',
  
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
        "2024/12/25 08:30:00"
      ],
      testResults: [],
      customInput: '',
      customResult: null,
      stats: {
        total: 0,
        success: 0,
        failed: 0,
        successRate: 0
      }
    }
  },

  onLoad() {
    this.runTests()
  },

  methods: {
    runTests() {
      console.log('🚀 开始测试iOS日期兼容性...')
      
      this.testResults = this.testCases.map(input => {
        const result = this.testDate(input)
        return {
          input: input,
          output: result.text,
          success: result.success
        }
      })
      
      this.calculateStats()
    },

    testDate(input) {
      try {
        console.log(`测试日期: "${input}"`)
        
        // 直接使用 new Date() 测试
        const date = new Date(input)
        
        if (isNaN(date.getTime())) {
          console.log(`❌ 失败: Invalid Date`)
          return {
            success: false,
            text: '❌ Invalid Date'
          }
        } else {
          console.log(`✅ 成功: ${date.toISOString()}`)
          return {
            success: true,
            text: `✅ ${date.toISOString()}`
          }
        }
      } catch (error) {
        console.log(`❌ 错误: ${error.message}`)
        return {
          success: false,
          text: `❌ Error: ${error.message}`
        }
      }
    },

    calculateStats() {
      this.stats.total = this.testResults.length
      this.stats.success = this.testResults.filter(r => r.success).length
      this.stats.failed = this.stats.total - this.stats.success
      this.stats.successRate = ((this.stats.success / this.stats.total) * 100).toFixed(1)
    },

    testCustomInput() {
      if (!this.customInput.trim()) {
        uni.showToast({
          title: '请输入日期字符串',
          icon: 'none'
        })
        return
      }

      this.customResult = this.testDate(this.customInput)
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

.test-result {
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.test-result.success {
  background-color: #d4edda;
  border-color: #c3e6cb;
}

.test-result.error {
  background-color: #f8d7da;
  border-color: #f5c6cb;
}

.test-input {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #333;
  margin-bottom: 5px;
  display: block;
  word-break: break-all;
}

.test-output {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  display: block;
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

.result-label {
  font-size: 14px;
  color: #666;
}

.result-value {
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.success {
  color: #28a745;
}

.error {
  color: #dc3545;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.stat-item {
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  color: #333;
}
</style>
