<template>
  <view class="qr-generator-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <text class="page-title">二维码生成器</text>
      <text class="page-subtitle">前端生成就餐确认二维码，无需后端支持</text>
    </view>

    <!-- 生成选项 -->
    <view class="generator-options">
      <view class="option-section">
        <text class="section-title">二维码类型</text>
        <view class="option-group">
          <view 
            v-for="type in qrTypes" 
            :key="type.value"
            class="option-item"
            :class="{ active: selectedType === type.value }"
            @click="selectType(type.value)"
          >
            <text class="option-icon">{{ type.icon }}</text>
            <text class="option-label">{{ type.label }}</text>
            <text class="option-desc">{{ type.desc }}</text>
          </view>
        </view>
      </view>

      <view class="option-section">
        <text class="section-title">生成参数</text>
        <view class="param-group">
          <view class="param-item">
            <text class="param-label">二维码尺寸</text>
            <slider 
              :value="qrSize" 
              @change="onSizeChange"
              min="200" 
              max="500" 
              step="50"
              activeColor="#2196f3"
            />
            <text class="param-value">{{ qrSize }}px</text>
          </view>
          
          <view class="param-item">
            <text class="param-label">边距</text>
            <slider 
              :value="margin" 
              @change="onMarginChange"
              min="1" 
              max="5" 
              step="1"
              activeColor="#2196f3"
            />
            <text class="param-value">{{ margin }}px</text>
          </view>
          
          <view class="param-item">
            <text class="param-label">包含完整URL</text>
            <switch 
              :checked="includeURL" 
              @change="onIncludeURLChange"
              color="#2196f3"
            />
          </view>
        </view>
      </view>

      <view class="option-section" v-if="selectedType === 'custom'">
        <text class="section-title">自定义内容</text>
        <textarea 
          v-model="customContent"
          placeholder="请输入自定义二维码内容"
          class="custom-input"
          maxlength="500"
        />
      </view>
    </view>

    <!-- 生成按钮 -->
    <view class="generate-section">
      <button 
        class="generate-btn" 
        @click="generateQRCode"
        :disabled="isGenerating"
      >
        <text class="btn-icon">{{ isGenerating ? '⏳' : '🎯' }}</text>
        <text>{{ isGenerating ? '生成中...' : '生成二维码' }}</text>
      </button>
    </view>

    <!-- 二维码显示区域 -->
    <view class="qr-display-section" v-if="generatedQRCode">
      <view class="qr-info">
        <text class="qr-title">{{ getCurrentTypeInfo().label }}</text>
        <text class="qr-content">{{ generatedQRCode.content }}</text>
        <text class="qr-token" v-if="generatedQRCode.sceneToken">
          场景令牌: {{ generatedQRCode.sceneToken }}
        </text>
      </view>
      
      <view class="qr-image-container">
        <image 
          :src="generatedQRCode.qrCodeImage" 
          mode="aspectFit"
          class="qr-image"
          @click="previewQRCode"
        />
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
        <button class="action-btn save-btn" @click="saveQRCode">
          <text class="btn-icon">💾</text>
          <text>保存</text>
        </button>
        <button class="action-btn share-btn" @click="shareQRCode">
          <text class="btn-icon">📤</text>
          <text>分享</text>
        </button>
      </view>
    </view>

    <!-- 历史记录 -->
    <view class="history-section" v-if="qrHistory.length > 0">
      <view class="section-title">
        <text>生成历史</text>
        <button class="clear-btn" @click="clearHistory">清空</button>
      </view>
      <view class="history-list">
        <view 
          v-for="(item, index) in qrHistory" 
          :key="index"
          class="history-item"
          @click="loadFromHistory(item)"
        >
          <image :src="item.qrCodeImage" class="history-image" />
          <view class="history-info">
            <text class="history-type">{{ item.type }}</text>
            <text class="history-time">{{ formatTime(item.timestamp) }}</text>
            <text class="history-content">{{ item.content.substring(0, 30) }}...</text>
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
            v-if="generatedQRCode" 
            :src="generatedQRCode.qrCodeImage" 
            mode="aspectFit"
            class="preview-image"
          />
        </view>
        <view class="popup-footer">
          <button class="action-btn" @click="downloadQRCode">下载</button>
          <button class="action-btn" @click="saveQRCode">保存</button>
          <button class="action-btn" @click="shareQRCode">分享</button>
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
import api from '@/utils/api.js'
import qrGenerator from '@/utils/qrGenerator.js'

export default {
  name: 'QRGenerator',
  data() {
    return {
      // 二维码类型
      selectedType: 'dining_confirm',
      qrTypes: [
        {
          value: 'dining_confirm',
          label: '就餐确认二维码',
          icon: '🍽️',
          desc: '包含完整URL的就餐确认二维码'
        },
        {
          value: 'wechat_miniprogram',
          label: '微信小程序码',
          icon: '💬',
          desc: '微信小程序专用扫码码'
        },
        {
          value: 'token_only',
          label: '令牌二维码',
          icon: '🔑',
          desc: '只包含scene_token的二维码'
        },
        {
          value: 'custom',
          label: '自定义二维码',
          icon: '⚙️',
          desc: '自定义内容的二维码'
        }
      ],
      
      // 生成参数
      qrSize: 300,
      margin: 2,
      includeURL: true,
      customContent: '',
      
      // 生成状态
      isGenerating: false,
      generatedQRCode: null,
      
      // 历史记录
      qrHistory: []
    }
  },
  
  onLoad() {
    this.loadHistory()
  },
  
  methods: {
    // 选择二维码类型
    selectType(type) {
      this.selectedType = type
    },
    
    // 获取当前类型信息
    getCurrentTypeInfo() {
      return this.qrTypes.find(type => type.value === this.selectedType) || this.qrTypes[0]
    },
    
    // 尺寸变化
    onSizeChange(e) {
      this.qrSize = e.detail.value
    },
    
    // 边距变化
    onMarginChange(e) {
      this.margin = e.detail.value
    },
    
    // 包含URL变化
    onIncludeURLChange(e) {
      this.includeURL = e.detail.value
    },
    
    // 生成二维码
    async generateQRCode() {
      try {
        this.isGenerating = true
        
        let result
        
        switch (this.selectedType) {
          case 'dining_confirm':
            result = await api.qrScan.generateExternalQRCode({
              width: this.qrSize,
              margin: this.margin,
              includeURL: this.includeURL
            })
            break
            
          case 'wechat_miniprogram':
            result = await api.qrScan.generateWechatExternalCode({
              width: this.qrSize,
              margin: this.margin
            })
            break
            
          case 'token_only':
            result = await qrGenerator.generateQRCodeDataURL(
              api.qrScan.generateSceneToken(),
              { width: this.qrSize, margin: this.margin }
            )
            result = {
              success: true,
              data: {
                qrCodeImage: result,
                content: api.qrScan.generateSceneToken(),
                sceneToken: api.qrScan.generateSceneToken(),
                type: 'token_only'
              }
            }
            break
            
          case 'custom':
            if (!this.customContent.trim()) {
              uni.showToast({
                title: '请输入自定义内容',
                icon: 'none'
              })
              return
            }
            result = await qrGenerator.generateQRCodeDataURL(
              this.customContent,
              { width: this.qrSize, margin: this.margin }
            )
            result = {
              success: true,
              data: {
                qrCodeImage: result,
                content: this.customContent,
                sceneToken: null,
                type: 'custom'
              }
            }
            break
            
          default:
            throw new Error('未知的二维码类型')
        }
        
        if (result.success) {
          this.generatedQRCode = result.data
          this.addToHistory(result.data)
          
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
      if (!this.generatedQRCode) return
      
      try {
        const filename = `qrcode_${Date.now()}.png`
        qrGenerator.downloadQRCode(this.generatedQRCode.qrCodeImage, filename)
        
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
    
    // 保存二维码
    async saveQRCode() {
      if (!this.generatedQRCode) return
      
      try {
        const filename = `qrcode_${Date.now()}.png`
        await qrGenerator.saveQRCodeToAlbum(this.generatedQRCode.qrCodeImage, filename)
        
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('保存失败:', error)
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    },
    
    // 分享二维码
    async shareQRCode() {
      if (!this.generatedQRCode) return
      
      try {
        await qrGenerator.shareQRCode(
          this.generatedQRCode.qrCodeImage,
          '就餐确认二维码',
          '扫描二维码确认就餐'
        )
      } catch (error) {
        console.error('分享失败:', error)
        uni.showToast({
          title: '分享失败',
          icon: 'none'
        })
      }
    },
    
    // 添加到历史记录
    addToHistory(qrData) {
      const historyItem = {
        ...qrData,
        timestamp: Date.now(),
        type: this.getCurrentTypeInfo().label
      }
      
      this.qrHistory.unshift(historyItem)
      
      // 限制历史记录数量
      if (this.qrHistory.length > 10) {
        this.qrHistory = this.qrHistory.slice(0, 10)
      }
      
      this.saveHistory()
    },
    
    // 从历史记录加载
    loadFromHistory(item) {
      this.generatedQRCode = item
      this.$refs.previewPopup.open()
    },
    
    // 清空历史记录
    clearHistory() {
      uni.showModal({
        title: '确认清空',
        content: '确定要清空所有历史记录吗？',
        success: (res) => {
          if (res.confirm) {
            this.qrHistory = []
            this.saveHistory()
            uni.showToast({
              title: '历史记录已清空',
              icon: 'success'
            })
          }
        }
      })
    },
    
    // 保存历史记录
    saveHistory() {
      try {
        uni.setStorageSync('qr_generator_history', this.qrHistory)
      } catch (error) {
        console.error('保存历史记录失败:', error)
      }
    },
    
    // 加载历史记录
    loadHistory() {
      try {
        const history = uni.getStorageSync('qr_generator_history')
        if (history && Array.isArray(history)) {
          this.qrHistory = history
        }
      } catch (error) {
        console.error('加载历史记录失败:', error)
      }
    },
    
    // 格式化时间
    formatTime(timestamp) {
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN')
    }
  }
}
</script>

<style scoped>
.qr-generator-container {
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

.generator-options {
  margin-bottom: 30px;
}

.option-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 15px;
}

.option-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.option-item {
  padding: 15px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.option-item.active {
  border-color: #2196f3;
  background: #e3f2fd;
}

.option-icon {
  font-size: 24px;
  display: block;
  margin-bottom: 8px;
}

.option-label {
  font-size: 16px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 5px;
}

.option-desc {
  font-size: 12px;
  color: #666;
  display: block;
}

.param-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.param-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.param-label {
  font-size: 14px;
  color: #333;
  min-width: 80px;
}

.param-value {
  font-size: 14px;
  color: #666;
  min-width: 50px;
  text-align: right;
}

.custom-input {
  width: 100%;
  height: 100px;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  resize: none;
}

.generate-section {
  text-align: center;
  margin-bottom: 30px;
}

.generate-btn {
  width: 200px;
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

.generate-btn:disabled {
  background: #ccc;
  box-shadow: none;
}

.btn-icon {
  margin-right: 8px;
  font-size: 18px;
}

.qr-display-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.qr-info {
  margin-bottom: 20px;
}

.qr-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10px;
}

.qr-content {
  font-size: 14px;
  color: #666;
  display: block;
  margin-bottom: 5px;
  word-break: break-all;
}

.qr-token {
  font-size: 12px;
  color: #999;
  display: block;
}

.qr-image-container {
  text-align: center;
  margin-bottom: 20px;
}

.qr-image {
  max-width: 300px;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
}

.history-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.history-section .section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.clear-btn {
  background: #ff5722;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  font-size: 12px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-item:hover {
  background: #f5f5f5;
}

.history-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  margin-right: 15px;
}

.history-info {
  flex: 1;
}

.history-type {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 5px;
}

.history-time {
  font-size: 12px;
  color: #666;
  display: block;
  margin-bottom: 5px;
}

.history-content {
  font-size: 12px;
  color: #999;
  display: block;
}

.preview-popup {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
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
  max-height: 300px;
  border-radius: 8px;
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
