<template>
  <view class="qr-scan-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">扫码确认就餐</text>
      <view class="help-btn" @click="showHelp = true">
        <text class="iconfont">❓</text>
      </view>
    </view>

    <!-- 二维码展示区域 -->
    <view class="qr-display-section">
      <view class="qr-section-title">
        <text>餐厅主入口二维码</text>
        <view class="qr-type-selector">
          <text 
            v-for="type in qrTypes" 
            :key="type.value"
            class="qr-type-btn"
            :class="{ active: selectedQRType === type.value }"
            @click="selectQRType(type.value)"
          >
            {{ type.label }}
          </text>
        </view>
        <text class="refresh-btn" @click="loadQRCode">🔄</text>
      </view>
      
      <view class="qr-container">
        <view class="qr-info">
          <text class="qr-name">{{ getCurrentQRType信息().name }}</text>
          <text class="qr-location">位置: {{ getCurrentQRType信息().location }}</text>
          <text class="qr-id">标识: {{ getCurrentQRType信息().code }}</text>
          <text class="qr-purpose">用途: {{ getCurrentQRType信息().purpose }}</text>
          <text class="qr-description" v-if="getCurrentQRType信息().description">
            {{ getCurrentQRType信息().description }}
          </text>
        </view>
        
        <view class="qr-image-container">
          <!-- 二维码图片显示 -->
          <image 
            v-if="currentQRCodeImage" 
            :src="currentQRCodeImage" 
            mode="aspectFit"
            class="qr-image"
            @click="previewQRCode"
          />
          <!-- 加载中状态 -->
          <view v-else-if="isGeneratingQR" class="qr-loading">
            <text class="loading-text">生成二维码中...</text>
          </view>
          <!-- 生成失败状态 -->
          <view v-else class="qr-error" @click="loadQRCode">
            <text class="error-text">点击生成二维码</text>
          </view>
        </view>
      </view>
      
      <!-- 二维码操作按钮 -->
      <view class="qr-actions" v-if="currentQRCodeImage">
        <button class="action-btn preview-btn" @click="previewQRCode">
          <text class="btn-icon">👁️</text>
          <text>预览</text>
        </button>
        <button class="action-btn download-btn" @click="downloadQRCode">
          <text class="btn-icon">⬇️</text>
          <text>下载</text>
        </button>
        <button class="action-btn share-btn" @click="shareQRCode">
          <text class="btn-icon">📤</text>
          <text>分享</text>
        </button>
      </view>
    </view>

    <!-- 今日就餐状态 -->
    <view class="dining-status-card" v-if="diningStatus">
      <view class="status-title">
        <text>今日就餐状态</text>
        <text class="status-date">{{ diningStatus.date }}</text>
      </view>
      
      <view class="meal-status-grid">
        <view 
          v-for="meal in mealTypes" 
          :key="meal.type" 
          class="meal-status-item"
          :class="{ 
            'registered': diningStatus.meal确认ationStatus?.[meal.type]?.isRegistered,
            'confirmed': diningStatus.meal确认ationStatus?.[meal.type]?.diningStatus === 'dined',
            'current': isCurrentMealTime(meal.type)
          }"
          @click="showMealDetail(meal.type)"
        >
          <text class="meal-name">{{ meal.name }}</text>
          <view class="status-indicators">
            <view class="status-dot registered" v-if="diningStatus.meal确认ationStatus?.[meal.type]?.isRegistered" title="已报餐"></view>
            <view class="status-dot confirmed" v-if="diningStatus.meal确认ationStatus?.[meal.type]?.diningStatus === 'dined'" title="已确认"></view>
          </view>
          <view class="meal-times">
            <text class="time-text">{{ getMealTimeRange(meal.type) }}</text>
          </view>
        </view>
      </view>
      
      <!-- 当前时间状态 -->
      <view class="current-time-status" v-if="currentMealStatus">
        <text class="status-text">{{ currentMealStatus }}</text>
      </view>
    </view>

    <!-- 扫码区域 -->
    <view class="scan-section">
      <view class="scan-title">
        <text>扫码确认就餐</text>
        <text class="scan-subtitle">选择扫码方式完成就餐确认</text>
      </view>
      
      <!-- 扫码模式选择 -->
      <view class="scan-mode-selector">
        <view class="mode-option" :class="{ active: scanMode === 'normal' }" @click="selectScanMode('normal')">
          <text class="mode-icon">📱</text>
          <text class="mode-label">普通扫码</text>
          <text class="mode-desc">使用相机扫描二维码</text>
        </view>
        <view class="mode-option" :class="{ active: scanMode === 'wechat' }" @click="selectScanMode('wechat')">
          <text class="mode-icon">💬</text>
          <text class="mode-label">微信扫码</text>
          <text class="mode-desc">微信小程序扫码确认</text>
        </view>
      </view>
      
      <view class="scan-area" @click="startScan" :class="{ 'scanning': isScanning }">
        <view class="scan-icon" :class="{ 'scanning': isScanning }">
          <text class="iconfont">{{ isScanning ? '⏳' : getScanModeIcon() }}</text>
        </view>
        <text class="scan-text">{{ isScanning ? '正在扫码...' : getScanModeText() }}</text>
        <text class="scan-tip">{{ isScanning ? '请将二维码对准扫描框' : getScanModeTip() }}</text>
        
        <!-- 扫码动画效果 -->
        <view class="scan-animation" v-if="isScanning">
          <view class="scan-line"></view>
        </view>
      </view>
      
      <view class="scan-actions">
        <button class="scan-btn" @click="startScan" :disabled="isScanning || !canScan">
          <text class="btn-icon">{{ isScanning ? '⏳' : getScanModeIcon() }}</text>
          <text>{{ isScanning ? '扫码中...' : '开始扫码' }}</text>
        </button>
      </view>
      
      <!-- 测试功能 -->
      <view class="test-section" v-if="showTestFeatures">
        <view class="test-title">
          <text>测试功能</text>
        </view>
        <button class="test-btn" @click="testScanProcess" :disabled="isScanning">
          <text class="btn-icon">🧪</text>
          <text>测试扫码流程</text>
        </button>
        <button class="simulate-scan-btn" @click="simulateRealScan" :disabled="isScanning">
          <text class="btn-icon">📱</text>
          <text>模拟实际扫码</text>
        </button>
        <button class="simulate-invalid-btn" @click="simulateInvalidScan" :disabled="isScanning">
          <text class="btn-icon">❌</text>
          <text>模拟无效扫码</text>
        </button>
        <button class="admin-confirm-btn" @click="confirmLunchFor管理员" :disabled="isScanning">
          <text class="btn-icon">👨‍💼</text>
          <text>确认系统管理员中餐</text>
        </button>
        <button class="force-confirm-btn" @click="force确认Dining" :disabled="isScanning">
          <text class="btn-icon">⚡</text>
          <text>强制确认就餐</text>
        </button>
      </view>
      
      <!-- 扫码提示信息 -->
      <view class="scan-tips" v-if="!isScanning">
        <view class="tip-item">
          <text class="tip-icon">✅</text>
          <text class="tip-text">确保已报餐</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">⏰</text>
          <text class="tip-text">在就餐时间内扫码</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">📱</text>
          <text class="tip-text">扫描固定二维码DINING_QR_MAIN_001</text>
        </view>
      </view>
    </view>

    <!-- 最近扫码记录 -->
    <view class="recent-records" v-if="recentRecords.length > 0">
      <view class="records-title">
        <text>最近扫码记录</text>
        <text class="view-all" @click="goToHistory">查看全部</text>
      </view>
      
      <view class="records-list">
        <view 
          v-for="record in recentRecords" 
          :key="record._id" 
          class="record-item"
        >
          <view class="record-info">
            <text class="meal-type">{{ record.mealTypeName }}</text>
            <text class="scan-time">{{ $formatTime(record.scanTime) }}</text>
          </view>
          <view class="record-status success">
            <text>✓</text>
          </view>
        </view>
      </view>
    </view>


    <!-- 二维码详情弹窗 -->
    <uni-popup ref="qrDetailPopup" type="center">
      <view class="qr-detail-popup">
        <view class="popup-header">
          <text class="popup-title">二维码详情</text>
          <text class="close-btn" @click="closeQrDetail">×</text>
        </view>
        
        <view class="popup-content" v-if="selectedQrCode">
          <view class="qr-detail-section">
            <text class="detail-label">二维码名称:</text>
            <text class="detail-value">{{ selectedQrCode.name }}</text>
          </view>
          
          <view class="qr-detail-section">
            <text class="detail-label">张贴位置:</text>
            <text class="detail-value">{{ selectedQrCode.location }}</text>
          </view>
          
          <view class="qr-detail-section">
            <text class="detail-label">二维码内容:</text>
            <text class="detail-value qr-code-content">{{ selectedQrCode.code }}</text>
          </view>
          
          <view class="qr-detail-section" v-if="selectedQrCode.description">
            <text class="detail-label">描述:</text>
            <text class="detail-value">{{ selectedQrCode.description }}</text>
          </view>
          
          <view class="qr-detail-section">
            <text class="detail-label">状态:</text>
            <text class="detail-value">{{ selectedQrCode.status === 'active' ? '启用' : '停用' }}</text>
          </view>
        </view>
        
        <view class="popup-actions">
          <button class="cancel-btn" @click="closeQrDetail">关闭</button>
          <button class="confirm-btn" @click="useQrCode">使用此二维码</button>
        </view>
      </view>
    </uni-popup>

    <!-- 帮助弹窗 -->
    <uni-popup ref="helpPopup" type="center">
      <view class="help-popup">
        <view class="popup-header">
          <text class="popup-title">扫码就餐帮助</text>
          <text class="close-btn" @click="closeHelp">×</text>
        </view>
        
        <view class="popup-content">
          <view class="help-section">
            <text class="help-title">使用步骤：</text>
            <text class="help-text">1. 确保已报餐（由部门管理员代为报餐）</text>
            <text class="help-text">2. 在就餐时间内扫码</text>
            <text class="help-text">3. 扫描固定二维码DINING_QR_MAIN_001</text>
            <text class="help-text">4. 系统自动识别餐次并确认就餐</text>
          </view>
          
          <view class="help-section">
            <text class="help-title">就餐时间：</text>
            <text class="help-text">早餐：6:00-10:00</text>
            <text class="help-text">午餐：11:00-14:00</text>
            <text class="help-text">晚餐：17:00-20:00</text>
          </view>
          
          <view class="help-section">
            <text class="help-title">固定二维码信息：</text>
            <text class="help-text">• 二维码标识：DINING_QR_MAIN_001</text>
            <text class="help-text">• 张贴位置：餐厅主入口</text>
            <text class="help-text">• 用途：扫码确认就餐</text>
          </view>
          
          <view class="help-section">
            <text class="help-title">注意事项：</text>
            <text class="help-text">• 必须先报餐才能扫码确认</text>
            <text class="help-text">• 每个餐次只能确认一次</text>
            <text class="help-text">• 超出就餐时间无法扫码</text>
          </view>
        </view>
        
        <view class="popup-actions">
          <button class="confirm-btn" @click="closeHelp">知道了</button>
        </view>
      </view>
    </uni-popup>

    <!-- 二维码预览弹窗 -->
    <uni-popup ref="qrPreviewPopup" type="center">
      <view class="qr-preview-popup">
        <view class="popup-header">
          <text class="popup-title">二维码预览</text>
          <text class="close-btn" @click="closeQrPreview">×</text>
        </view>
        
        <view class="popup-content">
          <view class="qr-preview-info">
            <text class="qr-preview-name">{{ getCurrentQRType信息().name }}</text>
            <text class="qr-preview-location">位置: {{ getCurrentQRType信息().location }}</text>
            <text class="qr-preview-type">类型: {{ getCurrentQRType信息().label }}</text>
          </view>
          
          <view class="qr-preview-image">
            <image 
              v-if="currentQRCodeImage"
              :src="currentQRCodeImage" 
              mode="aspectFit"
              class="large-qr-image"
            />
            <view v-else class="qr-loading-large">
              <text class="loading-text">加载中...</text>
            </view>
          </view>
          
          <view class="qr-preview-details">
            <text class="detail-label">二维码标识:</text>
            <text class="detail-value">{{ getCurrentQRType信息().code }}</text>
            <text class="detail-label">用途:</text>
            <text class="detail-value">{{ getCurrentQRType信息().purpose }}</text>
            <text class="detail-label">描述:</text>
            <text class="detail-value">{{ getCurrentQRType信息().description }}</text>
          </view>
        </view>
        
        <view class="popup-actions">
          <button class="download-btn" @click="downloadQRCode" v-if="currentQRCodeImage">
            下载二维码
          </button>
          <button class="share-btn" @click="shareQRCode" v-if="currentQRCodeImage">
            分享二维码
          </button>
          <button class="confirm-btn" @click="closeQrPreview">关闭</button>
        </view>
      </view>
    </uni-popup>

    <!-- 扫码结果弹窗 -->
    <uni-popup ref="resultPopup" type="center">
      <view class="result-popup">
        <view class="result-icon" :class="{ success: scanResult.success, error: !scanResult.success }">
          <text class="iconfont">{{ scanResult.success ? '✓' : '✗' }}</text>
        </view>
        
        <view class="result-content">
          <text class="result-title">{{ scanResult.success ? '扫码成功' : '扫码失败' }}</text>
          <text class="result-message">{{ scanResult.message }}</text>
          
          <view class="result-details" v-if="scanResult.success && scanResult.data">
            <text class="detail-item">餐次：{{ scanResult.data.mealTypeName }}</text>
            <text class="detail-item">时间：{{ $formatTime(scanResult.data.scanTime) }}</text>
            <text class="detail-item">位置：{{ scanResult.data.qrCode信息?.location }}</text>
          </view>
        </view>
        
        <view class="popup-actions">
          <button class="confirm-btn" @click="closeResult">确定</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import api from '@/utils/api.js'
import qrCodeGenerator from '@/utils/qrCodeGenerator.js'
import TimeUtils from '@/utils/timeUtils.js'
import timeMixin from '@/mixins/timeMixin.js'

export default {
  name: 'QrScan',
  mixins: [timeMixin],
  data() {
    return {
      diningStatus: null,  // 用户就餐确认状态
      recentRecords: [],
      isScanning: false,
      showHelp: false,
      scanResult: {
        success: false,
        message: '',
        data: null
      },
      currentQRCodeImage: null,  // 当前二维码图片
      isGeneratingQR: false,   // 是否正在生成二维码
      currentMealStatus: '',   // 当前时间状态
      currentMealType: null,   // 当前餐次类型
      mealTypes: [
        { type: 'breakfast', name: '早餐', startTime: '06:00', endTime: '10:00' },
        { type: 'lunch', name: '午餐', startTime: '11:00', endTime: '14:00' },
        { type: 'dinner', name: '晚餐', startTime: '17:00', endTime: '20:00' }
      ],
      mealTimeRanges: {
        breakfast: '06:00-10:00',
        lunch: '11:00-14:00',
        dinner: '17:00-20:00'
      },
      
      // 二维码类型选择
      selectedQRType: 'normal',  // 当前选择的二维码类型
      qrTypes: [
        { 
          value: 'normal', 
          label: '普通', 
          name: '餐厅主入口二维码',
          location: '餐厅主入口',
          code: 'DINING_QR_MAIN_001',
          purpose: '扫码确认就餐',
          description: '标准二维码，适用于所有扫码设备'
        },
        { 
          value: 'with-url', 
          label: '带URL', 
          name: '餐厅主入口二维码（带链接）',
          location: '餐厅主入口',
          code: 'DINING_QR_MAIN_001',
          purpose: '扫码确认就餐',
          description: '包含访问链接的二维码，扫码后可直接跳转'
        },
        { 
          value: 'secure', 
          label: '安全', 
          name: '餐厅主入口二维码（安全版）',
          location: '餐厅主入口',
          code: 'DINING_QR_MAIN_001',
          purpose: '扫码确认就餐',
          description: '带安全令牌的二维码，具有时效性保护'
        },
        { 
          value: 'wechat', 
          label: '微信', 
          name: '餐厅主入口二维码（微信版）',
          location: '餐厅主入口',
          code: 'DINING_QR_MAIN_001',
          purpose: '微信小程序扫码确认',
          description: '微信小程序码，专为微信用户优化'
        }
      ],
      
      // 扫码模式选择
      scanMode: 'normal',  // 扫码模式：normal | wechat
      
      // 测试功能
      showTestFeatures: true  // 开发环境显示测试功能
    }
  },
  onLoad() {
    this.initPage()
  },
  onShow() {
    this.loadDiningStatus()
    this.loadRecentRecords()
    this.loadQRCode()
    this.updateCurrentMealStatus()
  },
  computed: {
    // 判断是否可以扫码
    canScan() {
      // 使用TimeUtils获取当前时间，确保iOS兼容性
      const now = TimeUtils.getCurrentBeijingTime()
      const currentHour = now.getHours()
      
      // 检查是否在就餐时间内
      return (currentHour >= 6 && currentHour < 10) ||  // 早餐
             (currentHour >= 11 && currentHour < 14) || // 午餐
             (currentHour >= 17 && currentHour < 20)    // 晚餐
    }
  },
  methods: {
    // 初始化页面
    initPage() {
      this.loadDiningStatus()
      this.loadRecentRecords()
      this.loadQRCode()
    },

    // 选择二维码类型
    selectQRType(type) {
      this.selectedQRType = type
      this.loadQRCode()
    },

    // 选择扫码模式
    selectScanMode(mode) {
      this.scanMode = mode
    },

    // 获取当前二维码类型信息
    getCurrentQRType信息() {
      return this.qrTypes.find(type => type.value === this.selectedQRType) || this.qrTypes[0]
    },

    // 获取扫码模式图标
    getScanModeIcon() {
      return this.scanMode === 'wechat' ? '💬' : '📱'
    },

    // 获取扫码模式文本
    getScanModeText() {
      return this.scanMode === 'wechat' ? '微信扫码确认' : '点击开始扫码'
    },

    // 获取扫码模式提示
    getScanModeTip() {
      return this.scanMode === 'wechat' ? '使用微信扫描二维码' : '扫描餐厅主入口二维码'
    },

    // 加载二维码图片
    async loadQRCode() {
      try {
        this.isGeneratingQR = true
        
        let response
        const options = { width: 200, margin: 2 }
        
        switch (this.selectedQRType) {
          case 'normal':
            response = await api.qrScan.generateQRCodeImage('DINING_QR_MAIN_001', options)
            break
          case 'with-url':
            response = await api.qrScan.generateQRCodeWithURL('DINING_QR_MAIN_001', '', options)
            break
          case 'secure':
            response = await api.qrScan.generateSecureQRCode('DINING_QR_MAIN_001', '', options)
            break
          case 'wechat':
            response = await api.qrScan.generateWechatMiniProgramCode('DINING_QR_MAIN_001', options)
            break
          default:
            response = await api.qrScan.generateQRCodeImage('DINING_QR_MAIN_001', options)
        }
        
        if (response.success) {
          this.currentQRCodeImage = response.data.imageDataURL
          console.log(`加载${this.selectedQRType}二维码成功`)
        } else {
          console.error('获取二维码失败:', response.message)
          this.currentQRCodeImage = null
          
          // 根据错误类型显示不同的提示
          const errorMessage = this.get错误Message(response.message)
          uni.showModal({
            title: '二维码加载失败',
            content: errorMessage,
            show取消: true,
            cancelText: '重试',
            confirmText: '知道了',
            success: (res) => {
              if (res.cancel) {
                this.loadQRCode()
              }
            }
          })
        }
      } catch (error) {
        console.error('获取二维码失败:', error)
        this.currentQRCodeImage = null
        
        // 网络错误处理
        const errorMessage = this.getNetwork错误Message(error)
        uni.showModal({
          title: '网络连接失败',
          content: errorMessage,
          show取消: true,
          cancelText: '重试',
          confirmText: '知道了',
          success: (res) => {
            if (res.cancel) {
              this.loadQRCode()
            }
          }
        })
      } finally {
        this.isGeneratingQR = false
      }
    },

    // 预览二维码
    previewQRCode() {
      this.$refs.qrPreviewPopup.open()
    },

    // 下载二维码
    downloadQRCode() {
      if (!this.currentQRCodeImage) return
      
      try {
        const type信息 = this.getCurrentQRType信息()
        const filename = `${type信息.name}_${Date.now()}.png`
        qrCodeGenerator.downloadQRCode(this.currentQRCodeImage, filename)
        
        uni.showToast({
          title: '下载成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('下载失败:', error)
        uni.showToast({
          title: '下载失败',
          icon: 'none'
        })
      }
    },

    // 分享二维码
    shareQRCode() {
      if (!this.currentQRCodeImage) return
      
      uni.showActionSheet({
        itemList: ['保存到相册', '复制链接', '分享给朋友'],
        success: (res) => {
          switch (res.tapIndex) {
            case 0:
              this.saveToAlbum()
              break
            case 1:
              this.copyQRCodeLink()
              break
            case 2:
              this.shareToFriend()
              break
          }
        }
      })
    },

    // 保存到相册
    saveToAlbum() {
      uni.saveImageToPhotosAlbum({
        filePath: this.currentQRCodeImage,
        success: () => {
          uni.showToast({
            title: '保存成功',
            icon: 'success'
          })
        },
        fail: () => {
          uni.showToast({
            title: '保存失败',
            icon: 'none'
          })
        }
      })
    },

    // 复制二维码链接
    copyQRCodeLink() {
      uni.setClipboardData({
        data: 'DINING_QR_MAIN_001',
        success: () => {
          uni.showToast({
            title: '已复制到剪贴板',
            icon: 'success'
          })
        }
      })
    },

    // 分享给朋友
    shareToFriend() {
      uni.showToast({
        title: '分享功能开发中',
        icon: 'none'
      })
    },

    // 获取错误信息
    get错误Message(message) {
      const errorMap = {
        'QR_CODE_NOT_FOUND': '二维码不存在，请检查二维码标识是否正确',
        'QR_CODE_EXPIRED': '二维码已过期，请重新生成',
        'QR_CODE_DISABLED': '二维码已被禁用，请联系管理员',
        'INVALID_QR_TYPE': '无效的二维码类型，请选择正确的类型',
        'GENERATION_FAILED': '二维码生成失败，请稍后重试',
        'PERMISSION_DENIED': '权限不足，无法生成二维码',
        'SERVER_ERROR': '服务器错误，请稍后重试'
      }
      
      return errorMap[message] || `二维码加载失败：${message}`
    },

    // 获取网络错误信息
    getNetwork错误Message(error) {
      if (error.message && error.message.includes('timeout')) {
        return '网络请求超时，请检查网络连接后重试'
      } else if (error.message && error.message.includes('fail')) {
        return '网络连接失败，请检查网络设置'
      } else if (error.message && error.message.includes('401')) {
        return '登录已过期，请重新登录'
      } else if (error.message && error.message.includes('403')) {
        return '权限不足，无法访问此功能'
      } else if (error.message && error.message.includes('404')) {
        return '请求的资源不存在'
      } else if (error.message && error.message.includes('500')) {
        return '服务器内部错误，请稍后重试'
      } else {
        return `网络请求失败：${error.message || '未知错误'}`
      }
    },

    // 获取扫码错误信息
    getScan错误Message(error) {
      const errorMap = {
        'USER_NOT_REGISTERED': '您还未报餐，请先联系部门管理员报餐',
        'ALREADY_CONFIRMED': '您已经确认过就餐，无需重复确认',
        'MEAL_TIME_EXPIRED': '当前不在就餐时间内，无法确认就餐',
        'INVALID_QR_CODE': '无效的二维码，请扫描正确的餐厅二维码',
        'QR_CODE_EXPIRED': '二维码已过期，请重新生成',
        'PERMISSION_DENIED': '权限不足，无法确认就餐',
        'MEAL_NOT_AVAILABLE': '当前餐次不可用，请检查报餐状态',
        'SYSTEM_ERROR': '系统错误，请稍后重试'
      }
      
      // 检查是否是网络错误
      if (error.message && error.message.includes('timeout')) {
        return '网络请求超时，请检查网络连接后重试'
      } else if (error.message && error.message.includes('fail')) {
        return '网络连接失败，请检查网络设置'
      } else if (error.message && error.message.includes('401')) {
        return '登录已过期，请重新登录'
      } else if (error.message && error.message.includes('403')) {
        return '权限不足，无法确认就餐'
      } else if (error.message && error.message.includes('404')) {
        return '请求的资源不存在'
      } else if (error.message && error.message.includes('500')) {
        return '服务器内部错误，请稍后重试'
      }
      
      // 检查是否是业务错误
      for (const [key, message] of Object.entries(errorMap)) {
        if (error.message && error.message.includes(key)) {
          return message
        }
      }
      
      return `扫码确认失败：${error.message || '未知错误'}`
    },

    // 加载用户就餐确认状态
    async loadDiningStatus() {
      try {
        const response = await api.qrScan.getDiningStatus()
        
        if (response.success) {
          this.diningStatus = response.data
          console.log('加载就餐状态成功:', this.diningStatus)
        } else {
          console.error('获取就餐状态失败:', response.message)
          this.diningStatus = null
          
          // 只在首次加载失败时显示错误提示
          if (!this.diningStatus) {
            uni.showToast({
              title: '获取就餐状态失败',
              icon: 'none',
              duration: 2000
            })
          }
        }
      } catch (error) {
        console.error('获取就餐状态失败:', error)
        this.diningStatus = null
        
        // 只在首次加载失败时显示错误提示
        if (!this.diningStatus) {
          uni.showToast({
            title: '网络连接失败',
            icon: 'none',
            duration: 2000
          })
        }
      }
    },

    // 预览固定二维码
    previewFixedQRCode() {
      this.$refs.qrPreviewPopup.open()
    },

    // 关闭二维码预览
    closeQrPreview() {
      this.$refs.qrPreviewPopup.close()
    },

    // 获取餐次类型名称
    getMealTypeName(mealType) {
      const meal = this.mealTypes.find(m => m.type === mealType)
      return meal ? meal.name : mealType
    },

    // 测试扫码流程
    testScanProcess() {
      console.log('开始测试扫码流程')
      
      // 模拟扫描到固定二维码
      const testQRCode = 'DINING_QR_MAIN_001'
      
      uni.showModal({
        title: '测试扫码流程',
        content: `将模拟扫描二维码：${testQRCode}\n\n点击确定开始测试`,
        success: (res) => {
          if (res.confirm) {
            console.log('用户确认测试，开始模拟扫码')
            this.validateAndHandleScanResult(testQRCode)
          }
        }
      })
    },

    // 为系统管理员确认中餐（专门方法）
    confirmLunchFor管理员() {
      console.log('为系统管理员确认9月11日中餐')
      
      // 检查当前时间是否在午餐时间内，使用TimeUtils确保iOS兼容性
      const now = TimeUtils.getCurrentBeijingTime()
      const currentHour = now.getHours()
      
      if (currentHour >= 11 && currentHour < 14) {
        console.log('当前为午餐时间，可以确认就餐')
        
        uni.showModal({
          title: '确认系统管理员中餐',
          content: '将为系统管理员确认9月11日的中餐就餐\n\n点击确定开始确认',
          success: (res) => {
            if (res.confirm) {
              console.log('开始确认系统管理员中餐')
              // 直接调用确认就餐接口
              this.confirmDiningByScan('DINING_QR_MAIN_001')
            }
          }
        })
      } else {
        uni.showModal({
          title: '时间提醒',
          content: '当前不在午餐时间内(11:00-14:00)\n\n是否仍要继续确认？',
          success: (res) => {
            if (res.confirm) {
              console.log('用户确认在非午餐时间进行确认')
              this.confirmDiningByScan('DINING_QR_MAIN_001')
            }
          }
        })
      }
    },

    // 强制确认就餐（绕过时间限制）
    force确认Dining() {
      console.log('强制确认就餐，绕过时间限制')
      
      uni.showModal({
        title: '强制确认就餐',
        content: '将使用模拟时间强制确认就餐，绕过时间限制\n\n此功能仅用于测试和特殊情况',
        success: (res) => {
          if (res.confirm) {
            console.log('开始强制确认就餐')
            // 使用强制确认模式
            this.confirmDiningByScan('DINING_QR_MAIN_001', true)
          }
        }
      })
    },

    // 模拟实际扫码过程
    simulateRealScan() {
      console.log('开始模拟实际扫码过程')
      
      // 检查是否在扫码中
      if (this.isScanning) {
        uni.showToast({
          title: '正在扫码中，请稍候',
          icon: 'none'
        })
        return
      }
      
      // 检查是否在就餐时间内
      if (!this.canScan) {
        uni.showModal({
          title: '时间提醒',
          content: '当前不在就餐时间内(早餐:6:00-10:00, 午餐:11:00-14:00, 晚餐:17:00-20:00)\n\n是否仍要继续模拟扫码？',
          success: (res) => {
            if (res.confirm) {
              this.startSimulatedScan()
            }
          }
        })
        return
      }
      
      // 开始模拟扫码
      this.startSimulatedScan()
    },

    // 开始模拟扫码过程
    startSimulatedScan() {
      console.log('开始模拟扫码过程')
      
      this.isScanning = true
      
      // 显示扫码提示
      uni.showToast({
        title: '正在扫描二维码...',
        icon: 'none',
        duration: 1500
      })
      
      // 模拟扫码延迟（2-3秒）
      const scanDelay = 2000 + Math.random() * 1000
      
      setTimeout(() => {
        console.log('模拟扫码完成，获得二维码内容')
        
        // 模拟扫描到固定二维码
        const scannedQRCode = 'DINING_QR_MAIN_001'
        
        // 显示扫码成功提示
        uni.showToast({
          title: '扫码成功！',
          icon: 'success',
          duration: 1000
        })
        
        // 延迟一下再处理结果，让用户看到扫码成功
        setTimeout(() => {
          console.log('开始处理扫码结果:', scannedQRCode)
          // 使用强制确认模式处理扫码结果
          this.confirmDiningByScan(scannedQRCode, true)
        }, 500)
        
      }, scanDelay)
    },

    // 模拟扫描无效二维码
    simulateInvalidScan() {
      console.log('模拟扫描无效二维码')
      
      if (this.isScanning) {
        uni.showToast({
          title: '正在扫码中，请稍候',
          icon: 'none'
        })
        return
      }
      
      this.isScanning = true
      
      uni.showToast({
        title: '正在扫描二维码...',
        icon: 'none',
        duration: 1500
      })
      
      // 模拟扫码延迟
      const scanDelay = 2000 + Math.random() * 1000
      
      setTimeout(() => {
        console.log('模拟扫码完成，获得无效二维码内容')
        
        // 模拟扫描到无效二维码
        const invalidQRCode = 'INVALID_QR_CODE_123'
        
        uni.showToast({
          title: '扫码完成',
          icon: 'none',
          duration: 1000
        })
        
        setTimeout(() => {
          console.log('开始处理无效扫码结果:', invalidQRCode)
          this.validateAndHandleScanResult(invalidQRCode)
        }, 500)
        
      }, scanDelay)
    },

    // 加载最近扫码记录
    async loadRecentRecords() {
      try {
        const response = await api.qrScan.getHistory({
          limit: 5,
          offset: 0
        })
        
        if (response.success) {
          this.recentRecords = response.data || []
        } else {
          console.error('获取最近记录失败:', response.message)
        }
      } catch (error) {
        console.error('获取最近记录失败:', error)
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
        title: '请扫描餐厅主入口二维码',
        icon: 'none',
        duration: 1500
      })
      
      // 调用扫码功能
      uni.scanCode({
        success: (res) => {
          console.log('扫码成功，二维码内容:', res.result)
          // 验证扫码结果并处理
          this.validateAndHandleScanResult(res.result)
        },
        fail: (error) => {
          console.error('扫码失败:', error)
          this.isScanning = false
          
          if (error.errMsg && error.errMsg.includes('cancel')) {
            // 用户取消扫码，不显示错误
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

    // 验证并处理扫码结果
    validateAndHandleScanResult(qrCodeString) {
      console.log('验证扫码结果:', qrCodeString)
      
      // 验证二维码内容是否为有效的就餐二维码
      if (qrCodeString === 'DINING_QR_MAIN_001') {
        console.log('二维码验证通过，开始确认就餐')
        // 调用确认就餐接口
        this.confirmDiningByScan(qrCodeString)
      } else {
        console.log('无效的二维码:', qrCodeString)
        this.isScanning = false
        
        uni.showModal({
          title: '二维码无效',
          content: `扫描的二维码内容为：${qrCodeString}\n\n请扫描正确的餐厅主入口二维码`,
          show取消: false,
          confirmText: '知道了'
        })
      }
    },

    // 扫码确认就餐
    async confirmDiningByScan(qrCodeString, force确认 = false) {
      try {
        // 使用TimeUtils获取当前时间，确保iOS兼容性
        let scanTime = TimeUtils.getCurrentTimestamp()
        
        // 如果强制确认，使用就餐时间内的模拟时间
        if (force确认) {
          const now = TimeUtils.getCurrentBeijingTime()
          const currentHour = now.getHours()
          
          // 根据当前时间选择合适的时间段
          if (currentHour < 6) {
            // 凌晨，使用早餐时间
            scanTime = TimeUtils.toUTCForSubmit(`${TimeUtils.getCurrentDate()} 08:30:00`)
          } else if (currentHour < 11) {
            // 上午，使用早餐时间
            scanTime = TimeUtils.toUTCForSubmit(`${TimeUtils.getCurrentDate()} 08:30:00`)
          } else if (currentHour < 17) {
            // 下午，使用午餐时间
            scanTime = TimeUtils.toUTCForSubmit(`${TimeUtils.getCurrentDate()} 12:30:00`)
          } else {
            // 晚上，使用晚餐时间
            scanTime = TimeUtils.toUTCForSubmit(`${TimeUtils.getCurrentDate()} 18:30:00`)
          }
          
          console.log('强制确认模式，使用模拟时间:', scanTime)
        }
        
        // 显示处理中状态
        uni.showLoading({
          title: '确认就餐中...',
          mask: true
        })
        
        console.log('调用扫码确认接口:', { qrCode: qrCodeString, scanTime, force确认, scanMode: this.scanMode })
        
        // 根据扫码模式调用不同的接口
        let response
        if (this.scanMode === 'wechat') {
          response = await api.qrScan.wechatScan(qrCodeString, scanTime)
        } else {
          response = await api.qrScan.scan(qrCodeString, scanTime)
        }
        
        uni.hideLoading()
        
        this.scanResult = {
          success: response.success,
          message: response.message,
          data: response.data
        }
        
        // 显示结果弹窗
        this.$refs.resultPopup.open()
        
        // 刷新数据
        await this.loadDiningStatus()
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
        
        // 根据错误类型显示不同的错误信息
        const errorMessage = this.getScan错误Message(error)
        
        this.scanResult = {
          success: false,
          message: errorMessage,
          data: null
        }
        
        this.$refs.resultPopup.open()
        
        // 显示错误提示
        uni.showToast({
          title: '扫码确认失败',
          icon: 'none',
          duration: 2000
        })
      } finally {
        this.isScanning = false
      }
    },

    // 处理扫码结果
    async handleScanResult(qrCode = 'DINING_QR_MAIN_001') {
      try {
        // 使用TimeUtils获取当前时间，确保iOS兼容性
        const scanTime = TimeUtils.getCurrentTimestamp()
        
        // 显示处理中状态
        uni.showLoading({
          title: '处理中...',
          mask: true
        })
        
        // 使用固定二维码进行扫码确认
        const response = await api.qrScan.scan(qrCode, scanTime)
        
        uni.hideLoading()
        
        this.scanResult = {
          success: response.success,
          message: response.message,
          data: response.data
        }
        
        // 显示结果弹窗
        this.$refs.resultPopup.open()
        
        // 刷新数据
        await this.loadDiningStatus()
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
        console.error('处理扫码结果失败:', error)
        uni.hideLoading()
        
        this.scanResult = {
          success: false,
          message: '网络请求失败，请检查网络连接',
          data: null
        }
        
        this.$refs.resultPopup.open()
        
        uni.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        })
      } finally {
        this.isScanning = false
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

    // 格式化时间
    formatTime(timeStr) {
      if (!timeStr) return '--'
      
      try {
        // 使用统一的 TimeUtils 工具类，确保UTC时间正确转换为北京时间
        return TimeUtils.formatUTCTime(timeStr, 'datetime')
      } catch (error) {
        console.error('时间格式化失败:', error, '原始时间:', timeStr)
        return '--'
      }
    },

    // 格式化扫码时间
    formatScanTime(timeStr) {
      if (!timeStr) return '--'
      
      try {
        return TimeUtils.formatScanTime(timeStr)
      } catch (error) {
        console.error('扫码时间格式化失败:', error, '原始时间:', timeStr)
        return '--'
      }
    },

    // 查看历史
    goToHistory() {
      uni.navigateTo({
        url: '/pages/dining/qr-scan-history'
      })
    },

    // 更新当前时间状态
    updateCurrentMealStatus() {
      // 使用TimeUtils获取当前北京时间
      const now = TimeUtils.getCurrentBeijingTime()
      const currentHour = now.getHours()
      
      if (currentHour >= 6 && currentHour < 10) {
        this.currentMealStatus = '当前为早餐时间，可以扫码就餐'
        this.currentMealType = 'breakfast'
      } else if (currentHour >= 11 && currentHour < 14) {
        this.currentMealStatus = '当前为午餐时间，可以扫码就餐'
        this.currentMealType = 'lunch'
      } else if (currentHour >= 17 && currentHour < 20) {
        this.currentMealStatus = '当前为晚餐时间，可以扫码就餐'
        this.currentMealType = 'dinner'
      } else {
        this.currentMealStatus = '当前不在就餐时间内，无法扫码'
        this.currentMealType = null
      }
    },

    // 判断是否为当前餐次时间
    isCurrentMealTime(mealType) {
      // 使用TimeUtils获取当前北京时间
      const now = TimeUtils.getCurrentBeijingTime()
      const currentHour = now.getHours()
      
      switch (mealType) {
        case 'breakfast':
          return currentHour >= 6 && currentHour < 10
        case 'lunch':
          return currentHour >= 11 && currentHour < 14
        case 'dinner':
          return currentHour >= 17 && currentHour < 20
        default:
          return false
      }
    },

    // 获取餐次时间范围
    getMealTimeRange(mealType) {
      return this.mealTimeRanges[mealType] || ''
    },

    // 显示餐次详情
    showMealDetail(mealType) {
      const meal = this.mealTypes.find(m => m.type === mealType)
      const mealData = this.diningStatus?.meal确认ationStatus[mealType]
      
      let message = `${meal.name} (${this.getMealTimeRange(mealType)})\n\n`
      
      if (mealData?.isRegistered) {
        message += '✅ 已报餐\n'
      } else {
        message += '❌ 未报餐\n'
      }
      
      if (mealData?.diningStatus === 'dined') {
        message += '✅ 已确认就餐\n'
        if (mealData.actualDiningTime) {
          // 使用TimeUtils格式化时间，确保iOS兼容性
          const diningTime = TimeUtils.formatDiningTime(mealData.actualDiningTime)
          message += `确认时间: ${diningTime}\n`
        }
        if (mealData.confirmationType) {
          message += `确认方式: ${mealData.confirmationType === 'qr' ? '扫码确认' : '其他方式'}\n`
        }
      } else {
        message += '❌ 未确认就餐\n'
      }
      
      uni.showModal({
        title: `${meal.name}详情`,
        content: message,
        show取消: false,
        confirmText: '知道了'
      })
    }
  }
}
</script>

<style scoped>
.qr-scan-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding: 20rpx;
  background: white;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.page-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.help-btn {
  padding: 10rpx 20rpx;
  background: #f0f0f0;
  border-radius: 20rpx;
  font-size: 28rpx;
}

/* 二维码展示区域样式 */
.qr-display-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.qr-section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  flex-wrap: wrap;
  gap: 10rpx;
}

.qr-section-title text:first-child {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.qr-type-selector {
  display: flex;
  gap: 8rpx;
  flex-wrap: wrap;
}

.qr-type-btn {
  padding: 8rpx 16rpx;
  background: #f0f0f0;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
  transition: all 0.3s ease;
}

.qr-type-btn.active {
  background: #2196F3;
  color: white;
}

.qr-type-btn:active {
  transform: scale(0.95);
}

.qr-container {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.qr-info {
  flex: 1;
}

.qr-name {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.qr-location, .qr-id, .qr-purpose, .qr-description {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 5rpx;
}

.qr-description {
  font-style: italic;
  color: #999;
}

.qr-image-container {
  width: 200rpx;
  height: 200rpx;
}

.qr-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 8rpx;
  border: 1rpx solid #ddd;
  cursor: pointer;
  transition: all 0.3s ease;
}

.qr-image:active {
  transform: scale(0.95);
  border-color: #2196F3;
}

.qr-actions {
  display: flex;
  gap: 15rpx;
  margin-top: 20rpx;
  justify-content: center;
}

.action-btn {
  flex: 1;
  padding: 15rpx 20rpx;
  border-radius: 8rpx;
  font-size: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: all 0.3s ease;
}

.preview-btn {
  background: #2196F3;
  color: white;
}

.download-btn {
  background: #4CAF50;
  color: white;
}

.share-btn {
  background: #FF9800;
  color: white;
}

.action-btn:active {
  transform: scale(0.95);
}

/* 就餐状态卡片样式 */
.dining-status-card {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.status-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.status-title text:first-child {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.status-date {
  font-size: 26rpx;
  color: #666;
}

.meal-status-grid {
  display: flex;
  justify-content: space-between;
}

.meal-status-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 12rpx;
  background: #f8f9fa;
  margin: 0 5rpx;
}

.meal-status-item.registered {
  background: #fff3e0;
}

.meal-status-item.confirmed {
  background: #e8f5e8;
}

.meal-status-item.current {
  border: 2rpx solid #2196F3;
  box-shadow: 0 0 10rpx rgba(33, 150, 243, 0.3);
}

.meal-status-item:active {
  transform: scale(0.98);
}

.status-dot.confirmed {
  background: #4CAF50;
}

.overview-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.overview-title text:first-child {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.overview-actions {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.overview-date {
  font-size: 26rpx;
  color: #666;
}

.refresh-btn {
  font-size: 28rpx;
  color: #2196F3;
  padding: 5rpx;
}

.overview-grid {
  display: flex;
  justify-content: space-between;
}

.overview-item {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 12rpx;
  background: #f8f9fa;
  margin: 0 5rpx;
}

.overview-item.ordered {
  background: #fff3e0;
}

.overview-item.registered {
  background: #e8f5e8;
}

.overview-item.current {
  border: 2rpx solid #2196F3;
  box-shadow: 0 0 10rpx rgba(33, 150, 243, 0.3);
}

.overview-item:active {
  transform: scale(0.98);
}

.meal-name {
  font-size: 28rpx;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.status-indicators {
  display: flex;
  justify-content: center;
  gap: 8rpx;
}

.status-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
}

.status-dot.ordered {
  background: #FF9800;
}

.status-dot.registered {
  background: #4CAF50;
}

.meal-times {
  margin-top: 8rpx;
}

.time-text {
  font-size: 22rpx;
  color: #999;
}

.current-time-status {
  margin-top: 20rpx;
  padding: 15rpx;
  background: #f0f8ff;
  border-radius: 8rpx;
  border-left: 4rpx solid #2196F3;
}

.status-text {
  font-size: 26rpx;
  color: #2196F3;
}

.scan-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.scan-title {
  text-align: center;
  margin-bottom: 30rpx;
}

.scan-title text:first-child {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.scan-subtitle {
  font-size: 24rpx;
  color: #666;
}

/* 扫码模式选择器样式 */
.scan-mode-selector {
  display: flex;
  gap: 15rpx;
  margin-bottom: 30rpx;
}

.mode-option {
  flex: 1;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 2rpx solid transparent;
  text-align: center;
  transition: all 0.3s ease;
}

.mode-option.active {
  background: #e3f2fd;
  border-color: #2196F3;
}

.mode-option:active {
  transform: scale(0.98);
}

.mode-icon {
  font-size: 40rpx;
  display: block;
  margin-bottom: 10rpx;
}

.mode-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 8rpx;
}

.mode-desc {
  font-size: 22rpx;
  color: #666;
  display: block;
}

.scan-area {
  text-align: center;
  padding: 60rpx 30rpx;
  border: 2rpx dashed #ddd;
  border-radius: 16rpx;
  margin-bottom: 30rpx;
  position: relative;
  transition: all 0.3s ease;
}

.scan-area.scanning {
  border-color: #2196F3;
  background: #f0f8ff;
}

.scan-area:active {
  transform: scale(0.98);
}

.scan-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
  transition: all 0.3s ease;
}

.scan-icon.scanning {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.scan-text {
  font-size: 32rpx;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.scan-tip {
  font-size: 24rpx;
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
  left: 10%;
  right: 10%;
  height: 2rpx;
  background: linear-gradient(90deg, transparent, #2196F3, transparent);
  animation: scanMove 2s infinite;
}

@keyframes scanMove {
  0% { top: 20%; }
  100% { top: 80%; }
}

.scan-actions {
  display: flex;
  gap: 20rpx;
}

.scan-btn {
  flex: 1;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: all 0.3s ease;
}

.scan-btn:disabled {
  background: #ccc;
}

.scan-btn:not(:disabled):active {
  transform: scale(0.98);
}


.btn-icon {
  font-size: 24rpx;
}

/* 测试功能样式 */
.test-section {
  margin-top: 30rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 1rpx dashed #ddd;
}

.test-title {
  margin-bottom: 15rpx;
}

.test-title text {
  font-size: 26rpx;
  color: #666;
  font-weight: bold;
}

.test-btn {
  width: 100%;
  background: #FF9800;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: all 0.3s ease;
}

.test-btn:disabled {
  background: #ccc;
}

.test-btn:not(:disabled):active {
  transform: scale(0.98);
}

.admin-confirm-btn {
  width: 100%;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: all 0.3s ease;
  margin-top: 15rpx;
}

.admin-confirm-btn:disabled {
  background: #ccc;
}

.admin-confirm-btn:not(:disabled):active {
  transform: scale(0.98);
}

.simulate-scan-btn {
  width: 100%;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: all 0.3s ease;
  margin-top: 15rpx;
}

.simulate-scan-btn:disabled {
  background: #ccc;
}

.simulate-scan-btn:not(:disabled):active {
  transform: scale(0.98);
}

.simulate-invalid-btn {
  width: 100%;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: all 0.3s ease;
  margin-top: 15rpx;
}

.simulate-invalid-btn:disabled {
  background: #ccc;
}

.simulate-invalid-btn:not(:disabled):active {
  transform: scale(0.98);
}

.force-confirm-btn {
  width: 100%;
  background: #9C27B0;
  color: white;
  border: none;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  transition: all 0.3s ease;
  margin-top: 15rpx;
}

.force-confirm-btn:disabled {
  background: #ccc;
}

.force-confirm-btn:not(:disabled):active {
  transform: scale(0.98);
}

.scan-tips {
  margin-top: 30rpx;
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 15rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
}

.tip-icon {
  font-size: 24rpx;
}

.tip-text {
  font-size: 24rpx;
  color: #666;
}

.recent-records {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.records-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.records-title text:first-child {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.view-all {
  font-size: 26rpx;
  color: #2196F3;
}

.records-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
}

.record-info {
  display: flex;
  flex-direction: column;
}

.meal-type {
  font-size: 28rpx;
  color: #333;
  margin-bottom: 8rpx;
}

.scan-time {
  font-size: 24rpx;
  color: #666;
}

.record-status {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24rpx;
}

.record-status.success {
  background: #4CAF50;
}

/* 二维码展示区域样式 */
.qr-display-section {
  background: white;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
}

.qr-display-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.qr-display-title text:first-child {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.refresh-btn {
  font-size: 28rpx;
  color: #2196F3;
  padding: 10rpx;
}

.qr-codes-grid {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.qr-code-item {
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  border: 1rpx solid #e0e0e0;
  transition: all 0.3s ease;
}

.qr-code-item:active {
  background: #e3f2fd;
  border-color: #2196F3;
}

.qr-code-info {
  margin-bottom: 10rpx;
}

.qr-name {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  display: block;
  margin-bottom: 5rpx;
}

.qr-location {
  font-size: 24rpx;
  color: #666;
  display: block;
}

.qr-code-preview {
  padding: 15rpx;
  background: white;
  border-radius: 8rpx;
  border: 1rpx solid #ddd;
}

.qr-code-text {
  font-size: 22rpx;
  color: #333;
  font-family: monospace;
  word-break: break-all;
}

/* 二维码图片样式 */
.qr-code-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 8rpx;
  border: 1rpx solid #ddd;
  cursor: pointer;
  transition: all 0.3s ease;
}

.qr-code-image:active {
  transform: scale(0.95);
  border-color: #2196F3;
}

.qr-loading {
  width: 200rpx;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 8rpx;
  border: 1rpx solid #ddd;
}

.loading-text {
  font-size: 24rpx;
  color: #666;
}

.qr-error {
  width: 200rpx;
  height: 200rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff3e0;
  border-radius: 8rpx;
  border: 1rpx dashed #ff9800;
  cursor: pointer;
  transition: all 0.3s ease;
}

.qr-error:active {
  background: #ffe0b2;
}

.error-text {
  font-size: 22rpx;
  color: #ff9800;
  text-align: center;
}

/* 弹窗样式 */
.help-popup,
.result-popup,
.qr-preview-popup,
.qr-detail-popup {
  width: 600rpx;
  background: white;
  border-radius: 16rpx;
  overflow: hidden;
}


.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.close-btn {
  font-size: 40rpx;
  color: #666;
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.popup-content {
  padding: 30rpx;
}

.qr-input {
  width: 100%;
  padding: 20rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
  margin-bottom: 10rpx;
}

.input-tip {
  font-size: 24rpx;
  color: #666;
}

.help-section {
  margin-bottom: 20rpx;
}

.help-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.help-text {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

/* 二维码详情弹窗样式 */
.qr-detail-section {
  margin-bottom: 20rpx;
}

.detail-label {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.detail-value {
  font-size: 28rpx;
  color: #333;
  display: block;
  word-break: break-all;
}

.qr-code-content {
  font-family: monospace;
  background: #f5f5f5;
  padding: 10rpx;
  border-radius: 6rpx;
  font-size: 24rpx;
}

.popup-actions {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1rpx solid #eee;
}

.cancel-btn {
  flex: 1;
  padding: 20rpx;
  background: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.confirm-btn {
  flex: 1;
  padding: 20rpx;
  background: #2196F3;
  color: white;
  border: none;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.share-btn {
  background: #FF9800;
  color: white;
}

.result-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
  margin: 0 auto 20rpx;
}

.result-icon.success {
  background: #4CAF50;
  color: white;
}

.result-icon.error {
  background: #f44336;
  color: white;
}

.result-content {
  text-align: center;
  margin-bottom: 20rpx;
}

.result-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.result-message {
  font-size: 26rpx;
  color: #666;
}

.result-details {
  margin-top: 20rpx;
  text-align: left;
}

.detail-item {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

/* 二维码预览弹窗样式 */
.qr-preview-info {
  text-align: center;
  margin-bottom: 20rpx;
}

.qr-preview-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.qr-preview-location, .qr-preview-type {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 5rpx;
}

.qr-preview-image {
  text-align: center;
  margin-bottom: 20rpx;
}

.large-qr-image {
  width: 300rpx;
  height: 300rpx;
  border-radius: 12rpx;
  border: 2rpx solid #ddd;
}

.qr-loading-large {
  width: 300rpx;
  height: 300rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 12rpx;
  border: 2rpx solid #ddd;
  margin: 0 auto;
}

.qr-preview-details {
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
}

.detail-label {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 8rpx;
}

.detail-value {
  font-size: 22rpx;
  color: #333;
  font-family: monospace;
  word-break: break-all;
  background: white;
  padding: 10rpx;
  border-radius: 4rpx;
  border: 1rpx solid #ddd;
}

.download-btn {
  background: #4CAF50;
  color: white;
}
</style>
