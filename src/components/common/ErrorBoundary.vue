<template>
  <view class="error-boundary">
    <!-- 正常内容 -->
    <slot v-if="!hasError" />
    
    <!-- 错误状态 -->
    <view v-else class="error-container">
      <view class="error-content">
        <text class="error-icon">⚠️</text>
        <text class="error-title">{{ errorTitle }}</text>
        <text class="error-message">{{ errorMessage }}</text>
        <text class="error-details" v-if="showDetails">{{ errorDetails }}</text>
        
        <view class="error-actions">
          <button 
            class="retry-btn" 
            @click="handleRetry"
            :disabled="isRetrying"
          >
            <text class="btn-text">{{ isRetrying ? '重试中...' : '重试' }}</text>
          </button>
          
          <button 
            v-if="showReport" 
            class="report-btn" 
            @click="handleReport"
          >
            <text class="btn-text">反馈问题</text>
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { ref, computed, onErrorCaptured } from 'vue'

export default {
  name: 'ErrorBoundary',
  props: {
    // 错误标题
    errorTitle: {
      type: String,
      default: '出现错误'
    },
    // 是否显示错误详情
    showDetails: {
      type: Boolean,
      default: false
    },
    // 是否显示反馈按钮
    showReport: {
      type: Boolean,
      default: true
    },
    // 自定义错误处理函数
    onError: {
      type: Function,
      default: null
    }
  },
  emits: ['retry', 'report'],
  setup(props, { emit }) {
    const hasError = ref(false)
    const errorMessage = ref('')
    const errorDetails = ref('')
    const isRetrying = ref(false)
    
    // 捕获子组件错误
    onErrorCaptured((error, instance, info) => {
      console.error('ErrorBoundary 捕获到错误:', error)
      console.error('错误实例:', instance)
      console.error('错误信息:', info)
      
      hasError.value = true
      errorMessage.value = error.message || '未知错误'
      errorDetails.value = `${error.name}: ${error.stack}`
      
      // 调用自定义错误处理函数
      if (props.onError) {
        props.onError(error, instance, info)
      }
      
      // 阻止错误继续传播
      return false
    })
    
    // 处理重试
    const handleRetry = async () => {
      isRetrying.value = true
      try {
        // 重置错误状态
        hasError.value = false
        errorMessage.value = ''
        errorDetails.value = ''
        
        // 触发重试事件
        emit('retry')
        
        // 等待一段时间后重置重试状态
        setTimeout(() => {
          isRetrying.value = false
        }, 1000)
      } catch (error) {
        console.error('重试失败:', error)
        isRetrying.value = false
      }
    }
    
    // 处理问题反馈
    const handleReport = () => {
      emit('report', {
        message: errorMessage.value,
        details: errorDetails.value,
        timestamp: new Date().toISOString()
      })
    }
    
    // 手动设置错误状态
    const setError = (message, details = '') => {
      hasError.value = true
      errorMessage.value = message
      errorDetails.value = details
    }
    
    // 清除错误状态
    const clearError = () => {
      hasError.value = false
      errorMessage.value = ''
      errorDetails.value = ''
    }
    
    return {
      hasError,
      errorMessage,
      errorDetails,
      isRetrying,
      handleRetry,
      handleReport,
      setError,
      clearError
    }
  }
}
</script>

<style lang="scss" scoped>
.error-boundary {
  width: 100%;
  height: 100%;
}

.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400rpx;
  padding: 40rpx;
  background: #f8f9fa;
  border-radius: 16rpx;
}

.error-content {
  text-align: center;
  max-width: 600rpx;
}

.error-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
  display: block;
  opacity: 0.8;
}

.error-title {
  font-size: 36rpx;
  color: #e74c3c;
  font-weight: 600;
  margin-bottom: 20rpx;
  display: block;
}

.error-message {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
  margin-bottom: 20rpx;
  display: block;
}

.error-details {
  font-size: 24rpx;
  color: #999;
  line-height: 1.4;
  margin-bottom: 40rpx;
  display: block;
  text-align: left;
  background: #fff;
  padding: 20rpx;
  border-radius: 8rpx;
  border: 1rpx solid #e9ecef;
  max-height: 200rpx;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

.error-actions {
  display: flex;
  gap: 20rpx;
  justify-content: center;
  flex-wrap: wrap;
}

.retry-btn,
.report-btn {
  padding: 20rpx 40rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 600;
  border: none;
  transition: all 0.3s ease;
  box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.1);
  
  &:active {
    transform: scale(0.98);
  }
  
  &:disabled {
    opacity: 0.6;
    transform: none;
  }
}

.retry-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  
  &:disabled {
    background: linear-gradient(135deg, #ccc 0%, #999 100%);
  }
}

.report-btn {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  color: #495057;
  border: 2rpx solid #dee2e6;
}

.btn-text {
  color: inherit;
}

/* 响应式设计 */
@media screen and (max-width: 600rpx) {
  .error-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .retry-btn,
  .report-btn {
    width: 100%;
    max-width: 300rpx;
  }
  
  .error-details {
    font-size: 22rpx;
    max-height: 150rpx;
  }
}
</style>
