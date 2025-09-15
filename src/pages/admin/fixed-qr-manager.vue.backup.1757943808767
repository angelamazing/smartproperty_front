<template>
  <view class="fixed-qr-manager">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">固定二维码管理</text>
      <text class="page-subtitle">生成固定就餐确认二维码，所有人扫码后自动确认就餐</text>
    </view>

    <!-- 二维码信息卡片 -->
    <view class="qr-info-card">
      <view class="card-header">
        <text class="card-title">固定就餐确认二维码</text>
        <view class="status-badge" :class="qrStatusClass">
          <text>{{ qrStatusText }}</text>
        </view>
      </view>
      
      <view class="card-content">
        <text class="info-text">• 所有人扫码后都能进行就餐确认</text>
        <text class="info-text">• 自动根据扫码时间判断餐次（早中晚）</text>
        <text class="info-text">• 未登录用户扫码后先跳转登录页面</text>
        <text class="info-text">• 二维码24小时自动过期，需重新生成</text>
      </view>
    </view>

    <!-- 当前二维码显示 -->
    <view class="current-qr-section" v-if="currentQRCode">
      <view class="section-header">
        <text class="section-title">当前二维码</text>
        <text class="qr-age" v-if="currentQRCode.timestamp">
          生成时间: {{ formatTime(currentQRCode.timestamp) }}
        </text>
      </view>
      
      <view class="qr-display">
        <view class="qr-image-container">
          <!-- 显示二维码内容 -->
          <view v-if="currentQRCode.fallback || currentQRCode.platform === 'wechat_miniprogram'" class="qr-content-display">
            <text class="qr-content-text">{{ currentQRCode.content }}</text>
            <text class="qr-content-desc">二维码内容（微信扫码时使用）</text>
          </view>
          <!-- 否则显示图片（只有当qrCodeImage是有效的图片路径时才显示） -->
          <image 
            v-else-if="isValidImagePath(currentQRCode.qrCodeImage)"
            :src="currentQRCode.qrCodeImage" 
            mode="aspectFit"
            class="qr-image"
            @click="previewQRCode"
          />
          <!-- 如果qrCodeImage不是有效图片路径，也显示内容 -->
          <view v-else class="qr-content-display">
            <text class="qr-content-text">{{ currentQRCode.content }}</text>
            <text class="qr-content-desc">二维码内容（微信扫码时使用）</text>
          </view>
        </view>
        
        <view class="qr-details">
          <text class="qr-id">二维码ID: {{ currentQRCode.qrCodeId }}</text>
          <text class="qr-content">内容: {{ currentQRCode.content }}</text>
          <text class="qr-type">类型: {{ getQRTypeName(currentQRCode.type) }}</text>
          <text class="qr-platform">平台: {{ currentQRCode.platform || 'web' }}</text>
        </view>
      </view>
      
      <!-- 操作按钮 -->
      <view class="qr-actions">
        <button class="action-btn preview-btn" @click="previewQRCode">
          <text class="btn-icon">👁️</text>
          <text>预览</text>
        </button>
        <button class="action-btn download-btn" @click="downloadQRCode">
          <text class="btn-icon">⬇️</text>
          <text>下载</text>
        </button>
        <button class="action-btn print-btn" @click="printQRCode">
          <text class="btn-icon">🖨️</text>
          <text>打印</text>
        </button>
        <button class="action-btn refresh-btn" @click="generateNewQRCode">
          <text class="btn-icon">🔄</text>
          <text>重新生成</text>
        </button>
      </view>
    </view>

    <!-- 生成新二维码 -->
    <view class="generate-section" v-if="!currentQRCode">
      <view class="section-header">
        <text class="section-title">生成固定二维码</text>
      </view>
      
      <view class="generate-options">
        <view class="option-item">
          <text class="option-label">二维码尺寸</text>
          <slider 
            :value="qrSize" 
            @change="onSizeChange"
            min="300" 
            max="600" 
            step="50"
            activeColor="#2196f3"
          />
          <text class="option-value">{{ qrSize }}px</text>
        </view>
        
        <view class="option-item">
          <text class="option-label">边距</text>
          <slider 
            :value="margin" 
            @change="onMarginChange"
            min="1" 
            max="5" 
            step="1"
            activeColor="#2196f3"
          />
          <text class="option-value">{{ margin }}px</text>
        </view>
      </view>
      
      <button 
        class="generate-btn" 
        @click="generateNewQRCode"
        :disabled="isGenerating"
      >
        <text class="btn-icon">{{ isGenerating ? '⏳' : '🎯' }}</text>
        <text>{{ isGenerating ? '生成中...' : '生成固定二维码' }}</text>
      </button>
      
      <button 
        class="test-btn" 
        @click="testQRCode"
        :disabled="!currentQRCode"
      >
        <text class="btn-icon">🧪</text>
        <text>测试扫码</text>
      </button>
    </view>

    <!-- 使用说明 -->
    <view class="usage-section">
      <view class="section-header">
        <text class="section-title">使用说明</text>
      </view>
      
      <view class="usage-steps">
        <view class="step-item">
          <view class="step-number">1</view>
          <view class="step-content">
            <text class="step-title">生成二维码</text>
            <text class="step-desc">点击"生成固定二维码"按钮，系统会生成一个固定的二维码</text>
          </view>
        </view>
        
        <view class="step-item">
          <view class="step-number">2</view>
          <view class="step-content">
            <text class="step-title">打印张贴</text>
            <text class="step-desc">将二维码打印出来，张贴在餐厅入口显眼位置</text>
          </view>
        </view>
        
        <view class="step-item">
          <view class="step-number">3</view>
          <view class="step-content">
            <text class="step-title">用户扫码</text>
            <text class="step-desc">用户使用微信扫描二维码，系统自动判断餐次并确认就餐</text>
          </view>
        </view>
        
        <view class="step-item">
          <view class="step-number">4</view>
          <view class="step-content">
            <text class="step-title">定期更新</text>
            <text class="step-desc">二维码24小时过期，需要定期重新生成并更新</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 预览弹窗 -->
    <uni-popup ref="previewPopup" type="center">
      <view class="preview-popup">
        <view class="popup-header">
          <text class="popup-title">二维码预览</text>
          <button class="close-btn" @click="closePreview">✕</button>
        </view>
        <view class="popup-content">
          <image 
            v-if="currentQRCode" 
            :src="currentQRCode.qrCodeImage" 
            mode="aspectFit"
            class="preview-image"
          />
          <text class="preview-tip">建议打印尺寸: A4纸张，二维码居中</text>
        </view>
        <view class="popup-footer">
          <button class="action-btn" @click="downloadQRCode">下载</button>
          <button class="action-btn" @click="printQRCode">打印</button>
        </view>
      </view>
    </uni-popup>

    <!-- 加载提示 -->
    <view class="loading-mask" v-if="isGenerating">
      <view class="loading-content">
        <view class="loading-spinner"></view>
        <text class="loading-text">正在生成二维码...</text>
      </view>
    </view>
  </view>
</template>

<script>
import fixedQRGenerator from '@/utils/fixedQRGenerator.js'

export default {
  name: 'FixedQRManager',
  data() {
    return {
      // 当前二维码
      currentQRCode: null,
      
      // 生成参数
      qrSize: 400,
      margin: 2,
      
      // 生成状态
      isGenerating: false
    }
  },
  
  computed: {
    qrStatusClass() {
      if (!this.currentQRCode) return 'inactive'
      
      const age = Date.now() - this.currentQRCode.timestamp
      const maxAge = 24 * 60 * 60 * 1000 // 24小时
      
      if (age > maxAge) return 'expired'
      if (age > maxAge * 0.8) return 'warning'
      return 'active'
    },
    
    qrStatusText() {
      if (!this.currentQRCode) return '未生成'
      
      const age = Date.now() - this.currentQRCode.timestamp
      const maxAge = 24 * 60 * 60 * 1000 // 24小时
      
      if (age > maxAge) return '已过期'
      if (age > maxAge * 0.8) return '即将过期'
      return '正常'
    }
  },
  
  onLoad() {
    this.loadCurrentQRCode()
  },
  
  methods: {
    // 加载当前二维码
    loadCurrentQRCode() {
      try {
        const savedQR = uni.getStorageSync('fixed_qr_code')
        if (savedQR) {
          this.currentQRCode = savedQR
        }
      } catch (error) {
        console.error('加载当前二维码失败:', error)
      }
    },
    
    // 保存当前二维码
    saveCurrentQRCode() {
      try {
        uni.setStorageSync('fixed_qr_code', this.currentQRCode)
      } catch (error) {
        console.error('保存当前二维码失败:', error)
      }
    },
    
    // 尺寸变化
    onSizeChange(e) {
      this.qrSize = e.detail.value
    },
    
    // 边距变化
    onMarginChange(e) {
      this.margin = e.detail.value
    },
    
    // 生成新二维码
    async generateNewQRCode() {
      try {
        this.isGenerating = true
        
        // 使用固定二维码生成器
        const result = await fixedQRGenerator.generateFixedDiningQRCode({
          width: this.qrSize,
          margin: this.margin
        })
        
        if (result.success) {
          this.currentQRCode = result.data
          this.saveCurrentQRCode()
          
          uni.showToast({
            title: '二维码生成成功',
            icon: 'success'
          })
        } else {
          throw new Error(result.message)
        }
        
      } catch (error) {
        console.error('生成二维码失败:', error)
        uni.showToast({
          title: '生成失败: ' + error.message,
          icon: 'none',
          duration: 3000
        })
      } finally {
        this.isGenerating = false
      }
    },
    
    // 预览二维码
    previewQRCode() {
      this.$refs.previewPopup.open()
    },
    
    // 关闭预览
    closePreview() {
      this.$refs.previewPopup.close()
    },
    
    // 下载二维码
    downloadQRCode() {
      if (!this.currentQRCode) return
      
      try {
        const filename = `fixed_dining_qr_${Date.now()}.png`
        
        // 创建下载链接
        const link = document.createElement('a')
        link.download = filename
        link.href = this.currentQRCode.qrCodeImage
        
        // 触发下载
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
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
    
    // 打印二维码
    printQRCode() {
      if (!this.currentQRCode) return
      
      try {
        // 创建打印窗口
        const printWindow = window.open('', '_blank')
        printWindow.document.write(`
          <html>
            <head>
              <title>固定就餐确认二维码</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 20px; 
                  text-align: center; 
                  font-family: Arial, sans-serif;
                }
                .qr-container {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                }
                .qr-image {
                  max-width: 400px;
                  max-height: 400px;
                  border: 2px solid #000;
                }
                .qr-title {
                  font-size: 24px;
                  font-weight: bold;
                  margin-bottom: 20px;
                }
                .qr-info {
                  font-size: 14px;
                  color: #666;
                  margin-top: 20px;
                }
              </style>
            </head>
            <body>
              <div class="qr-container">
                <div class="qr-title">固定就餐确认二维码</div>
                <img src="${this.currentQRCode.qrCodeImage}" class="qr-image" />
                <div class="qr-info">
                  <p>扫码确认就餐 | 自动判断餐次</p>
                  <p>生成时间: ${this.formatTime(this.currentQRCode.timestamp)}</p>
                </div>
              </div>
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
        
        uni.showToast({
          title: '打印窗口已打开',
          icon: 'success'
        })
      } catch (error) {
        console.error('打印失败:', error)
        uni.showToast({
          title: '打印失败',
          icon: 'none'
        })
      }
    },
    
    // 获取二维码类型名称
    getQRTypeName(type) {
      const typeNames = {
        'fixed_dining_confirm': '固定就餐确认二维码'
      }
      return typeNames[type] || type
    },
    
    // 格式化时间
    formatTime(timestamp) {
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN')
    },

    // 测试二维码扫码
    async testQRCode() {
      if (!this.currentQRCode) return
      
      try {
        uni.showLoading({
          title: '测试中...',
          mask: true
        })
        
        // 模拟用户信息
        const mockUserInfo = {
          openId: 'test_openid_' + Date.now(),
          nickName: '测试用户',
          avatarUrl: '/static/default-avatar.png'
        }
        
        // 模拟扫码处理
        const now = new Date()
        const hour = now.getHours()
        
        let mealType = 'unknown'
        let mealName = '未知餐次'
        
        if (hour >= 6 && hour < 10) {
          mealType = 'breakfast'
          mealName = '早餐'
        } else if (hour >= 11 && hour < 14) {
          mealType = 'lunch'
          mealName = '午餐'
        } else if (hour >= 17 && hour < 20) {
          mealType = 'dinner'
          mealName = '晚餐'
        }
        
        const canScan = mealType !== 'unknown'
        
        uni.hideLoading()
        
        // 显示测试结果
        uni.showModal({
          title: canScan ? '测试成功' : '测试失败',
          content: canScan ? 
            `${mealName}确认成功！\n\n当前时间: ${now.toLocaleString()}\n餐次: ${mealName}\n用户: ${mockUserInfo.nickName}` :
            `当前时间 ${hour}:${now.getMinutes().toString().padStart(2, '0')} 不在就餐时间内\n\n就餐时间：\n早餐 06:00-10:00\n午餐 11:00-14:00\n晚餐 17:00-20:00`,
          showCancel: false,
          confirmText: '知道了'
        })
        
        console.log('测试结果:', { canScan, mealType, mealName, userInfo: mockUserInfo })
        
      } catch (error) {
        console.error('测试失败:', error)
        uni.hideLoading()
        
        uni.showModal({
          title: '测试失败',
          content: '测试过程中发生错误: ' + error.message,
          showCancel: false,
          confirmText: '知道了'
        })
      }
    },

    // 二维码生成成功回调
    onQRCodeSuccess() {
      console.log('二维码生成成功')
    },

    // 二维码生成失败回调
    onQRCodeError(error) {
      console.error('二维码生成失败:', error)
      uni.showToast({
        title: '二维码生成失败',
        icon: 'none',
        duration: 2000
      })
    },

    // 验证是否为有效的图片路径
    isValidImagePath(path) {
      if (!path) return false
      
      // 检查是否为有效的图片路径
      const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
      const isDataURL = path.startsWith('data:image/')
      const isHttpURL = path.startsWith('http://') || path.startsWith('https://')
      const isLocalPath = path.startsWith('/') && imageExtensions.some(ext => path.toLowerCase().includes(ext))
      
      return isDataURL || isHttpURL || isLocalPath
    }
  }
}
</script>

<style scoped>
.fixed-qr-manager {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10px;
}

.page-subtitle {
  font-size: 14px;
  color: #666;
  display: block;
}

.qr-info-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.status-badge.active {
  background: #e8f5e8;
  color: #4caf50;
}

.status-badge.warning {
  background: #fff3e0;
  color: #ff9800;
}

.status-badge.expired {
  background: #ffebee;
  color: #f44336;
}

.status-badge.inactive {
  background: #f5f5f5;
  color: #999;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-text {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
}

.current-qr-section, .generate-section, .usage-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 20px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 5px;
}

.qr-age {
  font-size: 12px;
  color: #666;
  display: block;
}

.qr-display {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.qr-image-container {
  flex-shrink: 0;
}

.qr-image {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.qr-content-display {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.qr-content-text {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  word-break: break-all;
  margin-bottom: 10px;
  line-height: 1.4;
}

.qr-content-desc {
  font-size: 12px;
  color: #666;
}

.qr-content-display {
  width: 200px;
  height: 200px;
  border-radius: 8px;
  border: 2px solid #e0e0e0;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.qr-content-text {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  word-break: break-all;
  margin-bottom: 10px;
  line-height: 1.4;
}

.qr-content-desc {
  font-size: 12px;
  color: #666;
}

.qr-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.qr-id, .qr-content, .qr-type {
  font-size: 14px;
  color: #666;
  word-break: break-all;
}

.qr-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.action-btn {
  height: 40px;
  background: #f5f5f5;
  color: #333;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  gap: 5px;
}

.generate-options {
  margin-bottom: 20px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.option-label {
  font-size: 14px;
  color: #333;
  min-width: 80px;
}

.option-value {
  font-size: 14px;
  color: #666;
  min-width: 50px;
  text-align: right;
}

.generate-btn {
  width: 100%;
  height: 50px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  gap: 8px;
}

.generate-btn:disabled {
  background: #ccc;
}

.test-btn {
  width: 100%;
  height: 50px;
  background: #9c27b0;
  color: white;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  gap: 8px;
  margin-top: 15px;
}

.test-btn:disabled {
  background: #ccc;
}

.btn-icon {
  font-size: 18px;
}

.usage-steps {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step-item {
  display: flex;
  gap: 15px;
}

.step-number {
  width: 30px;
  height: 30px;
  background: #2196f3;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 5px;
}

.step-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  display: block;
}

.preview-popup {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
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
  text-align: center;
}

.preview-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.preview-tip {
  font-size: 12px;
  color: #666;
  display: block;
}

.popup-footer {
  display: flex;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
}

.popup-footer .action-btn {
  flex: 1;
  height: 40px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
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
