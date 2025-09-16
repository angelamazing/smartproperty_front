<template>
  <view class="high-quality-qrcode-container">
    <!-- Web环境使用qrcode2生成高质量二维码 -->
    <view v-if="isWeb" class="qrcode-web-container">
      <canvas 
        :id="canvasId"
        :style="{ 
          width: displayWidth + 'px', 
          height: displayHeight + 'px',
          imageRendering: 'pixelated' // 防止模糊
        }"
        class="qrcode-canvas"
      ></canvas>
    </view>
    
    <!-- uniapp环境使用canvas渲染 -->
    <canvas 
      v-else-if="isUniApp && !isWechatMiniProgram"
      :canvas-id="canvasId"
      :id="canvasId"
      :style="{ width: size, height: size }"
      class="qrcode-canvas"
    ></canvas>
    
    <!-- 微信小程序环境显示内容 -->
    <view 
      v-else-if="isWechatMiniProgram"
      class="qrcode-content-display"
      :style="{ width: size, height: size }"
    >
      <text class="qrcode-content-text">{{ value }}</text>
      <text class="qrcode-content-desc">二维码内容（微信扫码时使用）</text>
    </view>
    
    <!-- 加载状态 -->
    <view v-if="loading" class="qrcode-loading">
      <text class="loading-text">生成中...</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'HighQualityQRCode',
  props: {
    value: {
      type: String,
      required: true
    },
    size: {
      type: String,
      default: '300rpx'
    },
    options: {
      type: Object,
      default: () => ({
        useDynamicSize: false,
        errorCorrectLevel: 'Q',
        margin: 10,
        areaColor: "#fff",
        scale: 5 // 放大倍数，解决模糊问题
      })
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      canvasId: `qrcode_${Date.now()}`,
      qrCodeImage: '',
      isWeb: false,
      isUniApp: false,
      isWechatMiniProgram: false,
      displayWidth: 300,
      displayHeight: 300,
      actualWidth: 1500,
      actualHeight: 1500
    }
  },
  mounted() {
    this.checkEnvironment()
    this.calculateDimensions()
    this.generateQRCode()
  },
  watch: {
    value: {
      handler() {
        this.generateQRCode()
      },
      immediate: true
    },
    size: {
      handler() {
        this.calculateDimensions()
        this.generateQRCode()
      }
    }
  },
  methods: {
    // 检查环境
    checkEnvironment() {
      this.isWeb = typeof window !== 'undefined' && typeof document !== 'undefined'
      this.isUniApp = typeof uni !== 'undefined'
      // 检查微信小程序特有的API，使用现代化检测方法
      this.isWechatMiniProgram = typeof wx !== 'undefined' && 
                                 (wx.getDeviceInfo || wx.getSystemInfoSync)
    },
    
    // 计算尺寸
    calculateDimensions() {
      if (this.isWeb) {
        // 解析尺寸
        const sizeValue = parseInt(this.size)
        this.displayWidth = sizeValue
        this.displayHeight = sizeValue
        
        // 计算实际渲染尺寸（放大解决模糊问题）
        const scale = this.options.scale || 5
        this.actualWidth = sizeValue * scale
        this.actualHeight = sizeValue * scale
      }
    },
    
    // 生成二维码
    async generateQRCode() {
      if (!this.value) return
      
      try {
        this.$emit('loading', true)
        
        if (this.isWeb) {
          // Web环境，使用qrcode2生成高质量二维码
          await this.generateQRCodeWithQrcode2()
        } else if (this.isUniApp && !this.isWechatMiniProgram) {
          // uniapp环境，使用canvas渲染
          await this.renderQRCodeWithCanvas()
        } else if (this.isWechatMiniProgram) {
          // 微信小程序环境，直接显示内容
          this.$emit('loading', false)
        }
        
        this.$emit('loading', false)
        this.$emit('success')
        
      } catch (error) {
        console.error('生成二维码失败:', error)
        this.$emit('loading', false)
        this.$emit('error', error)
      }
    },
    
    // 使用qrcode2生成高质量二维码
    async generateQRCodeWithQrcode2() {
      try {
        const qrcode2Generator = await import('@/utils/qrcode2Generator.js')
        const QRCode = await qrcode2Generator.initQRCode2()
        
        // 创建临时容器
        const tempContainer = document.createElement('div')
        tempContainer.style.position = 'absolute'
        tempContainer.style.left = '-9999px'
        tempContainer.style.top = '-9999px'
        document.body.appendChild(tempContainer)
        
        // 生成二维码（放大解决模糊问题）
        const qrCode = new QRCode(tempContainer, {
          text: this.value,
          width: this.actualWidth,
          height: this.actualHeight,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel[this.options.errorCorrectLevel] || QRCode.CorrectLevel.Q
        })
        
        // 等待二维码生成完成
        await new Promise((resolve) => {
          setTimeout(resolve, 200)
        })
        
        // 获取canvas元素
        const canvas = tempContainer.querySelector('canvas')
        if (canvas) {
          // 将canvas内容复制到目标canvas
          const targetCanvas = document.getElementById(this.canvasId)
          if (targetCanvas) {
            const ctx = targetCanvas.getContext('2d')
            targetCanvas.width = this.actualWidth
            targetCanvas.height = this.actualHeight
            ctx.drawImage(canvas, 0, 0)
          }
        }
        
        // 清理临时容器
        document.body.removeChild(tempContainer)
        
        console.log('qrcode2 高质量二维码生成成功')
        
      } catch (error) {
        console.error('qrcode2 生成失败:', error)
        throw error
      }
    },
    
    // 使用canvas渲染二维码（uniapp）
    async renderQRCodeWithCanvas() {
      try {
        // 这里需要实现canvas二维码渲染逻辑
        // 由于uniapp的canvas二维码渲染比较复杂，这里先返回内容
        console.log('uniapp canvas 渲染二维码:', this.value)
        this.$emit('loading', false)
      } catch (error) {
        console.error('canvas 渲染失败:', error)
        throw error
      }
    },
    
    // 保存二维码到相册
    async saveToAlbum() {
      try {
        if (this.isUniApp) {
          const qrcode2Generator = await import('@/utils/qrcode2Generator.js')
          return await qrcode2Generator.saveQRCodeToAlbum(this.canvasId)
        } else if (this.isWeb) {
          const qrcode2Generator = await import('@/utils/qrcode2Generator.js')
          const canvas = document.getElementById(this.canvasId)
          const dataURL = canvas.toDataURL('image/png')
          return await qrcode2Generator.downloadQRCode(dataURL)
        } else {
          throw new Error('当前环境不支持保存功能')
        }
      } catch (error) {
        console.error('保存二维码失败:', error)
        throw error
      }
    },
    
    // 重新生成二维码
    remake() {
      this.generateQRCode()
    }
  }
}
</script>

<style scoped>
.high-quality-qrcode-container {
  position: relative;
  display: inline-block;
}

.qrcode-web-container {
  position: relative;
  overflow: hidden;
}

.qrcode-canvas {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  image-rendering: pixelated; /* 防止模糊 */
  image-rendering: -webkit-optimize-contrast; /* Safari */
  image-rendering: crisp-edges; /* Firefox */
}

.qrcode-content-display {
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
}

.qrcode-content-text {
  font-size: 14px;
  font-weight: bold;
  color: #333;
  word-break: break-all;
  margin-bottom: 10px;
  line-height: 1.4;
}

.qrcode-content-desc {
  font-size: 12px;
  color: #666;
}

.qrcode-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.loading-text {
  font-size: 14px;
  color: #666;
}
</style>
