<script>
import auth from './utils/auth.js'

export default {
  onLaunch: function () {
    console.log('App Launch')
    
    // 初始化云开发
    this.initCloud()
    
    // 自动登录检查
    this.autoLoginCheck()
  },
  
  onShow: function () {
    console.log('App Show')
  },
  
  onHide: function () {
    console.log('App Hide')
  },
  
  methods: {
    /**
     * 初始化云开发
     */
    initCloud() {
      try {
        if (!wx.cloud) {
          console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
          wx.cloud.init({
            env: 'your-env-id', // 请替换为你的云开发环境ID
            trace用户: true
          })
          console.log('云开发初始化成功')
        }
      } catch (error) {
        console.error('云开发初始化失败:', error)
      }
    },
    
    /**
     * 自动登录检查
     */
    async autoLoginCheck() {
      try {
        // 延迟执行，确保页面加载完成
        setTimeout(async () => {
          await auth.autoLoginCheck()
        }, 1000)
      } catch (error) {
        console.error('自动登录检查失败:', error)
      }
    }
  }
}
</script>

<style>
/*每个页面公共css */
page {
  background-color: #f8f9fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 全局按钮样式 */
.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 50rpx;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:active {
  transform: scale(0.98);
}

/* 全局卡片样式 */
.card {
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  padding: 30rpx;
  margin: 20rpx;
}

/* 全局输入框样式 */
.input-field {
  background: #f8f9fa;
  border: 2rpx solid #e9ecef;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 28rpx;
  transition: all 0.3s ease;
}

.input-field:focus {
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 0 0 6rpx rgba(102, 126, 234, 0.1);
}

/* 全局加载样式 */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60rpx;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #f3f3f3;
  border-top: 4rpx solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 20rpx;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 全局空状态样式 */
.empty-state {
  text-align: center;
  padding: 120rpx 40rpx;
  color: #999;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
  opacity: 0.5;
}

.empty-text {
  font-size: 28rpx;
  line-height: 1.5;
}
</style>
