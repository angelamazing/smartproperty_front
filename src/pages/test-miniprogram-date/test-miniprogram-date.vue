<template>
  <view class="test-container">
    <view class="test-header">
      <text class="test-title">微信小程序Date修复测试</text>
      <text class="test-desc">验证window.Date问题修复效果</text>
    </view>
    
    <!-- 环境检测 -->
    <view class="env-section">
      <text class="section-title">🏃‍♂️ 运行环境检测</text>
      <view class="env-card">
        <view class="env-item">
          <text class="env-label">当前环境:</text>
          <text class="env-value" :class="environmentClass">{{ environment }}</text>
        </view>
        <view class="env-item">
          <text class="env-label">window对象:</text>
          <text class="env-value" :class="windowAvailable ? 'success' : 'warning'">
            {{ windowAvailable ? '✅ 可用' : '❌ 不可用' }}
          </text>
        </view>
        <view class="env-item">
          <text class="env-label">globalThis:</text>
          <text class="env-value" :class="globalThisAvailable ? 'success' : 'warning'">
            {{ globalThisAvailable ? '✅ 可用' : '❌ 不可用' }}
          </text>
        </view>
        <view class="env-item">
          <text class="env-label">Date对象:</text>
          <text class="env-value" :class="dateAvailable ? 'success' : 'error'">
            {{ dateAvailable ? '✅ 可用' : '❌ 不可用' }}
          </text>
        </view>
      </view>
    </view>
    
    <!-- Date修复状态 -->
    <view class="fix-section">
      <text class="section-title">🔧 Date修复状态</text>
      <view class="fix-grid">
        <view class="fix-item" :class="fixStatus.earlyDateFix ? 'success' : 'warning'">
          <text class="fix-label">早期修复</text>
          <text class="fix-value">{{ fixStatus.earlyDateFix ? '✅ 已应用' : '❌ 未应用' }}</text>
        </view>
        <view class="fix-item" :class="fixStatus.globalDateFix ? 'success' : 'warning'">
          <text class="fix-label">全局修复</text>
          <text class="fix-value">{{ fixStatus.globalDateFix ? '✅ 已应用' : '❌ 未应用' }}</text>
        </view>
        <view class="fix-item" :class="fixStatus.vendorDateFix ? 'success' : 'warning'">
          <text class="fix-label">Vendor修复</text>
          <text class="fix-value">{{ fixStatus.vendorDateFix ? '✅ 已应用' : '❌ 未应用' }}</text>
        </view>
        <view class="fix-item" :class="fixStatus.iosDateFix ? 'success' : 'warning'">
          <text class="fix-label">iOS修复</text>
          <text class="fix-value">{{ fixStatus.iosDateFix ? '✅ 已应用' : '❌ 未应用' }}</text>
        </view>
      </view>
    </view>
    
    <!-- Date创建测试 -->
    <view class="date-test-section">
      <text class="section-title">📅 Date创建测试</text>
      <view class="test-case-list">
        <view class="test-case" v-for="(testCase, index) in dateTests" :key="index">
          <view class="test-case-header">
            <text class="test-case-title">{{ testCase.name }}</text>
            <text class="test-case-status" :class="testCase.status">
              {{ testCase.status === 'success' ? '✅' : testCase.status === 'error' ? '❌' : '⚠️' }}
            </text>
          </view>
          <view class="test-case-input">
            <text class="test-label">输入:</text>
            <text class="test-value">{{ testCase.input }}</text>
          </view>
          <view class="test-case-result">
            <text class="test-label">结果:</text>
            <text class="test-value">{{ testCase.result }}</text>
          </view>
          <view class="test-case-error" v-if="testCase.error">
            <text class="test-label">错误:</text>
            <text class="test-value error">{{ testCase.error }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 控制按钮 -->
    <view class="controls">
      <button class="control-btn primary" @click="runAllTests">
        重新运行测试
      </button>
      <button class="control-btn secondary" @click="checkFixStatus">
        检查修复状态
      </button>
      <button class="control-btn info" @click="exportTestResults">
        导出测试结果
      </button>
    </view>
    
    <!-- 错误日志 -->
    <view class="error-section" v-if="errorLogs.length > 0">
      <text class="section-title">⚠️ 错误日志</text>
      <view class="error-log">
        <view class="error-item" v-for="(error, index) in errorLogs" :key="index">
          <text class="error-time">{{ error.time }}</text>
          <text class="error-message">{{ error.message }}</text>
        </view>
      </view>
    </view>
    
    <!-- 修复建议 -->
    <view class="suggestion-section" v-if="suggestions.length > 0">
      <text class="section-title">💡 修复建议</text>
      <view class="suggestion-list">
        <view class="suggestion-item" v-for="(suggestion, index) in suggestions" :key="index">
          <text class="suggestion-text">{{ suggestion }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'TestMiniProgramDate',
  data() {
    return {
      environment: 'unknown',
      environmentClass: 'unknown',
      windowAvailable: false,
      globalThisAvailable: false,
      dateAvailable: false,
      fixStatus: {
        earlyDateFix: false,
        globalDateFix: false,
        vendorDateFix: false,
        iosDateFix: false
      },
      dateTests: [
        {
          name: '当前时间',
          input: 'new Date()',
          result: '',
          status: 'pending',
          error: null
        },
        {
          name: 'ISO字符串',
          input: 'new Date("2023-12-19T10:30:00Z")',
          result: '',
          status: 'pending',
          error: null
        },
        {
          name: '美式日期格式',
          input: 'new Date("12/19/2023")',
          result: '',
          status: 'pending',
          error: null
        },
        {
          name: '连字符格式',
          input: 'new Date("2023-12-19")',
          result: '',
          status: 'pending',
          error: null
        },
        {
          name: '带时间的连字符格式',
          input: 'new Date("2023-12-19 10:30:00")',
          result: '',
          status: 'pending',
          error: null
        },
        {
          name: 'AM/PM格式',
          input: 'new Date("12/19/2023, 10:30:00 AM")',
          result: '',
          status: 'pending',
          error: null
        },
        {
          name: '时间戳',
          input: 'new Date(1703000000000)',
          result: '',
          status: 'pending',
          error: null
        }
      ],
      errorLogs: [],
      suggestions: []
    }
  },
  
  onLoad() {
    this.detectEnvironment()
    this.checkFixStatus()
    this.runAllTests()
  },
  
  methods: {
    /**
     * 检测运行环境
     */
    detectEnvironment() {
      // 检测基本环境
      this.windowAvailable = typeof window !== 'undefined'
      this.globalThisAvailable = typeof globalThis !== 'undefined'
      this.dateAvailable = typeof Date !== 'undefined'
      
      // 判断具体环境
      if (typeof wx !== 'undefined') {
        this.environment = '微信小程序'
        this.environmentClass = 'miniprogram'
      } else if (typeof uni !== 'undefined') {
        this.environment = 'uni-app'
        this.environmentClass = 'uniapp'
      } else if (this.windowAvailable) {
        this.environment = 'Web浏览器'
        this.environmentClass = 'web'
      } else {
        this.environment = 'Node.js或其他'
        this.environmentClass = 'other'
      }
      
      this.addErrorLog(`环境检测完成: ${this.environment}`)
    },
    
    /**
     * 检查修复状态
     */
    checkFixStatus() {
      this.addErrorLog('开始检查Date修复状态')
      
      // 检查早期修复标记
      try {
        // 这里可能需要根据实际的修复标记来检查
        this.fixStatus.earlyDateFix = typeof EARLY_DATE_FIX_APPLIED !== 'undefined'
      } catch (error) {
        this.fixStatus.earlyDateFix = false
      }
      
      // 检查Date对象是否被修改过
      if (typeof Date !== 'undefined') {
        const dateStr = Date.toString()
        this.fixStatus.globalDateFix = dateStr.includes('IOSCompatible') || dateStr.includes('Enhanced')
        this.fixStatus.vendorDateFix = dateStr.includes('Enhanced') || dateStr.includes('vendor')
        this.fixStatus.iosDateFix = dateStr.includes('iOS') || dateStr.includes('Patched')
      }
      
      this.addErrorLog(`修复状态检查完成: 早期=${this.fixStatus.earlyDateFix}, 全局=${this.fixStatus.globalDateFix}`)
    },
    
    /**
     * 运行所有Date测试
     */
    runAllTests() {
      this.addErrorLog('开始运行Date创建测试')
      
      this.dateTests.forEach((testCase, index) => {
        this.runSingleTest(testCase, index)
      })
      
      this.generateSuggestions()
    },
    
    /**
     * 运行单个测试用例
     */
    runSingleTest(testCase, index) {
      try {
        let result
        
        // 执行测试用例
        switch (index) {
          case 0: // 当前时间
            result = new Date()
            break
          case 1: // ISO字符串
            result = new Date("2023-12-19T10:30:00Z")
            break
          case 2: // 美式日期格式
            result = new Date("12/19/2023")
            break
          case 3: // 连字符格式
            result = new Date("2023-12-19")
            break
          case 4: // 带时间的连字符格式
            result = new Date("2023-12-19 10:30:00")
            break
          case 5: // AM/PM格式
            result = new Date("12/19/2023, 10:30:00 AM")
            break
          case 6: // 时间戳
            result = new Date(1703000000000)
            break
        }
        
        // 检查结果是否有效
        if (result instanceof Date && !isNaN(result.getTime())) {
          testCase.result = result.toString()
          testCase.status = 'success'
          testCase.error = null
        } else {
          testCase.result = 'Invalid Date'
          testCase.status = 'error'
          testCase.error = '创建的Date对象无效'
        }
        
      } catch (error) {
        testCase.result = 'Error'
        testCase.status = 'error'
        testCase.error = error.message
        
        this.addErrorLog(`测试失败 [${testCase.name}]: ${error.message}`)
      }
    },
    
    /**
     * 生成修复建议
     */
    generateSuggestions() {
      this.suggestions = []
      
      if (!this.windowAvailable) {
        this.suggestions.push('当前环境不支持window对象，这是正常的微信小程序环境')
      }
      
      if (!this.dateAvailable) {
        this.suggestions.push('⚠️ Date对象不可用，这是严重问题')
      }
      
      const errorCount = this.dateTests.filter(test => test.status === 'error').length
      if (errorCount > 0) {
        this.suggestions.push(`发现 ${errorCount} 个Date创建失败的测试用例，建议检查iOS兼容性修复`)
      }
      
      if (!this.fixStatus.earlyDateFix && !this.fixStatus.globalDateFix) {
        this.suggestions.push('未检测到Date修复，建议确认修复代码是否正确加载')
      }
      
      if (errorCount === 0) {
        this.suggestions.push('✅ 所有Date测试通过，修复效果良好')
      }
    },
    
    /**
     * 导出测试结果
     */
    exportTestResults() {
      const results = {
        environment: this.environment,
        windowAvailable: this.windowAvailable,
        globalThisAvailable: this.globalThisAvailable,
        dateAvailable: this.dateAvailable,
        fixStatus: this.fixStatus,
        dateTests: this.dateTests,
        errorLogs: this.errorLogs,
        suggestions: this.suggestions,
        timestamp: new Date().toISOString()
      }
      
      const resultStr = JSON.stringify(results, null, 2)
      
      if (typeof wx !== 'undefined') {
        wx.setClipboardData({
          data: resultStr,
          success: () => {
            this.addErrorLog('测试结果已复制到剪贴板')
            uni.showToast({
              title: '结果已复制',
              icon: 'success'
            })
          },
          fail: (error) => {
            this.addErrorLog(`复制失败: ${error.errMsg}`)
          }
        })
      } else {
        console.log('Test Results:', results)
        this.addErrorLog('测试结果已输出到控制台')
      }
    },
    
    /**
     * 添加错误日志
     */
    addErrorLog(message) {
      const timestamp = new Date().toLocaleTimeString()
      this.errorLogs.unshift({
        time: timestamp,
        message: message
      })
      
      // 限制日志数量
      if (this.errorLogs.length > 15) {
        this.errorLogs.pop()
      }
    }
  }
}
</script>

<style scoped>
.test-container {
  padding: 32rpx;
  background: #f8fafc;
  min-height: 100vh;
}

.test-header {
  text-align: center;
  margin-bottom: 40rpx;
}

.test-title {
  display: block;
  font-size: 36rpx;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 16rpx;
}

.test-desc {
  display: block;
  font-size: 28rpx;
  color: #64748b;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 24rpx;
}

/* 环境检测 */
.env-section {
  margin-bottom: 40rpx;
}

.env-card {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.env-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f3f4f6;
}

.env-item:last-child {
  border-bottom: none;
}

.env-label {
  font-size: 28rpx;
  color: #6b7280;
  font-weight: 500;
}

.env-value {
  font-size: 28rpx;
  font-weight: 600;
}

.env-value.miniprogram {
  color: #10b981;
}

.env-value.web {
  color: #3b82f6;
}

.env-value.success {
  color: #10b981;
}

.env-value.warning {
  color: #f59e0b;
}

.env-value.error {
  color: #ef4444;
}

/* 修复状态 */
.fix-section {
  margin-bottom: 40rpx;
}

.fix-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.fix-item {
  background: white;
  padding: 24rpx;
  border-radius: 12rpx;
  border-left: 6rpx solid #e5e7eb;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.fix-item.success {
  border-left-color: #10b981;
}

.fix-item.warning {
  border-left-color: #f59e0b;
}

.fix-label {
  display: block;
  font-size: 24rpx;
  color: #6b7280;
  margin-bottom: 8rpx;
}

.fix-value {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #1f2937;
}

/* 测试用例 */
.date-test-section {
  margin-bottom: 40rpx;
}

.test-case-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.test-case {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.test-case-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.test-case-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1e293b;
}

.test-case-status {
  font-size: 28rpx;
}

.test-case-input,
.test-case-result,
.test-case-error {
  display: flex;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.test-label {
  font-size: 26rpx;
  color: #6b7280;
  min-width: 80rpx;
}

.test-value {
  font-size: 26rpx;
  color: #374151;
  flex: 1;
  word-break: break-all;
}

.test-value.error {
  color: #dc2626;
}

/* 控制按钮 */
.controls {
  display: flex;
  gap: 16rpx;
  margin-bottom: 40rpx;
  flex-wrap: wrap;
}

.control-btn {
  flex: 1;
  min-width: 200rpx;
  padding: 20rpx 24rpx;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.2s ease;
}

.control-btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.3);
}

.control-btn.secondary {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(107, 114, 128, 0.3);
}

.control-btn.info {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(16, 185, 129, 0.3);
}

.control-btn:active {
  transform: translateY(2rpx);
}

/* 错误日志 */
.error-section {
  margin-bottom: 40rpx;
}

.error-log {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  max-height: 400rpx;
  overflow-y: auto;
}

.error-item {
  display: flex;
  gap: 16rpx;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f3f4f6;
}

.error-item:last-child {
  border-bottom: none;
}

.error-time {
  font-size: 24rpx;
  color: #9ca3af;
  min-width: 120rpx;
}

.error-message {
  font-size: 26rpx;
  color: #374151;
  flex: 1;
}

/* 建议 */
.suggestion-section {
  margin-bottom: 40rpx;
}

.suggestion-list {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.suggestion-item {
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f3f4f6;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-text {
  font-size: 28rpx;
  color: #374151;
  line-height: 1.6;
}
</style>
