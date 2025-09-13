<template>
  <view class="uni-qrcode-container">
    <!-- uniapp 环境使用 canvas 渲染 -->
    <canvas 
      v-if="isUniApp && !isWechatMiniProgram"
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
    
    <!-- Web环境显示图片 -->
    <image 
      v-else
      :src="qrCodeImage"
      :style="{ width: size, height: size }"
      class="qrcode-image"
      mode="aspectFit"
    />
    
    <!-- 加载状态 -->
    <view v-if="loading" class="qrcode-loading">
      <text class="loading-text">生成中...</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'UniQRCode',
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
        areaColor: "#fff"
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
      isUniApp: false,
      isWechatMiniProgram: false
    }
  },
  mounted() {
    this.checkEnvironment()
    this.generateQRCode()
  },
  watch: {
    value: {
      handler() {
        this.generateQRCode()
      },
      immediate: true
    }
  },
  methods: {
    // 检查环境
    checkEnvironment() {
      this.isUniApp = typeof uni !== 'undefined'
      this.isWechatMiniProgram = typeof wx !== 'undefined' && wx.getSystemInfoSync
    },
    
    // 生成二维码
    async generateQRCode() {
      if (!this.value) return
      
      try {
        this.$emit('loading', true)
        
        if (this.isUniApp && !this.isWechatMiniProgram) {
          // uniapp 环境，使用 canvas 渲染
          await this.renderQRCodeWithCanvas()
        } else if (this.isWechatMiniProgram) {
          // 微信小程序环境，直接显示内容
          this.$emit('loading', false)
        } else {
          // Web环境，生成图片
          await this.generateQRCodeImage()
        }
        
        this.$emit('loading', false)
        this.$emit('success')
        
      } catch (error) {
        console.error('生成二维码失败:', error)
        this.$emit('loading', false)
        this.$emit('error', error)
      }
    },
    
    // 使用 canvas 渲染二维码（uniapp）
    async renderQRCodeWithCanvas() {
      try {
        // 这里需要实现 canvas 二维码渲染逻辑
        // 由于 uniapp 的 canvas 二维码渲染比较复杂，这里先返回内容
        console.log('uniapp canvas 渲染二维码:', this.value)
        this.$emit('loading', false)
      } catch (error) {
        console.error('canvas 渲染失败:', error)
        throw error
      }
    },
    
    // 生成二维码图片（Web环境）
    async generateQRCodeImage() {
      try {
        const qrGenerator = await import('@/utils/qrGenerator.js')
        const dataURL = await qrGenerator.generateQRCodeDataURL(this.value, {
          width: parseInt(this.size),
          margin: this.options.margin || 2
        })
        
        this.qrCodeImage = dataURL
      } catch (error) {
        console.error('生成二维码图片失败:', error)
        throw error
      }
    },
    
    // 保存二维码到相册
    async saveToAlbum() {
      try {
        if (this.isUniApp) {
          const uniappQRGenerator = await import('@/utils/uniappQRGenerator.js')
          return await uniappQRGenerator.saveQRCodeToAlbum(this.canvasId)
        } else {
          const uniappQRGenerator = await import('@/utils/uniappQRGenerator.js')
          return await uniappQRGenerator.downloadQRCode(this.qrCodeImage)
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
.uni-qrcode-container {
  position: relative;
  display: inline-block;
}

.qrcode-canvas {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
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

.qrcode-image {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
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
