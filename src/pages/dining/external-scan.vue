<template>
  <view class="external-scan-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">外部扫码确认就餐</text>
      <view class="help-btn" @click="showHelp = true">
        <text class="iconfont">❓</text>
      </view>
    </view>

    <!-- 扫码状态显示 -->
    <view class="scan-status-section">
      <view class="status-card" :class="scanStatusClass">
        <view class="status-icon">
          <text class="iconfont">{{ statusIcon }}</text>
        </view>
        <view class="status-content">
          <text class="status-title">{{ statusTitle }}</text>
          <text class="status-desc">{{ statusDesc }}</text>
        </view>
      </view>
    </view>

    <!-- 用户信息显示 -->
    <view class="user-info-section" v-if="userInfo">
      <view class="user-card">
        <view class="user-avatar">
          <image :src="userInfo.avatarUrl || '/static/default-avatar.png'" mode="aspectFill"></image>
        </view>
        <view class="user-details">
          <text class="user-name">{{ userInfo.nickName || '用户' }}</text>
          <text class="user-id">ID: {{ userInfo.openId || '--' }}</text>
        </view>
      </view>
    </view>

    <!-- 餐次信息显示 -->
    <view class="meal-info-section" v-if="mealInfo">
      <view class="meal-card">
        <view class="meal-icon">
          <text class="iconfont">{{ mealInfo.icon }}</text>
        </view>
        <view class="meal-content">
          <text class="meal-type">{{ mealInfo.type }}</text>
          <text class="meal-time">{{ mealInfo.timeRange }}</text>
          <text class="meal-status" :class="mealInfo.statusClass">{{ mealInfo.status }}</text>
        </view>
      </view>
    </view>

    <!-- 扫码操作区域 -->
    <view class="scan-action-section">
      <view class="scan-area" @click="startScan" :class="{ 'scanning': isScanning }">
        <view class="scan-icon" :class="{ 'scanning': isScanning }">
          <text class="iconfont">{{ isScanning ? '⏳' : '📱' }}</text>
        </view>
        <text class="scan-text">{{ isScanning ? '正在扫码...' : '点击扫码确认就餐' }}</text>
        <text class="scan-tip">{{ isScanning ? '请将二维码对准扫描框' : '扫描餐厅二维码完成就餐确认' }}</text>
        
        <!-- 扫码动画效果 -->
        <view class="scan-animation" v-if="isScanning">
          <view class="scan-line"></view>
        </view>
      </view>
      
      <view class="scan-actions">
        <button class="scan-btn" @click="startScan" :disabled="isScanning || !canScan">
          <text class="btn-icon">{{ isScanning ? '⏳' : '📱' }}</text>
          <text>{{ isScanning ? '扫码中...' : '开始扫码' }}</text>
        </button>
        <button class="refresh-btn" @click="refreshPage" :disabled="isScanning">
          <text class="btn-icon">🔄</text>
          <text>刷新</text>
        </button>
        <button class="debug-btn" @click="simulateScan" :disabled="isScanning">
          <text class="btn-icon">🧪</text>
          <text>模拟扫码</text>
        </button>
      </view>
    </view>

    <!-- 最近记录 -->
    <view class="recent-records-section" v-if="recentRecords.length > 0">
      <view class="section-title">
        <text>最近确认记录</text>
      </view>
      <view class="records-list">
        <view 
          v-for="record in recentRecords" 
          :key="record.id"
          class="record-item"
        >
          <view class="record-icon">
            <text class="iconfont">{{ getMealIcon(record.mealType) }}</text>
          </view>
          <view class="record-content">
            <text class="record-meal">{{ getMealTypeName(record.mealType) }}</text>
            <text class="record-time">{{ formatTime(record.confirmTime) }}</text>
          </view>
          <view class="record-status" :class="record.status === 'confirmed' ? 'success' : 'pending'">
            <text>{{ record.status === 'confirmed' ? '已确认' : '待确认' }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 帮助弹窗 -->
    <uni-popup ref="helpPopup" type="center" :mask-click="false">
      <view class="help-popup">
        <view class="popup-header">
          <text class="popup-title">外部扫码帮助</text>
          <button class="close-btn" @click="closeHelp">✕</button>
        </view>
        <view class="popup-content">
          <view class="help-item">
            <text class="help-title">📱 如何扫码</text>
            <text class="help-desc">点击"开始扫码"按钮，将手机摄像头对准餐厅二维码进行扫描</text>
          </view>
          <view class="help-item">
            <text class="help-title">⏰ 就餐时间</text>
            <text class="help-desc">系统会根据扫码时间自动判断餐次：早餐(6:00-10:00)、午餐(11:00-14:00)、晚餐(17:00-20:00)</text>
          </view>
          <view class="help-item">
            <text class="help-title">❌ 常见问题</text>
            <text class="help-desc">如果扫码失败，请检查网络连接或联系管理员</text>
          </view>
        </view>
        <view class="popup-footer">
          <button class="confirm-btn" @click="closeHelp">知道了</button>
        </view>
      </view>
    </uni-popup>

    <!-- 结果弹窗 -->
    <uni-popup ref="resultPopup" type="center" :mask-click="false">
      <view class="result-popup">
        <view class="popup-header">
          <text class="popup-title">{{ scanResult.success ? '确认成功' : '确认失败' }}</text>
          <button class="close-btn" @click="closeResult">✕</button>
        </view>
        <view class="popup-content">
          <view class="result-icon" :class="scanResult.success ? 'success' : 'error'">
            <text class="iconfont">{{ scanResult.success ? '✅' : '❌' }}</text>
          </view>
          <text class="result-message">{{ scanResult.message }}</text>
          <view class="result-details" v-if="scanResult.data">
            <text class="detail-item">餐次：{{ getMealTypeName(scanResult.data.mealType) }}</text>
            <text class="detail-item">时间：{{ formatTime(scanResult.data.confirmTime) }}</text>
            <text class="detail-item">状态：{{ scanResult.data.status }}</text>
          </view>
        </view>
        <view class="popup-footer">
          <button class="confirm-btn" @click="closeResult">确定</button>
        </view>
      </view>
    </uni-popup>

    <!-- 加载提示 -->
    <view class="loading-mask" v-if="showLoading">
      <view class="loading-content">
        <view class="loading-spinner"></view>
        <text class="loading-text">{{ loadingText }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import TimeUtils from '@/utils/timeUtils.js'

export default {
  name: 'ExternalScan',
  data() {
    return {
      // 扫码状态
      isScanning: false,
      canScan: true,
      showLoading: false,
      loadingText: '处理中...',
      
      // 扫码结果
      scanResult: {
        success: false,
        message: '',
        data: null
      },
      
      // 用户信息
      userInfo: null,
      
      // 餐次信息
      mealInfo: null,
      
      // 最近记录
      recentRecords: [],
      
      // 场景令牌
      sceneToken: null,
      
      // 帮助弹窗
      showHelp: false
    }
  },
  
  computed: {
    // 扫码状态相关
    scanStatusClass() {
      if (this.isScanning) return 'scanning'
      if (this.scanResult.success) return 'success'
      if (this.scanResult.message && !this.scanResult.success) return 'error'
      return 'ready'
    },
    
    statusIcon() {
      if (this.isScanning) return '⏳'
      if (this.scanResult.success) return '✅'
      if (this.scanResult.message && !this.scanResult.success) return '❌'
      return '📱'
    },
    
    statusTitle() {
      if (this.isScanning) return '正在扫码...'
      if (this.scanResult.success) return '扫码成功'
      if (this.scanResult.message && !this.scanResult.success) return '扫码失败'
      return '准备扫码'
    },
    
    statusDesc() {
      if (this.isScanning) return '请将二维码对准扫描框'
      if (this.scanResult.success) return '就餐确认成功'
      if (this.scanResult.message && !this.scanResult.success) return this.scanResult.message
      return '点击下方按钮开始扫码确认就餐'
    }
  },
  
  onLoad(options) {
    console.log('外部扫码页面加载，参数:', options)
    
    // 获取场景令牌
    if (options.scene_token) {
      this.sceneToken = options.scene_token
      console.log('获取到场景令牌:', this.sceneToken)
    }
    
    this.initPage()
  },
  
  onShow() {
    this.loadUserInfo()
    this.loadRecentRecords()
    this.updateMealInfo()
  },
  
  methods: {
    // 初始化页面
    async initPage() {
      try {
        this.showLoading = true
        this.loadingText = '初始化中...'
        
        // 检查登录状态
        await this.checkLoginStatus()
        
        // 更新餐次信息
        this.updateMealInfo()
        
      } catch (error) {
        console.error('页面初始化失败:', error)
        uni.showToast({
          title: '页面初始化失败',
          icon: 'none'
        })
      } finally {
        this.showLoading = false
      }
    },
    
    // 检查登录状态
    async checkLoginStatus() {
      try {
        const userInfo = uni.getStorageSync('userInfo')
        if (userInfo) {
          this.userInfo = userInfo
        } else {
          // 如果没有用户信息，尝试获取微信用户信息
          await this.getWechatUserInfo()
        }
      } catch (error) {
        console.error('检查登录状态失败:', error)
      }
    },
    
    // 获取微信用户信息
    async getWechatUserInfo() {
      try {
        const userInfoRes = await uni.getUserProfile({
          desc: '用于就餐确认'
        })
        
        if (userInfoRes.userInfo) {
          this.userInfo = userInfoRes.userInfo
          uni.setStorageSync('userInfo', userInfoRes.userInfo)
        }
      } catch (error) {
        console.error('获取微信用户信息失败:', error)
        // 用户拒绝授权，使用默认信息
        this.userInfo = {
          nickName: '游客用户',
          avatarUrl: '/static/default-avatar.png'
        }
      }
    },
    
    // 更新餐次信息
    updateMealInfo() {
      const now = TimeUtils.getCurrentBeijingTime()
      const currentHour = now.getHours()
      
      let mealType = 'unknown'
      let icon = '🍽️'
      let timeRange = ''
      let status = '未确认'
      let statusClass = 'pending'
      
      if (currentHour >= 6 && currentHour < 10) {
        mealType = 'breakfast'
        icon = '🌅'
        timeRange = '06:00-10:00'
        status = '早餐时间'
        statusClass = 'active'
      } else if (currentHour >= 11 && currentHour < 14) {
        mealType = 'lunch'
        icon = '☀️'
        timeRange = '11:00-14:00'
        status = '午餐时间'
        statusClass = 'active'
      } else if (currentHour >= 17 && currentHour < 20) {
        mealType = 'dinner'
        icon = '🌙'
        timeRange = '17:00-20:00'
        status = '晚餐时间'
        statusClass = 'active'
      } else {
        status = '非就餐时间'
        statusClass = 'inactive'
        this.canScan = false
      }
      
      this.mealInfo = {
        type: this.getMealTypeName(mealType),
        icon,
        timeRange,
        status,
        statusClass,
        mealType
      }
    },
    
    // 开始扫码
    startScan() {
      if (this.isScanning) return
      
      // 检查是否在就餐时间内
      if (!this.canScan) {
        uni.showToast({
          title: '当前不在就餐时间内',
          icon: 'none',
          duration: 2000
        })
        return
      }
      
      this.isScanning = true
      
      // 显示扫码提示
      uni.showToast({
        title: '请扫描餐厅二维码',
        icon: 'none',
        duration: 1500
      })
      
      // 调用扫码功能
      uni.scanCode({
        success: (res) => {
          console.log('扫码成功，二维码内容:', res.result)
          this.validateAndHandleScanResult(res.result)
        },
        fail: (error) => {
          console.error('扫码失败:', error)
          this.isScanning = false
          
          if (error.errMsg && error.errMsg.includes('cancel')) {
            return
          }
          
          uni.showToast({
            title: '扫码失败，请重试',
            icon: 'none',
            duration: 2000
          })
        }
      })
    },

    // 模拟扫码（用于调试）
    simulateScan() {
      if (this.isScanning) return
      
      // 模拟固定二维码内容
      const mockQRContent = 'DINING_CONFIRM_FIXED_001_' + Date.now()
      
      console.log('模拟扫码，二维码内容:', mockQRContent)
      this.validateAndHandleScanResult(mockQRContent)
    },
    
    // 验证并处理扫码结果
    validateAndHandleScanResult(qrCodeString) {
      console.log('验证扫码结果:', qrCodeString)
      
      // 首先检查是否是固定二维码
      if (qrCodeString.startsWith('DINING_CONFIRM_FIXED_001')) {
        console.log('检测到固定二维码，使用固定二维码处理逻辑')
        this.handleFixedQRCodeScan(qrCodeString)
        return
      }
      
      // 解析二维码内容，提取scene_token
      let sceneToken = null
      
      try {
        // 尝试解析URL参数
        if (qrCodeString.includes('scene_token=')) {
          const url = new URL(qrCodeString)
          sceneToken = url.searchParams.get('scene_token')
        } else if (qrCodeString.startsWith('dining_')) {
          // 直接是scene_token
          sceneToken = qrCodeString
        } else {
          // 尝试JSON解析
          const parsed = JSON.parse(qrCodeString)
          sceneToken = parsed.scene_token || parsed.sceneToken
        }
      } catch (error) {
        console.error('解析二维码内容失败:', error)
      }
      
      if (sceneToken) {
        console.log('获取到场景令牌:', sceneToken)
        this.sceneToken = sceneToken
        this.confirmDiningByScan(sceneToken)
      } else {
        console.log('无效的二维码:', qrCodeString)
        this.isScanning = false
        
        uni.showModal({
          title: '二维码无效',
          content: `扫描的二维码内容为：${qrCodeString}\n\n请扫描正确的餐厅二维码`,
          showCancel: false,
          confirmText: '知道了'
        })
      }
    },
    
    // 扫码确认就餐
    async confirmDiningByScan(sceneToken) {
      try {
        const scanTime = TimeUtils.getCurrentTimestamp()
        
        // 显示处理中状态
        uni.showLoading({
          title: '确认就餐中...',
          mask: true
        })
        
        console.log('调用外部扫码确认接口:', { sceneToken, scanTime, userInfo: this.userInfo })
        
        // 调用外部扫码确认接口
        const response = await api.qrScan.externalScan(sceneToken, scanTime, this.userInfo)
        
        uni.hideLoading()
        
        this.scanResult = {
          success: response.success,
          message: response.message,
          data: response.data
        }
        
        // 显示结果弹窗
        this.$refs.resultPopup.open()
        
        // 刷新数据
        await this.loadRecentRecords()
        
        // 如果成功，显示成功提示
        if (response.success) {
          uni.showToast({
            title: '就餐确认成功！',
            icon: 'success',
            duration: 2000
          })
        }
        
      } catch (error) {
        console.error('扫码确认失败:', error)
        uni.hideLoading()
        
        const errorMessage = this.getScanErrorMessage(error)
        
        this.scanResult = {
          success: false,
          message: errorMessage,
          data: null
        }
        
        this.$refs.resultPopup.open()
        
        uni.showToast({
          title: '扫码确认失败',
          icon: 'none',
          duration: 2000
        })
      } finally {
        this.isScanning = false
      }
    },
    
    // 获取扫码错误信息
    getScanErrorMessage(error) {
      if (error.message) {
        if (error.message.includes('不在就餐时间内')) {
          return '当前不在就餐时间内，请稍后再试'
        } else if (error.message.includes('已确认')) {
          return '您已经确认过本次就餐'
        } else if (error.message.includes('二维码过期')) {
          return '二维码已过期，请重新获取'
        } else if (error.message.includes('无效的二维码')) {
          return '二维码无效，请扫描正确的餐厅二维码'
        }
        return error.message
      }
      return '网络请求失败，请检查网络连接'
    },
    
    // 加载最近记录
    async loadRecentRecords() {
      try {
        const response = await api.qrScan.getHistory({ limit: 5 })
        if (response.success && response.data) {
          this.recentRecords = response.data.records || []
        }
      } catch (error) {
        console.error('获取最近记录失败:', error)
      }
    },
    
    // 刷新页面
    refreshPage() {
      this.initPage()
    },
    
    // 获取餐次图标
    getMealIcon(mealType) {
      const icons = {
        breakfast: '🌅',
        lunch: '☀️',
        dinner: '🌙',
        unknown: '🍽️'
      }
      return icons[mealType] || icons.unknown
    },
    
    // 获取餐次名称
    getMealTypeName(mealType) {
      const names = {
        breakfast: '早餐',
        lunch: '午餐',
        dinner: '晚餐',
        unknown: '未知'
      }
      return names[mealType] || names.unknown
    },
    
    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return '--'
      
      try {
        return TimeUtils.formatUTCTime(timeStr, 'datetime')
      } catch (error) {
        console.error('时间格式化失败:', error)
        return timeStr
      }
    },
    
    // 关闭帮助弹窗
    closeHelp() {
      this.showHelp = false
      this.$refs.helpPopup.close()
    },
    
    // 关闭结果弹窗
    closeResult() {
      this.$refs.resultPopup.close()
    },

    // 处理固定二维码扫码
    async handleFixedQRCodeScan(qrCodeString) {
      try {
        // 动态导入固定二维码处理工具
        const fixedQRGenerator = await import('@/utils/fixedQRGenerator.js')
        
        // 检查用户登录状态
        if (!this.userInfo || !this.userInfo.openId) {
          // 用户未登录，跳转到登录页面
          uni.showModal({
            title: '需要登录',
            content: '请先登录后再进行就餐确认',
            confirmText: '去登录',
            cancelText: '取消',
            success: (res) => {
              if (res.confirm) {
                uni.navigateTo({
                  url: '/pages/login/login'
                })
              }
            }
          })
          this.isScanning = false
          return
        }
        
        // 显示处理中状态
        uni.showLoading({
          title: '处理中...',
          mask: true
        })
        
        // 处理固定二维码扫码
        const result = await fixedQRGenerator.handleFixedQRCodeScan(qrCodeString, this.userInfo)
        
        uni.hideLoading()
        
        this.scanResult = {
          success: result.success,
          message: result.message,
          data: result.data
        }
        
        // 显示结果弹窗
        this.$refs.resultPopup.open()
        
        // 如果成功，刷新数据
        if (result.success) {
          await this.loadRecentRecords()
          uni.showToast({
            title: '就餐确认成功！',
            icon: 'success',
            duration: 2000
          })
        }
        
      } catch (error) {
        console.error('处理固定二维码失败:', error)
        uni.hideLoading()
        
        this.scanResult = {
          success: false,
          message: '处理失败: ' + error.message,
          data: null
        }
        
        this.$refs.resultPopup.open()
        
        uni.showToast({
          title: '处理失败',
          icon: 'none',
          duration: 2000
        })
      } finally {
        this.isScanning = false
      }
    }
  }
}
</script>

<style scoped>
.external-scan-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.help-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.scan-status-section {
  margin-bottom: 20px;
}

.status-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.status-card.scanning {
  border-left: 4px solid #ffa726;
}

.status-card.success {
  border-left: 4px solid #4caf50;
}

.status-card.error {
  border-left: 4px solid #f44336;
}

.status-card.ready {
  border-left: 4px solid #2196f3;
}

.status-icon {
  width: 50px;
  height: 50px;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
}

.status-content {
  flex: 1;
}

.status-title {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.status-desc {
  display: block;
  font-size: 14px;
  color: #666;
}

.user-info-section {
  margin-bottom: 20px;
}

.user-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
}

.user-avatar image {
  width: 100%;
  height: 100%;
}

.user-details {
  flex: 1;
}

.user-name {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.user-id {
  display: block;
  font-size: 12px;
  color: #666;
}

.meal-info-section {
  margin-bottom: 20px;
}

.meal-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.meal-icon {
  width: 50px;
  height: 50px;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 24px;
}

.meal-content {
  flex: 1;
}

.meal-type {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.meal-time {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.meal-status {
  display: block;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  text-align: center;
  width: fit-content;
}

.meal-status.active {
  background: #e8f5e8;
  color: #4caf50;
}

.meal-status.inactive {
  background: #ffebee;
  color: #f44336;
}

.meal-status.pending {
  background: #fff3e0;
  color: #ff9800;
}

.scan-action-section {
  margin-bottom: 30px;
}

.scan-area {
  background: white;
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.scan-area.scanning {
  background: linear-gradient(135deg, #fff3e0, #ffecb3);
}

.scan-icon {
  width: 80px;
  height: 80px;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-size: 36px;
  transition: all 0.3s ease;
}

.scan-icon.scanning {
  animation: pulse 1.5s infinite;
}

.scan-text {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.scan-tip {
  display: block;
  font-size: 14px;
  color: #666;
}

.scan-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.scan-line {
  position: absolute;
  top: 50%;
  left: 20px;
  right: 20px;
  height: 2px;
  background: linear-gradient(90deg, transparent, #2196f3, transparent);
  animation: scan 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes scan {
  0% { transform: translateY(-50px); }
  100% { transform: translateY(50px); }
}

.scan-actions {
  display: flex;
  gap: 15px;
}

.scan-btn, .refresh-btn {
  flex: 1;
  height: 50px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(33, 150, 243, 0.3);
}

.refresh-btn {
  background: #ff9800;
  box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
}

.debug-btn {
  background: #9c27b0;
  box-shadow: 0 4px 15px rgba(156, 39, 176, 0.3);
}

.scan-btn:disabled, .refresh-btn:disabled {
  background: #ccc;
  box-shadow: none;
}

.btn-icon {
  margin-right: 8px;
  font-size: 18px;
}

.recent-records-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: white;
  margin-bottom: 15px;
}

.records-list {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.record-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.record-item:last-child {
  border-bottom: none;
}

.record-icon {
  width: 40px;
  height: 40px;
  background: #f5f5f5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  font-size: 18px;
}

.record-content {
  flex: 1;
}

.record-meal {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.record-time {
  display: block;
  font-size: 12px;
  color: #666;
}

.record-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.record-status.success {
  background: #e8f5e8;
  color: #4caf50;
}

.record-status.pending {
  background: #fff3e0;
  color: #ff9800;
}

/* 弹窗样式 */
.help-popup, .result-popup {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.popup-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.close-btn {
  width: 30px;
  height: 30px;
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #666;
}

.popup-content {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.help-item {
  margin-bottom: 20px;
}

.help-item:last-child {
  margin-bottom: 0;
}

.help-title {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.help-desc {
  display: block;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.result-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-size: 30px;
}

.result-icon.success {
  background: #e8f5e8;
  color: #4caf50;
}

.result-icon.error {
  background: #ffebee;
  color: #f44336;
}

.result-message {
  display: block;
  font-size: 16px;
  color: #333;
  text-align: center;
  margin-bottom: 15px;
}

.result-details {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 15px;
}

.detail-item {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.popup-footer {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
}

.confirm-btn {
  width: 100%;
  height: 45px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
}

.loading-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2196f3;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  color: #333;
}
</style>
