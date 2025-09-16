<template>
  <view class="test-container">
    <view class="test-header">
      <text class="test-title">现代化API测试</text>
      <text class="test-desc">验证wx.getSystemInfoSync替换方案</text>
    </view>
    
    <!-- API检测状态 -->
    <view class="status-section">
      <text class="section-title">🔍 API可用性检测</text>
      <view class="status-grid">
        <view class="status-item" :class="apiStatus.newDeviceApi ? 'success' : 'warning'">
          <text class="status-label">wx.getDeviceInfo</text>
          <text class="status-value">{{ apiStatus.newDeviceApi ? '✅ 可用' : '❌ 不可用' }}</text>
        </view>
        <view class="status-item" :class="apiStatus.newWindowApi ? 'success' : 'warning'">
          <text class="status-label">wx.getWindowInfo</text>
          <text class="status-value">{{ apiStatus.newWindowApi ? '✅ 可用' : '❌ 不可用' }}</text>
        </view>
        <view class="status-item" :class="apiStatus.newAppApi ? 'success' : 'warning'">
          <text class="status-label">wx.getAppBaseInfo</text>
          <text class="status-value">{{ apiStatus.newAppApi ? '✅ 可用' : '❌ 不可用' }}</text>
        </view>
        <view class="status-item" :class="apiStatus.oldApi ? 'warning' : 'success'">
          <text class="status-label">wx.getSystemInfoSync</text>
          <text class="status-value">{{ apiStatus.oldApi ? '⚠️ 已弃用' : '❌ 不可用' }}</text>
        </view>
      </view>
    </view>
    
    <!-- 环境信息 -->
    <view class="info-section">
      <text class="section-title">📱 环境信息</text>
      <view class="info-card">
        <view class="info-row">
          <text class="info-label">运行环境:</text>
          <text class="info-value">{{ environmentInfo.type }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">平台:</text>
          <text class="info-value">{{ environmentInfo.platform }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">系统:</text>
          <text class="info-value">{{ environmentInfo.system }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">数据来源:</text>
          <text class="info-value">{{ environmentInfo.source }}</text>
        </view>
      </view>
    </view>
    
    <!-- 设备信息 -->
    <view class="device-section" v-if="deviceInfo">
      <text class="section-title">⚙️ 设备信息</text>
      <view class="info-card">
        <view class="info-row" v-for="(value, key) in deviceInfo" :key="key">
          <text class="info-label">{{ formatKey(key) }}:</text>
          <text class="info-value">{{ formatValue(value) }}</text>
        </view>
      </view>
    </view>
    
    <!-- 窗口信息 -->
    <view class="window-section" v-if="windowInfo">
      <text class="section-title">🖼️ 窗口信息</text>
      <view class="info-card">
        <view class="info-row" v-for="(value, key) in windowInfo" :key="key">
          <text class="info-label">{{ formatKey(key) }}:</text>
          <text class="info-value">{{ formatValue(value) }}</text>
        </view>
      </view>
    </view>
    
    <!-- 应用信息 -->
    <view class="app-section" v-if="appInfo">
      <text class="section-title">📱 应用信息</text>
      <view class="info-card">
        <view class="info-row" v-for="(value, key) in appInfo" :key="key">
          <text class="info-label">{{ formatKey(key) }}:</text>
          <text class="info-value">{{ formatValue(value) }}</text>
        </view>
      </view>
    </view>
    
    <!-- 性能信息 -->
    <view class="performance-section">
      <text class="section-title">🚀 性能信息</text>
      <view class="info-card">
        <view class="info-row">
          <text class="info-label">性能等级:</text>
          <text class="info-value" :class="performanceInfo.isHighPerformance ? 'high-performance' : 'low-performance'">
            {{ performanceInfo.benchmarkLevel }} {{ performanceInfo.isHighPerformance ? '(高性能)' : '(中低性能)' }}
          </text>
        </view>
        <view class="info-row">
          <text class="info-label">像素比:</text>
          <text class="info-value">{{ performanceInfo.devicePixelRatio }}</text>
        </view>
      </view>
    </view>
    
    <!-- 测试按钮 -->
    <view class="test-controls">
      <button class="test-btn primary" @click="refreshAllInfo">
        刷新所有信息
      </button>
      <button class="test-btn secondary" @click="clearCache">
        清除缓存
      </button>
      <button class="test-btn info" @click="exportData">
        导出数据
      </button>
    </view>
    
    <!-- 操作日志 -->
    <view class="log-section">
      <text class="section-title">📝 操作日志</text>
      <view class="log-container">
        <view class="log-item" v-for="(log, index) in logs" :key="index">
          <text class="log-time">{{ log.time }}</text>
          <text class="log-message" :class="log.type">{{ log.message }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import modernSystemInfo from '@/utils/modernSystemInfo.js'

export default {
  name: 'TestModernAPI',
  data() {
    return {
      apiStatus: {
        newDeviceApi: false,
        newWindowApi: false,
        newAppApi: false,
        newSystemApi: false,
        oldApi: false
      },
      environmentInfo: {
        type: 'unknown',
        platform: 'unknown',
        system: 'unknown',
        source: 'unknown'
      },
      deviceInfo: null,
      windowInfo: null,
      appInfo: null,
      systemSetting: null,
      performanceInfo: {
        benchmarkLevel: -1,
        devicePixelRatio: 1,
        isHighPerformance: false
      },
      logs: []
    }
  },
  
  onLoad() {
    this.addLog('页面加载', '开始测试现代化API')
    this.checkApiAvailability()
    this.loadAllSystemInfo()
  },
  
  methods: {
    /**
     * 检查API可用性
     */
    checkApiAvailability() {
      this.addLog('API检测', '开始检测API可用性')
      
      if (typeof wx !== 'undefined') {
        this.apiStatus.newDeviceApi = typeof wx.getDeviceInfo === 'function'
        this.apiStatus.newWindowApi = typeof wx.getWindowInfo === 'function'
        this.apiStatus.newAppApi = typeof wx.getAppBaseInfo === 'function'
        this.apiStatus.newSystemApi = typeof wx.getSystemSetting === 'function'
        this.apiStatus.oldApi = typeof wx.getSystemInfoSync === 'function'
        
        this.addLog('API检测', `新设备API: ${this.apiStatus.newDeviceApi ? '可用' : '不可用'}`)
        this.addLog('API检测', `新窗口API: ${this.apiStatus.newWindowApi ? '可用' : '不可用'}`)
        this.addLog('API检测', `新应用API: ${this.apiStatus.newAppApi ? '可用' : '不可用'}`)
        this.addLog('API检测', `旧API: ${this.apiStatus.oldApi ? '存在(已弃用)' : '不存在'}`)
      } else {
        this.addLog('API检测', '非微信小程序环境')
      }
    },
    
    /**
     * 加载所有系统信息
     */
    loadAllSystemInfo() {
      this.addLog('数据加载', '开始加载系统信息')
      
      try {
        // 检测运行环境
        if (modernSystemInfo.isWechatMiniProgram()) {
          this.environmentInfo.type = '微信小程序'
        } else if (modernSystemInfo.isUniAppEnvironment()) {
          this.environmentInfo.type = 'uni-app'
        } else {
          this.environmentInfo.type = 'Web浏览器'
        }
        
        // 获取完整系统信息
        const completeInfo = modernSystemInfo.getCompleteSystemInfo()
        if (completeInfo) {
          this.environmentInfo.platform = completeInfo.platform || 'unknown'
          this.environmentInfo.system = completeInfo.system || 'unknown'
          this.environmentInfo.source = completeInfo._source || 'unknown'
        }
        
        // 获取分类信息
        this.deviceInfo = modernSystemInfo.getDeviceInfo()
        this.windowInfo = modernSystemInfo.getWindowInfo()
        this.appInfo = modernSystemInfo.getAppBaseInfo()
        this.systemSetting = modernSystemInfo.getSystemSetting()
        
        // 获取性能信息
        this.performanceInfo = modernSystemInfo.getDevicePerformanceLevel()
        
        this.addLog('数据加载', '系统信息加载完成')
      } catch (error) {
        this.addLog('错误', `加载系统信息失败: ${error.message}`, 'error')
      }
    },
    
    /**
     * 刷新所有信息
     */
    refreshAllInfo() {
      this.addLog('操作', '手动刷新所有信息')
      this.checkApiAvailability()
      this.loadAllSystemInfo()
    },
    
    /**
     * 清除缓存
     */
    clearCache() {
      try {
        modernSystemInfo.clearSystemInfoCache()
        this.addLog('操作', '系统信息缓存已清除')
        this.loadAllSystemInfo()
      } catch (error) {
        this.addLog('错误', `清除缓存失败: ${error.message}`, 'error')
      }
    },
    
    /**
     * 导出数据
     */
    exportData() {
      const exportData = {
        apiStatus: this.apiStatus,
        environmentInfo: this.environmentInfo,
        deviceInfo: this.deviceInfo,
        windowInfo: this.windowInfo,
        appInfo: this.appInfo,
        systemSetting: this.systemSetting,
        performanceInfo: this.performanceInfo,
        timestamp: new Date().toISOString()
      }
      
      const dataStr = JSON.stringify(exportData, null, 2)
      
      if (typeof wx !== 'undefined') {
        // 微信小程序环境
        wx.setClipboardData({
          data: dataStr,
          success: () => {
            this.addLog('导出', '数据已复制到剪贴板')
            uni.showToast({
              title: '数据已复制',
              icon: 'success'
            })
          },
          fail: (error) => {
            this.addLog('错误', `复制失败: ${error.errMsg}`, 'error')
          }
        })
      } else {
        // 其他环境
        if (navigator.clipboard) {
          navigator.clipboard.writeText(dataStr).then(() => {
            this.addLog('导出', '数据已复制到剪贴板')
          }).catch(error => {
            this.addLog('错误', `复制失败: ${error.message}`, 'error')
          })
        } else {
          console.log('Export Data:', dataStr)
          this.addLog('导出', '数据已输出到控制台')
        }
      }
    },
    
    /**
     * 格式化键名
     */
    formatKey(key) {
      const keyMap = {
        platform: '平台',
        system: '系统版本',
        devicePixelRatio: '像素比',
        benchmarkLevel: '性能等级',
        windowWidth: '窗口宽度',
        windowHeight: '窗口高度',
        screenWidth: '屏幕宽度',
        screenHeight: '屏幕高度',
        statusBarHeight: '状态栏高度',
        SDKVersion: 'SDK版本',
        version: '应用版本',
        language: '语言',
        theme: '主题',
        bluetoothEnabled: '蓝牙',
        locationEnabled: '定位',
        wifiEnabled: 'WiFi',
        deviceOrientation: '设备方向'
      }
      return keyMap[key] || key
    },
    
    /**
     * 格式化值
     */
    formatValue(value) {
      if (value === null || value === undefined) return '未知'
      if (typeof value === 'boolean') return value ? '启用' : '禁用'
      if (typeof value === 'object') return JSON.stringify(value)
      return String(value)
    },
    
    /**
     * 添加日志
     */
    addLog(type, message, level = 'info') {
      const timestamp = new Date().toLocaleTimeString()
      this.logs.unshift({
        time: timestamp,
        type: level,
        message: `[${type}] ${message}`
      })
      
      // 限制日志数量
      if (this.logs.length > 20) {
        this.logs.pop()
      }
    }
  }
}
</script>

<style scoped>
.test-container {
  padding: 32rpx;
  background: #f5f7fa;
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

/* 状态网格 */
.status-section {
  margin-bottom: 40rpx;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.status-item {
  background: white;
  padding: 24rpx;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  border-left: 6rpx solid #e5e7eb;
}

.status-item.success {
  border-left-color: #10b981;
}

.status-item.warning {
  border-left-color: #f59e0b;
}

.status-label {
  display: block;
  font-size: 24rpx;
  color: #6b7280;
  margin-bottom: 8rpx;
}

.status-value {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #1f2937;
}

/* 信息卡片 */
.info-section, .device-section, .window-section, .app-section, .performance-section {
  margin-bottom: 40rpx;
}

.info-card {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f3f4f6;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 28rpx;
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  font-size: 28rpx;
  color: #1f2937;
  text-align: right;
  max-width: 60%;
  word-break: break-all;
}

.info-value.high-performance {
  color: #10b981;
  font-weight: 600;
}

.info-value.low-performance {
  color: #f59e0b;
  font-weight: 600;
}

/* 测试控制按钮 */
.test-controls {
  display: flex;
  gap: 16rpx;
  margin-bottom: 40rpx;
  flex-wrap: wrap;
}

.test-btn {
  flex: 1;
  min-width: 200rpx;
  padding: 20rpx 24rpx;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  transition: all 0.2s ease;
}

.test-btn.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(59, 130, 246, 0.3);
}

.test-btn.secondary {
  background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(107, 114, 128, 0.3);
}

.test-btn.info {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4rpx 12rpx rgba(16, 185, 129, 0.3);
}

.test-btn:active {
  transform: translateY(2rpx);
}

/* 日志区域 */
.log-section {
  margin-top: 40rpx;
}

.log-container {
  background: white;
  border-radius: 12rpx;
  padding: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  max-height: 600rpx;
  overflow-y: auto;
}

.log-item {
  display: flex;
  gap: 16rpx;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f3f4f6;
}

.log-item:last-child {
  border-bottom: none;
}

.log-time {
  font-size: 24rpx;
  color: #9ca3af;
  min-width: 120rpx;
}

.log-message {
  font-size: 26rpx;
  color: #374151;
  flex: 1;
}

.log-message.error {
  color: #dc2626;
}

.log-message.warning {
  color: #d97706;
}
</style>
