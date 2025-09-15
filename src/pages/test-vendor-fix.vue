<template>
  <view class="test-container">
    <view class="header">
      <text class="title">Vendor.js 日期修复测试</text>
      <text class="subtitle">测试 new Date("9/15/2025, 8:41:44 AM") 等问题格式</text>
    </view>

    <view class="test-section">
      <view class="section-title">🎯 直接测试问题格式</view>
      
      <view class="test-item">
        <text class="test-label">测试: new Date("9/15/2025, 8:41:44 AM")</text>
        <text class="test-result" :class="test1.success ? 'success' : 'error'">
          {{ test1.result }}
        </text>
      </view>

      <view class="test-item">
        <text class="test-label">测试: new Date("9/2/2025, 12:59:21 AM")</text>
        <text class="test-result" :class="test2.success ? 'success' : 'error'">
          {{ test2.result }}
        </text>
      </view>

      <view class="test-item">
        <text class="test-label">测试: new Date("12/25/2024, 11:30:45 PM")</text>
        <text class="test-result" :class="test3.success ? 'success' : 'error'">
          {{ test3.result }}
        </text>
      </view>

      <view class="test-item">
        <text class="test-label">测试: new Date("2024-05-15 08:00:00") [连字符格式]</text>
        <text class="test-result" :class="test4.success ? 'success' : 'error'">
          {{ test4.result }}
        </text>
      </view>

      <view class="test-item">
        <text class="test-label">测试: new Date("2024-12-25") [纯日期连字符格式]</text>
        <text class="test-result" :class="test5.success ? 'success' : 'error'">
          {{ test5.result }}
        </text>
      </view>
    </view>

    <view class="test-section">
      <view class="section-title">🔍 模拟Vendor.js调用</view>
      
      <view class="test-item">
        <text class="test-label">模拟从Storage读取的日期</text>
        <text class="test-result" :class="storageTest.success ? 'success' : 'error'">
          {{ storageTest.result }}
        </text>
      </view>

      <view class="test-item">
        <text class="test-label">模拟序列化后的日期</text>
        <text class="test-result" :class="serializeTest.success ? 'success' : 'error'">
          {{ serializeTest.result }}
        </text>
      </view>
    </view>

    <view class="test-section">
      <view class="section-title">📊 修复状态检查</view>
      
      <view class="status-item">
        <text class="status-label">Early Date Fix:</text>
        <text class="status-value" :class="fixStatus.earlyFix ? 'active' : 'inactive'">
          {{ fixStatus.earlyFix ? '✅ 已启用' : '❌ 未启用' }}
        </text>
      </view>

      <view class="status-item">
        <text class="status-label">Date构造函数:</text>
        <text class="status-value" :class="fixStatus.datePatched ? 'active' : 'inactive'">
          {{ fixStatus.datePatched ? '✅ 已修补' : '❌ 原始' }}
        </text>
      </view>

      <view class="status-item">
        <text class="status-label">环境检测:</text>
        <text class="status-value">{{ fixStatus.environment }}</text>
      </view>
    </view>

    <view class="action-section">
      <button class="test-btn" @click="runAllTests">重新运行所有测试</button>
      <button class="test-btn" @click="simulateVendorError">模拟Vendor.js错误</button>
    </view>

    <view class="log-section">
      <view class="section-title">📝 测试日志</view>
      <view class="log-content">
        <text class="log-item" v-for="(log, index) in logs" :key="index">
          {{ log }}
        </text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TestVendorFix',
  data() {
    return {
      test1: { result: '', success: false },
      test2: { result: '', success: false },
      test3: { result: '', success: false },
      test4: { result: '', success: false },
      test5: { result: '', success: false },
      storageTest: { result: '', success: false },
      serializeTest: { result: '', success: false },
      fixStatus: {
        earlyFix: false,
        datePatched: false,
        environment: ''
      },
      logs: []
    }
  },
  onLoad() {
    this.checkFixStatus()
    this.runAllTests()
  },
  methods: {
    addLog(message) {
      const timestamp = new Date().toLocaleTimeString()
      this.logs.unshift(`[${timestamp}] ${message}`)
      if (this.logs.length > 20) {
        this.logs.pop()
      }
    },

    checkFixStatus() {
      this.addLog('检查修复状态...')
      
      // 检查早期修复是否已应用
      try {
        const earlyFixImport = require('@/utils/earlyDateFix.js')
        this.fixStatus.earlyFix = !!earlyFixImport.EARLY_DATE_FIX_APPLIED
      } catch (e) {
        this.fixStatus.earlyFix = false
      }

      // 检查Date构造函数是否被修补
      this.fixStatus.datePatched = Date.name !== 'Date' || typeof window.OriginalDate !== 'undefined'

      // 检查环境
      try {
        if (typeof wx !== 'undefined') {
          const systemInfo = wx.getSystemInfoSync()
          this.fixStatus.environment = `微信小程序 ${systemInfo.platform}`
        } else {
          this.fixStatus.environment = '浏览器环境'
        }
      } catch (e) {
        this.fixStatus.environment = '未知环境'
      }

      this.addLog(`修复状态: earlyFix=${this.fixStatus.earlyFix}, datePatched=${this.fixStatus.datePatched}`)
    },

    testDateFormat(formatString, testKey) {
      this.addLog(`测试日期格式: "${formatString}"`)
      
      try {
        const date = new Date(formatString)
        
        if (isNaN(date.getTime())) {
          this[testKey] = {
            result: '❌ Invalid Date',
            success: false
          }
          this.addLog(`❌ "${formatString}" 创建失败: Invalid Date`)
        } else {
          this[testKey] = {
            result: `✅ ${date.toISOString()}`,
            success: true
          }
          this.addLog(`✅ "${formatString}" 创建成功: ${date.toISOString()}`)
        }
      } catch (error) {
        this[testKey] = {
          result: `❌ Error: ${error.message}`,
          success: false
        }
        this.addLog(`❌ "${formatString}" 抛出异常: ${error.message}`)
      }
    },

    runAllTests() {
      this.addLog('========== 开始运行所有测试 ==========')
      
      // 测试具体的问题格式
      this.testDateFormat("9/15/2025, 8:41:44 AM", 'test1')
      this.testDateFormat("9/2/2025, 12:59:21 AM", 'test2')
      this.testDateFormat("12/25/2024, 11:30:45 PM", 'test3')
      this.testDateFormat("2024-05-15 08:00:00", 'test4')  // 连字符时间格式
      this.testDateFormat("2024-12-25", 'test5')           // 连字符日期格式

      // 测试模拟Storage场景
      this.simulateStorageScenario()
      this.simulateSerializationScenario()

      this.addLog('========== 所有测试完成 ==========')
    },

    simulateStorageScenario() {
      this.addLog('模拟Storage场景...')
      
      try {
        // 模拟一个Date对象被存储然后读取的场景
        const now = new Date()
        const stored = now.toString() // 这会产生问题格式
        
        this.addLog(`模拟存储的日期字符串: "${stored}"`)
        
        const restored = new Date(stored)
        
        if (isNaN(restored.getTime())) {
          this.storageTest = {
            result: '❌ Storage恢复失败',
            success: false
          }
        } else {
          this.storageTest = {
            result: `✅ Storage恢复成功: ${restored.toISOString()}`,
            success: true
          }
        }
      } catch (error) {
        this.storageTest = {
          result: `❌ Storage测试异常: ${error.message}`,
          success: false
        }
      }
    },

    simulateSerializationScenario() {
      this.addLog('模拟序列化场景...')
      
      try {
        // 模拟JSON序列化/反序列化可能产生的问题格式
        const dateObj = { time: new Date() }
        const serialized = JSON.stringify(dateObj)
        const deserialized = JSON.parse(serialized)
        
        this.addLog(`序列化后的时间: "${deserialized.time}"`)
        
        const restored = new Date(deserialized.time)
        
        if (isNaN(restored.getTime())) {
          this.serializeTest = {
            result: '❌ 序列化恢复失败',
            success: false
          }
        } else {
          this.serializeTest = {
            result: `✅ 序列化恢复成功: ${restored.toISOString()}`,
            success: true
          }
        }
      } catch (error) {
        this.serializeTest = {
          result: `❌ 序列化测试异常: ${error.message}`,
          success: false
        }
      }
    },

    simulateVendorError() {
      this.addLog('🚨 模拟Vendor.js错误场景...')
      
      // 模拟一些可能在vendor.js中出现的调用
      const problematicFormats = [
        "9/15/2025, 8:41:44 AM",
        "1/1/2025, 12:00:00 PM", 
        "12/31/2024, 11:59:59 PM",
        "2024-05-15 08:00:00",    // 连字符时间格式
        "2024-12-25",             // 连字符日期格式
        "2024-1-1 9:30:15"        // 单数字连字符格式
      ]

      problematicFormats.forEach(format => {
        try {
          const date = new Date(format)
          this.addLog(`🎯 Vendor测试 "${format}": ${date.isValid ? date.toISOString() : 'Invalid'}`)
        } catch (error) {
          this.addLog(`💥 Vendor测试 "${format}" 失败: ${error.message}`)
        }
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

.header {
  text-align: center;
  margin-bottom: 40rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #666;
  display: block;
}

.test-section, .action-section, .log-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

.test-item, .status-item {
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.test-item:last-child, .status-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.test-label, .status-label {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.test-result, .status-value {
  font-size: 24rpx;
  font-family: monospace;
  padding: 10rpx;
  border-radius: 8rpx;
  display: block;
  word-break: break-all;
}

.test-result.success, .status-value.active {
  background: #d4edda;
  color: #155724;
}

.test-result.error, .status-value.inactive {
  background: #f8d7da;
  color: #721c24;
}

.status-value {
  background: #e2e3e5;
  color: #383d41;
}

.action-section {
  display: flex;
  gap: 20rpx;
}

.test-btn {
  flex: 1;
  padding: 20rpx;
  border-radius: 12rpx;
  background: #007bff;
  color: white;
  font-size: 28rpx;
  border: none;
}

.test-btn:active {
  background: #0056b3;
}

.log-content {
  max-height: 400rpx;
  overflow-y: auto;
}

.log-item {
  font-size: 22rpx;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
  padding: 8rpx;
  background: #f8f9fa;
  border-radius: 4rpx;
  font-family: monospace;
}
</style>
